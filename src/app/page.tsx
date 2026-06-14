import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import LandingPageClient from "@/components/landing/landing-client";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return <LandingPageClient isLoggedIn={!!session} user={session?.user} />;
}
