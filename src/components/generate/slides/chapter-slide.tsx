"use client";

import { Check } from "lucide-react";
import type { Presentation } from "@/server/services/generation.service";
import { MarkdownContent } from "@/components/ui/markdown-content";

interface ChapterSlideProps {
  chapter: Presentation["chapters"][number];
  currentSlide: number;
  direction: "forward" | "backward";
}

export function ChapterSlide({ chapter, currentSlide, direction }: ChapterSlideProps) {
  return (
    <div
      className={`w-full flex flex-col animate-in fade-in duration-300 ${
        direction === "forward" ? "slide-in-from-right-[30px]" : "slide-in-from-left-[30px]"
      }`}
    >
      <div className="flex items-center justify-between border-b border-border/50 pb-2 mb-4 md:mb-6 flex-wrap gap-2 shrink-0">
        <h2 className="text-base sm:text-lg md:text-xl font-bold text-foreground flex items-center gap-2 min-w-0">
          <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-xs sm:text-sm font-extrabold text-primary shrink-0">
            {chapter.chapterNumber}
          </span>
          <span className="truncate font-extrabold">{chapter.title}</span>
        </h2>
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-secondary/80 dark:bg-zinc-800/80 px-2 py-1 rounded-md border border-border/50">
          Slide {currentSlide + 1}
        </span>
      </div>

      <div className="flex flex-col gap-4 md:gap-6 w-full">
        {/* Left Card: Overview & Takeaways */}
        <div className="bg-secondary/50 dark:bg-white/[0.03] border border-border/85 dark:border-white/5 rounded-2xl p-4 md:p-5 h-auto">
          <div className="text-xs font-bold text-foreground uppercase tracking-wider mb-3 border-b border-border/40 pb-1.5">
            Chapter Overview
          </div>
          <div className="space-y-4 pt-1">
            <div className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-medium">
              <MarkdownContent content={chapter.chapterSummary || chapter.description} compact />
            </div>

            <div className="space-y-2.5 pt-3 border-t border-border/40">
              <div className="text-[10px] font-bold text-foreground uppercase tracking-wider">Key Takeaways</div>
              <ul className="space-y-2">
                {chapter.keyTakeaways.map((kt, ki) => (
                  <li key={ki} className="flex items-start gap-2 text-xs text-foreground/90 leading-relaxed">
                    <Check className="w-3.5 h-3.5 text-green-500 dark:text-green-400 shrink-0 mt-0.5" />
                    <span className="font-medium">{kt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Card: Topics */}
        <div className="bg-secondary/50 dark:bg-white/[0.03] border border-border/85 dark:border-white/5 rounded-2xl p-4 md:p-5 h-auto">
          <div className="text-xs font-bold text-foreground uppercase tracking-wider mb-3 border-b border-border/40 pb-1.5">
            Topics & Explanations
          </div>
          <div className="space-y-3 pt-1">
            {chapter.topics.map((topic, ti) => (
              <div key={ti} className="p-4 md:p-5 bg-background border border-border/60 dark:border-white/[0.03] rounded-2xl space-y-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.01)] transition-all hover:border-primary/20 hover:shadow-sm">
                <div className="font-bold text-xs sm:text-sm text-foreground flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 animate-pulse" />
                  {topic.title}
                </div>
                <div className="pl-4 text-xs text-muted-foreground dark:text-zinc-300 leading-relaxed font-medium">
                  <MarkdownContent content={topic.explanation} compact />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
