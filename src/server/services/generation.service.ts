import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import {
  ChapterSchema,
  PresentationSchema,
  RevisionIntentSchema,
  RevisedChaptersResponseSchema,
  RevisedGlobalFieldsResponseSchema,
  type Presentation,
  type RevisionIntent,
} from "./generation/schemas";
import {
  buildGenerationSystemPrompt,
  buildIntentParserPrompt,
  buildChapterRevisionPrompt,
  buildGlobalFieldsRevisionPrompt,
} from "./generation/prompts";

// Re-export schemas and types for backwards compatibility
export {
  ChapterSchema,
  PresentationSchema,
  RevisionIntentSchema,
  type Presentation,
  type RevisionIntent,
};

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// ---------------------------------------------------------------------------
// Generation with retry
// ---------------------------------------------------------------------------

/**
 * Call the OpenRouter API and parse the JSON output.
 * Retries up to 2 times on invalid JSON (per FR-005).
 */
export async function generatePresentation(
  topic: string,
  modelId: string,
  language: string
): Promise<Presentation> {
  const maxRetries = 2;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const { text } = await generateText({
        model: openrouter(modelId),
        system: buildGenerationSystemPrompt(language),
        prompt: `Generate a presentation structure for this topic: ${topic}`,
        temperature: 0.7,
        maxOutputTokens: 4096,
      });

      // Strip potential markdown fences just in case
      const cleaned = text
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```\s*$/i, "")
        .trim();

      const parsed = JSON.parse(cleaned);
      const validated = PresentationSchema.parse(parsed);
      return validated;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries) {
        // Brief delay before retry
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }

  throw new Error(
    `Generation failed after ${maxRetries + 1} attempts: ${lastError?.message}`
  );
}

// ---------------------------------------------------------------------------
// Smart Partial Revision (FR-004)
// ---------------------------------------------------------------------------

/**
 * Step 1: Parse the user's natural language revision intent.
 * Only sends the chapter index (numbers + titles) — tiny context, low token cost.
 */
export async function parseRevisionIntent(
  presentation: Presentation,
  userInstruction: string,
  modelId: string
): Promise<RevisionIntent> {
  const chapterIndex = presentation.chapters.map((c) => ({
    chapterNumber: c.chapterNumber,
    title: c.title,
  }));

  const maxRetries = 2;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const { text } = await generateText({
        model: openrouter(modelId),
        system: buildIntentParserPrompt(chapterIndex),
        prompt: userInstruction,
        temperature: 0.1, // Low temperature for deterministic parsing
        maxOutputTokens: 512,
      });

      const cleaned = text
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```\s*$/i, "")
        .trim();

      const parsed = JSON.parse(cleaned);
      return RevisionIntentSchema.parse(parsed);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
      }
    }
  }

  // Fallback: if intent parsing fails, treat as "revise all chapters"
  console.warn("Intent parsing failed, falling back to all chapters:", lastError?.message);
  return {
    affectedChapters: presentation.chapters.map((c) => c.chapterNumber),
    globalFields: [],
    parsedInstruction: userInstruction,
    affectedSummary: "All Chapters",
  };
}

/**
 * Step 2a: Revise only the specified chapters.
 * Sends only those chapter objects — not the full presentation.
 */
async function reviseChapters(
  presentation: Presentation,
  intent: RevisionIntent,
  modelId: string,
  language: string
): Promise<Presentation> {
  const chaptersToRevise = presentation.chapters.filter((c) =>
    intent.affectedChapters.includes(c.chapterNumber)
  );

  if (chaptersToRevise.length === 0) return presentation;

  const maxRetries = 2;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const { text } = await generateText({
        model: openrouter(modelId),
        system: buildChapterRevisionPrompt(intent.parsedInstruction, language),
        prompt: JSON.stringify({ chaptersToRevise }),
        temperature: 0.5,
        maxOutputTokens: 4096,
      });

      const cleaned = text
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```\s*$/i, "")
        .trim();

      const parsed = JSON.parse(cleaned);
      const { revisedChapters } = RevisedChaptersResponseSchema.parse(parsed);

      // Merge revised chapters back into the full presentation
      const mergedChapters = presentation.chapters.map((original) => {
        const revised = revisedChapters.find(
          (r) => r.chapterNumber === original.chapterNumber
        );
        return revised ?? original;
      });

      return { ...presentation, chapters: mergedChapters };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }

  throw new Error(`Chapter revision failed: ${lastError?.message}`);
}

/**
 * Step 2b: Revise only the specified global fields.
 * Sends only those field values — not the full presentation.
 */
async function reviseGlobalFields(
  presentation: Presentation,
  intent: RevisionIntent,
  modelId: string,
  language: string
): Promise<Presentation> {
  if (intent.globalFields.length === 0) return presentation;

  const allowedGlobalFields = [
    "title", "description", "targetAudience", "presentationDuration",
    "learningObjectives", "prerequisites", "summary",
  ] as const;

  const fieldsToRevise = intent.globalFields.filter((f) =>
    allowedGlobalFields.includes(f as any)
  );

  if (fieldsToRevise.length === 0) return presentation;

  // Extract only the current values of the fields to revise
  const currentValues: Record<string, unknown> = {};
  for (const field of fieldsToRevise) {
    currentValues[field] = (presentation as any)[field];
  }

  const maxRetries = 2;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const { text } = await generateText({
        model: openrouter(modelId),
        system: buildGlobalFieldsRevisionPrompt(intent.parsedInstruction, fieldsToRevise, language),
        prompt: JSON.stringify({ currentValues }),
        temperature: 0.5,
        maxOutputTokens: 1024,
      });

      const cleaned = text
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```\s*$/i, "")
        .trim();

      const parsed = JSON.parse(cleaned);
      const revisedFields = RevisedGlobalFieldsResponseSchema.parse(parsed);

      // Merge revised fields back into the full presentation
      return { ...presentation, ...revisedFields };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }

  throw new Error(`Global fields revision failed: ${lastError?.message}`);
}

/**
 * Main entry point: Two-step smart partial revision.
 * 1. Parse intent (tiny LLM call)
 * 2. Revise only the affected parts (minimal context)
 * 3. Merge back into full Presentation
 *
 * Returns both the revised Presentation and the intent (for UI display).
 */
export async function revisePartialPresentation(
  presentation: Presentation,
  userInstruction: string,
  modelId: string,
  language: string = "English"
): Promise<{ revised: Presentation; intent: RevisionIntent }> {
  // Step 1: Parse intent
  const intent = await parseRevisionIntent(presentation, userInstruction, modelId);

  let current = presentation;

  // Step 2a: Revise affected chapters
  if (intent.affectedChapters.length > 0) {
    current = await reviseChapters(current, intent, modelId, language);
  }

  // Step 2b: Revise affected global fields
  if (intent.globalFields.length > 0) {
    current = await reviseGlobalFields(current, intent, modelId, language);
  }

  // Validate the final merged result
  const validated = PresentationSchema.parse(current);

  return { revised: validated, intent };
}
