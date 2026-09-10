export default function BoltDiagram() {
  return (
    <svg viewBox="0 0 140 100" className="h-24 w-32">
      {/* bolt head */}
      <rect
        x="55"
        y="10"
        width="30"
        height="10"
        fill="#cbd5e1"
        stroke="#334155"
      />
      {/* bolt shaft */}
      <rect
        x="65"
        y="20"
        width="10"
        height="60"
        fill="#e2e8f0"
        stroke="#334155"
      />

      {/* 1: diameter (d) */}
      <line x1="65" y1="90" x2="75" y2="90" stroke="#334155" />
      <circle cx="70" cy="90" r="7" fill="#1e293b" />
      <text
        x="70"
        y="93"
        textAnchor="middle"
        fontSize="9"
        fontWeight="bold"
        fill="#fff"
      >
        1
      </text>

      {/* 2: length (l) */}
      <line x1="90" y1="20" x2="90" y2="80" stroke="#334155" />
      <circle cx="90" cy="50" r="7" fill="#1e293b" />
      <text
        x="90"
        y="53"
        textAnchor="middle"
        fontSize="9"
        fontWeight="bold"
        fill="#fff"
      >
        2
      </text>
    </svg>
  );
}
