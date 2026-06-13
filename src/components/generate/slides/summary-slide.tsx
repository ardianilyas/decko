"use client";

import { BookOpen } from "lucide-react";
import type { Presentation } from "@/server/services/generation.service";
import { MarkdownContent } from "@/components/ui/markdown-content";

interface SummarySlideProps {
  result: Presentation;
  direction: "forward" | "backward";
}

export function SummarySlide({ result, direction }: SummarySlideProps) {
  return (
    <div
      className={`text-center space-y-4 md:space-y-6 animate-in fade-in duration-300 ${
        direction === "forward" ? "slide-in-from-right-[30px]" : "slide-in-from-left-[30px]"
      }`}
    >
      <div className="inline-flex p-3 bg-gradient-to-tr from-primary/20 via-violet-500/10 to-amber-500/20 rounded-full shadow-sm mx-auto animate-pulse">
        <BookOpen className="w-6 h-6 text-primary" />
      </div>
      <div className="space-y-3">
        <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
          Presentation Summary
        </h2>
        <div className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed bg-secondary/15 dark:bg-zinc-900/20 border border-border/60 rounded-2xl p-4 md:p-6 shadow-inner overflow-y-auto max-h-[180px] md:max-h-[220px] scrollbar-thin">
          <MarkdownContent content={result.summary} compact />
        </div>
      </div>
      <h3 className="text-sm font-bold text-primary tracking-wider uppercase pt-2 animate-pulse">
        Presentation Plan Completed
      </h3>
    </div>
  );
}
