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
} from "lucide-react";
import { toast } from "sonner";
import type { Presentation } from "@/server/services/generation.service";

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const revisionEndRef = useRef<HTMLDivElement>(null);

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
          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy Text"}
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <MetaStat icon={<Clock className="w-4 h-4" />} label="Duration" value={`${result.presentationDuration} min`} />
          <MetaStat icon={<Users className="w-4 h-4" />} label="Audience" value={result.targetAudience} />
          <MetaStat icon={<BookOpen className="w-4 h-4" />} label="Chapters" value={`${result.chapters.length} chapters`} />
        </div>
      </div>

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
              onClick={() => toggleChapter(idx)}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-secondary/50 transition-colors"
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
              <div className="px-4 pb-4 space-y-4 border-t border-border bg-background/50">
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
        {reviseMutation.isPending && (
          <div className="px-4 py-4 border-b border-border bg-background/40 space-y-4">
            {/* Show the user's message */}
            <div className="flex items-start gap-2 justify-end">
              <div className="max-w-[85%] bg-primary/10 border border-primary/15 rounded-2xl rounded-tr-sm px-4 py-2.5">
                <p className="text-sm text-foreground leading-relaxed">{revisionInput || "Revising..."}</p>
              </div>
            </div>
            {/* Typing indicator */}
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-1">
                <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
              </div>
              <div className="bg-secondary/60 border border-border/60 rounded-2xl rounded-tl-sm px-5 py-3.5 flex items-center gap-1.5 h-[44px]">
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
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
                disabled={reviseMutation.isPending}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none leading-relaxed min-h-[24px] max-h-[120px] disabled:opacity-50"
              />
              <button
                onClick={handleRevise}
                disabled={revisionInput.trim().length < 3 || reviseMutation.isPending}
                className="p-1.5 rounded-lg bg-primary text-primary-foreground transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                {reviseMutation.isPending ? (
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
