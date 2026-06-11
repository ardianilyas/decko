import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { desc, asc, inArray, and, eq } from "drizzle-orm";
import * as schema from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";
import {
  verifyParticipant,
  touchConversation,
} from "../services/conversation.service";

export const chatRouter = router({
  // -------------------------------------------------------------------------
  // Queries
  // -------------------------------------------------------------------------

  getConversations: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db
      .select({
        id: schema.conversation.id,
        name: schema.conversation.name,
        isGroup: schema.conversation.isGroup,
        updatedAt: schema.conversation.updatedAt,
      })
      .from(schema.conversation)
      .innerJoin(
        schema.participant,
        eq(schema.conversation.id, schema.participant.conversationId)
      )
      .where(eq(schema.participant.userId, ctx.session.user.id))
      .orderBy(desc(schema.conversation.updatedAt));

    return result;
  }),

  getMessages: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ ctx, input }) => {
      await verifyParticipant(ctx.db, input.conversationId, ctx.session.user.id);

      const messages = await ctx.db
        .select({
          id: schema.message.id,
          content: schema.message.content,
          createdAt: schema.message.createdAt,
          senderId: schema.message.senderId,
          role: schema.message.role,
          senderName: schema.user.name,
        })
        .from(schema.message)
        .leftJoin(schema.user, eq(schema.message.senderId, schema.user.id))
        .where(eq(schema.message.conversationId, input.conversationId))
        .orderBy(asc(schema.message.createdAt));

      return messages;
    }),

  // -------------------------------------------------------------------------
  // Mutations
  // -------------------------------------------------------------------------

  createConversation: protectedProcedure
    .input(z.object({ name: z.string().optional() }).optional())
    .mutation(async ({ ctx, input }) => {
      const convId = randomUUID();
      await ctx.db.insert(schema.conversation).values({
        id: convId,
        name: input?.name || "New Chat",
        isGroup: false,
      });
      await ctx.db.insert(schema.participant).values({
        id: randomUUID(),
        conversationId: convId,
        userId: ctx.session.user.id,
      });
      return { id: convId };
    }),

  sendMessage: protectedProcedure
    .input(z.object({ conversationId: z.string(), content: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await verifyParticipant(ctx.db, input.conversationId, ctx.session.user.id);

      const [newMessage] = await ctx.db
        .insert(schema.message)
        .values({
          id: randomUUID(),
          conversationId: input.conversationId,
          senderId: ctx.session.user.id,
          content: input.content,
        })
        .returning();

      await touchConversation(ctx.db, input.conversationId);
      return newMessage;
    }),

  deleteMessagesFrom: protectedProcedure
    .input(z.object({ conversationId: z.string(), messageId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await verifyParticipant(ctx.db, input.conversationId, ctx.session.user.id);

      // Get the target message's timestamp
      const [msg] = await ctx.db
        .select({ createdAt: schema.message.createdAt })
        .from(schema.message)
        .where(
          and(
            eq(schema.message.id, input.messageId),
            eq(schema.message.conversationId, input.conversationId)
          )
        );

      if (!msg) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Message not found" });
      }

      // Fetch IDs of messages at or after this timestamp and batch-delete
      const all = await ctx.db
        .select({ id: schema.message.id, createdAt: schema.message.createdAt })
        .from(schema.message)
        .where(eq(schema.message.conversationId, input.conversationId));

      const cutoff = new Date(msg.createdAt).getTime();
      const toDeleteIds = all
        .filter((m) => new Date(m.createdAt).getTime() >= cutoff)
        .map((m) => m.id);

      if (toDeleteIds.length > 0) {
        await ctx.db
          .delete(schema.message)
          .where(inArray(schema.message.id, toDeleteIds));
      }

      return { success: true, deletedCount: toDeleteIds.length };
    }),
});
