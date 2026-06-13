"use client";

import { Sparkles } from "lucide-react";
import type { Presentation } from "@/server/services/generation.service";

interface TitleSlideProps {
  result: Presentation;
  direction: "forward" | "backward";
}

export function TitleSlide({ result, direction }: TitleSlideProps) {
  return (
    <div
      className={`flex flex-col justify-center flex-1 text-center space-y-3 md:space-y-5 animate-in fade-in duration-300 ${
        direction === "forward" ? "slide-in-from-right-[30px]" : "slide-in-from-left-[30px]"
      }`}
    >
      <div className="inline-flex p-2 bg-gradient-to-tr from-amber-400 to-amber-200 rounded-full shadow-md shadow-amber-400/10 mx-auto animate-pulse">
        <Sparkles className="w-5 h-5 text-black" />
      </div>
      <div className="space-y-2">
        <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-violet-500 to-amber-400 bg-clip-text text-transparent leading-[1.15] px-4">
          {result.title}
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed px-6 font-medium">
          {result.description}
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        {[
          `Audience: ${result.targetAudience}`,
          `Duration: ${result.presentationDuration} min`,
          `Chapters: ${result.chapters.length}`,
        ].map((label) => (
          <span
            key={label}
            className="inline-flex items-center justify-center rounded-full font-bold text-foreground shadow-sm"
            style={{
              padding: "4px 14px",
              fontSize: "11px",
              border: "1px solid var(--border)",
              background: "var(--secondary)",
              lineHeight: 1,
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
