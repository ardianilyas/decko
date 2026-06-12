import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { desc, eq } from "drizzle-orm";
import * as schema from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";
import {
  generatePresentation,
  revisePartialPresentation,
  PresentationSchema,
  type Presentation,
} from "../services/generation.service";
import {
  getUserCredits,
  deductCredits,
  refundCredits,
  MODEL_COSTS,
} from "../services/credit.service";

const MAX_REVISIONS = 3;

export const generationRouter = router({
  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------

  /** Current user's credit balance */
  getCredits: protectedProcedure.query(async ({ ctx }) => {
    const credits = await getUserCredits(ctx.db, ctx.session.user.id);
    return { credits };
  }),

  /** Paginated list of past generations */
  getHistory: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(20), offset: z.number().default(0) }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select({
          id: schema.generation.id,
          topic: schema.generation.topic,
          model: schema.generation.model,
          status: schema.generation.status,
          creditsUsed: schema.generation.creditsUsed,
          revisionCount: schema.generation.revisionCount,
          createdAt: schema.generation.createdAt,
          generatedJson: schema.generation.generatedJson,
        })
        .from(schema.generation)
        .where(eq(schema.generation.userId, ctx.session.user.id))
        .orderBy(desc(schema.generation.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return rows;
    }),

  /** Single generation with its revisions */
  getGeneration: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [gen] = await ctx.db
        .select()
        .from(schema.generation)
        .where(eq(schema.generation.id, input.id));

      if (!gen) throw new TRPCError({ code: "NOT_FOUND" });
      if (gen.userId !== ctx.session.user.id) throw new TRPCError({ code: "FORBIDDEN" });

      const revisions = await ctx.db
        .select()
        .from(schema.revision)
        .where(eq(schema.revision.generationId, input.id))
        .orderBy(desc(schema.revision.createdAt));

      return { ...gen, revisions };
    }),

  // -------------------------------------------------------------------------
  // Mutations
  // -------------------------------------------------------------------------

  /**
   * FR-001: Generate a presentation structure from a topic.
   * FR-002: Deducts credits based on model selection.
   */
  generate: protectedProcedure
    .input(
      z.object({
        topic: z.string().min(3, "Topic must be at least 3 characters").max(500, "Topic too long"),
        language: z.enum(["English", "Bahasa Indonesia"]).default("English"),
        model: z.enum(["deepseek/deepseek-chat", "openai/gpt-4o-mini", "openrouter/owl-alpha"]).default("openrouter/owl-alpha"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const cost = MODEL_COSTS[input.model] ?? 3;
      const genId = randomUUID();

      // Create placeholder record first
      await ctx.db.insert(schema.generation).values({
        id: genId,
        userId: ctx.session.user.id,
        topic: input.topic,
        language: input.language,
        model: input.model,
        creditsUsed: cost,
        status: "pending",
      });

      // Deduct credits before calling AI (refund on failure)
      await deductCredits(
        ctx.db,
        ctx.session.user.id,
        cost,
        `Generate presentation: "${input.topic}"`
      );

      let result: Presentation;
      try {
        result = await generatePresentation(input.topic, input.model, input.language);
      } catch (err) {
        // Refund and mark as failed
        await refundCredits(
          ctx.db,
          ctx.session.user.id,
          cost,
          `Refund for failed generation: "${input.topic}"`
        );
        await ctx.db
          .update(schema.generation)
          .set({ status: "failed", updatedAt: new Date() })
          .where(eq(schema.generation.id, genId));

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Generation failed. Your credits have been refunded.",
        });
      }

      // Store result
      await ctx.db
        .update(schema.generation)
        .set({
          generatedJson: result as any,
          status: "completed",
          updatedAt: new Date(),
        })
        .where(eq(schema.generation.id, genId));

      return { id: genId, result };
    }),

  /**
   * FR-004: Revise a generated presentation (max 3 revisions, no extra credits).
   * Uses two-step partial revision: parse intent → revise only affected parts.
   */
  revise: protectedProcedure
    .input(
      z.object({
        generationId: z.string(),
        prompt: z.string().min(3, "Revision must be at least 3 characters").max(500),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [gen] = await ctx.db
        .select()
        .from(schema.generation)
        .where(eq(schema.generation.id, input.generationId));

      if (!gen) throw new TRPCError({ code: "NOT_FOUND" });
      if (gen.userId !== ctx.session.user.id) throw new TRPCError({ code: "FORBIDDEN" });
      if (gen.status !== "completed") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot revise a failed or pending generation." });
      }
      if (gen.revisionCount >= MAX_REVISIONS) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Maximum ${MAX_REVISIONS} revisions reached for this generation.`,
        });
      }

      // Mark generation as pending while revising so clients know it is loading
      await ctx.db
        .update(schema.generation)
        .set({
          status: "pending",
          updatedAt: new Date(),
        })
        .where(eq(schema.generation.id, input.generationId));

      const currentJson = PresentationSchema.parse(gen.generatedJson);

      let revised: Presentation;
      let affectedSummary: string;

      try {
        const result = await revisePartialPresentation(
          currentJson,
          input.prompt,
          gen.model,
          gen.language
        );
        revised = result.revised;
        affectedSummary = result.intent.affectedSummary;
      } catch (err) {
        // Reset status back to completed on failure so it is not stuck in pending
        await ctx.db
          .update(schema.generation)
          .set({
            status: "completed",
            updatedAt: new Date(),
          })
          .where(eq(schema.generation.id, input.generationId));

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Revision failed. Please try again.",
        });
      }

      // Save revision record and update generation
      const revisionId = randomUUID();
      await ctx.db.insert(schema.revision).values({
        id: revisionId,
        generationId: input.generationId,
        prompt: input.prompt,
        affectedSummary,
        generatedJson: revised as any,
      });

      await ctx.db
        .update(schema.generation)
        .set({
          generatedJson: revised as any,
          revisionCount: gen.revisionCount + 1,
          status: "completed",
          updatedAt: new Date(),
        })
        .where(eq(schema.generation.id, input.generationId));

      const revisionsLeft = MAX_REVISIONS - gen.revisionCount - 1;
      return { id: revisionId, result: revised, affectedSummary, revisionsLeft };
    }),

  /**
   * Delete a generation and all its revisions
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check ownership
      const [gen] = await ctx.db
        .select()
        .from(schema.generation)
        .where(eq(schema.generation.id, input.id));

      if (!gen) throw new TRPCError({ code: "NOT_FOUND" });
      if (gen.userId !== ctx.session.user.id) throw new TRPCError({ code: "FORBIDDEN" });

      // Delete revisions manually since cascade delete is not set on the foreign key
      await ctx.db
        .delete(schema.revision)
        .where(eq(schema.revision.generationId, input.id));

      // Delete generation
      await ctx.db
        .delete(schema.generation)
        .where(eq(schema.generation.id, input.id));

      return { success: true };
    }),
});
