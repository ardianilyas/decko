import type { Presentation } from "@/server/services/generation.service";
import type { Paragraph } from "docx";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

// ---------------------------------------------------------------------------
// PDF export (text-based via jsPDF for clean, reliable output)
// ---------------------------------------------------------------------------

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
  addText(presentation.description, 10, "normal", [90, 90, 90]);
  addGap(3);

  // ── Meta ──
  addText(
    `Duration: ${presentation.presentationDuration} min  ·  Audience: ${presentation.targetAudience}  ·  ${presentation.chapters.length} chapters`,
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
      addText(`·  ${pre}`, 10);
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
    addText(chapter.description, 10, "normal", [80, 80, 80]);

    if (chapter.chapterSummary) {
      addGap(2);
      addText(chapter.chapterSummary, 10);
    }

    if (chapter.topics.length > 0) {
      addGap(3);
      addText("Topics", 10, "bold");
      addGap(1);
      chapter.topics.forEach((t) => {
        addText(`·  ${t.title}`, 10, "bold");
        addGap(1);
        addText(`   ${t.explanation}`, 10);
        addGap(2);
      });
    }

    if (chapter.keyTakeaways.length > 0) {
      addGap(1);
      addText("Key Takeaways", 10, "bold");
      addGap(1);
      chapter.keyTakeaways.forEach((k) => {
        addText(`✓  ${k}`, 10);
        addGap(1);
      });
    }
  });

  // ── Summary ──
  addGap(5);
  addHRule();
  addText("Summary", 12, "bold");
  addGap(2);
  addText(presentation.summary, 10);

  doc.save(`${slugify(presentation.title)}.pdf`);
}

// ---------------------------------------------------------------------------
// DOCX export (structured heading hierarchy via docx package)
// ---------------------------------------------------------------------------

export async function exportToDocx(presentation: Presentation) {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } =
    await import("docx");
  const { saveAs } = await import("file-saver");

  const children: Paragraph[] = [];

  function heading1(text: string) {
    return new Paragraph({
      text,
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 240, after: 120 },
    });
  }

  function heading2(text: string) {
    return new Paragraph({
      text,
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 80 },
    });
  }

  function heading3(text: string) {
    return new Paragraph({
      text,
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 160, after: 60 },
    });
  }

  function body(text: string) {
    return new Paragraph({
      children: [new TextRun({ text, size: 22 })],
      spacing: { after: 80 },
    });
  }

  function bullet(text: string, level = 0) {
    return new Paragraph({
      children: [new TextRun({ text, size: 22 })],
      bullet: { level },
      spacing: { after: 60 },
    });
  }

  function divider() {
    return new Paragraph({
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 6, color: "DDDDDD", space: 4 },
      },
      spacing: { before: 120, after: 120 },
    });
  }

  // ── Title ──
  children.push(heading1(presentation.title));
  children.push(body(presentation.description));
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Duration: ${presentation.presentationDuration} min  ·  Audience: ${presentation.targetAudience}  ·  ${presentation.chapters.length} chapters`,
          size: 20,
          color: "888888",
        }),
      ],
      spacing: { after: 120 },
    })
  );
  children.push(divider());

  // ── Learning Objectives ──
  children.push(heading2("Learning Objectives"));
  presentation.learningObjectives.forEach((obj, i) => {
    children.push(bullet(`${i + 1}.  ${obj}`));
  });
  children.push(divider());

  // ── Prerequisites ──
  if (presentation.prerequisites.length > 0) {
    children.push(heading2("Prerequisites"));
    presentation.prerequisites.forEach((pre) => children.push(bullet(pre)));
    children.push(divider());
  }

  // ── Chapters ──
  children.push(heading2("Chapters"));
  presentation.chapters.forEach((chapter) => {
    children.push(heading2(`Chapter ${chapter.chapterNumber}: ${chapter.title}`));
    children.push(body(chapter.description));
    if (chapter.chapterSummary) children.push(body(chapter.chapterSummary));

    if (chapter.topics.length > 0) {
      children.push(heading3("Topics"));
      chapter.topics.forEach((t) => {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: t.title, bold: true, size: 22 })],
            spacing: { after: 40 },
          })
        );
        children.push(body(t.explanation));
      });
    }

    if (chapter.keyTakeaways.length > 0) {
      children.push(heading3("Key Takeaways"));
      chapter.keyTakeaways.forEach((k) => children.push(bullet(k)));
    }
  });

  children.push(divider());

  // ── Summary ──
  children.push(heading2("Summary"));
  children.push(body(presentation.summary));

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${slugify(presentation.title)}.docx`);
}
