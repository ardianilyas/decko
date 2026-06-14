import { z } from "zod";

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
export const RevisedChaptersResponseSchema = z.object({
  revisedChapters: z.array(ChapterSchema),
});

// Partial global fields revision response schema
export const RevisedGlobalFieldsResponseSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  targetAudience: z.string().optional(),
  presentationDuration: z.number().optional(),
  learningObjectives: z.array(z.string()).optional(),
  prerequisites: z.array(z.string()).optional(),
  summary: z.string().optional(),
});
