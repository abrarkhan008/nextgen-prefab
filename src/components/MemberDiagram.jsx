export default function MemberDiagram() {
  const dark = "#334155";
  const steel = "#cbd5e1";
  const lightSteel = "#e2e8f0";
  const orange = "#f97316";

  const circle = (cx, cy, n) => (
    <>
      <circle cx={cx} cy={cy} r="8" fill="#1e293b" />
      <text
        x={cx}
        y={cy + 3}
        textAnchor="middle"
        fontSize="9"
        fontWeight="bold"
        fill="#fff"
      >
        {n}
      </text>
    </>
  );

  return (
    <svg
      viewBox="0 0 300 230"
      className="w-full max-w-[360px] h-auto"
    >
      <defs>
        <marker
          id="memberArrow"
          markerWidth="7"
          markerHeight="7"
          refX="3.5"
          refY="3.5"
          orient="auto"
        >
          <path d="M0,0 L7,3.5 L0,7 Z" fill={dark} />
        </marker>
      </defs>

      {/* =========================
          3D I-BEAM
      ========================= */}

      {/* TOP FLANGE - top face */}
      <polygon
        points="55,55 115,25 260,45 200,75"
        fill={steel}
        stroke={dark}
        strokeWidth="1.5"
      />

      {/* TOP FLANGE - front/side thickness */}
      <polygon
        points="55,55 200,75 200,87 55,67"
        fill="#b8c4d1"
        stroke={dark}
        strokeWidth="1.5"
      />

      {/* WEB - front face */}
      <polygon
        points="115,67 140,70 140,155 115,152"
        fill={lightSteel}
        stroke={dark}
        strokeWidth="1.5"
      />

      {/* WEB - side depth */}
      <polygon
        points="140,70 200,87 200,155 140,155"
        fill="#cbd5e1"
        stroke={dark}
        strokeWidth="1.5"
      />

      {/* BOTTOM FLANGE - top face */}
      <polygon
        points="55,152 115,125 260,145 200,175"
        fill={steel}
        stroke={dark}
        strokeWidth="1.5"
      />

      {/* BOTTOM FLANGE - front/side thickness */}
      <polygon
        points="55,152 200,175 200,187 55,164"
        fill="#b8c4d1"
        stroke={dark}
        strokeWidth="1.5"
      />

      {/* =========================
          B - FLANGE WIDTH
      ========================= */}

      <line
        x1="55"
        y1="43"
        x2="115"
        y2="17"
        stroke={dark}
        strokeWidth="1.5"
        markerStart="url(#memberArrow)"
        markerEnd="url(#memberArrow)"
      />

      {circle(83, 30, 1)}

      <text
        x="82"
        y="10"
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        fill={orange}
      >
        B
      </text>

      {/* =========================
          H - OVERALL HEIGHT
      ========================= */}

      <line
        x1="220"
        y1="48"
        x2="220"
        y2="177"
        stroke={dark}
        strokeWidth="1.5"
        markerStart="url(#memberArrow)"
        markerEnd="url(#memberArrow)"
      />

      {circle(220, 112, 2)}

      <text
        x="235"
        y="116"
        fontSize="12"
        fontWeight="bold"
        fill={orange}
      >
        H
      </text>

      {/* =========================
          L - MEMBER LENGTH
      ========================= */}

      <line
        x1="55"
        y1="205"
        x2="260"
        y2="177"
        stroke={dark}
        strokeWidth="1.5"
        markerStart="url(#memberArrow)"
        markerEnd="url(#memberArrow)"
      />

      {circle(158, 191, 3)}

      <text
        x="158"
        y="218"
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        fill={orange}
      >
        L
      </text>

      {/* =========================
          T - FLANGE THICKNESS
      ========================= */}

      <line
        x1="42"
        y1="54"
        x2="42"
        y2="68"
        stroke={dark}
        strokeWidth="1.5"
        markerStart="url(#memberArrow)"
        markerEnd="url(#memberArrow)"
      />

      {circle(32, 61, 4)}

      <text
        x="25"
        y="82"
        fontSize="12"
        fontWeight="bold"
        fill={orange}
      >
        T
      </text>

      {/* =========================
          LABELS
      ========================= */}

      <text
        x="125"
        y="100"
        fontSize="11"
        fontWeight="bold"
        fill={dark}
      >
        WEB
      </text>

      <text
        x="90"
        y="195"
        fontSize="10"
        fill={dark}
      >
        I-BEAM / MEMBER
      </text>
    </svg>
  );
}