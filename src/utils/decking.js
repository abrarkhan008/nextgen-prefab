// =====================================================================
// DECKING SHEET  -  data model, weight formulas and summary builder
// Used by: pages/DeckingEditor.jsx, pages/DeckingSummary.jsx,
//          utils/pdf/deckingPdf.js
// =====================================================================
import { newId, getNextNumber } from "./storage";
import { STEEL_DENSITY, plateWeight, boltWeight, round2 } from "./calc";
import { findSection, CUSTOM_SECTION } from "./steelTables";

export const BUILDING_TYPES = { PEB: "PEB", CONVENTIONAL: "CONVENTIONAL" };
export const CONVENTIONAL_TYPES = { SINGLE: "SINGLE", TUBULAR: "TUBULAR" };
export const TUBE_SHAPES = { RECT: "RECT", ROUND: "ROUND" };
export const GUSSET_SHAPES = ["Triangle", "Rectangle"];

// Steel density used for tubes (g/cm3), same value the Square Tube app shows
export const TUBE_DENSITY = "7.85";

const num = (v) => Number(v) || 0;

// ---------------------------------------------------------------------
// Which set of member rows is active?
// PEB -> "peb"   |   Conventional + Single -> "single"   |   Tubular -> "tubular"
// Each mode keeps its own pillar / beam rows, so switching type never
// deletes what was typed in another type.
// ---------------------------------------------------------------------
export function modeKey(doc) {
  if (doc.buildingType === BUILDING_TYPES.PEB) return "peb";
  return doc.conventionalType === CONVENTIONAL_TYPES.TUBULAR
    ? "tubular"
    : "single";
}

export function modeLabel(doc) {
  const m = modeKey(doc);
  if (m === "peb") return "PEB";
  if (m === "single") return "Conventional - Single Section";
  return "Conventional - Tubular (Pipe Section)";
}

// ---------------------------------------------------------------------
// Section list (same order for every type)
// kind decides which card / formula is used
// ---------------------------------------------------------------------
export const DECK_SECTION_DEFS = [
  {
    key: "foundationBolts",
    title: "Foundation Bolts",
    kind: "foundationBolt",
    prefix: "FB",
  },
  { key: "pillars", title: "Pillars (Columns)", kind: "member", prefix: "C" },
  { key: "primaryBeams", title: "Primary Beams", kind: "member", prefix: "PB" },
  {
    key: "secondaryBeams",
    title: "Secondary Beams",
    kind: "member",
    prefix: "SB",
  },
  { key: "studs", title: "Studs", kind: "stud", prefix: "ST" },
  { key: "boltsNuts", title: "Bolts & Nuts", kind: "bolt", prefix: "BN" },
  { key: "decking", title: "Decking Sheet", kind: "deck", prefix: "DS" },
];

const MEMBER_KEYS = ["pillars", "primaryBeams", "secondaryBeams"];

export function getRows(doc, key) {
  if (MEMBER_KEYS.includes(key)) {
    return doc.members?.[modeKey(doc)]?.[key] || [];
  }
  return doc.shared?.[key] || [];
}

export function setRowsIn(doc, key, rows) {
  if (MEMBER_KEYS.includes(key)) {
    const mode = modeKey(doc);
    return {
      ...doc,
      members: {
        ...doc.members,
        [mode]: { ...doc.members[mode], [key]: rows },
      },
    };
  }
  return { ...doc, shared: { ...doc.shared, [key]: rows } };
}

// ---------------------------------------------------------------------
// Attached plates
// ---------------------------------------------------------------------
export const emptyConnectionPlate = () => ({
  id: newId(),
  length: "", // m
  width: "", // mm
  thickness: "", // mm
  density: String(STEEL_DENSITY),
  qty: "",
});

export const emptyGussetPlate = () => ({
  id: newId(),
  shape: "Triangle",
  base: "", // mm
  height: "", // mm
  thickness: "", // mm
  density: String(STEEL_DENSITY),
  qty: "",
});

// Connection plate = width(mm) x length(m) x thickness(mm) x 0.00785 x qty
export function connectionPlateWeight(p) {
  return (
    plateWeight(
      p?.width,
      p?.length,
      p?.thickness,
      num(p?.density) || STEEL_DENSITY,
    ) * num(p?.qty)
  );
}

// Gusset plate = base(mm) x height(mm) x thickness(mm) x density  (x 0.5 if triangle)
export function gussetPlateWeight(g) {
  const factor = g?.shape === "Rectangle" ? 1 : 0.5;
  return (
    plateWeight(
      g?.base,
      num(g?.height) / 1000,
      g?.thickness,
      num(g?.density) || STEEL_DENSITY,
    ) *
    factor *
    num(g?.qty)
  );
}

