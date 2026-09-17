export default function MemberDiagram() {
  // ---- isometric axes (true parallelogram projection) ----
  const O = { x: 190, y: 300 }; // near corner, top face
  const A = { x: 280, y: -160 }; // beam LENGTH direction
  const B = { x: -130, y: -75 }; // flange WIDTH direction

  const flangeThickness = 34;
  const webHeight = 130; // gap between the two flanges (web width)
  const webBStart = 0.36; // web sits centered in the flange width
  const webBEnd = 0.64;
  const webAVisible = 0.14; // sliver of the web's long face that peeks out

  const D2 = flangeThickness + webHeight; // top of bottom flange (down offset)

  // project a point given fractional length (a), fractional width (b),
  // and a straight-down pixel offset (down) for thickness/height
  const pt = (a, b, down = 0) => ({
    x: O.x + a * A.x + b * B.x,
    y: O.y + a * A.y + b * B.y + down,
  });

  const poly = (pts) => pts.map((p) => `${p.x},${p.y}`).join(" ");

  // ---- colors, matched to a soft grayscale rendered look ----
  const topFace = "#dcdedf";
  const frontFace = "#aeb2b6";
  const rightFace = "#8d9195";
  const webFrontFace = "#7d8185";
  const webRightFace = "#6b6f73";
  const seam = "#000000";
  const dimLine = "#000000";

  const circle = (cx, cy, n) => (
    <g>
      <circle cx={cx} cy={cy} r="11" fill="#000000" />
      <text
        x={cx}
        y={cy + 4}
        textAnchor="middle"
        fontSize="11"
        fontWeight="bold"
        fill="#ffffff"
      >
        {n}
      </text>
    </g>
  );

  // ---- TOP FLANGE ----
  const tfTop = poly([pt(0, 0, 0), pt(1, 0, 0), pt(1, 1, 0), pt(0, 1, 0)]);
  const tfFront = poly([
    pt(0, 0, 0),
    pt(0, 1, 0),
    pt(0, 1, flangeThickness),
    pt(0, 0, flangeThickness),
  ]);
  const tfRight = poly([
    pt(0, 1, 0),
    pt(1, 1, 0),
    pt(1, 1, flangeThickness),
    pt(0, 1, flangeThickness),
  ]);

  // ---- BOTTOM FLANGE ----
  const bfTop = poly([pt(0, 0, D2), pt(1, 0, D2), pt(1, 1, D2), pt(0, 1, D2)]);
  const bfFront = poly([
    pt(0, 0, D2),
    pt(0, 1, D2),
    pt(0, 1, D2 + flangeThickness),
    pt(0, 0, D2 + flangeThickness),
  ]);
  const bfRight = poly([
    pt(0, 1, D2),
    pt(1, 1, D2),
    pt(1, 1, D2 + flangeThickness),
    pt(0, 1, D2 + flangeThickness),
  ]);

  // ---- WEB (only the near end + a small sliver are visible) ----
  const webFrontPoly = poly([
    pt(0, webBStart, flangeThickness),
    pt(0, webBEnd, flangeThickness),
    pt(0, webBEnd, D2),
    pt(0, webBStart, D2),
  ]);
  const webRightPoly = poly([
    pt(0, webBEnd, flangeThickness),
    pt(webAVisible, webBEnd, flangeThickness),
    pt(webAVisible, webBEnd, D2),
    pt(0, webBEnd, D2),
  ]);

  // ---- dimension callout endpoints ----
  const p000 = pt(0, 0, 0);
  const p010 = pt(0, 1, 0);
  const d1a = { x: p000.x - 10, y: p000.y - 70 };
  const d1b = { x: p010.x - 10, y: p010.y - 70 };

  const d2a = { x: pt(0, 0, 0).x - 55, y: pt(0, 0, 0).y };
  const d2b = {
    x: pt(0, 0, flangeThickness).x - 55,
    y: pt(0, 0, flangeThickness).y,
  };

  const d3a = {
    x: pt(1, 0, flangeThickness).x + 30,
    y: pt(1, 0, flangeThickness).y,
  };
  const d3b = { x: pt(1, 0, D2).x + 30, y: pt(1, 0, D2).y };

  const wA = pt(0, webBStart, flangeThickness);
  const wB = pt(0, webBEnd, flangeThickness);
  const d4a = { x: wA.x - 45, y: wA.y + 90 };
  const d4b = { x: wB.x - 45, y: wB.y + 90 };

  const d5a = {
    x: pt(0, 0, D2 + flangeThickness).x,
    y: pt(0, 0, D2 + flangeThickness).y + 25,
  };
  const d5b = {
    x: pt(1, 0, D2 + flangeThickness).x,
    y: pt(1, 0, D2 + flangeThickness).y + 25,
  };

  const mid = (p, q) => ({ x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 });

  return (
    <svg
      viewBox="0 0 640 640"
      className="w-full h-auto"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="beamShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="3" dy="6" stdDeviation="8" floodOpacity="0.15" />
        </filter>
        <marker
          id="dimArrow"
          markerWidth="8"
          markerHeight="8"
          refX="4"
          refY="4"
          orient="auto"
        >
          <path d="M0 0 L8 4 L0 8 Z" fill={dimLine} />
        </marker>
      </defs>

      <g filter="url(#beamShadow)" strokeLinejoin="round">
        {/* BOTTOM FLANGE (drawn first, sits behind) */}
        <polygon
          points={bfFront}
          fill={frontFace}
          stroke={seam}
          strokeWidth="2"
        />
        <polygon
          points={bfRight}
          fill={rightFace}
          stroke={seam}
          strokeWidth="2"
        />
        <polygon points={bfTop} fill={topFace} stroke={seam} strokeWidth="2" />

        {/* WEB */}
        <polygon
          points={webFrontPoly}
          fill={webFrontFace}
          stroke={seam}
          strokeWidth="1.5"
        />
        <polygon
          points={webRightPoly}
          fill={webRightFace}
          stroke={seam}
          strokeWidth="1.5"
        />

        {/* TOP FLANGE (drawn last, sits in front) */}
        <polygon
          points={tfFront}
          fill={frontFace}
          stroke={seam}
          strokeWidth="2"
        />
        <polygon
          points={tfRight}
          fill={rightFace}
          stroke={seam}
          strokeWidth="2"
        />
        <polygon points={tfTop} fill={topFace} stroke={seam} strokeWidth="2" />
      </g>

      {/* ===================== DIMENSION CALLOUTS ===================== */}

      {/* 1 - FLANGE WIDTH */}
      <line
        x1={d1a.x}
        y1={d1a.y}
        x2={d1b.x}
        y2={d1b.y}
        stroke={dimLine}
        strokeWidth="2"
        markerStart="url(#dimArrow)"
        markerEnd="url(#dimArrow)"
      />
      {circle(mid(d1a, d1b).x, mid(d1a, d1b).y, 1)}

      {/* 2 - FLANGE THICKNESS */}
      <line
        x1={d2a.x}
        y1={d2a.y}
        x2={d2b.x}
        y2={d2b.y}
        stroke={dimLine}
        strokeWidth="2"
        markerStart="url(#dimArrow)"
        markerEnd="url(#dimArrow)"
      />
      {circle(mid(d2a, d2b).x - 18, mid(d2a, d2b).y, 2)}

      {/* 3 - WEB WIDTH (clear depth between flanges) */}
      <line
        x1={d3a.x}
        y1={d3a.y}
        x2={d3b.x}
        y2={d3b.y}
        stroke={dimLine}
        strokeWidth="2"
        markerStart="url(#dimArrow)"
        markerEnd="url(#dimArrow)"
      />
      {circle(mid(d3a, d3b).x + 22, mid(d3a, d3b).y, 3)}

      {/* 4 - WEB THICKNESS */}
      <line
        x1={d4a.x}
        y1={d4a.y}
        x2={d4b.x}
        y2={d4b.y}
        stroke={dimLine}
        strokeWidth="2"
        markerStart="url(#dimArrow)"
        markerEnd="url(#dimArrow)"
      />
      {circle(mid(d4a, d4b).x, mid(d4a, d4b).y + 20, 4)}

      {/* 5 - LENGTH */}
      <line
        x1={d5a.x}
        y1={d5a.y}
        x2={d5b.x}
        y2={d5b.y}
        stroke={dimLine}
        strokeWidth="2"
        markerStart="url(#dimArrow)"
        markerEnd="url(#dimArrow)"
      />
      {circle(mid(d5a, d5b).x, mid(d5a, d5b).y + 22, 5)}

      {/* ===================== LEGEND ===================== */}
      <g fontSize="15" fontWeight="bold" fill="#000000" fontFamily="sans-serif">
        <text x="20" y="555">
          1 — Flange Width
        </text>
        <text x="20" y="578">
          2 — Flange Thickness
        </text>
        <text x="20" y="601">
          3 — Web Width
        </text>
        <text x="20" y="624">
          4 — Web Thickness
        </text>
        <text x="330" y="555">
          5 — Length
        </text>
      </g>
    </svg>
  );
}
