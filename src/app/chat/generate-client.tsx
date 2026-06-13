"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/trpc/client";
import { GenerationForm } from "@/components/generate/generation-form";
import { GenerationResult } from "@/components/generate/generation-result";
import { PanelLeftOpen, Sparkles, Loader2 } from "lucide-react";
import type { Presentation } from "@/server/services/generation.service";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { GenerateSidebar } from "./generate-sidebar";
import { GeneratingOverlay } from "./generating-overlay";

const ThemeToggle = dynamic(
  () => import("@/components/theme-toggle").then((mod) => mod.ThemeToggle),
  {
    ssr: false,
    loading: () => (
      <div className="p-2 rounded-lg w-8 h-8 flex items-center justify-center bg-secondary/35 border border-border/10 animate-pulse">
        <span className="w-4 h-4 rounded-full bg-muted-foreground/25" />
      </div>
    ),
  }
);

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
  const [searchOpen, setSearchOpen] = useState(false);

  const LOADING_STEPS = [
    "Tuning prompt template...",
    "Generating presentation content...",
    "Structuring outline & chapters...",
    "Polishing key takeaways & details...",
    "Finalizing document structures...",
  ];
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  // Cmd+K / Ctrl+K to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const utils = trpc.useUtils();

  const { data: historyItem, isLoading: historyLoading } = trpc.generation.getGeneration.useQuery(
    { id: displayId! },
    { 
      enabled: !!displayId,
      refetchInterval: (query) => query.state.data?.status === "pending" ? 3000 : false
    }
  );

  // Cycle loadingStep for new generations
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const isPending = isGenerating || (historyItem?.status === "pending" && !historyItem?.generatedJson);
    if (isPending) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1 < LOADING_STEPS.length ? prev + 1 : prev));
      }, 3000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating, historyItem?.status, !!historyItem?.generatedJson]);

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
  const isGeneratingOverlayVisible = isGenerating || (displayId && historyItem?.status === "pending" && !historyItem?.generatedJson);

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
      <GenerateSidebar
        user={user}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
        displayId={displayId}
        handleNewGeneration={handleNewGeneration}
        handleHistorySelect={handleHistorySelect}
      />

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
        <div className="flex-1 overflow-y-auto w-full relative">
          <GeneratingOverlay
            isVisible={!!isGeneratingOverlayVisible}
            loadingStep={loadingStep}
            loadingSteps={LOADING_STEPS}
          />

          {!isGeneratingOverlayVisible && (
            <div className={`max-w-3xl mx-auto px-4 py-8 md:py-12 ${displayId ? "pb-12" : "pb-56"}`}>
              {displayId ? (
                historyLoading ? (
                  <div className="w-full space-y-6 animate-pulse">
                    {/* Header meta skeleton */}
                    <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                      <div className="space-y-2.5">
                        <div className="h-5.5 bg-muted-foreground/20 rounded-md w-1/2" />
                        <div className="h-3.5 bg-muted-foreground/15 rounded-md w-3/4" />
                        <div className="h-3.5 bg-muted-foreground/10 rounded-md w-2/3" />
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                        <div className="h-14 bg-secondary/40 border border-border/20 rounded-xl animate-pulse" />
                        <div className="h-14 bg-secondary/40 border border-border/20 rounded-xl animate-pulse" />
                        <div className="h-14 bg-secondary/40 border border-border/20 rounded-xl animate-pulse" />
                      </div>
                    </div>

                    {/* Learning Objectives skeleton */}
                    <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-muted-foreground/20 rounded shrink-0" />
                        <div className="h-3.5 bg-muted-foreground/20 rounded w-28" />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 bg-secondary/50 border border-border/20 rounded-full shrink-0 animate-pulse" />
                          <div className="h-3.5 bg-muted-foreground/15 rounded w-[85%] mt-0.5" />
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 bg-secondary/50 border border-border/20 rounded-full shrink-0 animate-pulse" />
                          <div className="h-3.5 bg-muted-foreground/15 rounded w-[75%] mt-0.5" />
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="w-5 h-5 bg-secondary/50 border border-border/20 rounded-full shrink-0 animate-pulse" />
                          <div className="h-3.5 bg-muted-foreground/15 rounded w-[80%] mt-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Chapters skeleton */}
                    <div className="space-y-3">
                      <div className="h-3.5 bg-muted-foreground/12 rounded-md w-20 px-0.5" />
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                          <div className="w-7 h-7 bg-secondary/50 border border-border/20 rounded-full shrink-0 animate-pulse" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3.5 bg-muted-foreground/20 rounded w-1/3" />
                            <div className="h-3 bg-muted-foreground/12 rounded w-2/3" />
                          </div>
                          <div className="w-4 h-4 bg-muted-foreground/10 rounded shrink-0" />
                        </div>
                      ))}
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
          )}
        </div>

        {/* Fixed bottom input area (kept mounted to prevent aborting requests) */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-10 ${displayId ? 'hidden' : 'block'}`}>
          <GenerationForm 
            onResult={handleResult} 
            onPendingChange={(pending) => {
              setIsGenerating(pending);
            }}
          />
        </div>
      </div>
    </div>
  );
}
