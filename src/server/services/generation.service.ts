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
  chapters: z.array(ChapterSchema).min(7).max(9),
  summary: z.string(),
});

export type Presentation = z.infer<typeof PresentationSchema>;

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
- Generate exactly 7 to 9 chapters. No more, no less.
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
 * Build the system prompt for revising an existing presentation.
 */
export function buildRevisionSystemPrompt(currentJson: Presentation, language: string): string {
  return `You are an expert instructional designer revising an existing presentation outline.

The user will provide a revision instruction. Apply it to the existing JSON below and return the UPDATED full JSON.
Ensure any new or revised text is generated strictly in ${language}.

CRITICAL RULES:
- Return ONLY valid JSON. No markdown, no explanations.
- Maintain all existing fields and structure.
- Apply the requested changes precisely.
- Keep 7-9 chapters.
- Follow the same schema as the original.

CURRENT PRESENTATION JSON:
${JSON.stringify(currentJson, null, 2)}`;
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

/**
 * Revise an existing presentation based on a user instruction.
 * Retries up to 2 times on invalid JSON.
 */
export async function revisePresentation(
  currentJson: Presentation,
  revisionPrompt: string,
  modelId: string,
  language: string = "English"
): Promise<Presentation> {
  const maxRetries = 2;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const { text } = await generateText({
        model: openrouter(modelId),
        system: buildRevisionSystemPrompt(currentJson, language),
        prompt: revisionPrompt,
        temperature: 0.5,
        maxOutputTokens: 4096,
      });

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
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
      }
    }
  }

  throw new Error(
    `Revision failed after ${maxRetries + 1} attempts: ${lastError?.message}`
  );
}
