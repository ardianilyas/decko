import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText, convertToModelMessages } from "ai";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { message as messageTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const maxDuration = 60;

const CHAT_SYSTEM_PROMPT = `You are Decko, an expert AI assistant specializing in education, content creation, and presentation design.

You help users with:
- Generating structured presentation outlines and learning materials
- Explaining concepts clearly across all knowledge levels  
- Brainstorming ideas for courses, workshops, and training programs
- Reviewing and improving educational content

Communication style:
- Be concise and structured — use markdown headers, bullet points, and numbered lists where appropriate
- Match the user's tone: professional for formal requests, friendly for casual ones
- When presenting structured content, use clear headings
- Proactively suggest related ideas or follow-up improvements

You have deep expertise in instructional design, Bloom's taxonomy, and curriculum development.`;

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { messages, conversationId, model } = body;

    if (!conversationId) {
      return new Response("Missing conversationId", { status: 400 });
    }

    const latestUserMsg = messages?.[messages.length - 1];
    if (!latestUserMsg) {
      return new Response("No messages provided", { status: 400 });
    }

    const userContent =
      latestUserMsg.content ||
      (latestUserMsg.parts && latestUserMsg.parts[0]?.text) ||
      "";

    // Persist user message
    await db.insert(messageTable).values({
      id: nanoid(),
      conversationId,
      senderId: session.user.id,
      role: "user",
      content: userContent,
    });

    // Use requested model or fall back to a default
    const modelId = typeof model === "string" && model.trim()
      ? model.trim()
      : "openrouter/owl-alpha";

    const result = streamText({
      model: openrouter(modelId),
      system: CHAT_SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      temperature: 0.7,
      async onFinish({ text }) {
        await db.insert(messageTable).values({
          id: nanoid(),
          conversationId,
          senderId: null,
          role: "assistant",
          content: text,
        });

        await db
          .update(schema.conversation)
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
