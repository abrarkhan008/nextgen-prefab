export default function BracingDiagram({ type }) {
  const isPipe = type === "Pipe Bracing";
  return (
    <svg viewBox="0 0 140 100" className="h-24 w-32">
      {/* diagonal brace */}
      <line
        x1="15"
        y1="85"
        x2="125"
        y2="15"
        stroke="#334155"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* 1: size / diameter / OD */}
      <circle cx="70" cy="50" r="7" fill="#1e293b" />
      <text
        x="70"
        y="53"
        textAnchor="middle"
        fontSize="9"
        fontWeight="bold"
        fill="#fff"
      >
        1
      </text>

      {isPipe && (
        <>
          {/* 2: thickness, only for pipe */}
          <circle cx="95" cy="30" r="7" fill="#1e293b" />
          <text
            x="95"
            y="33"
            textAnchor="middle"
            fontSize="9"
            fontWeight="bold"
            fill="#fff"
          >
            2
          </text>
        </>
      )}
    </svg>
  );
}
