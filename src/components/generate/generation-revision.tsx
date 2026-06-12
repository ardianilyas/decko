import { Wand2, Sparkles, Check, Loader2, ArrowUp, RotateCcw } from "lucide-react";
import type { Presentation } from "@/server/services/generation.service";
import { usePresentationRevision, MAX_REVISIONS } from "@/hooks/use-presentation-revision";

interface GenerationRevisionProps {
  generationId: string;
  revisionsUsed: number;
  revisionHistory: any[];
  isPending: boolean;
  onRevisionSuccess: (revised: Presentation) => void;
  refetch: () => void;
}

export function GenerationRevision({
  generationId,
  revisionsUsed,
  revisionHistory,
  isPending,
  onRevisionSuccess,
  refetch,
}: GenerationRevisionProps) {
  const {
    revisionInput,
    setRevisionInput,
    textareaRef,
    revisionEndRef,
    revisionsLeft,
    reviseMutation,
    handleRevise,
    handleKeyDown,
  } = usePresentationRevision({
    generationId,
    revisionsUsed,
    onRevisionSuccess,
    refetch,
  });

  const isMutating = reviseMutation.isPending || isPending;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden mt-8 shadow-sm">
      {/* Header */}
      <div className="p-4 md:px-5 md:py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-secondary/10">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <Wand2 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Revise Presentation</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Free, no extra credits required</p>
          </div>
        </div>

        {/* Revision counter — dots */}
        <div className="flex items-center gap-1.5 bg-background border border-border px-3 py-1.5 rounded-full shadow-sm">
          {Array.from({ length: MAX_REVISIONS }).map((_, i) => (
            <span
              key={i}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                i < revisionsUsed
                  ? "bg-primary/70"
                  : "bg-border"
              }`}
            />
          ))}
          <span className="text-[10px] font-bold text-muted-foreground ml-1.5">
            {revisionsLeft}/{MAX_REVISIONS} LEFT
          </span>
        </div>
      </div>

      {/* Revision History */}
      {revisionHistory.length > 0 && (
        <div className="px-4 py-4 space-y-4 border-b border-border bg-background/40">
          {revisionHistory.slice().reverse().map((rev: any) => (
            <div key={rev.id} className="space-y-2">
              {/* User bubble */}
              <div className="flex items-start gap-2 justify-end">
                <div className="max-w-[85%] bg-primary/10 border border-primary/15 rounded-2xl rounded-tr-sm px-4 py-2.5">
                  <p className="text-sm text-foreground leading-relaxed">{rev.prompt}</p>
                </div>
              </div>
              {/* System response */}
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-1">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="max-w-[85%] bg-secondary/60 border border-border/60 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                    <span>Revised: <span className="text-foreground font-medium">{rev.affectedSummary ?? "Presentation"}</span></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={revisionEndRef} />
        </div>
      )}

      {/* Revision loading state */}
      {isMutating && (
        <div className="px-4 py-4 border-b border-border bg-background/40 space-y-4">
          {/* Show the user's message */}
          <div className="flex items-start gap-2 justify-end">
            <div className="max-w-[85%] bg-primary/10 border border-primary/15 rounded-2xl rounded-tr-sm px-4 py-2.5">
              <p className="text-sm text-foreground leading-relaxed">{revisionInput || "Revising presentation..."}</p>
            </div>
          </div>
          {/* Typing indicator */}
          <div className="flex items-start gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-1 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/25 via-violet-500/10 to-amber-500/25 animate-spin" style={{ animationDuration: "4s" }} />
              <Sparkles className="w-3.5 h-3.5 text-primary relative z-10 animate-pulse" />
            </div>
            <div className="bg-secondary/50 border border-border/40 rounded-2xl rounded-tl-sm px-4.5 py-3 flex items-center gap-3.5 shadow-sm">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-xs text-muted-foreground font-medium tracking-wide animate-pulse duration-2000">
                Revising outline...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="p-3">
        {revisionsLeft > 0 ? (
          <div className="flex items-end gap-2 bg-background rounded-xl border border-border focus-within:border-ring/50 focus-within:ring-1 focus-within:ring-ring/30 transition-all p-2">
            <textarea
              ref={textareaRef}
              value={revisionInput}
              onChange={(e) => setRevisionInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask for a revision... e.g. "make chapter 3 more detailed" or "ubah chapter 2 untuk pemula"`}
              rows={1}
              disabled={isMutating}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none leading-relaxed min-h-[24px] max-h-[120px] disabled:opacity-50"
            />
            <button
              onClick={handleRevise}
              disabled={revisionInput.trim().length < 3 || isMutating}
              className="p-1.5 rounded-lg bg-primary text-primary-foreground transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              {isMutating ? (
                <Loader2 className="w-4 h-4 animate-spin" style={{ animation: "spin 1s linear infinite" }} />
              ) : (
                <ArrowUp className="w-4 h-4" />
              )}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>No revisions remaining for this generation</span>
          </div>
        )}
        {revisionsLeft > 0 && (
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Press <kbd className="px-1 py-0.5 rounded bg-secondary border border-border text-[9px]">Enter</kbd> to send · <kbd className="px-1 py-0.5 rounded bg-secondary border border-border text-[9px]">Shift+Enter</kbd> for new line
          </p>
        )}
      </div>
    </div>
  );
}
