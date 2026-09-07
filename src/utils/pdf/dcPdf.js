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
import { sumItems } from "../calc";
import { drawSignatureStamp, drawWatermark } from "./pdfBranding";

export function generateDcPdf(doc_, company) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  drawWatermark(pdf);
  let y = drawCompanyHeader(pdf, company, "DELIVERY CHALLAN");
  const leftY0 = y;
  // // Left block: To / client
  // const leftY0 = y;
  // pdf.setFont("helvetica", "bold");
  // pdf.setFontSize(8.5);
  // pdf.setTextColor(60, 70, 80);
  // pdf.text("TO.", MARGIN, y);
  // y += 4.4;
  // pdf.setFont("helvetica", "bold");
  // pdf.setFontSize(9.5);
  // pdf.setTextColor(20, 30, 40);
  // pdf.text(doc_.client?.name || "", MARGIN, y);
  // y += 4.4;
  // pdf.setFont("helvetica", "normal");
  // pdf.setFontSize(8);
  // const addrLines = pdf.splitTextToSize(doc_.client?.address || "", 95);
  // pdf.text(addrLines, MARGIN, y);
  // y += addrLines.length * 3.8 + 1;
  // pdf.setFont("helvetica", "bold");
  // pdf.text(`GST NO. ${doc_.client?.gstNo || ""}`, MARGIN, y);
  // y += 4;
  // if (doc_.client?.email) {
  //   pdf.setFont("helvetica", "normal");
  //   pdf.text(doc_.client.email, MARGIN, y);
  //   y += 4;
  // }
  // ================= BILL TO / SHIP TO =================

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(60, 70, 80);

  // ---------- BILL TO ----------
  pdf.text("BILL TO", MARGIN, y);

  y += 5;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(20, 30, 40);

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
  pdf.setTextColor(60, 70, 80);

  pdf.text("SHIP TO", MARGIN, y);

  y += 5;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setTextColor(20, 30, 40);

  pdf.text(doc_.shipTo?.name || "", MARGIN, y);

  y += 4.2;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);

  pdf.text(`GST NO: ${doc_.shipTo?.gstNo || ""}`, MARGIN, y);

  y += 4.2;

  const shipAddressLines = pdf.splitTextToSize(doc_.shipTo?.address || "", 80);

  pdf.text(shipAddressLines, MARGIN, y);

  y += shipAddressLines.length * 3.8 + 2;

  // Right block: DC details
  const rightX = PAGE_WIDTH - MARGIN - 82;
  drawKeyValueBlock(
    pdf,
    rightX,
    leftY0,
    [
      ["D C NO", doc_.docNo],
      // ["W O NO", doc_.woNo],
      ["Date", fmtDate(doc_.date)],
      ["Vehicle No.", doc_.vehicleNo],
      ["E-way bill no.", doc_.ewayBillNo || ""],
    ],
    { labelWidth: 38, lineGap: 4.6 },
  );

  // Terms of Delivery - fixed 3-line area
  let termsY = leftY0 + 5 * 4.6 + 1;

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
  // Driver details
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.setTextColor(20, 30, 40);

  pdf.text(`Driver name: ${doc_.driverName || ""}`, MARGIN, y);

  pdf.text(`Phone: ${doc_.driverPhone || ""}`, PAGE_WIDTH - MARGIN - 45, y);

  y += 6;

  // Delivery address + driver
  // if (doc_.deliveryAddress) {
  //   pdf.setFont("helvetica", "normal");
  //   pdf.setFontSize(8);
  //   pdf.setTextColor(20, 30, 40);
  //   const dLines = pdf.splitTextToSize(doc_.deliveryAddress, CONTENT_WIDTH);
  //   pdf.text(dLines, MARGIN, y);
  //   y += dLines.length * 3.8 + 2;
  // }
  // pdf.setFont("helvetica", "bold");
  // pdf.setFontSize(8.5);
  // pdf.text(`Driver name: ${doc_.driverName || ""}`, MARGIN, y);
  // pdf.text(`Phone: ${doc_.driverPhone || ""}`, PAGE_WIDTH - MARGIN - 45, y);
  // y += 6;

  // Items table
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
    head: [
      ["Sl. No.", "Category", "HSN Code", "Quantity", "Rate", "Amount (Rs)"],
    ],
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
      2: { cellWidth: 20, halign: "center" },
      3: { cellWidth: 25, halign: "center" },
      4: { cellWidth: 25, halign: "right" },
      5: { cellWidth: 30, halign: "right" },
    },
    margin: { left: MARGIN, right: MARGIN },
  });

  y = pdf.lastAutoTable.finalY + 2;
  const total = sumItems(doc_.items);

  pdf.setFillColor(235, 239, 243);
  pdf.rect(MARGIN, y, CONTENT_WIDTH, 8, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9.5);
  pdf.text("GRAND TOTAL", MARGIN + 3, y + 5.5);
  pdf.text(`Rs. ${fmtMoney(total)}`, PAGE_WIDTH - MARGIN - 3, y + 5.5, {
    align: "right",
  });
  y += 12;

  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(8.3);
  pdf.text(`Amount In Words: ${amountInWords(total)}`, MARGIN, y);
  y += 7;

  if (doc_.notes) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    const noteLines = pdf.splitTextToSize(`NOTE: ${doc_.notes}`, CONTENT_WIDTH);
    pdf.text(noteLines, MARGIN, y);
    y += noteLines.length * 3.8 + 6;
  } else {
    y += 6;
  }

  const sigY = Math.max(y, 250);
  drawSignatureRow(pdf, sigY, [
    "Customer's Signature and seal",
    `For ${company.name}`,
  ]);
  drawSignatureStamp(pdf, sigY, company); // <-- NEW

  // ================= DECLARATION =================
  // const declarationY = sigY + 6;

  // pdf.setFont("helvetica", "bold");
  // pdf.setFontSize(8.5);
  // pdf.setTextColor(20, 30, 40);

  // pdf.text("Declaration", MARGIN + 4, declarationY + 6);

  // // Get declaration from Company Settings
  // const declarationText = company.declaration || "";

  // pdf.setFont("helvetica", "normal");
  // pdf.setFontSize(8);
  // pdf.setTextColor(20, 30, 40);

  // // Split declaration into separate lines
  // const declarationLines = declarationText
  //   .split("\n")
  //   .filter((line) => line.trim() !== "");

  // let declarationLineY = declarationY + 12;

  // // Print every declaration line
  // declarationLines.forEach((line) => {
  //   const wrappedLines = pdf.splitTextToSize(line, CONTENT_WIDTH - 8);

  //   pdf.text(wrappedLines, MARGIN + 4, declarationLineY);

  //   declarationLineY += wrappedLines.length * 4.5;
  // });
  // ================= FOOTER =================
  // ================= FOOTER =================

  let fy = 280;

  fy = drawFooterNote(pdf, fy, company.jurisdiction || "");

  drawFooterNote(pdf, 289, "This is a computer generated document.");

  return pdf;
}
