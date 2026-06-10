import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignOutButton } from "./sign-out-button";
import { ChatLayout } from "@/components/chat/chat-layout";

export default async function ChatPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="flex flex-col h-screen bg-[#171717]">
      <main className="flex-1 flex overflow-hidden">
        <ChatLayout userEmail={session.user.email} userId={session.user.id} />
      </main>
    </div>
  );
}