// ---------------------------------------------------------------------
// Row factories
// ---------------------------------------------------------------------
export const emptyFoundationBoltRow = (label = "") => ({
  id: newId(),
  label,
  pedestals: "",
  boltsPerPedestal: "",
  diameter: "", // mm
  length: "", // mm
});

export const emptyBoltRow = (label = "") => ({
  id: newId(),
  label,
  d: "", // mm
  l: "", // mm
  qty: "",
});

export const emptyStudRow = (label = "") => ({
  id: newId(),
  label,
  d: "", // mm
  l: "", // mm
  qty: "",
});

// PEB built-up member: 2 flanges + 1 web (+ plates)
export const emptyPebMember = (label = "") => ({
  id: newId(),
  label,
  flangeWidth: "",
  flangeThick: "",
  webWidth: "",
  webThick: "",
  length: "",
  qty: "",
  plates: [],
  gussets: [],
});

// Conventional rolled section picked from the IS 808 table
export const emptySectionMember = (label = "") => ({
  id: newId(),
  label,
  category: "medium",
  designation: "",
  customKgm: "",
  length: "",
  qty: "",
  plates: [],
  gussets: [],
});

// Conventional tubular member (square / rectangular tube or round pipe)
export const emptyTubeMember = (label = "") => ({
  id: newId(),
  label,
  shape: TUBE_SHAPES.RECT,
  sideA: "",
  sideB: "",
  outerDia: "",
  thickness: "",
  density: TUBE_DENSITY,
  length: "",
  qty: "",
  plates: [],
  gussets: [],
});

// ---------------------------------------------------------------------
// Decking sheet
// Weight = building length x building width x weight per sq ft
// Default kg/sq ft = thickness(mm) x 7.85 kg/m2 per mm / 10.7639 sqft per m2
// (flat steel). Edit the kg/sq ft box to use your supplier's profile weight.
// ---------------------------------------------------------------------
export const DECK_THICKNESSES = ["0.8", "1.0", "1.2"];
const SQFT_PER_SQM = 10.7639104;

export function deckWeightPerSqft(thicknessMm) {
  const t = num(thicknessMm);
  return Math.round(((t * 7.85) / SQFT_PER_SQM) * 1000) / 1000;
}

export const emptyDeckRow = (label = "") => ({
  id: newId(),
  label,
  unit: "m", // unit used for length & width: "m" or "ft"
  length: "",
  width: "",
  thickness: DECK_THICKNESSES[0],
  weightPerSqft: String(deckWeightPerSqft(DECK_THICKNESSES[0])),
});

export function deckAreaSqft(row) {
  const area = num(row?.length) * num(row?.width);
  return row?.unit === "ft" ? area : area * SQFT_PER_SQM;
}

export function deckRowWeight(row) {
  return deckAreaSqft(row) * num(row?.weightPerSqft);
}

// ---------------------------------------------------------------------
// Simple row weights
// ---------------------------------------------------------------------
export function foundationBoltRowWeight(r) {
  return (
    num(r?.pedestals) *
    num(r?.boltsPerPedestal) *
    boltWeight(r?.diameter, r?.length)
  );
}

// Bolt / nut / stud (solid round): 0.000006165 x d(mm)^2 x l(mm) x qty
export function boltRowWeight(r) {
  return boltWeight(r?.d, r?.l) * num(r?.qty);
}
export const studRowWeight = boltRowWeight;

// ---------------------------------------------------------------------
// Member weight helpers
// ---------------------------------------------------------------------

/** kg per metre of a rolled section (IS 808 table, or custom value) */
export function sectionKgm(row) {
  if (row?.designation === CUSTOM_SECTION) return num(row.customKgm);
  return findSection(row?.designation)?.kgm || 0;
}

/** Cross-section area (mm2) of a tube wall */
export function tubeAreaMm2(row) {
  const T = num(row?.thickness);
  if (row?.shape === TUBE_SHAPES.ROUND) {
    const D = num(row.outerDia);
    return T > 0 && D > T ? Math.PI * T * (D - T) : 0;
  }
  const A = num(row?.sideA);
  const B = num(row?.sideB) || A; // Side B left blank = square tube
  if (!A || !B || !T) return 0;
  const innerA = Math.max(A - 2 * T, 0);
  const innerB = Math.max(B - 2 * T, 0);
  return A * B - innerA * innerB;
}

