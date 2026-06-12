import { useState } from "react";
import { Check, Copy, Loader2, FileDown, FileText, Clock, Users, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { exportToPDF, exportToDocx } from "@/lib/export";
import type { Presentation } from "@/server/services/generation.service";
import { MetaStat } from "@/components/ui/meta-stat";

interface GenerationHeaderProps {
  result: Presentation;
}

export function GenerationHeader({ result }: GenerationHeaderProps) {
  const [copied, setCopied] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingDocx, setExportingDocx] = useState(false);

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

  return (
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
  );
}
