"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Presentation } from "@/server/services/generation.service";
import { TitleSlide } from "./slides/title-slide";
import { ObjectivesSlide } from "./slides/objectives-slide";
import { ChapterSlide } from "./slides/chapter-slide";
import { SummarySlide } from "./slides/summary-slide";

interface GenerationSlidesProps {
  result: Presentation;
}

export function GenerationSlides({ result }: GenerationSlidesProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const touchStartX = useRef<number | null>(null);

  const totalSlides = result.chapters.length + 3;

  useEffect(() => {
    if (currentSlide >= totalSlides) {
      setCurrentSlide(Math.max(0, totalSlides - 1));
    }
  }, [totalSlides, currentSlide]);

  const currentSlideRef = useRef(currentSlide);
  useEffect(() => {
    currentSlideRef.current = currentSlide;
  }, [currentSlide]);

  // Arrow key controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement | null;
      if (
        activeEl?.tagName === "INPUT" ||
        activeEl?.tagName === "TEXTAREA" ||
        activeEl?.isContentEditable
      ) {
        return;
      }

      if (e.key === "ArrowLeft") {
        const next = Math.max(0, currentSlideRef.current - 1);
        if (next !== currentSlideRef.current) {
          setDirection("backward");
          setCurrentSlide(next);
        }
      } else if (e.key === "ArrowRight") {
        const next = Math.min(totalSlides - 1, currentSlideRef.current + 1);
        if (next !== currentSlideRef.current) {
          setDirection("forward");
          setCurrentSlide(next);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [totalSlides]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    const threshold = 50; // swipe threshold of 50px
    if (diff > threshold) {
      const next = Math.min(totalSlides - 1, currentSlide + 1);
      if (next !== currentSlide) {
        setDirection("forward");
        setCurrentSlide(next);
      }
    } else if (diff < -threshold) {
      const next = Math.max(0, currentSlide - 1);
      if (next !== currentSlide) {
        setDirection("backward");
        setCurrentSlide(next);
      }
    }
    touchStartX.current = null;
  };

  return (
    <div className="space-y-4">
      {/* View Toggle Status Bar */}
      <div className="flex items-center justify-end flex-wrap">
        <div className="text-xs font-medium text-muted-foreground px-3 flex items-center gap-1.5 bg-background/50 border border-border/50 dark:border-white/5 py-1.5 rounded-xl">
          <span>Slide</span>
          <span className="text-foreground font-semibold">{currentSlide + 1}</span>
          <span>of</span>
          <span className="text-foreground font-semibold">{totalSlides}</span>
          <span className="text-muted-foreground/50 mx-1">·</span>
          <span className="text-[10px] bg-secondary/80 px-1.5 py-0.5 rounded border border-border/50 font-mono">← / → Arrow Keys</span>
        </div>
      </div>

      {/* Slide Viewport Canvas */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="w-full aspect-auto md:aspect-[16/9.5] min-h-[380px] md:min-h-[520px] bg-[#fcfdfa] dark:bg-[#0b0b0e] border border-border dark:border-white/10 rounded-3xl shadow-2xl flex flex-col justify-between p-6 md:py-8 md:px-10 relative overflow-hidden transition-all duration-300"
      >
        {/* Ambient gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-indigo-500/8 via-purple-500/8 to-indigo-500/4 blur-[120px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-blue-500/8 via-teal-500/4 to-amber-500/8 blur-[120px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: "12s" }} />

        {/* Slide active content wrapper */}
        <div className="flex-1 flex flex-col z-10 select-text overflow-y-auto pr-1.5 pb-4 md:pb-6 scrollbar-thin">
          {currentSlide === 0 && (
            <TitleSlide result={result} direction={direction} />
          )}

          {currentSlide === 1 && (
            <ObjectivesSlide result={result} direction={direction} />
          )}

          {currentSlide >= 2 && currentSlide < totalSlides - 1 && (() => {
            const chapterIndex = currentSlide - 2;
            const chapter = result.chapters[chapterIndex];
            return (
              <ChapterSlide
                key={currentSlide}
                chapter={chapter}
                currentSlide={currentSlide}
                direction={direction}
              />
            );
          })()}

          {currentSlide === totalSlides - 1 && (
            <SummarySlide result={result} direction={direction} />
          )}
        </div>

        {/* Slide footer bar */}
        <div className="flex items-center justify-between border-t border-border/40 pt-3 text-[10px] text-muted-foreground font-medium z-10 shrink-0">
          <div>Decko Presentation Planner</div>
          <div>Slide {currentSlide + 1} of {totalSlides}</div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between gap-4 bg-card border border-border px-5 py-3 rounded-2xl shadow-sm">
        <button
          type="button"
          onClick={() => {
            const next = Math.max(0, currentSlide - 1);
            if (next !== currentSlide) {
              setDirection("backward");
              setCurrentSlide(next);
            }
          }}
          disabled={currentSlide === 0}
          className="p-2 rounded-xl border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Indicator dots */}
        <div className="flex flex-nowrap items-center justify-center gap-1.5 max-w-[60%] overflow-x-auto py-1 no-scrollbar">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (idx !== currentSlide) {
                  setDirection(idx > currentSlide ? "forward" : "backward");
                  setCurrentSlide(idx);
                }
              }}
              className="rounded-full transition-all duration-300 cursor-pointer shrink-0"
              style={{
                width: idx === currentSlide ? "20px" : "8px",
                height: "8px",
                background: idx === currentSlide
                  ? "var(--primary)"
                  : "color-mix(in srgb, currentColor 25%, transparent)",
              }}
              title={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            const next = Math.min(totalSlides - 1, currentSlide + 1);
            if (next !== currentSlide) {
              setDirection("forward");
              setCurrentSlide(next);
            }
          }}
          disabled={currentSlide === totalSlides - 1}
          className="p-2 rounded-xl border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0 cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
