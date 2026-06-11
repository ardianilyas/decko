"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
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
} from "lucide-react";
import { toast } from "sonner";
import type { Presentation } from "@/server/services/generation.service";

interface GenerationResultProps {
  generationId: string;
  initialResult: Presentation;
}

export function GenerationResult({ generationId, initialResult }: GenerationResultProps) {
  const [result, setResult] = useState<Presentation>(initialResult);
  const [revisionPrompt, setRevisionPrompt] = useState("");
  const [showRevisionInput, setShowRevisionInput] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set([0]));
  const [copied, setCopied] = useState(false);

  const { data: gen, refetch } = trpc.generation.getGeneration.useQuery({ id: generationId });
  const revisionsUsed = gen?.revisionCount ?? 0;
  const revisionsLeft = Math.max(0, 3 - revisionsUsed);

  const reviseMutation = trpc.generation.revise.useMutation({
    onSuccess: ({ result: revised, revisionsLeft: left }) => {
      setResult(revised);
      setRevisionPrompt("");
      setShowRevisionInput(false);
      refetch();
      toast.success(`Presentation revised! ${left} revision${left !== 1 ? "s" : ""} remaining.`);
    },
    onError: (err) => {
      toast.error(err.message || "Revision failed. Please try again.");
    },
  });

  const handleCopyText = async () => {
    let text = `${result.title}\n${result.description}\n\n`;
    text += `Duration: ${result.presentationDuration} min | Audience: ${result.targetAudience}\n\n`;
    
    text += `LEARNING OBJECTIVES:\n`;
    result.learningObjectives.forEach((obj, i) => text += `${i + 1}. ${obj}\n`);
    text += `\n`;

    if (result.prerequisites.length > 0) {
      text += `PREREQUISITES:\n`;
      result.prerequisites.forEach(pre => text += `- ${pre}\n`);
      text += `\n`;
    }

    text += `CHAPTERS:\n`;
    result.chapters.forEach(chapter => {
      text += `\nChapter ${chapter.chapterNumber}: ${chapter.title}\n`;
      text += `${chapter.description}\n`;
      if (chapter.chapterSummary) {
        text += `${chapter.chapterSummary}\n`;
      }
      text += `Topics:\n`;
      chapter.topics.forEach(t => {
        text += `- ${t.title}\n`;
        text += `  ${t.explanation}\n`;
      });
      text += `Key Takeaways:\n`;
      chapter.keyTakeaways.forEach(k => text += `- ${k}\n`);
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
    <div className="w-full space-y-6">
      {/* Header meta */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1 min-w-0">
            <h2 className="text-xl font-bold text-foreground">{result.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{result.description}</p>
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
                  <div className="pt-3 text-sm text-foreground/90 leading-relaxed border-b border-border/50 pb-3">
                    {chapter.chapterSummary}
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
                        <div className="pl-3.5 text-muted-foreground text-xs leading-relaxed">
                          {topic.explanation}
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
        <p className="text-sm text-foreground leading-relaxed">{result.summary}</p>
      </Section>

      {/* Revision Panel */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-sm font-semibold text-foreground">Revision</div>
            <div className="text-xs text-muted-foreground">
              {revisionsLeft > 0
                ? `${revisionsLeft} revision${revisionsLeft !== 1 ? "s" : ""} remaining — no extra credits`
                : "No revisions remaining"}
            </div>
          </div>
          <button
            onClick={() => setShowRevisionInput((v) => !v)}
            disabled={revisionsLeft === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Revise
          </button>
        </div>

        {showRevisionInput && revisionsLeft > 0 && (
          <div className="space-y-3 pt-2 border-t border-border">
            <textarea
              value={revisionPrompt}
              onChange={(e) => setRevisionPrompt(e.target.value)}
              placeholder="e.g. Add a chapter about DOM manipulation, make it suitable for beginners, reduce duration to 45 minutes..."
              rows={3}
              className="w-full bg-background border border-border rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-shadow resize-none"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowRevisionInput(false)}
                className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg border border-border transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  reviseMutation.mutate({
                    generationId,
                    prompt: revisionPrompt.trim(),
                  })
                }
                disabled={revisionPrompt.trim().length < 3 || reviseMutation.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-foreground text-background font-medium rounded-lg transition-opacity hover:opacity-80 disabled:opacity-40"
              >
                {reviseMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="w-3.5 h-3.5" />
                )}
                Apply Revision
              </button>
            </div>
          </div>
        )}
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
