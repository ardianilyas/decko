import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ChatLayout } from "@/components/chat/chat-layout";

export default async function ChatIdPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  const { id } = await params;

  return (
    <div className="flex flex-col h-screen bg-[#171717]">
      <main className="flex-1 flex overflow-hidden">
        <ChatLayout 
          userEmail={session.user.email} 
          userId={session.user.id} 
          userName={session.user.name} 
          initialConversationId={id} 
        />
      </main>
    </div>
  );
}
