import type { Presentation } from "@/server/services/generation.service";

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export async function exportToPDF(presentation: Presentation) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const margin = 18;
  const pageW = doc.internal.pageSize.getWidth();
  const contentW = pageW - margin * 2;
  let y = margin;

  const lineH = 6;
  const paraGap = 4;

  function ensurePage(needed = 10) {
    if (y + needed > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
  }

  function addText(
    text: string,
    size: number,
    style: "normal" | "bold" = "normal",
    color: [number, number, number] = [30, 30, 30]
  ) {
    doc.setFontSize(size);
    doc.setFont("helvetica", style);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, contentW);
    ensurePage(lines.length * lineH + 2);
    doc.text(lines, margin, y);
    y += lines.length * lineH;
  }

  function drawCodeBlock(rawLines: string[], size = 9) {
    doc.setFontSize(size);
    doc.setFont("courier", "normal");
    
    const codeLineH = 4.5;
    const padding = 3;
    const maxCodeW = contentW - padding * 2;
    
    const wrappedLines: string[] = [];
    rawLines.forEach((line) => {
      const split = doc.splitTextToSize(line, maxCodeW);
      wrappedLines.push(...split);
    });

    const rectH = wrappedLines.length * codeLineH + padding * 2;
    
    ensurePage(rectH + 2);
    
    doc.setFillColor(245, 245, 247);
    doc.rect(margin, y, contentW, rectH, "F");
    
    doc.setTextColor(50, 50, 50);
    
    let codeY = y + padding + 3;
    wrappedLines.forEach((line) => {
      doc.text(line, margin + padding, codeY);
      codeY += codeLineH;
    });
    
    y += rectH;
    addGap(2);
  }

  function addMarkdownText(
    text: string,
    size: number,
    color: [number, number, number] = [30, 30, 30]
  ) {
    const rawLines = text.split("\n");
    let inCodeBlock = false;
    let codeBlockLines: string[] = [];

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i].trim();

      if (line.startsWith("```")) {
        if (inCodeBlock) {
          drawCodeBlock(codeBlockLines, size - 1);
          codeBlockLines = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockLines.push(rawLines[i]);
        continue;
      }

      if (line === "") {
        addGap(2);
        continue;
      }

      const cleanLine = line
        .replace(/\*\*(.*?)\*\//g, "$1")
        .replace(/`(.*?)`/g, "$1");

      doc.setFontSize(size);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...color);

      const wrapped = doc.splitTextToSize(cleanLine, contentW);
      wrapped.forEach((wrappedLine: string) => {
        ensurePage(lineH + 1);
        doc.text(wrappedLine, margin, y);
        y += lineH;
      });
    }

    if (inCodeBlock && codeBlockLines.length > 0) {
      drawCodeBlock(codeBlockLines, size - 1);
    }
  }

  function addGap(h = paraGap) {
    y += h;
  }

  function addHRule() {
    ensurePage(6);
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageW - margin, y);
    y += 4;
  }

  // ── Title ──
  addText(presentation.title, 20, "bold");
  addGap(2);
  addMarkdownText(presentation.description, 10, [90, 90, 90]);
  addGap(3);

  // ── Meta ──
  addText(
    `Duration: ${presentation.presentationDuration} min  |  Audience: ${presentation.targetAudience}  |  ${presentation.chapters.length} chapters`,
    9,
    "normal",
    [120, 120, 120]
  );
  addGap(4);
  addHRule();

  // ── Learning Objectives ──
  addText("Learning Objectives", 12, "bold");
  addGap(2);
  presentation.learningObjectives.forEach((obj, i) => {
    addText(`${i + 1}.  ${obj}`, 10);
    addGap(1);
  });
  addGap(3);

  // ── Prerequisites ──
  if (presentation.prerequisites.length > 0) {
    addHRule();
    addText("Prerequisites", 12, "bold");
    addGap(2);
    presentation.prerequisites.forEach((pre) => {
      addText(`-  ${pre}`, 10);
      addGap(1);
    });
    addGap(3);
  }

  // ── Chapters ──
  addHRule();
  addText("Chapters", 12, "bold");

  presentation.chapters.forEach((chapter) => {
    addGap(5);
    ensurePage(18);
    addText(`Chapter ${chapter.chapterNumber}: ${chapter.title}`, 12, "bold");
    addGap(1);
    addMarkdownText(chapter.description, 10, [80, 80, 80]);

    if (chapter.chapterSummary) {
      addGap(2);
      addMarkdownText(chapter.chapterSummary, 10);
    }

    if (chapter.topics.length > 0) {
      addGap(3);
      addText("Topics", 10, "bold");
      addGap(1);
      chapter.topics.forEach((t) => {
        addText(`-  ${t.title}`, 10, "bold");
        addGap(1);
        addMarkdownText(t.explanation, 10);
        addGap(2);
      });
    }

    if (chapter.keyTakeaways.length > 0) {
      addGap(1);
      addText("Key Takeaways", 10, "bold");
      addGap(1);
      chapter.keyTakeaways.forEach((k) => {
        addText(`-  ${k}`, 10);
        addGap(1);
      });
    }
  });

  // ── Summary ──
  addGap(5);
  addHRule();
  addText("Summary", 12, "bold");
  addGap(2);
  addMarkdownText(presentation.summary, 10);

  doc.save(`${slugify(presentation.title)}.pdf`);
}
