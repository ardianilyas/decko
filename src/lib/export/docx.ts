import type { Presentation } from "@/server/services/generation.service";

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export async function exportToDocx(presentation: Presentation) {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle, Table, TableRow, TableCell, WidthType } =
    await import("docx");
  const { saveAs } = await import("file-saver");

  const children: any[] = [];

  function addBodyWithMarkdown(text: string) {
    const lines = text.split("\n");
    let inCodeBlock = false;
    let codeBlockLines: string[] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("```")) {
        if (inCodeBlock) {
          if (codeBlockLines.length > 0) {
            const codeParagraphs = codeBlockLines.map(
              (codeLine) =>
                new Paragraph({
                  children: [
                    new TextRun({
                      text: codeLine,
                      font: "Courier New",
                      size: 18,
                      color: "333333",
                    }),
                  ],
                  spacing: { before: 20, after: 20 },
                })
            );

            children.push(
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.NONE },
                  bottom: { style: BorderStyle.NONE },
                  left: { style: BorderStyle.NONE },
                  right: { style: BorderStyle.NONE },
                  insideHorizontal: { style: BorderStyle.NONE },
                  insideVertical: { style: BorderStyle.NONE },
                },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        children: codeParagraphs,
                        shading: { fill: "F5F5F7" },
                        margins: { top: 140, bottom: 140, left: 240, right: 240 },
                      }),
                    ],
                  }),
                ],
              })
            );
          }
          codeBlockLines = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockLines.push(line);
      } else {
        if (trimmed === "") {
          children.push(new Paragraph({ spacing: { after: 60 } }));
          return;
        }

        const cleanLine = line
          .replace(/\*\*(.*?)\*\*/g, "$1")
          .replace(/`(.*?)`/g, "$1");

        children.push(
          new Paragraph({
            children: [new TextRun({ text: cleanLine, size: 22 })],
            spacing: { after: 80 },
          })
        );
      }
    });

    if (inCodeBlock && codeBlockLines.length > 0) {
      const codeParagraphs = codeBlockLines.map(
        (codeLine) =>
          new Paragraph({
            children: [
              new TextRun({
                text: codeLine,
                font: "Courier New",
                size: 18,
                color: "333333",
              }),
            ],
            spacing: { before: 20, after: 20 },
          })
      );

      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
            insideHorizontal: { style: BorderStyle.NONE },
            insideVertical: { style: BorderStyle.NONE },
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: codeParagraphs,
                  shading: { fill: "F5F5F7" },
                  margins: { top: 140, bottom: 140, left: 240, right: 240 },
                }),
              ],
            }),
          ],
        })
      );
    }
  }

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
  addBodyWithMarkdown(presentation.description);
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
    addBodyWithMarkdown(chapter.description);
    if (chapter.chapterSummary) addBodyWithMarkdown(chapter.chapterSummary);

    if (chapter.topics.length > 0) {
      children.push(heading3("Topics"));
      chapter.topics.forEach((t) => {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: t.title, bold: true, size: 22 })],
            spacing: { after: 40 },
          })
        );
        addBodyWithMarkdown(t.explanation);
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
  addBodyWithMarkdown(presentation.summary);

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${slugify(presentation.title)}.docx`);
}
