import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  PAGE_WIDTH,
  MARGIN,
  CONTENT_WIDTH,
  drawCompanyHeader,
  drawFooterNote,
  fmtMoney,
  fmtDate,
  up,
} from "./common";
import { sumItems, roundTotal } from "../calc";
import { drawWatermark, drawSignatureStamp } from "./pdfBranding";

const PAGE_BOTTOM = 285; // do not write below this line
const SIGN_BLOCK_NEEDED = 45; // space needed for bank details + signature

export function generateEstimationPdf(doc_, company) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });

  drawWatermark(pdf);

  // "(A unit of ...)" line - only if Settings says NEED
  const unitLine =
    company.showUnitLine !== false ? company.unitLineText || "" : "";

  let y = drawCompanyHeader(pdf, company, "ESTIMATION", unitLine || undefined);

  // If there is no space left, go to a new page (with watermark)
  const ensureSpace = (needed) => {
    if (y + needed > PAGE_BOTTOM) {
      pdf.addPage();
      drawWatermark(pdf);
      y = 20;
    }
  };

  const grandTotal = roundTotal(sumItems(doc_.items || []));

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9.5);
  pdf.setTextColor(20, 30, 40);

  pdf.text("TO.", MARGIN, y);
  pdf.text(`E.O.NO : ${up(doc_.docNo)}`, PAGE_WIDTH - MARGIN, y, {
    align: "right",
  });
  y += 5;

  pdf.setFont("helvetica", "bold");
  pdf.text(up(doc_.client?.name), MARGIN, y);
  pdf.setFont("helvetica", "normal");
  pdf.text(`DATE : ${fmtDate(doc_.date)}`, PAGE_WIDTH - MARGIN, y, {
    align: "right",
  });
  y += 5;

  if (doc_.client?.address) {
    pdf.text(up(doc_.client.address), MARGIN, y);
    y += 5;
  }
  y += 4;

  autoTable(pdf, {
    startY: y,
    head: [
      [
        "SL NO",
        "CATEGORY (WITH MATERIAL)",
        "QTY (APROX)",
        "UNIT",
        "RATE",
        "AMOUNT",
      ],
    ],
    body: (doc_.items || []).map((it, idx) => [
      idx + 1,
      up(it.category),
      it.qty,
      up(it.unit),
      fmtMoney(it.rate),
      fmtMoney(it.amount),
    ]),
    foot: [["", up(doc_.designNote), "", "TOTAL", "", fmtMoney(grandTotal)]],
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 2.5,
      textColor: [20, 30, 40],
      lineColor: [150, 160, 170],
      lineWidth: 0.2,
      overflow: "linebreak",
      fillColor: false, // <-- lets the watermark show through the table
    },
    headStyles: {
      fillColor: [226, 232, 240],
      textColor: 51,
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
    // watermark on pages 2, 3... created by the table
    willDrawPage: () => {
      if (pdf.internal.getCurrentPageInfo().pageNumber > 1) {
        drawWatermark(pdf);
      }
    },
  });
  y = pdf.lastAutoTable.finalY + 8;

  if (doc_.materialUsed) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    const lines = pdf.splitTextToSize(up(doc_.materialUsed), CONTENT_WIDTH);
    ensureSpace(lines.length * 4.4 + 12);

    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(200, 0, 0);
    pdf.setFontSize(9);
    pdf.text("MATERIAL USED :", MARGIN, y);
    y += 4.6;
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(20, 30, 40);
    pdf.text(lines, MARGIN, y);
    y += lines.length * 4.4 + 5;
  }

  ensureSpace(15);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(20, 30, 40);
  pdf.text("NOTE:", MARGIN, y);
  y += 4.6;
  pdf.setFont("helvetica", "normal");
  (doc_.notes || [])
    .filter((n) => (n || "").trim() !== "")
    .forEach((n, i) => {
      const lines = pdf.splitTextToSize(up(`${i + 1}.${n}`), CONTENT_WIDTH);
      ensureSpace(lines.length * 4.4);
      pdf.text(lines, MARGIN, y);
      y += lines.length * 4.4;
    });
  y += 8;

  // ---------------- BANK DETAILS + SIGNATURE ----------------
  // If not enough space on this page -> whole block goes to next page
  ensureSpace(SIGN_BLOCK_NEEDED);

  const sigY = Math.max(y + 30, 250);

  const bankX = MARGIN;
  let bankY = sigY - 22;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(20, 30, 40);
  pdf.text("COMPANY BANK DETAILS:", bankX, bankY);
  bankY += 5;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.text(`BANK NAME : ${up(company.bankName)}`, bankX, bankY);
  bankY += 4.5;
  pdf.text(`ACCOUNT NO : ${up(company.bankAccountNo)}`, bankX, bankY);
  bankY += 4.5;
  pdf.text(`BRANCH / IFSC CODE : ${up(company.bankIfsc)}`, bankX, bankY);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text(
    `FOR ${up(company.name || "NextGen Prefab")}`,
    PAGE_WIDTH - MARGIN,
    sigY,
    { align: "right" },
  );

  drawSignatureStamp(pdf, sigY, company, {
    centerX: PAGE_WIDTH - MARGIN - 30,
    width: 55,
  });

  // Jurisdiction footer - only if Settings says NEED
  // (delete these 3 lines if you never want it on Estimation)
  if (company.showJurisdiction !== false) {
    drawFooterNote(pdf, 289, up(company.jurisdiction));
  }

  return pdf;
}
