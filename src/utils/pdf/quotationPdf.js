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
import { amountInWords } from "../numberToWords";
import { gstSummary, sumItems } from "../calc";
import { drawLogo, drawSignatureStamp, drawWatermark } from "./pdfBranding";

// A4 page height in mm (jsPDF default unit here is "mm", format "a4").
// Defined locally so this file works even if common.js doesn't export it.
const PAGE_HEIGHT = 297;

// ---------- default text blocks (used unless doc_ overrides them) ----------

const DEFAULT_OUR_SCOPE = [
  "Fabrication and erection of PEB structure.",
  "Bed bolts fixing work as per foundation drawing.",
  "Loading of material in factory.",
  "Tools & Machinery's.",
  "Installation work with crane.",
  "One coat yellow primer and enamel paint.",
  "Supply of required material.",
];

const DEFAULT_CLIENT_SCOPE = [
  "Accommodation in Site.",
  "Power and Water.",
  "All Civil Works. (Site clear, Floor leveling, Civil foundation).",
  "Electrical lights for working area need to be provided if required.",
  "Necessary Statutory Approvals.",
  "Any Testing of Materials is Your Scope.",
];

const DEFAULT_PAYMENT_TERMS = [
  "Advance of 60% along with the Work order.",
  "After quality inspection material will be dispatched from factory; before dispatch, 25% to be released.",
  "10% payment will be released during erection work under progress.",
  "5% as Final Payment after sheet fixing completed.",
];

// ---------- small local helpers ----------

function h1(pdf, text, y) {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.setTextColor(20, 30, 40);
  pdf.text(text, PAGE_WIDTH / 2, y, { align: "center" });
  return y;
}

function pageNumber(pdf, n) {
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(90, 90, 90);
  pdf.text(
    `PAGE - ${String(n).padStart(2, "0")}`,
    PAGE_WIDTH - MARGIN,
    PAGE_HEIGHT - 10,
    {
      align: "right",
    },
  );
}

// Draws the standard letterhead + logo, returns the y position right after it
function pageHeader(pdf, company, title) {
  drawWatermark(pdf);
  const y = drawCompanyHeader(pdf, company, title || "");
  drawLogo(pdf, company);
  return y;
}

function numberedList(pdf, items, x, y, opts = {}) {
  const width = opts.width || CONTENT_WIDTH - (x - MARGIN);
  const gap = opts.gap ?? 4.6;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  pdf.setTextColor(20, 30, 40);
  items.forEach((item, i) => {
    const lines = pdf.splitTextToSize(`${i + 1}. ${item}`, width);
    pdf.text(lines, x, y);
    y += lines.length * gap;
  });
  return y;
}

// ---------- main entry point ----------

