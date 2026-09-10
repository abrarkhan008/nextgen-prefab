export default function StripDiagram() {
  return (
    <svg viewBox="0 0 140 100" className="h-24 w-32">
      <rect
        x="20"
        y="40"
        width="100"
        height="20"
        fill="#e2e8f0"
        stroke="#334155"
      />
      {/* 1: thickness */}
      <line x1="10" y1="40" x2="10" y2="60" stroke="#334155" />
      <circle cx="10" cy="50" r="7" fill="#1e293b" />
      <text
        x="10"
        y="53"
        textAnchor="middle"
        fontSize="9"
        fontWeight="bold"
        fill="#fff"
      >
        1
      </text>
    </svg>
  );
}
