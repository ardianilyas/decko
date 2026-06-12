import { useState } from "react";
import { Target, AlertCircle, ChevronUp, ChevronDown, Check, BookOpen } from "lucide-react";
import type { Presentation } from "@/server/services/generation.service";
import { Section } from "@/components/ui/section";
import { MarkdownContent } from "@/components/ui/markdown-content";

interface GenerationOutlineProps {
  result: Presentation;
}

export function GenerationOutline({ result }: GenerationOutlineProps) {
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set([0]));

  const toggleChapter = (idx: number) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
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
                <div className="pt-3 space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Topics</div>
                  <div className="space-y-3">
                    {chapter.topics.map((topic, ti) => (
                      <div key={ti} className="flex flex-col gap-1.5 p-4 bg-secondary/20 dark:bg-white/[0.01] rounded-xl border border-border/50">
                        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          {topic.title}
                        </div>
                        <div className="pl-3.5 text-sm text-foreground/90 leading-relaxed">
                          <MarkdownContent content={topic.explanation} />
                        </div>
                      </div>
                    ))}
                  </div>
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
  );
}