/** kg per metre of a tube: area(mm2) x density(g/cm3) / 1000 */
export function tubeWeightPerMeter(row) {
  return (
    (tubeAreaMm2(row) * (num(row?.density) || Number(TUBE_DENSITY))) / 1000
  );
}

const thicknessKey = (t) => {
  const n = Number(t);
  return n > 0 ? String(n) : "0";
};

function addThickness(map, t, w) {
  if (!w) return;
  const k = thicknessKey(t);
  map[k] = (map[k] || 0) + w;
}

/**
 * Full weight break-up of one pillar / beam row.
 * main     = flanges+web (PEB), rolled section, or tube  (x qty)
 * plates   = connection plates
 * gussets  = gusset plates
 * byThickness = plate / tube-wall / flange / web weight grouped by thickness
 * rolled   = rolled-section weight (has no single plate thickness)
 */
export function memberBreakdown(row, mode) {
  const byThickness = {};
  const L = num(row?.length);
  const q = num(row?.qty);
  let main = 0;
  let rolled = 0;

  if (mode === "peb") {
    const flange = plateWeight(row?.flangeWidth, L, row?.flangeThick) * 2 * q;
    const web = plateWeight(row?.webWidth, L, row?.webThick) * q;
    addThickness(byThickness, row?.flangeThick, flange);
    addThickness(byThickness, row?.webThick, web);
    main = flange + web;
  } else if (mode === "single") {
    rolled = sectionKgm(row) * L * q;
    main = rolled;
  } else {
    main = tubeWeightPerMeter(row) * L * q;
    addThickness(byThickness, row?.thickness, main);
  }

  let plates = 0;
  (row?.plates || []).forEach((p) => {
    const w = connectionPlateWeight(p);
    plates += w;
    addThickness(byThickness, p.thickness, w);
  });

  let gussets = 0;
  (row?.gussets || []).forEach((g) => {
    const w = gussetPlateWeight(g);
    gussets += w;
    addThickness(byThickness, g.thickness, w);
  });

  return {
    main,
    plates,
    gussets,
    rolled,
    byThickness,
    total: main + plates + gussets,
  };
}

// ---------------------------------------------------------------------
// New / normalised documents
// ---------------------------------------------------------------------
const blankModeRows = () => ({
  pillars: [],
  primaryBeams: [],
  secondaryBeams: [],
});

function blankShell() {
  return {
    type: "decking",
    date: new Date().toISOString().slice(0, 10),
    client: { name: "", gstNo: "" },
    site: "",
    buildingType: BUILDING_TYPES.PEB,
    conventionalType: CONVENTIONAL_TYPES.SINGLE,
    shared: { foundationBolts: [], studs: [], boltsNuts: [], decking: [] },
    members: {
      peb: blankModeRows(),
      single: blankModeRows(),
      tubular: blankModeRows(),
    },
  };
}

export function blankDeckingDoc() {
  let docNo = "";
  try {
    docNo = getNextNumber("decking");
  } catch (e) {
    docNo = "";
  }
  return { ...blankShell(), id: newId(), docNo };
}

/** Fills in any missing field so older / partial documents never crash the editor */
export function normalizeDeckingDoc(existing) {
  const base = blankShell();
  return {
    ...base,
    ...existing,
    client: { ...base.client, ...existing.client },
    shared: { ...base.shared, ...existing.shared },
    members: {
      peb: { ...base.members.peb, ...existing.members?.peb },
      single: { ...base.members.single, ...existing.members?.single },
      tubular: { ...base.members.tubular, ...existing.members?.tubular },
    },
  };
}

/** Creates a new empty row for a section, labelled C1, C2 ... */
export function createRow(def, doc) {
  const label = `${def.prefix}${getRows(doc, def.key).length + 1}`;
  switch (def.kind) {
    case "foundationBolt":
      return emptyFoundationBoltRow(label);
    case "stud":
      return emptyStudRow(label);
    case "bolt":
      return emptyBoltRow(label);
    case "deck":
      return emptyDeckRow(label);
    default: {
      const mode = modeKey(doc);
      if (mode === "peb") return emptyPebMember(label);
      if (mode === "single") return emptySectionMember(label);
      return emptyTubeMember(label);
    }
  }
}

