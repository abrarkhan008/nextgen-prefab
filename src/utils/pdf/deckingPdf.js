import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  PAGE_WIDTH,
  MARGIN,
  CONTENT_WIDTH,
  drawCompanyHeader,
  fmtDate,
} from "./common";
import { drawWatermark } from "./pdfBranding";
import { buildDeckingSummary, fmtKg } from "../decking";

const PAGE_HEIGHT = 297;
const HEAD_FILL = [226, 232, 240];
const SUB_FILL = [241, 245, 249];
const TEXT = [20, 30, 40];

function sectionHeading(pdf, text, y) {
  // Start a new page if the heading + a few rows would not fit
  if (y > PAGE_HEIGHT - 50) {
    pdf.addPage();
    y = 20;
  }
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10.5);
  pdf.setTextColor(...TEXT);
  pdf.text(text, MARGIN, y);
  return y + 3;
}

export function generateDeckingPdf(doc_, company) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const summary = buildDeckingSummary(doc_);

  // ---------- page 1 header ----------
  drawWatermark(pdf);
  let y = drawCompanyHeader(pdf, company, "DECKING SHEET - MEMBERS WEIGHT");

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(...TEXT);
  pdf.text(`Decking no. ${doc_.docNo || ""}`, MARGIN, y);
  pdf.text(`Date: ${fmtDate(doc_.date)}`, PAGE_WIDTH - MARGIN, y, {
    align: "right",
  });
  y += 5;
  pdf.setFont("helvetica", "bold");
  pdf.text(`Client: ${(doc_.client?.name || "").toUpperCase()}`, MARGIN, y);
  y += 4.6;
  pdf.setFont("helvetica", "normal");
  if (doc_.site) {
    pdf.text(`Site: ${doc_.site.toUpperCase()}`, MARGIN, y);
    y += 4.6;
  }
  pdf.text(`Building type: ${summary.modeLabel}`, MARGIN, y);
  y += 7;

  // ---------- 1. detailed table, every section ----------
  const body = [];
  summary.sections.forEach((section, sIdx) => {
    if (section.lines.length === 0) return;

    body.push([
      {
        content: `${sIdx + 1}. ${section.title}`,
        colSpan: 4,
        styles: { fillColor: HEAD_FILL, fontStyle: "bold" },
      },
    ]);

    section.lines.forEach((line, i) => {
      body.push([
        { content: String(i + 1), styles: { halign: "center" } },
        { content: line.label, styles: { fontStyle: "bold" } },
        line.detail,
        { content: fmtKg(line.weight), styles: { halign: "right" } },
      ]);
      if (line.parts.length > 1) {
        line.parts.forEach((p) => {
          body.push([
            "",
            "",
            {
              content: `   - ${p.label}`,
              styles: { textColor: [90, 100, 110], fontSize: 7.5 },
            },
            {
              content: fmtKg(p.weight),
              styles: {
                halign: "right",
                textColor: [90, 100, 110],
                fontSize: 7.5,
              },
            },
          ]);
        });
      }
    });

    body.push([
      {
        content: `${section.title} total`,
        colSpan: 3,
        styles: { halign: "right", fontStyle: "bold", fillColor: SUB_FILL },
      },
      {
        content: fmtKg(section.total),
        styles: { halign: "right", fontStyle: "bold", fillColor: SUB_FILL },
      },
    ]);
  });

  if (body.length === 0) {
    body.push([
      {
        content: "No items entered.",
        colSpan: 4,
        styles: { halign: "center", textColor: [120, 130, 140] },
      },
    ]);
  }

  autoTable(pdf, {
    startY: y,
    head: [["SL", "DESCRIPTION", "DETAILS", "WEIGHT (KG)"]],
    body,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 1.8,
      textColor: TEXT,
    },
    headStyles: { fillColor: [51, 65, 85], textColor: 255, fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 32 },
      2: { cellWidth: "auto" },
      3: { cellWidth: 30 },
    },
    margin: { left: MARGIN, right: MARGIN, top: 15, bottom: 15 },
  });
  y = pdf.lastAutoTable.finalY + 9;

  // ---------- 2. thickness-wise weight ----------
  if (summary.thicknessRows.length > 0) {
    y = sectionHeading(pdf, "THICKNESS-WISE WEIGHT", y);
    autoTable(pdf, {
      startY: y,
      head: [["THICKNESS", "WEIGHT (KG)"]],
      body: [
        ...summary.thicknessRows.map((r) => [
          r.label,
          { content: fmtKg(r.weight), styles: { halign: "right" } },
        ]),
        [
          {
            content: "Thickness-wise total",
            styles: { fontStyle: "bold", fillColor: SUB_FILL },
          },
          {
            content: fmtKg(summary.thicknessTotal),
            styles: { halign: "right", fontStyle: "bold", fillColor: SUB_FILL },
          },
        ],
      ],
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 8.5,
        cellPadding: 2,
        textColor: TEXT,
      },
      headStyles: {
        fillColor: [51, 65, 85],
        textColor: 255,
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: CONTENT_WIDTH - 45 },
        1: { cellWidth: 45 },
      },
      margin: { left: MARGIN, right: MARGIN, top: 15, bottom: 15 },
    });
    y = pdf.lastAutoTable.finalY + 9;
  }

  // ---------- 3. rolled sections, bolts, studs ----------
  if (summary.otherRows.length > 0) {
    y = sectionHeading(pdf, "SECTIONS, BOLTS & STUDS", y);
    autoTable(pdf, {
      startY: y,
      head: [["ITEM", "WEIGHT (KG)"]],
      body: [
        ...summary.otherRows.map((r) => [
          r.label,
          { content: fmtKg(r.weight), styles: { halign: "right" } },
        ]),
        [
          {
            content: "Sections, bolts & studs total",
            styles: { fontStyle: "bold", fillColor: SUB_FILL },
          },
          {
            content: fmtKg(summary.otherTotal),
            styles: { halign: "right", fontStyle: "bold", fillColor: SUB_FILL },
          },
        ],
      ],
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 8.5,
        cellPadding: 2,
        textColor: TEXT,
      },
      headStyles: {
        fillColor: [51, 65, 85],
        textColor: 255,
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: CONTENT_WIDTH - 45 },
        1: { cellWidth: 45 },
      },
      margin: { left: MARGIN, right: MARGIN, top: 15, bottom: 15 },
    });
    y = pdf.lastAutoTable.finalY + 9;
  }

  // ---------- 4. metal summary ----------
  y = sectionHeading(pdf, "METAL SUMMARY", y);
  autoTable(pdf, {
    startY: y,
    body: [
      [
        "Thickness-wise material (plates, tube walls, decking sheet)",
        { content: fmtKg(summary.thicknessTotal), styles: { halign: "right" } },
      ],
      [
        "Sections, bolts & studs",
        { content: fmtKg(summary.otherTotal), styles: { halign: "right" } },
      ],
      [
        {
          content: "TOTAL WEIGHT (KG)",
          styles: { fontStyle: "bold", fillColor: HEAD_FILL },
        },
        {
          content: fmtKg(summary.grandTotal),
          styles: { halign: "right", fontStyle: "bold", fillColor: HEAD_FILL },
        },
      ],
      [
        "Total weight in tonnes",
        {
          content: `${(summary.grandTotal / 1000).toFixed(3)} MT`,
          styles: { halign: "right" },
        },
      ],
    ],
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 2.2,
      textColor: TEXT,
    },
    columnStyles: {
      0: { cellWidth: CONTENT_WIDTH - 45 },
      1: { cellWidth: 45 },
    },
    margin: { left: MARGIN, right: MARGIN, top: 15, bottom: 15 },
  });

  // ---------- page numbers ----------
  const pages = pdf.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    pdf.setPage(p);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(90, 90, 90);
    pdf.text(
      `PAGE - ${String(p).padStart(2, "0")}`,
      PAGE_WIDTH - MARGIN,
      PAGE_HEIGHT - 8,
      {
        align: "right",
      },
    );
  }

  return pdf;
}
