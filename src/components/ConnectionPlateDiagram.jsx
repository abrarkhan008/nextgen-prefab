export default function FlatBarDiagram() {
  const dark = "#5b6168";
  const topSteel = "#d9dadd";
  const frontSteel = "#b8bcc0";
  const sideSteel = "#aeb3b8";
  const orange = "#f97316";

  const circle = (cx, cy, n) => (
    <g>
      <circle cx={cx} cy={cy} r="10" fill="#1e293b" />
      <text
        x={cx}
        y={cy + 4}
        textAnchor="middle"
        fontSize="10"
        fontWeight="bold"
        fill="white"
      >
        {n}
      </text>
    </g>
  );

  return (
    <svg
      viewBox="0 0 600 320"
      className="w-full h-auto"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="barShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="3" stdDeviation="3" floodOpacity="0.12" />
        </filter>

        <marker
          id="barArrow"
          markerWidth="8"
          markerHeight="8"
          refX="4"
          refY="4"
          orient="auto"
        >
          <path d="M0 0 L8 4 L0 8 Z" fill={dark} />
        </marker>
      </defs>

      {/* =====================================================
          FLAT BAR
      ===================================================== */}

      <g filter="url(#barShadow)">
        {/* TOP FACE */}
        <polygon
          points="
            110,150
            285,60
            480,150
            305,240
          "
          fill={topSteel}
          stroke={dark}
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* FRONT FACE */}
        <polygon
          points="
            110,150
            305,240
            305,268
            110,178
          "
          fill={frontSteel}
          stroke={dark}
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* RIGHT FACE */}
        <polygon
          points="
            305,240
            480,150
            480,178
            305,268
          "
          fill={sideSteel}
          stroke={dark}
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </g>

      {/* =====================================================
          DIMENSION 1 - B
          BAR WIDTH
      ===================================================== */}

      <line
        x1="110"
        y1="120"
        x2="285"
        y2="30"
        stroke={dark}
        strokeWidth="2"
        markerStart="url(#barArrow)"
        markerEnd="url(#barArrow)"
      />

      {circle(197, 77, 1)}

      <text
        x="197"
        y="55"
        textAnchor="middle"
        fontSize="16"
        fontWeight="bold"
        fill={orange}
      >
        B
      </text>

      {/* =====================================================
          DIMENSION 2 - T
          BAR THICKNESS
      ===================================================== */}

      <line
        x1="75"
        y1="150"
        x2="75"
        y2="178"
        stroke={dark}
        strokeWidth="2"
        markerStart="url(#barArrow)"
        markerEnd="url(#barArrow)"
      />

      {circle(58, 164, 2)}

      <text
        x="58"
        y="196"
        textAnchor="middle"
        fontSize="16"
        fontWeight="bold"
        fill={orange}
      >
        T
      </text>

      {/* =====================================================
          DIMENSION 3 - L
          BAR LENGTH
      ===================================================== */}

      <line
        x1="305"
        y1="290"
        x2="480"
        y2="200"
        stroke={dark}
        strokeWidth="2"
        markerStart="url(#barArrow)"
        markerEnd="url(#barArrow)"
      />

      {circle(392, 245, 3)}

      <text
        x="392"
        y="272"
        textAnchor="middle"
        fontSize="16"
        fontWeight="bold"
        fill={orange}
      >
        L
      </text>

      {/* =====================================================
          MEMBER NAME
      ===================================================== */}

      <text x="300" y="300" textAnchor="middle" fontSize="13" fill={dark}>
        FLAT BAR
      </text>
    </svg>
  );
}
