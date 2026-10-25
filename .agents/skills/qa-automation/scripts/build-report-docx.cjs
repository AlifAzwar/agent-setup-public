// Usage: node build-report-docx.cjs spec.json out.docx
// Requires the `docx` npm package (npm i docx@9). See references/report-structure.md for the spec format.
const fs = require("node:fs");
const path = require("node:path");
const {
  AlignmentType, BorderStyle, Document, Footer, HeadingLevel, ImageRun, LevelFormat, Packer, PageBreak,
  PageNumber, Paragraph, ShadingType, Table, TableCell, TableOfContents, TableRow, TextRun, WidthType,
} = require("docx");

const [specPath, outPath] = process.argv.slice(2);
if (!specPath || !outPath) {
  console.error("Usage: node build-report-docx.cjs spec.json out.docx");
  process.exit(1);
}
const spec = JSON.parse(fs.readFileSync(specPath, "utf8"));
const baseDir = path.dirname(path.resolve(specPath));
const shotsDir = path.resolve(baseDir, spec.shotsDir ?? "shots-jpg");
const L = { toc: "Table of Contents", figure: "Figure", ...spec.labels };

const FONT = spec.font ?? "Times New Roman";
const BODY = 24; // 12 pt
const HEAD = 28; // 14 pt
const LINE = 360; // 1.5 spacing
const TEXT_W = 8787; // A4 minus 3 cm + 2.5 cm margins, in DXA

const run = (text, o = {}) => new TextRun({ text, font: FONT, size: BODY, ...o });
const para = (children, o = {}) =>
  new Paragraph({
    children: typeof children === "string" ? [run(children)] : children,
    spacing: { line: LINE, after: 120 },
    alignment: AlignmentType.JUSTIFIED,
    ...o,
  });
const heading = (text, level) =>
  new Paragraph({
    heading: level === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
    children: [new TextRun({ text, font: FONT, size: HEAD, bold: true })],
    spacing: { line: LINE, before: level === 1 ? 240 : 200, after: 120 },
    keepNext: true,
  });

function jpegSize(buf) {
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) { i++; continue; }
    const m = buf[i + 1];
    if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    i += 2 + buf.readUInt16BE(i + 2);
  }
  throw new Error("Not a JPEG");
}

let figNo = 0;
function figure([name, caption]) {
  const file = path.join(shotsDir, `${name}.jpg`);
  if (!fs.existsSync(file)) throw new Error(`Missing screenshot: ${file}`);
  const data = fs.readFileSync(file);
  const { w, h } = jpegSize(data);
  let width = 560;
  let height = Math.round((h / w) * 560);
  if (height > 760) { height = 760; width = Math.round((w / h) * 760); }
  figNo += 1;
  return [
    new Paragraph({ children: [new ImageRun({ type: "jpg", data, transformation: { width, height }, altText: { title: caption, description: caption, name } })], alignment: AlignmentType.CENTER, spacing: { before: 120, after: 60 }, keepNext: true }),
    new Paragraph({ children: [run(`${L.figure} ${figNo}. ${caption}`, { italics: true })], alignment: AlignmentType.CENTER, spacing: { line: LINE, after: 200 } }),
  ];
}

const border = { style: BorderStyle.SINGLE, size: 4, color: "808080" };
function table({ head, rows, widths }) {
  const cols = widths ?? head.map(() => Math.floor(TEXT_W / head.length));
  const sum = cols.reduce((a, b) => a + b, 0);
  if (sum !== TEXT_W) cols[cols.length - 1] += TEXT_W - sum;
  const cell = (text, w, isHead) =>
    new TableCell({
      borders: { top: border, bottom: border, left: border, right: border },
      width: { size: w, type: WidthType.DXA },
      shading: isHead ? { fill: "D9D9D9", type: ShadingType.CLEAR, color: "auto" } : undefined,
      margins: { top: 60, bottom: 60, left: 100, right: 100 },
      children: String(text).split("\n").map((line) => new Paragraph({ children: [run(line, { bold: !!isHead })], spacing: { line: 276 } })),
    });
  return [
    new Table({
      width: { size: TEXT_W, type: WidthType.DXA },
      columnWidths: cols,
      rows: [
        new TableRow({ tableHeader: true, children: head.map((x, i) => cell(x, cols[i], true)) }),
        ...rows.map((r) => new TableRow({ children: r.map((x, i) => cell(x, cols[i], false)) })),
      ],
    }),
    new Paragraph({ children: [run("")], spacing: { after: 120 } }),
  ];
}

function block(b) {
  if (b.p) return [para(b.p)];
  if (b.h2) return [heading(b.h2, 2)];
  if (b.label) return [para([run(`${b.label[0]}: `, { bold: true }), run(b.label[1])])];
  if (b.bullets) return b.bullets.map((x) => new Paragraph({ children: [run(x)], numbering: { reference: "bullets", level: 0 }, spacing: { line: LINE, after: 60 } }));
  if (b.table) return table(b.table);
  if (b.figure) return figure(b.figure);
  if (b.pagebreak) return [new Paragraph({ children: [new PageBreak()] })];
  if (b.code)
    return [
      para(
        b.code.split("\n").map((line, i) => run(line, { font: "Courier New", size: 18, break: i ? 1 : 0 })),
        { alignment: AlignmentType.LEFT, spacing: { line: 240, after: 120 }, shading: { type: ShadingType.CLEAR, fill: "F2F2F2" } },
      ),
    ];
  throw new Error(`Unknown block: ${JSON.stringify(b).slice(0, 80)}`);
}

const children = [
  new Paragraph({ children: [new TextRun({ text: spec.title, font: FONT, size: HEAD, bold: true })], alignment: AlignmentType.CENTER, spacing: { before: 2400, line: LINE } }),
  new Paragraph({ children: [new TextRun({ text: spec.subtitle ?? "", font: FONT, size: HEAD, bold: true })], alignment: AlignmentType.CENTER, spacing: { line: LINE, after: 600 } }),
  ...(spec.meta ? table({ head: spec.metaHead ?? ["", ""], rows: spec.meta, widths: [3000, 5787] }) : []),
  new Paragraph({ children: [new PageBreak()] }),
  new Paragraph({ children: [new TextRun({ text: L.toc.toUpperCase(), font: FONT, size: HEAD, bold: true })], alignment: AlignmentType.CENTER, spacing: { line: LINE, after: 200 } }),
  new TableOfContents(L.toc, { hyperlink: true, headingStyleRange: "1-2" }),
  new Paragraph({ children: [new PageBreak()] }),
];
for (const s of spec.sections) {
  children.push(heading(s.h1, 1));
  for (const b of s.body ?? []) children.push(...block(b));
}

const headingStyle = (id, name, level, before) => ({
  id, name, basedOn: "Normal", next: "Normal", quickFormat: true,
  run: { font: FONT, size: HEAD, bold: true, color: "000000" },
  paragraph: { spacing: { line: LINE, before, after: 120 }, outlineLevel: level },
});

const doc = new Document({
  title: spec.title,
  features: { updateFields: true },
  styles: {
    default: { document: { run: { font: FONT, size: BODY } } },
    paragraphStyles: [headingStyle("Heading1", "Heading 1", 0, 240), headingStyle("Heading2", "Heading 2", 1, 200)],
  },
  numbering: { config: [{ reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }] },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1418, bottom: 1418, left: 1701, right: 1418 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: BODY })] })] }) },
    children,
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
  fs.writeFileSync(outPath, buf);
  console.log(`Wrote ${outPath} (${(buf.length / 1e6).toFixed(1)} MB, ${figNo} figures)`);
});