export function generateQuotationPdf(doc_, company) {
  const pdf = new jsPDF({ unit: "mm", format: "a4" });

  // One date, computed once, reused on every single page.
  const dateStr = fmtDate(doc_.date);
  const rev = doc_.rev || "00";
  const docNo = doc_.docNo || "";
  const clientName = doc_.client?.name || "";
  const site = doc_.siteLocation || doc_.project?.place || "";
  const specs = doc_.specs || {};
  const ourScope = doc_.ourScope?.length ? doc_.ourScope : DEFAULT_OUR_SCOPE;
  const clientScope = doc_.clientScope?.length
    ? doc_.clientScope
    : DEFAULT_CLIENT_SCOPE;
  const paymentTerms = doc_.paymentTerms?.length
    ? doc_.paymentTerms
    : DEFAULT_PAYMENT_TERMS;

  // ===================== PAGE 1 : COVER =====================
  pageHeader(pdf, company, "");
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9.5);
  pdf.setTextColor(20, 30, 40);
  pdf.text(`Estimation no. ${docNo}`, MARGIN, 55);
  pdf.text(`Rev.${rev}`, PAGE_WIDTH / 2, 55, { align: "center" });
  pdf.text(`Date: ${dateStr}`, PAGE_WIDTH - MARGIN, 55, { align: "right" });

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.text("PROPOSAL FOR PRE ENGINEERED BUILDING", PAGE_WIDTH / 2, 110, {
    align: "center",
  });
  pdf.text("(PEB) FOR", PAGE_WIDTH / 2, 122, { align: "center" });
  pdf.setFontSize(22);
  pdf.text(clientName.toUpperCase(), PAGE_WIDTH / 2, 145, { align: "center" });
  pdf.setFontSize(14);
  pdf.text("@", PAGE_WIDTH / 2, 156, { align: "center" });
  pdf.setFontSize(18);
  pdf.text(site.toUpperCase(), PAGE_WIDTH / 2, 168, { align: "center" });
  pageNumber(pdf, 1);

  // ===================== PAGE 2 : COVER LETTER =====================
  pdf.addPage();
  let y = pageHeader(pdf, company, "");
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text(`Estimation no.${docNo}`, MARGIN, y);
  pdf.text(`Rev.${rev}`, PAGE_WIDTH / 2, y, { align: "center" });
  pdf.text(`Date: ${dateStr}`, PAGE_WIDTH - MARGIN, y, { align: "right" });
  y += 10;

  h1(pdf, "PROPOSAL FOR PRE ENGINEERED BUILDING", y);
  y += 7;
  h1(pdf, `(PEB) FOR ${site.toUpperCase()}`, y);
  y += 12;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9.5);
  pdf.text("Dear Sir,", MARGIN, y);
  y += 7;

  const letterBody =
    doc_.coverLetter ||
    "We thank you for your valuable enquiry and we are very glad to submit our most competitive offer for the same as per the scope of work.\n\n" +
      "Our proposal covers fabrication and on-site erection in accordance with the enclosed codes and our standards and specifications.\n\n" +
      "You will find that this proposal is the best fit for your requirements, and gives you unequalled advantages in terms of price, schedule and quality.\n\n" +
      "We strive to provide the highest quality of products and services, and aim for customer delight.\n\n" +
      "Yours sincerely,";

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  letterBody.split("\n\n").forEach((para) => {
    const lines = pdf.splitTextToSize(para, CONTENT_WIDTH);
    pdf.text(lines, MARGIN, y);
    y += lines.length * 4.4 + 3;
  });
  y += 6;

  pdf.setFont("helvetica", "bold");
  pdf.text(doc_.contactPerson || "", MARGIN, y);
  y += 4.4;
  pdf.setFont("helvetica", "normal");
  pdf.text(`Mobile: ${doc_.contactMobile || ""}`, MARGIN, y);
  y += 4.4;
  pdf.text(`Mail: ${doc_.contactEmail || company.email || ""}`, MARGIN, y);
  y += 8;

  pdf.setFont("helvetica", "bold");
  pdf.text(`SITE LOCATION : ${site.toUpperCase()}`, MARGIN, y);
  y += 4.6;
  pdf.text(`Rev.${rev}`, MARGIN, y);
  y += 4.6;
  pdf.text(
    `Scope of Work: ${
      doc_.scopeOfWorkLine ||
      "Making & Installation of Pre-engineered Building."
    }`,
    MARGIN,
    y,
  );
  pageNumber(pdf, 2);

  // ===================== PAGE 3 : SPECIFICATIONS =====================
  pdf.addPage();
  y = pageHeader(pdf, company, "");
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text(`CLIENT NAME : ${clientName.toUpperCase()}`, MARGIN, y);
  pdf.text(`Estimation no. ${docNo}`, PAGE_WIDTH - MARGIN, y, {
    align: "right",
  });
  y += 10;

  const specRows = [
    ["POLYCARBONATE SHEET", specs.polycarbonateSheet ?? "CONSIDERED"],
    ["ROLLING SHUTTER", specs.rollingShutter ?? "NOT CONSIDERED"],
    ["MS GRILL AND SIDE LOUVERS", specs.msGrill ?? "NOT CONSIDERED"],
    ["CANOPY WIDTH", specs.canopyWidth ? `${specs.canopyWidth} MTR` : "-"],
    ["GUTTER AND DOWN TAKE PIPE", specs.gutterDownTake ?? "CONSIDERED"],
    ["FLASHING", specs.flashing ?? "CONSIDERED"],
    ["ROOF SHEET", specs.roofSheet || "-"],
    ["WALL SHEET", specs.wallSheet || "-"],
    ["CANOPY LENGTH", specs.canopyLength ? `${specs.canopyLength} MTR` : "-"],
    ["BAY SPACING", specs.baySpacing ? `${specs.baySpacing} MTR` : "-"],
    ["CRANE BEAMS", specs.craneBeams ?? "NOT CONSIDERED"],
    ["INTERMEDIATE COLUMN", specs.intermediateColumn ?? "NOT CONSIDERED"],
    ["MEZZANINE LEANTH (APPROX)", specs.mezzanineLeanth || "N/A"],
    ["MEZZANINE SPAN (APPROX)", specs.mezzanineSpan || "N/A"],
    ["MEZZANINE HEIGHT (APPROX)", specs.mezzanineHeight || "N/A"],
    ["EAVE HEIGHT", specs.eaveHeight ? `${specs.eaveHeight} MTR` : "-"],
    ["SHED MODEL", specs.shedModel || "-"],
    ["WALL HEIGHT", specs.wallHeight || "-"],
  ];

  autoTable(pdf, {
    startY: y,
    body: specRows,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 8.5,
      cellPadding: 2,
      textColor: [20, 30, 40],
    },
    columnStyles: {
      0: { cellWidth: 85, fontStyle: "bold" },
      1: { cellWidth: "auto", halign: "center" },
    },
    margin: { left: MARGIN, right: MARGIN },
  });
  y = pdf.lastAutoTable.finalY + 8;

  h1(pdf, "Specifications of Building", y);
  y += 8;

  autoTable(pdf, {
    startY: y,
    body: [
      ["LEANTH (APPROX)", specs.leanth ? `${specs.leanth} MTR O/O` : "-"],
      ["SPAN (APPROX)", specs.span ? `${specs.span} MTR O/O` : "-"],
    ],
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 2.5,
      textColor: [20, 30, 40],
      halign: "center",
    },
    columnStyles: { 0: { cellWidth: 85, fontStyle: "bold", halign: "left" } },
    margin: { left: MARGIN, right: MARGIN },
  });
  pageNumber(pdf, 3);

  // ===================== PAGE 4 : ITEMS & TOTAL =====================
  pdf.addPage();
  y = pageHeader(pdf, company, "");
  h1(pdf, "ESTIMATION", y);
  y += 8;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text("TO,", MARGIN, y);
  pdf.text(`Estimation : ${docNo}`, PAGE_WIDTH - MARGIN, y, { align: "right" });
  y += 4.6;
  pdf.setFont("helvetica", "bold");
  pdf.text(clientName.toUpperCase(), MARGIN, y);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Date: ${dateStr}`, PAGE_WIDTH - MARGIN, y, { align: "right" });
  y += 4.6;
  pdf.text(site.toUpperCase(), MARGIN, y);
  y += 8;

  autoTable(pdf, {
    startY: y,
    head: [
      [
        "SL NO",
        "PARTICULARS (scope of work)",
        "QTY (APPROX)",
        "UNIT",
        "PRICE",
        "TOTAL",
      ],
    ],
    body: (doc_.items || []).map((it, idx) => [
      idx + 1,
      it.description,
      it.qty,
      it.unit,
      fmtMoney(it.rate),
      fmtMoney(it.amount),
    ]),
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 2,
      textColor: [20, 30, 40],
    },
    headStyles: { fillColor: [50, 62, 77], textColor: 255, fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 12, halign: "center" },
      1: { cellWidth: "auto" },
      2: { cellWidth: 22, halign: "center" },
      3: { cellWidth: 18, halign: "center" },
      4: { cellWidth: 24, halign: "right" },
      5: { cellWidth: 30, halign: "right" },
    },
    margin: { left: MARGIN, right: MARGIN },
  });
  y = pdf.lastAutoTable.finalY + 3;

  let grandTotal;
  if (doc_.applyGst) {
    const {
      subTotal,
      cgst,
      sgst,
      roundOff,
      grandTotal: gt,
    } = gstSummary(doc_.items, company.cgstPercent, company.sgstPercent);
    grandTotal = gt;
    const gstPercent = (company.cgstPercent || 0) + (company.sgstPercent || 0);
    const boxW = 75;
    const boxX = PAGE_WIDTH - MARGIN - boxW;
    pdf.setFontSize(9);
    [
      ["SUB TOTAL", fmtMoney(subTotal)],
      [`GST ${gstPercent}%`, fmtMoney(cgst + sgst)],
    ].forEach(([label, val]) => {
      pdf.setFont("helvetica", "normal");
      pdf.text(label, boxX, y);
      pdf.setFont("helvetica", "bold");
      pdf.text(val, PAGE_WIDTH - MARGIN, y, { align: "right" });
      y += 5;
    });
    pdf.setFillColor(235, 239, 243);
    pdf.rect(boxX - 3, y - 3.5, boxW + 3, 8, "F");
    pdf.setFont("helvetica", "bold");
    pdf.text("GRAND TOTAL", boxX, y + 2.5);
    pdf.text(fmtMoney(grandTotal), PAGE_WIDTH - MARGIN, y + 2.5, {
      align: "right",
    });
    y += 12;
  } else {
    grandTotal = sumItems(doc_.items);
    pdf.setFillColor(235, 239, 243);
    pdf.rect(MARGIN, y, CONTENT_WIDTH, 8, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9.5);
    pdf.text("TOTAL ESTIMATE", MARGIN + 3, y + 5.5);
    pdf.text(fmtMoney(grandTotal), PAGE_WIDTH - MARGIN - 3, y + 5.5, {
      align: "right",
    });
    y += 12;
  }

  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(8.3);
  const wordsLines = pdf.splitTextToSize(
    `Amount In Words: ${amountInWords(grandTotal)}`,
    CONTENT_WIDTH,
  );
  pdf.text(wordsLines, MARGIN, y);
  y += wordsLines.length * 4 + 6;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  pdf.text("NOTE:", MARGIN, y);
  y += 4.4;
  pdf.setFont("helvetica", "normal");
  const noteLines = pdf.splitTextToSize(
    doc_.qtyNote ||
      "1. THE ABOVE QTY IS TENTATIVE, MAY VARY +/-5%. BILLING WILL BE DONE FOR ACTUAL QTY.",
    CONTENT_WIDTH,
  );
  pdf.text(noteLines, MARGIN, y);
  pageNumber(pdf, 4);

  // ===================== PAGE 5 : SCOPE + BANK =====================
  pdf.addPage();
  y = pageHeader(pdf, company, "");
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text(
    `Estimation no. ${docNo}   Rev.${rev}   Date: ${dateStr}`,
    MARGIN,
    y,
  );
  y += 10;

  const colW = (CONTENT_WIDTH - 8) / 2;
  const leftX = MARGIN;
  const rightXCol = MARGIN + colW + 8;
  const topY = y;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text("Our Scope:", leftX, y);
  pdf.text("Client Scope:", rightXCol, y);
  const yOur = numberedList(pdf, ourScope, leftX, y + 6, { width: colW });
  const yClient = numberedList(pdf, clientScope, rightXCol, y + 6, {
    width: colW,
  });
  y = Math.max(yOur, yClient) + 6;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text("Payment Terms:", leftX, y);
  y = numberedList(pdf, paymentTerms, leftX, y + 6, { width: CONTENT_WIDTH });
  y += 6;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text("Account Details:", leftX, y);
  y += 6;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text(`BANK NAME : ${company.bankName || ""}`, leftX, y);
  y += 4.6;
  pdf.text(`ACCOUNT NO : ${company.bankAccountNo || ""}`, leftX, y);
  y += 4.6;
  pdf.text(`BRANCH / IFSC CODE : ${company.bankIfsc || ""}`, leftX, y);
  pageNumber(pdf, 5);

  // ===================== PAGE 6 : TERMS & CONDITIONS =====================
  pdf.addPage();
  y = pageHeader(pdf, company, "");
  h1(pdf, "General Terms & Conditions", y);
  y += 10;

  const gstPercentAll = (company.cgstPercent || 0) + (company.sgstPercent || 0);
  const terms = doc_.termsAndConditions || [
    [
      "PROPOSAL & PRICE VALIDITY.",
      `This Proposal is valid for ${
        doc_.proposalValidityDays || 3
      } days from the above noted date. Any extension of validity must be received in writing from NGPF.`,
    ],
    [
      "DELIVERY PERIOD.",
      `After providing drawing approval and advance payment, item will be delivered within ${
        doc_.deliveryDays || 50
      } days, +/- ${doc_.deliveryToleranceDays || 10} days.`,
    ],
    [
      "WARRANTY.",
      `NGPF products are warranted against failure due to defective material for a period of ${
        doc_.warrantyYears || 1
      } year(s) after shipment.`,
    ],
    [
      "TAXES.",
      `The above all prices are basic only and GST @${gstPercentAll}% is extra.`,
    ],
    [
      "ORDER CANCELLING.",
      "Agreements and orders cannot be cancelled or modified by BUYER under any circumstances without BUYER first reaching an agreement in writing with SELLER covering all damages. If the buyer cancels the order, the BUYER shall be subjected to order cancellation charges as hereunder: (1) 10% of the total order value, if production hasn't started, considered as engineering cost. (2) 10% of the total order value plus the cost of material procured/manufactured (based on tonnage) till the date of intimation to SELLER in writing by BUYER.",
    ],
    [
      "JURISDICTION.",
      `All suits arising out of the contract shall be instituted in a court of competent jurisdiction situated in ${
        doc_.jurisdictionCity || "Mysuru"
      } and no other court.`,
    ],
    [
      "INSPECTION.",
      "Any quality inspection should be done before material dispatch from the factory.",
    ],
    [
      "SCOPE OF WORK.",
      "Any additional work not mentioned in the scope will be charged separately.",
    ],
    [
      "OWNERSHIP OF EXCESS MATERIAL AT SITE.",
      "All materials supplied to site in excess of building requirements shall be the property of NGPF, and NGPF retains the right to ship it back to its own factory.",
    ],
    [
      "STRUCTURAL DESIGN NOTE.",
      "The above estimation and structural consideration have been prepared based solely on the current project requirements. Additional loads arising from future expansion, crane installation, solar panel installation, mezzanine floor construction, or any other future modifications have not been considered in this estimation or structural design criteria.",
    ],
  ];

  terms.forEach(([title, body], idx) => {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text(`${idx + 1}. ${title}`, MARGIN, y);
    y += 4.6;
    pdf.setFont("helvetica", "normal");
    const lines = pdf.splitTextToSize(body, CONTENT_WIDTH);
    pdf.text(lines, MARGIN, y);
    y += lines.length * 4.2 + 3.5;
  });
  pageNumber(pdf, 6);

  // ===================== PAGE 7 : ORDER CONFIRMATION =====================
  pdf.addPage();
  y = pageHeader(pdf, company, "");
  h1(pdf, "ORDER CONFIRMATION, ACCEPTANCE OF OFFER & CONTRACT", y);
  y += 10;

  const confirmParagraphs = [
    `This Order Confirmation and Acceptance of Offer shall constitute a valid Contract/Agreement between the Client and ${company.name.toUpperCase()} for the execution of Pre-Engineered Building (PEB) material supply and Labour Works as specified in the approved quotation/estimation.`,
    `The Client hereby confirms acceptance of the submitted quotation and authorizes ${company.name.toUpperCase()} to proceed with the execution of the work in accordance with the approved specifications, drawings, terms, and scope of work mentioned in the quotation.`,
    `${company.name.toUpperCase()} shall execute the agreed PEB material supply and labour works strictly as per the approved estimation and mutually accepted conditions.`,
    "The Client agrees to release the payments as per the mutually agreed payment terms and schedule mentioned in the quotation/work order. Any delay in payment may affect the work progress and delivery schedule.",
    "This Agreement shall come into effect from the date of order confirmation and shall remain binding on both parties until completion of the agreed scope of work.",
  ];
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  confirmParagraphs.forEach((para) => {
    const lines = pdf.splitTextToSize(para, CONTENT_WIDTH);
    pdf.text(lines, MARGIN, y);
    y += lines.length * 4.4 + 3.5;
  });
  y += 6;

  // Company signatory block (left column)
  const sigTopY = y;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text(company.name.toUpperCase(), MARGIN, y);
  y += 7;
  pdf.setFontSize(9);
  pdf.text("Authorized Signatory : ______________________", MARGIN, y);
  y += 6;
  pdf.text("Designation : _______________________________", MARGIN, y);
  y += 6;
  pdf.text("Contact Number : _____________________________", MARGIN, y);
  y += 6;
  pdf.text(`Date : ${dateStr}`, MARGIN, y);
  y += 8;
  pdf.text("Company Seal:", MARGIN, y);
  y += 10;

  // Signature + stamp image placed above/near the signatory line
  drawSignatureStamp(pdf, sigTopY + 20, company, { centerX: MARGIN + 70 });

  y += 8;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("CLIENT DETAILS", MARGIN, y);
  y += 7;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  [
    "Client Name : ___________________________",
    "Company Name : ____________________________________",
    "Authorized Person : _________________________________",
    "Contact Number : ___________________________________",
    "Project Location : __________________________________",
    "Date : ________________",
  ].forEach((line) => {
    pdf.text(line, MARGIN, y);
    y += 6;
  });
  pageNumber(pdf, 7);

  return pdf;
}
