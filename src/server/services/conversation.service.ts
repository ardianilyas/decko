import { and, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import * as schema from "@/db/schema";

type AnyDb = {
  select: (...args: any[]) => any;
  update: (...args: any[]) => any;
};

/**
 * Verify that a user is a participant in a conversation.
 * Throws FORBIDDEN if not. Used in multiple router procedures.
 */
export async function verifyParticipant(db: any, conversationId: string, userId: string) {
  const rows = await db
    .select()
    .from(schema.participant)
    .where(
      and(
        eq(schema.participant.conversationId, conversationId),
        eq(schema.participant.userId, userId)
      )
    );

  if (rows.length === 0) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }

  return rows[0];
}

/**
 * Touch a conversation's updatedAt timestamp.
 * Used after sending/editing messages.
 */
export async function touchConversation(db: any, conversationId: string) {
  await db
    .update(schema.conversation)
    .set({ updatedAt: new Date() })
    .where(eq(schema.conversation.id, conversationId));
}
