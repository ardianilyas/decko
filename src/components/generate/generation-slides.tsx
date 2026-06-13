import { useState, useRef, useEffect } from "react";
import { Sparkles, Target, AlertCircle, BookOpen, ChevronLeft, ChevronRight, Check } from "lucide-react";
import type { Presentation } from "@/server/services/generation.service";
import { MarkdownContent } from "@/components/ui/markdown-content";

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
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-indigo-500/8 via-purple-500/8 to-pink-500/4 blur-[120px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-blue-500/8 via-teal-500/4 to-amber-500/8 blur-[120px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: "12s" }} />

        {/* Slide active content wrapper */}
        <div className="flex-1 flex flex-col z-10 select-text overflow-y-auto pr-1.5 pb-4 md:pb-6 scrollbar-thin">
          {currentSlide === 0 && (
            <div key={0} className={`flex flex-col justify-center flex-1 text-center space-y-3 md:space-y-5 animate-in fade-in duration-300 ${
              direction === "forward" ? "slide-in-from-right-[30px]" : "slide-in-from-left-[30px]"
            }`}>
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
          )}

          {currentSlide === 1 && (
            <div key={1} className={`w-full flex flex-col animate-in fade-in duration-300 ${
              direction === "forward" ? "slide-in-from-right-[30px]" : "slide-in-from-left-[30px]"
            }`}>
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
          )}

          {currentSlide >= 2 && currentSlide < totalSlides - 1 && (() => {
            const chapterIndex = currentSlide - 2;
            const chapter = result.chapters[chapterIndex];
            return (
              <div key={currentSlide} className={`w-full flex flex-col animate-in fade-in duration-300 ${
                direction === "forward" ? "slide-in-from-right-[30px]" : "slide-in-from-left-[30px]"
              }`}>
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
          })()}

          {currentSlide === totalSlides - 1 && (
            <div key={totalSlides - 1} className={`text-center space-y-4 md:space-y-6 animate-in fade-in duration-300 ${
              direction === "forward" ? "slide-in-from-right-[30px]" : "slide-in-from-left-[30px]"
            }`}>
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
