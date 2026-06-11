"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { GenerationForm } from "@/components/generate/generation-form";
import { GenerationResult } from "@/components/generate/generation-result";
import { HistoryList } from "@/components/generate/history-list";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  PanelLeftOpen,
  PanelLeft,
  Sparkles,
  Plus,
  Loader2,
} from "lucide-react";
import type { Presentation } from "@/server/services/generation.service";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { SignOutButton } from "./sign-out-button";

export function GeneratePageClient({ user }: { user: { name: string; email: string } }) {
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>}>
      <GeneratePageContent user={user} />
    </Suspense>
  );
}

function GeneratePageContent({ user }: { user: { name: string; email: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const displayId = searchParams.get("id");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const utils = trpc.useUtils();

  const { data: historyItem, isLoading: historyLoading } = trpc.generation.getGeneration.useQuery(
    { id: displayId! },
    { 
      enabled: !!displayId,
      refetchInterval: (query) => query.state.data?.status === "pending" ? 3000 : false
    }
  );

  const handleNewGeneration = () => {
    router.push("/chat");
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleResult = (id: string, result: Presentation) => {
    router.push(`/chat?id=${id}`);
    utils.generation.getHistory.invalidate();
    utils.generation.getCredits.invalidate();
  };

  const handleHistorySelect = (id: string) => {
    router.push(`/chat?id=${id}`);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const displayResult = (historyItem?.generatedJson as Presentation | undefined) ?? null;
  const showResult = !!displayId && !!displayResult;

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground font-sans">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="absolute inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      {sidebarOpen && (
        <div className="absolute md:relative z-50 h-full w-[260px] shrink-0 border-r border-border bg-card flex flex-col">
          <div className="p-3 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Decko</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title="Close sidebar"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="p-2">
            <button
              onClick={handleNewGeneration}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Presentation
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                History
              </span>
            </div>
            <HistoryList onSelect={handleHistorySelect} activeId={displayId} />
          </div>

          <div className="p-3 border-t border-border bg-card">
            <div className="flex items-center justify-between gap-2 px-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">
                  {user.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
              <SignOutButton />
            </div>
          </div>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden relative bg-background">
        <div className="h-14 px-4 flex items-center justify-between border-b border-border shrink-0 bg-background/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <PanelLeftOpen className="w-4 h-4" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-foreground">
                {displayId ? "Generated Presentation" : "Create New Presentation"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto w-full">
          <div className={`max-w-3xl mx-auto px-4 py-8 md:py-12 ${displayId ? "pb-12" : "pb-56"}`}>
            {displayId ? (
              historyLoading ? (
                <div className="flex flex-col items-center justify-center mt-24 space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Loading presentation...</p>
                </div>
              ) : historyItem?.status === "pending" ? (
                <div className="flex flex-col items-center justify-center mt-24 space-y-5 animate-in fade-in zoom-in duration-500">
                  <div className="relative bg-card rounded-full p-2.5 shadow-sm border border-primary/20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" style={{ animation: "spin 1s linear infinite" }} />
                    <Sparkles className="w-4 h-4 text-amber-500 absolute -top-1.5 -right-1.5 animate-bounce" />
                  </div>
                  <div className="flex flex-col items-center space-y-1 text-center">
                    <p className="text-base font-bold bg-gradient-to-r from-primary to-foreground bg-clip-text text-transparent">
                      Still crafting your presentation...
                    </p>
                    <p className="text-xs text-muted-foreground">
                      This is running in the background. You can wait here or check back later!
                    </p>
                  </div>
                </div>
              ) : displayResult ? (
                <GenerationResult key={displayId} generationId={displayId} initialResult={displayResult} />
              ) : (
                <div className="flex flex-col items-center justify-center mt-24 space-y-4">
                  <p className="text-sm text-muted-foreground">Presentation not found or failed to generate.</p>
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center text-center space-y-4 mt-12 md:mt-24">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-secondary border border-border shadow-sm">
                  <Sparkles className="w-8 h-8 text-foreground" />
                </div>
                <h1 className="text-3xl font-bold text-foreground">
                  What are we presenting today?
                </h1>
                <p className="text-base text-muted-foreground max-w-md">
                  Enter a topic below to generate a complete, structured presentation outline with chapters and learning objectives.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Fixed bottom input area (kept mounted to prevent aborting requests) */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-10 ${displayId ? 'hidden' : 'block'}`}>
          <GenerationForm onResult={handleResult} />
        </div>
      </div>
    </div>
  );
}