// ---------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------
export function fmtKg(n) {
  return (Number(n) || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function memberDetail(row, mode) {
  const size = `L=${row.length || 0}m x Qty ${row.qty || 0}`;
  if (mode === "peb") {
    return `Flange ${row.flangeWidth || 0}x${row.flangeThick || 0}mm, Web ${
      row.webWidth || 0
    }x${row.webThick || 0}mm, ${size}`;
  }
  if (mode === "single") {
    const name =
      row.designation === CUSTOM_SECTION
        ? `Custom ${row.customKgm || 0} kg/m`
        : row.designation || "No section selected";
    return `${name}, ${size}`;
  }
  const spec =
    row.shape === TUBE_SHAPES.ROUND
      ? `Pipe OD ${row.outerDia || 0} x ${row.thickness || 0}mm`
      : `Tube ${row.sideA || 0} x ${row.sideB || row.sideA || 0} x ${
          row.thickness || 0
        }mm`;
  return `${spec}, ${size}`;
}

const MAIN_LABEL = {
  peb: "Flanges + web",
  single: "Rolled section",
  tubular: "Tube / pipe",
};

// ---------------------------------------------------------------------
// SUMMARY  (Members Weight page + PDF)
//
//  sections      -> every section with its rows and total
//  thicknessRows -> plate / sheet / tube-wall weight grouped by thickness
//  otherRows     -> rolled sections, foundation bolts, bolts & nuts, studs
//  grandTotal    -> thicknessTotal + otherTotal
// ---------------------------------------------------------------------
export function buildDeckingSummary(doc) {
  const mode = modeKey(doc);
  const thicknessMap = {};
  const other = { rolled: 0, foundationBolts: 0, boltsNuts: 0, studs: 0 };
  let grandRaw = 0;

  const sections = DECK_SECTION_DEFS.map((def) => {
    const rows = getRows(doc, def.key);
    let sectionRaw = 0;

    const lines = rows.map((row) => {
      let weight = 0;
      let detail = "";
      let parts = [];

      if (def.kind === "member") {
        const b = memberBreakdown(row, mode);
        weight = b.total;
        detail = memberDetail(row, mode);
        parts = [
          { label: MAIN_LABEL[mode], weight: b.main },
          { label: "Connection plates", weight: b.plates },
          { label: "Gusset plates", weight: b.gussets },
        ].filter((p) => p.weight > 0);
        Object.entries(b.byThickness).forEach(([t, w]) =>
          addThickness(thicknessMap, t, w),
        );
        other.rolled += b.rolled;
      } else if (def.kind === "foundationBolt") {
        weight = foundationBoltRowWeight(row);
        detail = `${row.pedestals || 0} pedestals x ${
          row.boltsPerPedestal || 0
        } bolts, dia ${row.diameter || 0} x ${row.length || 0}mm`;
        other.foundationBolts += weight;
      } else if (def.kind === "bolt") {
        weight = boltRowWeight(row);
        detail = `dia ${row.d || 0} x ${row.l || 0}mm x Qty ${row.qty || 0}`;
        other.boltsNuts += weight;
      } else if (def.kind === "stud") {
        weight = studRowWeight(row);
        detail = `dia ${row.d || 0} x ${row.l || 0}mm x Qty ${row.qty || 0}`;
        other.studs += weight;
      } else if (def.kind === "deck") {
        weight = deckRowWeight(row);
        detail = `${row.length || 0} x ${row.width || 0} ${row.unit || "m"}, ${
          row.thickness || 0
        }mm sheet @ ${row.weightPerSqft || 0} kg/sq ft`;
        addThickness(thicknessMap, row.thickness, weight);
      }

      sectionRaw += weight;
      return {
        label: row.label || def.prefix,
        detail,
        weight: round2(weight),
        parts: parts.map((p) => ({ ...p, weight: round2(p.weight) })),
      };
    });

    grandRaw += sectionRaw;
    return {
      key: def.key,
      title: def.title,
      lines,
      total: round2(sectionRaw),
    };
  });

  const thicknessRows = Object.entries(thicknessMap)
    .map(([t, w]) => ({
      thickness: Number(t),
      label: t === "0" ? "Thickness not entered" : `${t} mm`,
      weight: round2(w),
    }))
    .sort((a, b) => a.thickness - b.thickness);

  const otherRows = [
    { label: "Rolled sections (IS 808 table)", weight: round2(other.rolled) },
    { label: "Foundation bolts", weight: round2(other.foundationBolts) },
    { label: "Bolts & nuts", weight: round2(other.boltsNuts) },
    { label: "Studs", weight: round2(other.studs) },
  ].filter((r) => r.weight > 0);

  const otherRaw =
    other.rolled + other.foundationBolts + other.boltsNuts + other.studs;

  return {
    modeLabel: modeLabel(doc),
    sections,
    thicknessRows,
    otherRows,
    thicknessTotal: round2(grandRaw - otherRaw),
    otherTotal: round2(otherRaw),
    grandTotal: round2(grandRaw),
  };
}
