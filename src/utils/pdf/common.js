// Shared layout helpers for all PDF generators (A4, mm units)
import { LOGO_DATA_URL } from "../assets";
export const PAGE_WIDTH = 210;
export const MARGIN = 12;

export const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

export function drawCompanyHeader(doc, company, title) {
  let y = 14;

  // ==============================
  // COMPANY LOGO - LEFT SIDE
  // ==============================
  const logoW = 42;
  const logoH = 28;
  const logoX = MARGIN;
  const logoY = 7;
  const logo = company?.logoDataUrl || LOGO_DATA_URL;
  // ==============================
  // COMPANY DETAILS POSITION
  // ==============================
  const textBlockCenter = PAGE_WIDTH / 2;

  // ==============================
  // DRAW LOGO
  if (logo) {
    try {
      doc.addImage(logo, "PNG", logoX, logoY, logoW, logoH);
    } catch (e) {
      console.warn("Company logo error:", e);
    }
  }

  // ==============================
  // COMPANY NAME
  // ==============================
  doc.setFont("times", "bold");
  doc.setFontSize(24);
  doc.setTextColor(210, 0, 0);

  doc.text(company.name || "Company Name", textBlockCenter, y, {
    align: "center",
  });

  y += 5.5;

  // ==============================
  // COMPANY DETAILS
  // ==============================
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(60, 70, 80);

  if (company.addressLine1) {
    doc.text(company.addressLine1, textBlockCenter, y, { align: "center" });
    y += 4;
  }

  if (company.addressLine2) {
    doc.text(company.addressLine2, textBlockCenter, y, { align: "center" });
    y += 4;
  }

  if (company.addressLine3) {
    doc.text(company.addressLine3, textBlockCenter, y, { align: "center" });
    y += 4;
  }

  const contact = [company.email, company.phone ? `Mob: ${company.phone}` : ""]
    .filter(Boolean)
    .join("   ");

  if (contact) {
    doc.text(contact, textBlockCenter, y, { align: "center" });

    y += 4;
  }

  // Make header height follow the larger logo
  y = Math.max(y, logoY + logoH) + 4;

  // ==============================
  // HORIZONTAL LINE
  // ==============================
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.6);

  doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);

  y += 6;

  // ==============================
  // DOCUMENT TITLE
  // ==============================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12.5);
  doc.setTextColor(20, 30, 40);

  doc.text(title, PAGE_WIDTH / 2, y, {
    align: "center",
  });

  y += 3;

  doc.setDrawColor(180, 190, 200);
  doc.setLineWidth(0.3);

  doc.line(PAGE_WIDTH / 2 - 18, y, PAGE_WIDTH / 2 + 18, y);

  y += 6;

  return y;
}
export function drawKeyValueBlock(doc, x, y, pairs, opts = {}) {
  const { labelWidth = 26, lineGap = 4.6, fontSize = 8.5 } = opts;
  doc.setFontSize(fontSize);
  let cy = y;
  pairs.forEach(([label, value]) => {
    if (!label && !value) return;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 70, 80);
    doc.text(label, x, cy);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 30, 40);
    doc.text(String(value ?? ""), x + labelWidth, cy);
    cy += lineGap;
  });
  return cy;
}

export function drawSignatureRow(doc, y, labels) {
  const n = labels.length;
  const colW = CONTENT_WIDTH / n;
  doc.setDrawColor(150, 160, 170);
  doc.setLineWidth(0.2);
  labels.forEach((label, i) => {
    const cx = MARGIN + colW * i;
    doc.line(cx + 4, y, cx + colW - 4, y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(50, 60, 70);
    doc.text(label, cx + colW / 2, y + 4.5, { align: "center" });
  });
}

export function drawFooterNote(doc, y, text) {
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.6);
  doc.setTextColor(90, 100, 110);
  const lines = doc.splitTextToSize(text, CONTENT_WIDTH);
  doc.text(lines, PAGE_WIDTH / 2, y, { align: "center" });
  return y + lines.length * 3.6;
}

export function fmtMoney(n) {
  return Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function fmtDate(d) {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (isNaN(dt)) return d;
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yy = String(dt.getFullYear()).slice(-2);
  return `${dd}.${mm}.${yy}`;
}
