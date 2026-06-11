import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";
import * as schema from "@/db/schema";


export const MODEL_COSTS: Record<string, number> = {
  "openrouter/owl-alpha": 0,
  "deepseek/deepseek-chat": 3,
  "openai/gpt-4o-mini": 7,
};

/**
 * Get the current credit balance for a user.
 */
export async function getUserCredits(db: any, userId: string): Promise<number> {
  const [row] = await db
    .select({ credits: schema.user.credits })
    .from(schema.user)
    .where(eq(schema.user.id, userId));

  if (!row) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
  return row.credits;
}

/**
 * Deduct credits from a user and log the transaction.
 * Throws BAD_REQUEST if insufficient credits.
 */
export async function deductCredits(
  db: any,
  userId: string,
  amount: number,
  description: string
) {
  const current = await getUserCredits(db, userId);

  if (current < amount) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Insufficient credits. You need ${amount} credits but have ${current}.`,
    });
  }

  await db
    .update(schema.user)
    .set({ credits: current - amount })
    .where(eq(schema.user.id, userId));

  await db.insert(schema.creditTransaction).values({
    id: randomUUID(),
    userId,
    amount: -amount,
    type: "GENERATION",
    description,
  });

  return current - amount;
}

/**
 * Refund credits to a user and log the transaction.
 * Called when AI generation fails after credit deduction.
 */
export async function refundCredits(
  db: any,
  userId: string,
  amount: number,
  description: string
) {
  const [row] = await db
    .select({ credits: schema.user.credits })
    .from(schema.user)
    .where(eq(schema.user.id, userId));

  const current = row?.credits ?? 0;

  await db
    .update(schema.user)
    .set({ credits: current + amount })
    .where(eq(schema.user.id, userId));

  await db.insert(schema.creditTransaction).values({
    id: randomUUID(),
    userId,
    amount,
    type: "REFUND",
    description,
  });
}
