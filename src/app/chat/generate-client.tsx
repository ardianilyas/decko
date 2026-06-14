"use client";

import { GenerationForm } from "@/components/generate/generation-form";
import { GenerationResult } from "@/components/generate/generation-result";
import { PanelLeftOpen, Loader2, Zap } from "lucide-react";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { GenerateSidebar } from "./generate-sidebar";
import { GeneratingOverlay } from "./generating-overlay";
import { SUGGESTIONS, LOADING_STEPS } from "./constants";
import { useGeneratePage } from "@/hooks/use-generate-page";

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
  const {
    displayId,
    sidebarOpen,
    setSidebarOpen,
    searchOpen,
    setSearchOpen,
    topic,
    setTopic,
    textareaRef,
    greeting,
    setIsGenerating,
    loadingStep,
    historyLoading,
    displayResult,
    isGeneratingOverlayVisible,
    handleNewGeneration,
    handleResult,
    handleHistorySelect,
  } = useGeneratePage();

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
                  <div className="flex flex-col items-center justify-center text-center space-y-5 mt-20 animate-in fade-in duration-300">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 shadow-sm">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-xl font-bold text-foreground">Generation Failed</h2>
                      <p className="text-sm text-muted-foreground max-w-md">
                        Something went wrong while generating this presentation outline. If credits were deducted, they have been automatically refunded to your account.
                      </p>
                    </div>
                    <button
                      onClick={handleNewGeneration}
                      className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-semibold cursor-pointer shadow-sm animate-in zoom-in duration-300"
                    >
                      Try Another Topic
                    </button>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center text-center space-y-8 mt-8 md:mt-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-3">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                      {greeting}, {user.name.split(" ")[0]}
                    </h1>
                    <p className="text-lg md:text-xl font-medium text-foreground/85">
                      What would you like to present today?
                    </p>
                    <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
                      Select a structured template suggestion below or draft your own topic in the input box to generate a complete presentation outline.
                    </p>
                  </div>

                  {/* Suggestion Cards Grid */}
                  <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 px-2">
                    {SUGGESTIONS.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setTopic(s.topic);
                          textareaRef.current?.focus();
                        }}
                        className="group flex flex-col items-start text-left p-5 rounded-2xl border border-border bg-card/50 hover:bg-secondary/40 hover:border-foreground/20 active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-sm relative overflow-hidden"
                      >
                        {/* Hover accent line */}
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        
                        <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${s.badgeColor}`}>
                          {s.category}
                        </span>
                        <span className="font-semibold text-foreground text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {s.label}
                        </span>
                        <span className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                          {s.topic}
                        </span>
                      </button>
                    ))}
                  </div>
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
            topic={topic}
            setTopic={setTopic}
            textareaRef={textareaRef}
          />
        </div>
      </div>
    </div>
  );
}
