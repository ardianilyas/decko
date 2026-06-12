"use client";

import { useState, useRef, useEffect } from "react";
import { trpc } from "@/trpc/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  RotateCcw,
  Loader2,
  Clock,
  Users,
  Target,
  BookOpen,
  AlertCircle,
  ArrowUp,
  Sparkles,
  Wand2,
  FileDown,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import type { Presentation } from "@/server/services/generation.service";
import { exportToPDF, exportToDocx } from "@/lib/export";

interface GenerationResultProps {
  generationId: string;
  initialResult: Presentation;
}

const MAX_REVISIONS = 3;

export function GenerationResult({ generationId, initialResult }: GenerationResultProps) {
  const [result, setResult] = useState<Presentation>(initialResult);
  const [revisionInput, setRevisionInput] = useState("");
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set([0]));
  const [copied, setCopied] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingDocx, setExportingDocx] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const revisionEndRef = useRef<HTMLDivElement>(null);

  // Slide Visualizer state and hooks
  const [viewMode, setViewMode] = useState<"outline" | "slides">("outline");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const touchStartX = useRef<number | null>(null);

  const totalSlides = result.chapters.length + 3;

  // Auto-adjust slide index if it becomes out of bounds (e.g. after a revision changes chapter count)
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
    if (viewMode !== "slides") return;
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if typing in text inputs or textareas
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
  }, [viewMode, totalSlides]);

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

  const { data: gen, refetch } = trpc.generation.getGeneration.useQuery({ id: generationId });

  const revisionsUsed = gen?.revisionCount ?? 0;
  const revisionsLeft = Math.max(0, MAX_REVISIONS - revisionsUsed);
  const revisionHistory = gen?.revisions ?? [];

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  }, [revisionInput]);

  const reviseMutation = trpc.generation.revise.useMutation({
    onSuccess: ({ result: revised, affectedSummary, revisionsLeft: left }) => {
      setResult(revised);
      setRevisionInput("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";

      // Flash the result to indicate it was updated
      setIsUpdated(true);
      setTimeout(() => setIsUpdated(false), 1500);

      refetch();

      toast.success(
        `✓ Revised: ${affectedSummary}${left > 0 ? ` — ${left} revision${left !== 1 ? "s" : ""} left` : " — no revisions left"}`,
        { duration: 4000 }
      );

      // Scroll to see the revision history
      setTimeout(() => revisionEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 300);
    },
    onError: (err) => {
      toast.error(err.message || "Revision failed. Please try again.");
    },
  });

  const handleRevise = () => {
    const trimmed = revisionInput.trim();
    if (trimmed.length < 3 || reviseMutation.isPending || revisionsLeft === 0) return;
    reviseMutation.mutate({ generationId, prompt: trimmed });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleRevise();
    }
  };

  const handleCopyText = async () => {
    let text = `${result.title}\n${result.description}\n\n`;
    text += `Duration: ${result.presentationDuration} min | Audience: ${result.targetAudience}\n\n`;
    text += `LEARNING OBJECTIVES:\n`;
    result.learningObjectives.forEach((obj, i) => (text += `${i + 1}. ${obj}\n`));
    text += `\n`;
    if (result.prerequisites.length > 0) {
      text += `PREREQUISITES:\n`;
      result.prerequisites.forEach((pre) => (text += `- ${pre}\n`));
      text += `\n`;
    }
    text += `CHAPTERS:\n`;
    result.chapters.forEach((chapter) => {
      text += `\nChapter ${chapter.chapterNumber}: ${chapter.title}\n`;
      text += `${chapter.description}\n`;
      if (chapter.chapterSummary) text += `${chapter.chapterSummary}\n`;
      text += `Topics:\n`;
      chapter.topics.forEach((t) => {
        text += `- ${t.title}\n  ${t.explanation}\n`;
      });
      text += `Key Takeaways:\n`;
      chapter.keyTakeaways.forEach((k) => (text += `- ${k}\n`));
    });
    text += `\nSUMMARY:\n${result.summary}\n`;

    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Text copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = async () => {
    setExportingPdf(true);
    try {
      await exportToPDF(result);
      toast.success("PDF downloaded!");
    } catch {
      toast.error("Failed to export PDF.");
    } finally {
      setExportingPdf(false);
    }
  };

  const handleExportDocx = async () => {
    setExportingDocx(true);
    try {
      await exportToDocx(result);
      toast.success("DOCX downloaded!");
    } catch {
      toast.error("Failed to export DOCX.");
    } finally {
      setExportingDocx(false);
    }
  };

  const toggleChapter = (idx: number) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className={`w-full space-y-6 transition-all duration-500 ${isUpdated ? "opacity-60 scale-[0.995]" : "opacity-100 scale-100"}`}>
      {/* Header meta */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1 min-w-0">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">{result.title}</h2>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{result.description}</p>
          </div>
          {/* Export toolbar */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleCopyText}
              title="Copy as plain text"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>
            <button
              onClick={handleExportPDF}
              disabled={exportingPdf}
              title="Export as PDF"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
            >
              {exportingPdf
                ? <Loader2 className="w-3.5 h-3.5" style={{ animation: "spin 1s linear infinite" }} />
                : <FileDown className="w-3.5 h-3.5" />}
              <span>PDF</span>
            </button>
            <button
              onClick={handleExportDocx}
              disabled={exportingDocx}
              title="Export as DOCX"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
            >
              {exportingDocx
                ? <Loader2 className="w-3.5 h-3.5" style={{ animation: "spin 1s linear infinite" }} />
                : <FileText className="w-3.5 h-3.5" />}
              <span>DOCX</span>
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <MetaStat icon={<Clock className="w-4 h-4" />} label="Duration" value={`${result.presentationDuration} min`} />
          <MetaStat icon={<Users className="w-4 h-4" />} label="Audience" value={result.targetAudience} />
          <MetaStat icon={<BookOpen className="w-4 h-4" />} label="Chapters" value={`${result.chapters.length} chapters`} />
        </div>
      </div>

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

        {viewMode === "slides" && (
          <div className="text-xs font-medium text-muted-foreground px-3 flex items-center gap-1.5 bg-background/50 border border-border/50 dark:border-white/5 py-1.5 rounded-xl">
            <span>Slide</span>
            <span className="text-foreground font-semibold">{currentSlide + 1}</span>
            <span>of</span>
            <span className="text-foreground font-semibold">{totalSlides}</span>
            <span className="text-muted-foreground/50 mx-1">·</span>
            <span className="text-[10px] bg-secondary/80 px-1.5 py-0.5 rounded border border-border/50 font-mono">← / → Arrow Keys</span>
          </div>
        )}
      </div>

      {viewMode === "outline" ? (
        <>
          {/* Learning Objectives */}
          <Section title="Learning Objectives" icon={<Target className="w-4 h-4" />}>
            <ul className="space-y-1.5">
              {result.learningObjectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="w-5 h-5 rounded-full bg-secondary border border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {obj}
                </li>
              ))}
            </ul>
          </Section>

          {/* Prerequisites */}
          {result.prerequisites.length > 0 && (
            <Section title="Prerequisites" icon={<AlertCircle className="w-4 h-4" />}>
              <ul className="flex flex-wrap gap-2">
                {result.prerequisites.map((pre, i) => (
                  <li key={i} className="px-3 py-1 rounded-full bg-secondary border border-border text-xs text-foreground font-medium">
                    {pre}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Chapters */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider px-0.5">Chapters</h3>
            {result.chapters.map((chapter, idx) => (
              <div key={chapter.chapterNumber} className="bg-card border border-border rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleChapter(idx)}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-secondary/50 transition-colors cursor-pointer"
                >
                  <span className="w-7 h-7 rounded-full bg-secondary border border-border flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
                    {chapter.chapterNumber}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground">{chapter.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{chapter.description}</div>
                  </div>
                  {expandedChapters.has(idx) ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </button>

                {expandedChapters.has(idx) && (
                  <div className="px-4 pb-4 space-y-4 border-t border-border bg-background/50 animate-in fade-in duration-200">
                    {chapter.chapterSummary && (
                      <div className="pt-3 border-b border-border/50 pb-3">
                        <MarkdownContent content={chapter.chapterSummary} />
                      </div>
                    )}
                    <div className="pt-3 space-y-1">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Topics</div>
                      <ul className="space-y-1">
                        {chapter.topics.map((topic, ti) => (
                          <li key={ti} className="flex flex-col gap-1 text-sm text-foreground">
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground shrink-0" />
                              <span className="font-semibold">{topic.title}</span>
                            </div>
                            <div className="pl-3.5 mt-1">
                              <MarkdownContent content={topic.explanation} />
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Key Takeaways</div>
                      <ul className="space-y-1">
                        {chapter.keyTakeaways.map((kt, ki) => (
                          <li key={ki} className="flex items-start gap-2 text-sm text-foreground">
                            <Check className="w-3.5 h-3.5 text-green-500 dark:text-green-400 shrink-0 mt-0.5" />
                            {kt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Summary */}
          <Section title="Summary" icon={<BookOpen className="w-4 h-4" />}>
            <MarkdownContent content={result.summary} />
          </Section>
        </>
      ) : (
        <div className="space-y-4">
          {/* Slide Viewport Canvas */}
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="w-full aspect-[16/9] min-h-[320px] md:min-h-[460px] bg-card/65 dark:bg-[#08080a]/65 border border-border/80 dark:border-white/10 rounded-2xl shadow-xl flex flex-col justify-between p-6 md:p-10 relative overflow-hidden backdrop-blur-md transition-all duration-300"
          >
            {/* Ambient gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-primary/10 via-violet-500/10 to-indigo-500/5 blur-[120px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: "8s" }} />
            <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-blue-500/10 via-pink-500/5 to-amber-500/10 blur-[120px] pointer-events-none z-0 animate-pulse" style={{ animationDuration: "12s" }} />

            {/* Slide active content wrapper */}
            <div className="flex-1 flex flex-col justify-center z-10 select-text overflow-hidden">
              {currentSlide === 0 && (
                <div key={0} className={`text-center space-y-4 md:space-y-6 animate-in fade-in duration-300 ${
                  direction === "forward" ? "slide-in-from-right-[30px]" : "slide-in-from-left-[30px]"
                }`}>
                  <div className="inline-flex p-3 bg-gradient-to-tr from-amber-400 to-amber-200 rounded-full shadow-md shadow-amber-400/10 mx-auto animate-pulse">
                    <Sparkles className="w-6 h-6 text-black" />
                  </div>
                  <div className="space-y-3">
                    <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-violet-500 to-amber-400 bg-clip-text text-transparent leading-[1.15] px-4">
                      {result.title}
                    </h1>
                    <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed px-6">
                      {result.description}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <span className="px-3 py-1 rounded-full bg-secondary/85 border border-border/60 text-[10px] sm:text-xs font-semibold text-foreground shadow-sm">
                      Audience: {result.targetAudience}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-secondary/85 border border-border/60 text-[10px] sm:text-xs font-semibold text-foreground shadow-sm">
                      Duration: {result.presentationDuration} min
                    </span>
                    <span className="px-3 py-1 rounded-full bg-secondary/85 border border-border/60 text-[10px] sm:text-xs font-semibold text-foreground shadow-sm">
                      Chapters: {result.chapters.length}
                    </span>
                  </div>
                </div>
              )}

              {currentSlide === 1 && (
                <div key={1} className={`w-full h-full flex flex-col justify-center animate-in fade-in duration-300 ${
                  direction === "forward" ? "slide-in-from-right-[30px]" : "slide-in-from-left-[30px]"
                }`}>
                  <h2 className="text-base sm:text-lg md:text-xl font-bold text-foreground mb-4 md:mb-6 flex items-center gap-2 border-b border-border/50 pb-2 shrink-0">
                    <Target className="w-4 md:w-5 h-4 md:h-5 text-primary" />
                    Learning Objectives & Prerequisites
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 flex-1 min-h-0">
                    {/* Objectives Card */}
                    <div className="flex flex-col bg-secondary/25 dark:bg-white/[0.02] border border-border/50 dark:border-white/5 rounded-2xl p-4 md:p-5 min-h-0">
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Target className="w-3.5 h-3.5 text-primary" />
                        Objectives
                      </div>
                      <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin">
                        <ul className="space-y-3">
                          {result.learningObjectives.map((obj, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90 leading-relaxed">
                              <span className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary shrink-0 mt-0.5">
                                {i + 1}
                              </span>
                              <span>{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Prerequisites Card */}
                    <div className="flex flex-col bg-secondary/25 dark:bg-white/[0.02] border border-border/50 dark:border-white/5 rounded-2xl p-4 md:p-5 min-h-0">
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-primary" />
                        Prerequisites
                      </div>
                      <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin">
                        {result.prerequisites.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {result.prerequisites.map((pre, i) => (
                              <span key={i} className="px-3 py-1.5 rounded-xl bg-background border border-border/80 text-xs text-foreground/90 font-medium shadow-sm transition-colors hover:border-primary/30">
                                {pre}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">No prior experience required. Perfect for beginners!</p>
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
                  <div key={currentSlide} className={`w-full h-full flex flex-col justify-center animate-in fade-in duration-300 ${
                    direction === "forward" ? "slide-in-from-right-[30px]" : "slide-in-from-left-[30px]"
                  }`}>
                    <div className="flex items-center justify-between border-b border-border/50 pb-2 mb-4 md:mb-6 flex-wrap gap-2 shrink-0">
                      <h2 className="text-base sm:text-lg md:text-xl font-bold text-foreground flex items-center gap-2 min-w-0">
                        <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-xs sm:text-sm font-extrabold text-primary shrink-0">
                          {chapter.chapterNumber}
                        </span>
                        <span className="truncate">{chapter.title}</span>
                      </h2>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-secondary/80 dark:bg-zinc-800/80 px-2 py-1 rounded-md border border-border/50">
                        Slide {currentSlide + 1}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 flex-1 min-h-0">
                      {/* Left Card: Overview & Takeaways */}
                      <div className="flex flex-col bg-secondary/25 dark:bg-white/[0.02] border border-border/50 dark:border-white/5 rounded-2xl p-4 md:p-5 min-h-0">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                          Chapter Overview
                        </div>
                        <div className="flex-1 overflow-y-auto pr-1 space-y-4 scrollbar-thin">
                          <div className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                            <MarkdownContent content={chapter.chapterSummary || chapter.description} />
                          </div>

                          <div className="space-y-2.5 pt-3 border-t border-border/40">
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Key Takeaways</div>
                            <ul className="space-y-2">
                              {chapter.keyTakeaways.map((kt, ki) => (
                                <li key={ki} className="flex items-start gap-2 text-xs text-foreground/90 leading-relaxed">
                                  <Check className="w-3.5 h-3.5 text-green-500 dark:text-green-400 shrink-0 mt-0.5" />
                                  <span>{kt}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Right Card: Topics */}
                      <div className="flex flex-col bg-secondary/25 dark:bg-white/[0.02] border border-border/50 dark:border-white/5 rounded-2xl p-4 md:p-5 min-h-0">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
                          Topics & Explanations
                        </div>
                        <div className="flex-1 overflow-y-auto pr-1 space-y-3 scrollbar-thin">
                          {chapter.topics.map((topic, ti) => (
                            <div key={ti} className="p-3.5 bg-background border border-border/60 dark:border-white/[0.03] rounded-xl space-y-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.01)] transition-colors hover:border-primary/20">
                              <div className="font-semibold text-xs sm:text-sm text-foreground flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 animate-pulse" />
                                {topic.title}
                              </div>
                              <div className="pl-3.5 text-xs text-muted-foreground leading-relaxed">
                                <MarkdownContent content={topic.explanation} />
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
                  <div className="inline-flex p-3 bg-gradient-to-tr from-primary/20 via-violet-500/10 to-amber-500/20 rounded-full shadow-sm mx-auto">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                      Presentation Summary
                    </h2>
                    <div className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed bg-secondary/15 dark:bg-zinc-900/20 border border-border/60 rounded-2xl p-4 md:p-6 shadow-inner overflow-y-auto max-h-[180px] md:max-h-[220px] scrollbar-thin">
                      <MarkdownContent content={result.summary} />
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
            <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-[60%] overflow-x-auto py-1">
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
                  className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentSlide
                      ? "bg-primary w-5"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
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
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Chat-style Revision Panel                                           */}
      {/* ------------------------------------------------------------------ */}
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
            {revisionHistory.slice().reverse().map((rev) => (
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
                      <span>Revised: <span className="text-foreground font-medium">{(rev as any).affectedSummary ?? "Presentation"}</span></span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={revisionEndRef} />
          </div>
        )}

        {/* Revision loading state */}
        {(reviseMutation.isPending || gen?.status === "pending") && (
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
                disabled={reviseMutation.isPending || gen?.status === "pending"}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none leading-relaxed min-h-[24px] max-h-[120px] disabled:opacity-50"
              />
              <button
                onClick={handleRevise}
                disabled={revisionInput.trim().length < 3 || reviseMutation.isPending || gen?.status === "pending"}
                className="p-1.5 rounded-lg bg-primary text-primary-foreground transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                {reviseMutation.isPending || gen?.status === "pending" ? (
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
    </div>
  );
}

// Helpers
function MetaStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-secondary/60 border border-border">
      <span className="text-muted-foreground mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">{label}</div>
        <div className="text-sm font-medium text-foreground truncate">{value}</div>
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">{icon}</span>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function CodeBlock({ language, codeString, ...props }: any) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-border/50 my-4 shadow-sm bg-[#1E1E1E]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
        <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">{language}</span>
        <button
          onClick={handleCopy}
          className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 text-[10px] uppercase font-semibold tracking-wider"
          title="Copy code"
        >
          {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        {...props}
        style={vscDarkPlus}
        language={language}
        PreTag="div"
        className="!m-0 !bg-transparent text-xs md:text-sm"
        customStyle={{ padding: "1rem" }}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  );
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="w-full text-sm md:text-base text-foreground/90 leading-relaxed space-y-4">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="leading-relaxed mb-3">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-5 mb-4 space-y-1.5">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 mb-4 space-y-1.5">{children}</ol>,
          li: ({ children }) => <li className="text-foreground/90">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 mt-6 text-foreground">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-bold mb-3 mt-5 text-foreground">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-bold mb-2 mt-4 text-foreground">{children}</h3>,
          blockquote: ({ children }) => <blockquote className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground my-4">{children}</blockquote>,
          code({ className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const isBlock = match || String(children).includes("\n");
            
            if (isBlock) {
              const language = match ? match[1] : "text";
              let codeString = String(children).replace(/\n$/, "");
              if (codeString.startsWith("`")) codeString = codeString.slice(1);
              if (codeString.endsWith("`")) codeString = codeString.slice(0, -1);
              codeString = codeString.trim();
              
              return <CodeBlock language={language} codeString={codeString} {...props} />;
            }

            return (
              <code {...props} className={`${className || ""} bg-secondary/80 px-1.5 py-0.5 rounded-md text-foreground font-mono text-[13px] font-medium border border-border/50`}>
                {children}
              </code>
            );
          },
          pre: ({ children }: any) => <>{children}</>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
