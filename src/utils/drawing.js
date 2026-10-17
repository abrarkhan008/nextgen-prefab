// src/utils/drawing.js
// Data model + maths for the PEB drawing generator.

export const ROW_LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ".split(""); // no "I", same as your PDF

export function todayShort() {
  const t = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${p(t.getDate())}.${p(t.getMonth() + 1)}.${String(
    t.getFullYear(),
  ).slice(2)}`;
}

export function defaultDrawing(id, docNo = "") {
  return {
    id,
    type: "drawing",
    // ---- title block ----
    docNo, // e.g. Q3248
    formatNo: "DOC.SBTPL/QMS/DE/PD/01/V0",
    clientName: "",
    buildingName: "WAREHOUSE",
    location: "",
    date: todayShort(),
    drawnBy: "",
    designBy: "",
    rev: "0",
    scale: "NTS",
    // ---- building ----
    length: 60000, // along ridge, outer to outer (mm)
    width: 30000, // across ridge, outer to outer (mm)
    clearHeight: 7000, // eave / clear height (mm)
    bayCount: 8, // number of bays along length
    slope: 10, // roof slope 1 in N
    rowSpacing: 6000, // purlin / row spacing across width
    brickWall: 3048, // brick wall height, 0 = none
    canopyHeight: 4500,
    jackBeam: true,
    crossBracing: true,
    show3d: true,
    notes: "1. FRAMED OPENING (F.O): 4.0M(W)X4.0M(H)",
    // ---- lists ----
    openings: [], // {id, wall:'front'|'back', bay, width, height, label}
    canopies: [], // {id, side:'front'|'back'|'left'|'right', fromBay, toBay, width}
    extras: [], // {id, kind, label, length, width, height, x, y, z}
  };
}

export function geom(d) {
  const L = +d.length || 1;
  const W = +d.width || 1;
  const n = Math.max(1, Math.round(+d.bayCount || 1));
  const bw = L / n;
  const m = Math.max(1, Math.round(W / (+d.rowSpacing || 6000)));
  const rs = W / m;
  const slope = +d.slope || 10;
  const rise = W / 2 / slope;
  const H = +d.clearHeight || 0;
  return { L, W, n, bw, m, rs, rise, H, Hr: H + rise, slope };
}

export const EXTRA_KINDS = {
  pillar: {
    name: "Pillar",
    length: 300,
    width: 300,
    height: 7000,
    z: 0,
    color: "#555",
  },
  staircase: {
    name: "Staircase",
    length: 1200,
    width: 4000,
    height: 3000,
    z: 0,
    color: "#c9d6e2",
  },
  walkway: {
    name: "Walkway / Platform",
    length: 1500,
    width: 10000,
    height: 3000,
    z: 3000,
    color: "#dfe7d0",
  },
  pipe: {
    name: "Pipe",
    length: 200,
    width: 10000,
    height: 200,
    z: 5000,
    color: "#b9c0c7",
  },
  angle: {
    name: "Angle",
    length: 100,
    width: 6000,
    height: 100,
    z: 5000,
    color: "#d6c4a8",
  },
};

export function newExtra(kind, newId) {
  const k = EXTRA_KINDS[kind];
  return {
    id: newId(),
    kind,
    label: k.name.toUpperCase(),
    length: k.length, // size along building length (X)
    width: k.width, // size across building width (Y)
    height: k.height,
    x: 5000, // distance from left wall (grid 1)
    y: 5000, // distance from front wall (line A)
    z: k.z, // height above floor
  };
}
