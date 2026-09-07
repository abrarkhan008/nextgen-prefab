// Steel density constant used in the reference Excel sheet (kg per mm-width * m-length * mm-thick)
export const STEEL_DENSITY = 0.00785;

/**
 * Weight (kg) of a flat plate/flange/web member:
 * weight = width(mm) x length(m) x thickness(mm) x density
 */
export function plateWeight(
  widthMm,
  lengthM,
  thicknessMm,
  density = STEEL_DENSITY,
) {
  const w = Number(widthMm) || 0;
  const l = Number(lengthM) || 0;
  const t = Number(thicknessMm) || 0;
  return w * l * t * density;
}

export function round2(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

// Bolt/Nut weight (kg) = 0.006165 x diameter(mm)^2 x length(mm)
export function boltWeight(d, l) {
  const dia = Number(d) || 0;
  const len = Number(l) || 0;
  return 0.006165 * dia * dia * len;
}

/** Builds flange + web rows (and totals) for one pillar/rafter/adapter member */
export function memberRows(label, member) {
  const { flangeWidth, flangeThick, webWidth, webThick, length, qty } = member;
  const flangeUnitWt = plateWeight(flangeWidth, length, flangeThick);
  const webUnitWt = plateWeight(webWidth, length, webThick);
  const flangeTotal = flangeUnitWt * 2; // two flanges per member
  const perPieceWeight = flangeTotal + webUnitWt;
  const totalWeight = perPieceWeight * (Number(qty) || 0);
  return {
    label,
    flangeUnitWt: round2(flangeUnitWt),
    webUnitWt: round2(webUnitWt),
    perPieceWeight: round2(perPieceWeight),
    qty: Number(qty) || 0,
    totalWeight: round2(totalWeight),
  };
}

export function sumItems(items) {
  return items.reduce((s, i) => s + (Number(i.amount) || 0), 0);
}

export function computeItemAmount(item) {
  const qty = Number(item.qty) || 0;
  const rate = Number(item.rate) || 0;
  return round2(qty * rate);
}

/** GST + round-off summary block used by DC bill / Tax invoice / Quotation */
export function gstSummary(items, cgstPercent, sgstPercent) {
  const subTotal = round2(sumItems(items));
  const cgst = round2((subTotal * (Number(cgstPercent) || 0)) / 100);
  const sgst = round2((subTotal * (Number(sgstPercent) || 0)) / 100);
  const rawTotal = subTotal + cgst + sgst;
  const grandTotal = Math.round(rawTotal);
  const roundOff = round2(grandTotal - rawTotal);
  return { subTotal, cgst, sgst, roundOff, grandTotal };
}

// =====================================================================
// BRACING WEIGHT FORMULAS
// All three take a diameter/size (and thickness for pipe) in mm and
// return weight in KG for a single piece. Multiply by qty for total.
// =====================================================================

export const BRACING_TYPES = ["Rod Bracing", "Pipe Bracing", "Rope Bracing"];

// Rod Bracing (solid round bar): weight (kg) = size(mm)^2 / 162
export function rodBracingWeight(size) {
  const s = Number(size) || 0;
  return (s * s) / 162;
}

// Pipe Bracing (hollow round pipe): weight (kg) = 0.02466 x thickness(mm) x (size(mm) - thickness(mm))
export function pipeBracingWeight(size, thickness) {
  const s = Number(size) || 0;
  const t = Number(thickness) || 0;
  return 0.02466 * t * (s - t);
}

// Rope Bracing: weight (kg) = size(mm)^2 x 0.004
export function ropeBracingWeight(size) {
  const s = Number(size) || 0;
  return s * s * 0.004;
}

/** Dispatches to the right formula above based on row.type */
export function bracingUnitWeight(row) {
  switch (row?.type) {
    case "Pipe Bracing":
      return pipeBracingWeight(row.size, row.thickness);
    case "Rope Bracing":
      return ropeBracingWeight(row.size);
    case "Rod Bracing":
    default:
      return rodBracingWeight(row?.size);
  }
}

export function bracingTotalWeight(row) {
  const qty = Number(row?.qty) || 0;
  return round2(bracingUnitWeight(row) * qty);
}

// =====================================================================
// PURLIN (Z / C SECTION) WEIGHT
// Cross-section = 2 flanges + 1 web + 2 lips, each a flat strip:
// weight = width(mm) x length(m) x thickness(mm) x density
// =====================================================================
export function purlinSectionWeight(p) {
  const density = Number(p?.density) || STEEL_DENSITY;
  const flange = plateWeight(p?.flangeWidth, p?.length, p?.thickness, density);
  const web = plateWeight(p?.webWidth, p?.length, p?.thickness, density);
  const lip = plateWeight(p?.lipWidth, p?.length, p?.thickness, density);
  const perPieceWeight = flange * 2 + web + lip * 2;
  const qty = Number(p?.qty) || 0;
  return {
    perPieceWeight: round2(perPieceWeight),
    totalWeight: round2(perPieceWeight * qty),
  };
}
