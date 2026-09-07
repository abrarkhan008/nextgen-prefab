import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  PAGE_WIDTH,
  MARGIN,
  CONTENT_WIDTH,
  drawCompanyHeader,
  drawKeyValueBlock,
  drawSignatureRow,
  drawFooterNote,
  fmtMoney,
  fmtDate,
} from "./common";
import { amountInWords } from "../numberToWords";
import { gstSummary } from "../calc";
import { drawSignatureStamp, drawWatermark } from "./pdfBranding";

export function generateInvoicePdf(doc_, company) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  drawWatermark(pdf);
  const isProforma = doc_.type === "proforma";

  const documentTitle = isProforma ? "PROFORMA INVOICE" : "TAX INVOICE";

  let y = drawCompanyHeader(pdf, company, documentTitle);
  // drawLogo(pdf, company); // <-- NEW: puts the logo top-left

  // ================= BILL TO / SHIP TO =================
  const leftY0 = y;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(20, 30, 40);

  // ---------- BILL TO ----------
  pdf.text("BILL TO:", MARGIN, y);

  y += 5;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);

  pdf.text(doc_.client?.name || "", MARGIN, y);

  y += 4.2;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);

  pdf.text(`GST NO: ${doc_.client?.gstNo || ""}`, MARGIN, y);

  y += 4.2;

  const billAddressLines = pdf.splitTextToSize(doc_.client?.address || "", 80);

  pdf.text(billAddressLines, MARGIN, y);

  y += billAddressLines.length * 3.8 + 5;

  // ---------- SHIP TO ----------
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);

  pdf.text("SHIP TO:", MARGIN, y);

  y += 5;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);

  pdf.text(doc_.shipTo?.name || "", MARGIN, y);

  y += 4.2;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);

  pdf.text(`GST NO: ${doc_.shipTo?.gstNo || ""}`, MARGIN, y);

  y += 4.2;

  const shipAddressLines = pdf.splitTextToSize(doc_.shipTo?.address || "", 80);

  pdf.text(shipAddressLines, MARGIN, y);

  y += shipAddressLines.length * 3.8 + 2;

  const rightX = PAGE_WIDTH - MARGIN - 82;
  drawKeyValueBlock(
    pdf,
    rightX,
    leftY0,
    [
      ["W.O. NO", doc_.woNo],
      ["DATE", fmtDate(doc_.date)],
      [isProforma ? "PROFORMA NO" : "INVOICE NO", doc_.docNo],
      ...(isProforma ? [] : [["E-WAY BILL NO", doc_.ewayBillNo || ""]]),
    ],
    { labelWidth: 38, lineGap: 4.6 },
  );

  // Terms of Delivery - fixed 3-line area
  const detailRowCount = isProforma ? 3 : 4;

  let termsY = leftY0 + detailRowCount * 4.6 + 1;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(60, 70, 80);
  pdf.text("Terms of Delivery", rightX, termsY);

  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(20, 30, 40);

  const termsX = rightX + 38;
  const termsWidth = PAGE_WIDTH - MARGIN - termsX;

  const termsLines = pdf
    .splitTextToSize(doc_.termsOfDelivery || "", termsWidth)
    .slice(0, 3);

  pdf.text(termsLines, termsX, termsY);

  const termsHeight = 3 * 4.2;

  y = Math.max(y, termsY + termsHeight) + 5;

  const rows = doc_.items.map((it, idx) => [
    idx + 1,
    it.description,
    it.hsnCode || "",
    `${it.qty} ${it.unit}`,
    fmtMoney(it.rate),
    fmtMoney(it.amount),
  ]);

  autoTable(pdf, {
    startY: y,
    head: [["Sl. No.", "Category", "HSN Code", "Qty", "Rate (Rs)", "Amount"]],
    body: rows,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: 2,
      textColor: [20, 30, 40],
    },
    headStyles: { fillColor: [50, 62, 77], textColor: 255, fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 22, halign: "center" },
      3: { cellWidth: 20, halign: "center" },
      4: { cellWidth: 25, halign: "right" },
      5: { cellWidth: 30, halign: "right" },
    },
    margin: { left: MARGIN, right: MARGIN },
  });

  y = pdf.lastAutoTable.finalY + 3;

  const { subTotal, cgst, sgst, roundOff, grandTotal } = gstSummary(
    doc_.items,
    company.cgstPercent,
    company.sgstPercent,
  );

  const summaryRows = [
    ["SUB TOTAL", fmtMoney(subTotal)],
    [`C-GST ${company.cgstPercent}%`, fmtMoney(cgst)],
    [`S-GST ${company.sgstPercent}%`, fmtMoney(sgst)],
    ["R OFF (+/-)", fmtMoney(roundOff)],
  ];
  const boxW = 75;
  const boxX = PAGE_WIDTH - MARGIN - boxW;
  pdf.setFontSize(8.5);
  summaryRows.forEach(([label, val]) => {
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(60, 70, 80);
    pdf.text(label, boxX, y);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(20, 30, 40);
    pdf.text(val, PAGE_WIDTH - MARGIN, y, { align: "right" });
    y += 4.6;
  });

  pdf.setFillColor(235, 239, 243);
  pdf.rect(boxX - 3, y - 2.5, boxW + 3, 8, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9.5);
  pdf.text("GRAND TOTAL", boxX, y + 3.5);
  pdf.text(`Rs. ${fmtMoney(grandTotal)}`, PAGE_WIDTH - MARGIN, y + 3.5, {
    align: "right",
  });
  y += 12;

  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(8.3);
  pdf.setTextColor(20, 30, 40);
  const wordsLines = pdf.splitTextToSize(
    `Amount In Words: ${amountInWords(grandTotal)}`,
    CONTENT_WIDTH,
  );
  pdf.text(wordsLines, MARGIN, y);
  y += wordsLines.length * 3.8 + 6;

  if (doc_.notes) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    const noteLines = pdf.splitTextToSize(`NOTE: ${doc_.notes}`, CONTENT_WIDTH);
    pdf.text(noteLines, MARGIN, y);
    y += noteLines.length * 3.8 + 4;
  }

  const sigY = Math.max(y + 8, 235);

  drawSignatureRow(pdf, sigY, [
    "Customer Signature with seal",
    `For ${company.name}`,
  ]);

  drawSignatureStamp(pdf, sigY, company);

  // ======================================================
  // DECLARATION + BANK DETAILS
  // ======================================================

  const sectionY = sigY + 8;

  // LEFT - DECLARATION
  const declarationX = MARGIN + 4;
  const declarationWidth = 130;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(20, 30, 40);

  pdf.text("Declaration", declarationX, sectionY + 6);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);

  const declarationText = company.declaration || "";

  const declarationLines = declarationText
    .split("\n")
    .filter((line) => line.trim() !== "");

  let declarationLineY = sectionY + 10;

  declarationLines.forEach((line) => {
    const wrappedLines = pdf.splitTextToSize(line, declarationWidth);

    pdf.text(wrappedLines, declarationX, declarationLineY);

    declarationLineY += wrappedLines.length * 3.5;
  });

  // RIGHT - BANK DETAILS
  const bankWidth = 55;
  const bankX = PAGE_WIDTH - MARGIN - bankWidth;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);

  pdf.text("COMPANY BANK DETAILS:", bankX, sectionY + 6);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);

  pdf.text(`Bank Name: ${company.bankName || ""}`, bankX, sectionY + 12);

  pdf.text(`Account No: ${company.bankAccountNo || ""}`, bankX, sectionY + 16);

  pdf.text(`Branch/IFSC Code: ${company.bankIfsc || ""}`, bankX, sectionY + 20);

  // ======================================================
  // FOOTER - 2 LINES AFTER DECLARATION
  // ======================================================

  const footerY = declarationLineY + 8;

  drawFooterNote(pdf, footerY, company.jurisdiction || "");

  drawFooterNote(pdf, footerY + 7, "This is a computer generated invoice.");

  return pdf;
}
