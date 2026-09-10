export default function MemberDiagram() {
  const numStyle = {
    fill: "#1e293b",
  };
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
      {/* top flange */}
      <rect
        x="20"
        y="20"
        width="100"
        height="10"
        fill="#cbd5e1"
        stroke="#334155"
      />
      {/* web */}
      <rect
        x="60"
        y="30"
        width="20"
        height="90"
        fill="#e2e8f0"
        stroke="#334155"
      />
      {/* bottom flange */}
      <rect
        x="20"
        y="120"
        width="100"
        height="10"
        fill="#cbd5e1"
        stroke="#334155"
      />

      {/* 1: flange width (top arrow) */}
      <line
        x1="20"
        y1="12"
        x2="120"
        y2="12"
        stroke="#334155"
        markerStart="url(#arrow)"
        markerEnd="url(#arrow)"
      />
      {circle(70, 12)}
      {num(70, 12, 1)}

      {/* 2: flange thickness */}
      <line x1="10" y1="20" x2="10" y2="30" stroke="#334155" />
      {circle(10, 25)}
      {num(10, 25, 2)}

      {/* 3: web width (vertical height of web) */}
      <line x1="130" y1="30" x2="130" y2="120" stroke="#334155" />
      {circle(130, 75)}
      {num(130, 75, 3)}

      {/* 4: web thickness */}
      <line x1="60" y1="140" x2="80" y2="140" stroke="#334155" />
      {circle(70, 140)}
      {num(70, 140, 4)}

      {/* 5: length (whole member) */}
      <line x1="10" y1="150" x2="130" y2="150" stroke="#334155" />
      {circle(70, 155)}
      {num(70, 155, 5)}

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
