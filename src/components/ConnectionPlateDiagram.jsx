export default function ConnectionPlateDiagram() {
  const dark = "#334155";
  const plate = "#cbd5e1";
  const hole = "#94a3b8";
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
    <svg viewBox="0 0 260 230" className="w-full max-w-[320px] h-auto">
      <defs>
        <marker
          id="plateArrow"
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
          CONNECTION PLATE
      ========================= */}

      <rect
        x="55"
        y="50"
        width="120"
        height="115"
        rx="1"
        fill={plate}
        stroke={dark}
        strokeWidth="2"
      />

      {/* =========================
          BOLT HOLES
      ========================= */}

      <circle
        cx="82"
        cy="75"
        r="7"
        fill={hole}
        stroke={dark}
        strokeWidth="1.5"
      />

      <circle
        cx="148"
        cy="75"
        r="7"
        fill={hole}
        stroke={dark}
        strokeWidth="1.5"
      />

      <circle
        cx="82"
        cy="140"
        r="7"
        fill={hole}
        stroke={dark}
        strokeWidth="1.5"
      />

      <circle
        cx="148"
        cy="140"
        r="7"
        fill={hole}
        stroke={dark}
        strokeWidth="1.5"
      />

      {/* =========================
          B - PLATE WIDTH
      ========================= */}

      <line
        x1="55"
        y1="32"
        x2="175"
        y2="32"
        stroke={dark}
        strokeWidth="1.5"
        markerStart="url(#plateArrow)"
        markerEnd="url(#plateArrow)"
      />

      {circle(115, 32, 1)}

      <text
        x="115"
        y="20"
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        fill={orange}
      >
        B
      </text>

      {/* =========================
          L - PLATE LENGTH
      ========================= */}

      <line
        x1="195"
        y1="50"
        x2="195"
        y2="165"
        stroke={dark}
        strokeWidth="1.5"
        markerStart="url(#plateArrow)"
        markerEnd="url(#plateArrow)"
      />

      {circle(195, 108, 2)}

      <text x="210" y="112" fontSize="12" fontWeight="bold" fill={orange}>
        L
      </text>

      {/* =========================
          T - THICKNESS
      ========================= */}

      {/* side profile */}
      <rect
        x="75"
        y="190"
        width="70"
        height="8"
        fill="#94a3b8"
        stroke={dark}
        strokeWidth="1.5"
      />

      <line x1="75" y1="180" x2="75" y2="205" stroke={dark} />

      <line x1="145" y1="180" x2="145" y2="205" stroke={dark} />

      {circle(110, 214, 3)}

      <text
        x="110"
        y="229"
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        fill={orange}
      >
        T
      </text>

      {/* =========================
          QTY
      ========================= */}

      {circle(40, 45, 4)}

      <text x="20" y="30" fontSize="11" fontWeight="bold" fill={dark}>
        QTY
      </text>

      {/* =========================
          TITLE
      ========================= */}

      <text
        x="115"
        y="175"
        textAnchor="middle"
        fontSize="10"
        fontWeight="bold"
        fill={dark}
      >
        CONNECTION PLATE
      </text>
    </svg>
  );
}
