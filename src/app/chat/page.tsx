import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { GeneratePageClient } from "./generate-client";

export default async function ChatPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="h-screen bg-background">
      <GeneratePageClient user={{ name: session.user.name, email: session.user.email }} />
    </div>
  );
}
