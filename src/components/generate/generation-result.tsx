"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import type { Presentation } from "@/server/services/generation.service";

import { GenerationHeader } from "./generation-header";
import { GenerationOutline } from "./generation-outline";
import { GenerationSlides } from "./generation-slides";
import { GenerationRevision } from "./generation-revision";

interface GenerationResultProps {
  generationId: string;
  initialResult: Presentation;
}

export function GenerationResult({ generationId, initialResult }: GenerationResultProps) {
  const [result, setResult] = useState<Presentation>(initialResult);
  const [viewMode, setViewMode] = useState<"outline" | "slides">("outline");
  const [isUpdated, setIsUpdated] = useState(false);

  const { data: gen, refetch } = trpc.generation.getGeneration.useQuery({ id: generationId });

  const revisionsUsed = gen?.revisionCount ?? 0;
  const revisionHistory = gen?.revisions ?? [];
  const isPending = gen?.status === "pending";

  const handleRevisionSuccess = (revised: Presentation) => {
    setResult(revised);
    // Flash the result to indicate it was updated
    setIsUpdated(true);
    setTimeout(() => setIsUpdated(false), 1500);
  };

  return (
    <div className={`w-full space-y-6 transition-all duration-500 ${isUpdated ? "opacity-60 scale-[0.995]" : "opacity-100 scale-100"}`}>
      <GenerationHeader result={result} />

      {/* View Toggle */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-secondary/35 dark:bg-white/[0.02] border border-border/60 dark:border-white/5 p-1.5 rounded-2xl">
        <div className="flex items-center p-1 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 dark:border-white/5 shadow-sm">
          <button
            type="button"
            onClick={() => setViewMode("outline")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              viewMode === "outline"
                ? "bg-background text-foreground shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Outline View
          </button>
          <button
            type="button"
            onClick={() => setViewMode("slides")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              viewMode === "slides"
                ? "bg-background text-foreground shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Slide Deck Preview
          </button>
        </div>
      </div>

      {viewMode === "outline" ? (
        <GenerationOutline result={result} />
      ) : (
        <GenerationSlides result={result} />
      )}

      <GenerationRevision
        generationId={generationId}
        revisionsUsed={revisionsUsed}
        revisionHistory={revisionHistory}
        isPending={isPending}
        onRevisionSuccess={handleRevisionSuccess}
        refetch={refetch}
      />
    </div>
  );
}
