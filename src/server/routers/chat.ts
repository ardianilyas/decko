import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { eq, and, desc, asc } from "drizzle-orm";
import * as schema from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";

export const chatRouter = router({
  getConversations: protectedProcedure.query(async ({ ctx }) => {
    // For now, let's just return all conversations the user is part of.
    const userParticipants = await ctx.db
      .select({
        conversationId: schema.participant.conversationId,
      })
      .from(schema.participant)
      .where(eq(schema.participant.userId, ctx.session.user.id));

    if (userParticipants.length === 0) return [];

    const conversationIds = userParticipants.map((p) => p.conversationId);



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
      // Verify user is in conversation
      const isParticipant = await ctx.db
        .select()
        .from(schema.participant)
        .where(
          and(
            eq(schema.participant.conversationId, input.conversationId),
            eq(schema.participant.userId, ctx.session.user.id)
          )
        );

      if (isParticipant.length === 0) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      // Join with user to get sender name
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

  sendMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        content: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify participant
      const isParticipant = await ctx.db
        .select()
        .from(schema.participant)
        .where(
          and(
            eq(schema.participant.conversationId, input.conversationId),
            eq(schema.participant.userId, ctx.session.user.id)
          )
        );

      if (isParticipant.length === 0) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const [newMessage] = await ctx.db
        .insert(schema.message)
        .values({
          id: randomUUID(),
          conversationId: input.conversationId,
          senderId: ctx.session.user.id,
          content: input.content,
        })
        .returning();

      // Update conversation updatedAt
      await ctx.db
        .update(schema.conversation)
        .set({ updatedAt: new Date() })
        .where(eq(schema.conversation.id, input.conversationId));

      return newMessage;
    }),

  createConversation: protectedProcedure
    .mutation(async ({ ctx }) => {
      // Create a dummy group conversation for testing if empty
      const convId = randomUUID();
      await ctx.db.insert(schema.conversation).values({
        id: convId,
        name: "General Chat",
        isGroup: true,
      });

      await ctx.db.insert(schema.participant).values({
        id: randomUUID(),
        conversationId: convId,
        userId: ctx.session.user.id,
      });

      return { id: convId };
    }),
});
