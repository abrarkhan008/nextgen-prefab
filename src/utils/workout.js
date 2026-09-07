import { newId } from "./storage";
import {
  memberRows,
  plateWeight,
  STEEL_DENSITY,
  round2,
  bracingTotalWeight,
  boltWeight,
} from "./calc";
// ---- row factories ----

export const emptyPlate = () => ({
  length: "",
  width: "",
  thickness: "",
  density: String(STEEL_DENSITY), // editable per-row, defaults to 0.00785
  qty: "",
});

export const emptyMemberRow = (label = "") => ({
  id: newId(),
  label,
  flangeWidth: "",
  flangeThick: "",
  webWidth: "",
  webThick: "",
  length: "",
  qty: "",
  plates: [emptyPlate()], // list of connection plates attached to this member
});

// `unit` defaults to NOS but a section can ask for a different default
// (e.g. Flange Bracing rows default to "Meter"). `thickness` is only
// shown/used by sections that set `hasThickness: true` below, but it's
// kept on every row so switching sections never crashes on a missing key.
export const emptyRateRow = (label = "", unit = "NOS") => ({
  id: newId(),
  label,
  qty: "",
  unit,
  thickness: "",
  weightPerUnit: "",
  size: "",
});

// Rod / Pipe / Rope bracing row — used by BRACING-type sections.
export const emptyBracingRow = (label = "") => ({
  id: newId(),
  label,
  type: "Rod Bracing",
  size: "",
  thickness: "",
  qty: "",
});

// ---- weight calculators ----

// Member weight (flange x2 + web, from calc.js) + its attached connection plate
export function memberRowWeight(row) {
  const m = memberRows(row.label, row);
  const platesTotal = (row.plates || []).reduce((sum, p) => {
    const pQty = Number(p?.qty) || 0;
    const pUnitWt = plateWeight(
      p?.width,
      p?.length,
      p?.thickness,
      Number(p?.density) || STEEL_DENSITY,
    );
    return sum + pUnitWt * pQty;
  }, 0);
  return round2(m.totalWeight + platesTotal);
}

export function rateRowWeight(row) {
  return round2((Number(row.qty) || 0) * (Number(row.weightPerUnit) || 0));
}

export const emptyBoltRow = (label = "") => ({
  id: newId(),
  label,
  d: "",
  l: "",
  qty: "",
});

export function boltRowWeight(row) {
  const unit = boltWeight(row.d, row.l);
  return round2(unit * (Number(row.qty) || 0));
}
// ---- section registry ----
// Add/remove/rename a section by editing ONLY this array — every page
// (Workout, Summary, Material List) reads from it, so nothing else needs
// to change if you add a 15th section later.
//
// Optional per-section flags for RATE sections:
//   hasThickness: true      -> shows a Thickness (mm) input on each row
//   defaultUnit: "Meter"    -> new rows start with this unit instead of NOS
//   qtyLabel: "Quantity (Meter)" -> overrides the "Qty" field label

export const SECTION_TYPES = {
  MEMBER: "member",
  RATE: "rate",
  BRACING: "bracing",
};

export const SECTIONS = [
  {
    key: "pillars",
    title: "Pillars (Columns)",
    type: SECTION_TYPES.MEMBER,
    prefix: "C",
  },
  { key: "rafters", title: "Rafters", type: SECTION_TYPES.MEMBER, prefix: "R" },
  {
    key: "windColumns",
    title: "Wind Columns",
    type: SECTION_TYPES.MEMBER,
    prefix: "WC",
  },
  {
    key: "endRafters",
    title: "End Rafters",
    type: SECTION_TYPES.MEMBER,
    prefix: "ER",
  },
  { key: "canopy", title: "Canopy", type: SECTION_TYPES.MEMBER, prefix: "CN" },
  {
    key: "jackBeam",
    title: "Jack Beam",
    type: SECTION_TYPES.MEMBER,
    prefix: "JB",
  },
  {
    key: "centerPillar",
    title: "Center Pillar",
    type: SECTION_TYPES.MEMBER,
    prefix: "CP",
  },
  {
    key: "roofMonitor",
    title: "Roof Monitor",
    type: SECTION_TYPES.MEMBER,
    prefix: "RM",
  },
  {
    key: "xBracing",
    title: "X Bracing",
    type: SECTION_TYPES.BRACING,
    prefix: "XB",
  },
  {
    key: "boltsNuts",
    title: "Bolts & Nuts",
    type: SECTION_TYPES.RATE,
    prefix: "BN",
  },
  {
    key: "flangeBracing",
    title: "Flange Bracing",
    type: SECTION_TYPES.RATE,
    prefix: "FB",
    hasThickness: true,
    defaultUnit: "Meter",
    qtyLabel: "Quantity (Meter)",
  },
  {
    key: "sagRods",
    title: "Sag Rods",
    type: SECTION_TYPES.BRACING,
    prefix: "SR",
  },
];

export function blankWorkout() {
  const w = {};
  SECTIONS.forEach((s) => {
    w[s.key] = [];
  });
  return w;
}

export function sectionTotalWeight(section, rows) {
  const fn =
    section.key === "sagRods"
      ? bracingTotalWeight
      : section.key === "boltsNuts"
      ? boltRowWeight
      : section.type === SECTION_TYPES.MEMBER
      ? memberRowWeight
      : section.type === SECTION_TYPES.BRACING
      ? bracingTotalWeight
      : rateRowWeight;

  return round2((rows || []).reduce((sum, r) => sum + fn(r), 0));
}
