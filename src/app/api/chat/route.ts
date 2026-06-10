import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText, convertToModelMessages } from "ai";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { message as messageTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, asc } from "drizzle-orm";
import { nanoid } from "nanoid";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const maxDuration = 60; // Allow longer generation

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { messages, conversationId } = await req.json();

    if (!conversationId) {
      console.error("400: Missing conversationId in request body");
      return new Response("Missing conversationId", { status: 400 });
    }

    // Save the user's latest message to DB
    const latestUserMsg = messages?.[messages?.length - 1];
    if (!latestUserMsg) {
      console.error("400: No messages provided. messages payload:", messages);
      return new Response("No messages provided", { status: 400 });
    }
    const userContent = latestUserMsg.content || (latestUserMsg.parts && latestUserMsg.parts[0]?.text) || "";
    await db.insert(messageTable).values({
      id: nanoid(),
      conversationId,
      senderId: session.user.id,
      role: "user",
      content: userContent,
    });

    // Save the AI's final response to the database once streaming finishes
    const result = streamText({
      model: openrouter("nvidia/nemotron-3-ultra-550b-a55b:free"),
      messages: await convertToModelMessages(messages),
      async onFinish({ text }) {
        await db.insert(messageTable).values({
          id: nanoid(),
          conversationId,
          senderId: null, // AI has no senderId
          role: "assistant",
          content: text,
        });

        // Update conversation timestamp
        await db.update(schema.conversation)
          .set({ updatedAt: new Date() })
          .where(eq(schema.conversation.id, conversationId));
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
