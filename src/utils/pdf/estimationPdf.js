import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  PAGE_WIDTH,
  MARGIN,
  CONTENT_WIDTH,
  drawCompanyHeader,
  fmtMoney,
  fmtDate,
} from "./common";
import { drawWatermark } from "./pdfBranding";

export function generateEstimationPdf(doc_, company) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });

  drawWatermark(pdf);
  let y = drawCompanyHeader(pdf, company, "ESTIMATION");

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9.5);
  pdf.setTextColor(20, 30, 40);

  pdf.text("TO.", MARGIN, y);
  pdf.text(`E.O.NO : ${doc_.docNo || ""}`, PAGE_WIDTH - MARGIN, y, {
    align: "right",
  });
  y += 5;

  pdf.setFont("helvetica", "bold");
  pdf.text((doc_.client?.name || "").toUpperCase(), MARGIN, y);
  pdf.setFont("helvetica", "normal");
  pdf.text(`DATE : ${fmtDate(doc_.date)}`, PAGE_WIDTH - MARGIN, y, {
    align: "right",
  });
  y += 5;

  if (doc_.client?.address) {
    pdf.text(doc_.client.address, MARGIN, y);
    y += 5;
  }
  y += 4;

  autoTable(pdf, {
    startY: y,
    head: [
      [
        "SL NO",
        "CATEGORY (WITH MATERIAL)",
        "QTY (Aprox)",
        "UNIT",
        "RATE",
        "AMOUNT",
      ],
    ],
    body: (doc_.items || []).map((it, idx) => [
      idx + 1,
      it.category,
      it.qty,
      it.unit,
      fmtMoney(it.rate),
      fmtMoney(it.amount),
    ]),
    foot: [
      ["", doc_.designNote || "", "", "TOTAL", "", fmtMoney(doc_.grandTotal)],
    ],
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 2.5,
      textColor: [20, 30, 40],
      lineColor: [150, 160, 170],
      lineWidth: 0.2,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [50, 62, 77],
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
      minCellHeight: 8,
    },
    footStyles: {
      fillColor: [235, 239, 243],
      textColor: [20, 30, 40],
      fontStyle: "bold",
      lineColor: [150, 160, 170],
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 16, halign: "center" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 22, halign: "center" },
      3: { cellWidth: 16, halign: "center" },
      4: { cellWidth: 26, halign: "right" },
      5: { cellWidth: 30, halign: "right" },
    },
    margin: { left: MARGIN, right: MARGIN },
  });
  y = pdf.lastAutoTable.finalY + 8;

  if (doc_.materialUsed) {
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(200, 0, 0);
    pdf.setFontSize(9);
    pdf.text("MATERIAL USED :", MARGIN, y);
    y += 4.6;
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(20, 30, 40);
    const lines = pdf.splitTextToSize(doc_.materialUsed, CONTENT_WIDTH);
    pdf.text(lines, MARGIN, y);
    y += lines.length * 4.4 + 5;
  }

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text("NOTE:", MARGIN, y);
  y += 4.6;
  pdf.setFont("helvetica", "normal");
  (doc_.notes || []).forEach((n, i) => {
    const lines = pdf.splitTextToSize(`${i + 1}.${n}`, CONTENT_WIDTH);
    pdf.text(lines, MARGIN, y);
    y += lines.length * 4.4;
  });
  y += 8;

  pdf.setFont("helvetica", "bold");
  pdf.text("COMPANY BANK DETAILS:", MARGIN, y);
  y += 5;
  pdf.setFont("helvetica", "normal");
  pdf.text(`BANK NAME : ${company.bankName || ""}`, PAGE_WIDTH - MARGIN, y, {
    align: "right",
  });
  y += 4.6;
  pdf.text(
    `ACCOUNT NO : ${company.bankAccountNo || ""}`,
    PAGE_WIDTH - MARGIN,
    y,
    { align: "right" },
  );
  y += 4.6;
  pdf.text(
    `BRANCH / IFSC CODE : ${company.bankIfsc || ""}`,
    PAGE_WIDTH - MARGIN,
    y,
    { align: "right" },
  );
  y += 10;

  pdf.setFont("helvetica", "bold");
  pdf.text(`for ${company.name || ""},`, PAGE_WIDTH - MARGIN, y, {
    align: "right",
  });

  return pdf;
}
