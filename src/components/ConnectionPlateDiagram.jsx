export default function ConnectionPlateDiagram() {
  const circle = (cx, cy) => <circle cx={cx} cy={cy} r="7" fill="#1e293b" />;
  const num = (cx, cy, n) => (
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
  );

  return (
    <svg viewBox="0 0 140 170" className="h-40 w-32">
      {/* Plate - flat top view */}
      <rect
        x="25"
        y="30"
        width="70"
        height="90"
        fill="#e2e8f0"
        stroke="#334155"
        strokeWidth="2"
      />

      {/* Bolt holes on plate (purely decorative) */}
      <circle cx="38" cy="43" r="3" fill="#94a3b8" stroke="#334155" />
      <circle cx="82" cy="43" r="3" fill="#94a3b8" stroke="#334155" />
      <circle cx="38" cy="107" r="3" fill="#94a3b8" stroke="#334155" />
      <circle cx="82" cy="107" r="3" fill="#94a3b8" stroke="#334155" />

      {/* 1: Width (top arrow, horizontal) */}
      <line
        x1="25"
        y1="18"
        x2="95"
        y2="18"
        stroke="#334155"
        markerStart="url(#arrow)"
        markerEnd="url(#arrow)"
      />
      {circle(60, 18)}
      {num(60, 18, 1)}

      {/* 2: Length (right side arrow, vertical) */}
      <line
        x1="108"
        y1="30"
        x2="108"
        y2="120"
        stroke="#334155"
        markerStart="url(#arrow)"
        markerEnd="url(#arrow)"
      />
      {circle(108, 75)}
      {num(108, 75, 2)}

      {/* 3: Thickness - small side-profile plate below */}
      <rect
        x="45"
        y="140"
        width="35"
        height="6"
        fill="#94a3b8"
        stroke="#334155"
      />
      <line
        x1="45"
        y1="132"
        x2="45"
        y2="150"
        stroke="#334155"
        strokeWidth="1"
      />
      <line
        x1="80"
        y1="132"
        x2="80"
        y2="150"
        stroke="#334155"
        strokeWidth="1"
      />
      {circle(62, 155)}
      {num(62, 155, 3)}

      {/* 4: Qty label */}
      <circle cx="20" cy="20" r="7" fill="#1e293b" />
      {num(20, 20, 4)}

      <defs>
        <marker
          id="arrow"
          markerWidth="6"
          markerHeight="6"
          refX="3"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L6,3 L0,6 Z" fill="#334155" />
        </marker>
      </defs>
    </svg>
  );
}
