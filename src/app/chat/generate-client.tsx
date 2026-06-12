"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { GenerationForm } from "@/components/generate/generation-form";
import { GenerationResult } from "@/components/generate/generation-result";
import { HistoryList } from "@/components/generate/history-list";
import {
  PanelLeftOpen,
  PanelLeft,
  Sparkles,
  Plus,
  Search,
  Loader2,
  CheckCircle2,
  Circle,
} from "lucide-react";
import type { Presentation } from "@/server/services/generation.service";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";

const SearchCommand = dynamic(
  () => import("@/components/generate/search-command").then((mod) => mod.SearchCommand),
  { ssr: false }
);

const ThemeToggle = dynamic(
  () => import("@/components/theme-toggle").then((mod) => mod.ThemeToggle),
  {
    ssr: false,
    loading: () => (
      <div className="p-2 rounded-lg text-muted-foreground w-8 h-8 flex items-center justify-center">
        <span className="w-4 h-4 rounded-full bg-muted animate-pulse" />
      </div>
    ),
  }
);

const UserMenu = dynamic(
  () => import("./user-menu").then((mod) => mod.UserMenu),
  {
    ssr: false,
    loading: () => (
      <div className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg text-left">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="h-3.5 bg-muted rounded-md w-20 animate-pulse" />
          <div className="h-3 bg-muted/60 rounded-md w-32 animate-pulse" />
        </div>
        <div className="w-4 h-4 bg-muted rounded-md shrink-0 animate-pulse" />
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
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                title="Search presentations (⌘K)"
              >
                <Search className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                title="Close sidebar"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          <SearchCommand
            open={searchOpen}
            onOpenChange={setSearchOpen}
            onSelect={(id) => {
              handleHistorySelect(id);
              setSearchOpen(false);
            }}
          />

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
            <UserMenu user={user} />
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
        </div>        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto w-full relative">
          {isGenerating || (displayId && historyItem?.status === "pending" && !historyItem?.generatedJson) ? (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-xl z-20 flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
              {/* Ambient Glows */}
              <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-violet-500/5 blur-[120px] pointer-events-none" />

              {/* Glowing Center Orb Animation */}
              <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
                {/* Pulsing Aura */}
                <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-primary/20 via-violet-500/10 to-amber-500/20 blur-xl animate-pulse duration-3000" />
                
                {/* Outer Concentric Dash Ring (Spinning Counter-clockwise) */}
                <div 
                  className="absolute w-36 h-36 border border-dashed border-primary/20 rounded-full" 
                  style={{ animation: "spin 16s linear infinite reverse" }}
                />
                
                {/* Inner Concentric Dash Ring (Spinning Clockwise) */}
                <div 
                  className="absolute w-28 h-28 border border-dashed border-violet-500/30 rounded-full" 
                  style={{ animation: "spin 10s linear infinite" }}
                />

                {/* Glowing morphing gradient core */}
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-primary via-violet-500 to-amber-400 p-0.5 shadow-[0_0_40px_rgba(var(--primary),0.3)] animate-pulse duration-2000">
                  <div className="w-full h-full rounded-full bg-background/90 flex items-center justify-center backdrop-blur-2xl">
                    <Sparkles className="w-6 h-6 text-foreground animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Stepper Checklist */}
              <div className="text-center max-w-sm w-full space-y-6">
                <div className="space-y-1.5">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary via-foreground to-primary bg-clip-text text-transparent animate-pulse">
                    Crafting Outline
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Analyzing topic and generating custom slides
                  </p>
                </div>

                <div className="bg-card/50 border border-border/50 rounded-2xl p-5 shadow-sm space-y-3.5 text-left backdrop-blur-md">
                  {LOADING_STEPS.map((step, idx) => {
                    const isCompleted = idx < loadingStep;
                    const isActive = idx === loadingStep;
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 transition-all duration-500 ${
                          isCompleted ? "opacity-45 scale-98" : isActive ? "opacity-100 scale-102" : "opacity-25"
                        }`}
                      >
                        <div className="flex items-center justify-center w-5 h-5 shrink-0">
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 animate-in zoom-in duration-300" />
                          ) : isActive ? (
                            <div className="relative flex items-center justify-center">
                              <span className="absolute w-4 h-4 bg-primary/20 rounded-full animate-ping duration-1000" />
                              <span className="relative w-2 h-2 bg-primary rounded-full animate-pulse" />
                            </div>
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-muted-foreground/60" />
                          )}
                        </div>
                        <span
                          className={`text-xs transition-colors duration-500 ${
                            isActive ? "text-foreground font-semibold" : "text-muted-foreground"
                          }`}
                        >
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className={`max-w-3xl mx-auto px-4 py-8 md:py-12 ${displayId ? "pb-12" : "pb-56"}`}>
              {displayId ? (
                historyLoading ? (
                  <div className="flex flex-col items-center justify-center mt-24 space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Loading presentation...</p>
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
