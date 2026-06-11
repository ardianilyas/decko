import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { z } from "zod";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// ---------------------------------------------------------------------------
// Schema validation
// ---------------------------------------------------------------------------

export const ChapterSchema = z.object({
  chapterNumber: z.number(),
  title: z.string(),
  description: z.string(),
  chapterSummary: z.string(),
  topics: z.array(
    z.object({
      title: z.string(),
      explanation: z.string(),
    })
  ).min(1),
  keyTakeaways: z.array(z.string()).min(1),
});

export const PresentationSchema = z.object({
  title: z.string(),
  description: z.string(),
  targetAudience: z.string(),
  presentationDuration: z.number(),
  learningObjectives: z.array(z.string()).min(1),
  prerequisites: z.array(z.string()),
  chapters: z.array(ChapterSchema).min(3).max(15),
  summary: z.string(),
});

export type Presentation = z.infer<typeof PresentationSchema>;

// Revision intent — what the user wants to change
export const RevisionIntentSchema = z.object({
  affectedChapters: z.array(z.number()),   // chapter numbers (e.g. [3,4])
  globalFields: z.array(z.string()),        // e.g. ["learningObjectives","summary"]
  parsedInstruction: z.string(),            // clean instruction for the revision AI
  affectedSummary: z.string(),              // human-readable label e.g. "Chapter 3, Chapter 4"
});

export type RevisionIntent = z.infer<typeof RevisionIntentSchema>;

// Partial chapters revision response schema
const RevisedChaptersResponseSchema = z.object({
  revisedChapters: z.array(ChapterSchema),
});

// Partial global fields revision response schema
const RevisedGlobalFieldsResponseSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  targetAudience: z.string().optional(),
  presentationDuration: z.number().optional(),
  learningObjectives: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  summary: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Prompt builders
// ---------------------------------------------------------------------------

/**
 * Build the system prompt for generating a presentation structure.
 * PRD-specified prompt tuned for consistent JSON output.
 */
export function buildGenerationSystemPrompt(language: string): string {
  return `You are an expert instructional designer and curriculum architect with 15+ years of experience creating high-quality educational presentations.

Your task is to generate a comprehensive, well-structured presentation outline in strict JSON format.
Generate the ENTIRE output (including all text, summaries, and descriptions) strictly in ${language}.

CRITICAL RULES:
- Return ONLY valid JSON. No markdown fences, no explanations, no preamble, no postamble.
- Generate between 3 and 15 chapters. If the user's topic implies or explicitly requests a specific number of items/chapters (e.g., "5 cyber attacks"), generate EXACTLY that many chapters.
- Each chapter MUST include:
  - chapterNumber (integer, starting at 1)
  - title (concise, engaging)
  - description (1-2 sentences explaining what this chapter covers)
  - chapterSummary (A detailed descriptive paragraph of 30-50 words discussing the chapter content comprehensively)
  - topics (array of 3-5 objects, each with a 'title' string and an 'explanation' string which is a highly descriptive 40-60 word paragraph or detailed code example explaining the topic)
  - keyTakeaways (array of 2-4 actionable insights the learner will gain)
- learningObjectives must have 4-6 measurable, verb-driven objectives (use Bloom's taxonomy verbs).
- prerequisites must list 1-4 realistic prior knowledge requirements.
- presentationDuration must be an integer between 60 and 120 (minutes).
- targetAudience must be a specific, descriptive string (e.g., "Beginner software developers with no prior JavaScript experience").
- summary must be 2-3 sentences encapsulating the full arc of the presentation.
- All text must be professional, clear, and pedagogically sound.

OUTPUT SCHEMA (follow exactly):
{
  "title": "string",
  "description": "string",
  "targetAudience": "string",
  "presentationDuration": number,
  "learningObjectives": ["string"],
  "prerequisites": ["string"],
  "chapters": [
    {
      "chapterNumber": number,
      "title": "string",
      "description": "string",
      "chapterSummary": "string",
      "topics": [
        {
          "title": "string",
          "explanation": "string"
        }
      ],
      "keyTakeaways": ["string"]
    }
  ],
  "summary": "string"
}`;
}

/**
 * Build the system prompt for parsing a user's natural language revision intent.
 * This is a lightweight call — only chapter titles/numbers are sent as context.
 */
export function buildIntentParserPrompt(chapterIndex: { chapterNumber: number; title: string }[]): string {
  const index = chapterIndex
    .map((c) => `Chapter ${c.chapterNumber}: ${c.title}`)
    .join("\n");

  return `You are a revision intent parser for a presentation editor.

The user will give a natural language instruction to revise parts of a presentation.
Your job is to identify WHICH parts they want to change and return structured JSON.

CHAPTER INDEX:
${index}

GLOBAL FIELDS available: title, description, targetAudience, presentationDuration, learningObjectives, prerequisites, summary

RULES:
- Return ONLY valid JSON. No markdown, no explanation.
- If the user mentions specific chapters (by number or title), list those chapter numbers in "affectedChapters".
- If the user mentions global fields (e.g. "change learning objectives", "update summary"), list them in "globalFields".
- If the instruction is general and not specific to any chapter or field (e.g. "make it more beginner friendly"), set affectedChapters to ALL chapter numbers and globalFields to [].
- "parsedInstruction" must be a clear, concise English instruction for the revision AI. Translate from any language if needed.
- "affectedSummary" must be a short human-readable label like "Chapter 3, Chapter 4" or "Learning Objectives, Summary" or "All Chapters".

OUTPUT:
{
  "affectedChapters": [number],
  "globalFields": ["string"],
  "parsedInstruction": "string",
  "affectedSummary": "string"
}`;
}

/**
 * Build the system prompt for revising specific chapters.
 */
export function buildChapterRevisionPrompt(instruction: string, language: string): string {
  return `You are an expert instructional designer revising specific chapters of a presentation.

REVISION INSTRUCTION: ${instruction}
OUTPUT LANGUAGE: ${language}

RULES:
- Return ONLY valid JSON. No markdown, no explanations.
- Apply the revision instruction ONLY to the chapters provided in the user message.
- Each revised chapter MUST follow this exact schema:
  {
    "chapterNumber": number,
    "title": string,
    "description": string,
    "chapterSummary": string,
    "topics": [{ "title": string, "explanation": string }],
    "keyTakeaways": [string]
  }
- Preserve chapterNumber values exactly.
- Return the result as: { "revisedChapters": [ ...chapters ] }`;
}

/**
 * Build the system prompt for revising specific global fields.
 */
export function buildGlobalFieldsRevisionPrompt(instruction: string, fields: string[], language: string): string {
  return `You are an expert instructional designer revising specific fields of a presentation outline.

REVISION INSTRUCTION: ${instruction}
OUTPUT LANGUAGE: ${language}
FIELDS TO REVISE: ${fields.join(", ")}

RULES:
- Return ONLY valid JSON. No markdown, no explanations.
- Only include the fields listed above in your response.
- Do NOT include any other fields.
- Match the same data types as the input (arrays stay arrays, strings stay strings, numbers stay numbers).`;
}

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
