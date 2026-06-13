"use client";

import { Target, AlertCircle } from "lucide-react";
import type { Presentation } from "@/server/services/generation.service";

interface ObjectivesSlideProps {
  result: Presentation;
  direction: "forward" | "backward";
}

export function ObjectivesSlide({ result, direction }: ObjectivesSlideProps) {
  return (
    <div
      className={`w-full flex flex-col animate-in fade-in duration-300 ${
        direction === "forward" ? "slide-in-from-right-[30px]" : "slide-in-from-left-[30px]"
      }`}
    >
      <h2 className="text-base sm:text-lg md:text-xl font-bold text-foreground mb-4 md:mb-6 flex items-center gap-2 border-b border-border/50 pb-2 shrink-0">
        <Target className="w-4 md:w-5 h-4 md:h-5 text-primary" />
        Learning Objectives & Prerequisites
      </h2>
      <div className="flex flex-col gap-4 md:gap-6 w-full">
        {/* Objectives Card */}
        <div className="bg-secondary/50 dark:bg-white/[0.03] border border-border/85 dark:border-white/5 rounded-2xl p-4 md:p-5 h-auto">
          <div className="text-xs font-bold text-foreground uppercase tracking-wider mb-3 border-b border-border/40 pb-1.5 flex items-center gap-2">
            <Target className="w-3.5 h-3.5 text-primary" />
            Objectives
          </div>
          <div className="space-y-3">
            <ul className="space-y-3">
              {result.learningObjectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90 leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="font-medium">{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Prerequisites Card */}
        <div className="bg-secondary/50 dark:bg-white/[0.03] border border-border/85 dark:border-white/5 rounded-2xl p-4 md:p-5 h-auto">
          <div className="text-xs font-bold text-foreground uppercase tracking-wider mb-3 border-b border-border/40 pb-1.5 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-primary" />
            Prerequisites
          </div>
          <div className="space-y-3">
            {result.prerequisites.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {result.prerequisites.map((pre, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-xl bg-background border border-border text-xs text-foreground/90 font-semibold shadow-sm transition-all hover:border-primary/30 hover:shadow">
                    {pre}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic font-medium">No prior experience required. Perfect for beginners!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
