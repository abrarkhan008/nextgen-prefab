import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { PAGE_WIDTH, MARGIN, drawCompanyHeader, fmtDate } from "./common";

/**
 * rows: [{ label, pieces, weight }]  e.g. [{ label: "6mm Plate", pieces: 12, weight: 84.5 }]
 */
export function generateMaterialListPdf(doc_, rows, grandTotal, company) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });

  let y = drawCompanyHeader(pdf, company, "MATERIAL LIST");

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text(`Quotation No: ${doc_.docNo || ""}`, MARGIN, y);
  pdf.text(`Date: ${fmtDate(doc_.date)}`, PAGE_WIDTH - MARGIN, y, {
    align: "right",
  });
  y += 6;
  pdf.text(`Client: ${(doc_.client?.name || "").toUpperCase()}`, MARGIN, y);
  y += 4.6;
  pdf.text(
    `Site: ${(doc_.siteLocation || doc_.project?.place || "").toUpperCase()}`,
    MARGIN,
    y,
  );
  y += 8;

  autoTable(pdf, {
    startY: y,
    head: [["THICKNESS / GROUP", "PIECES", "WEIGHT (KG)"]],
    body: rows.map((r) => [
      r.label,
      r.pieces,
      r.weight.toLocaleString("en-IN", { maximumFractionDigits: 2 }),
    ]),
    foot: [
      [
        "TOTAL",
        "",
        grandTotal.toLocaleString("en-IN", { maximumFractionDigits: 2 }),
      ],
    ],
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 2.5,
      textColor: [20, 30, 40],
    },
    headStyles: { fillColor: [50, 62, 77], textColor: 255, fontStyle: "bold" },
    footStyles: {
      fillColor: [235, 239, 243],
      textColor: [20, 30, 40],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { cellWidth: 35, halign: "center" },
      2: { cellWidth: 45, halign: "right" },
    },
    margin: { left: MARGIN, right: MARGIN },
  });

  return pdf;
}
