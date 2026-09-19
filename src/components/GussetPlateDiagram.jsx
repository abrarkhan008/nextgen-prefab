// Numbers on the diagram match the numbered input labels:
//   1 = Base (mm)   2 = Height (mm)   3 = Thickness (mm)
function Badge({ x, y, n }) {
  return (
    <g>
      <circle cx={x} cy={y} r="6.5" fill="white" stroke="currentColor" strokeWidth="1.2" />
      <text
        x={x}
        y={y + 3.6}
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        fill="currentColor"
      >
        {n}
      </text>
    </g>
  );
}

export default function GussetPlateDiagram({ shape = "Triangle" }) {
  return (
    <svg
      viewBox="0 0 120 112"
      className="w-full text-steel-600"
      role="img"
      aria-label={`${shape} gusset plate with base, height and thickness`}
    >
      {shape === "Rectangle" ? (
        <rect
          x="26"
          y="12"
          width="68"
          height="68"
          fill="currentColor"
          fillOpacity="0.12"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      ) : (
        <polygon
          points="26,12 26,80 94,80"
          fill="currentColor"
          fillOpacity="0.12"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      )}

      {/* bolt holes */}
      <circle cx="36" cy="26" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="36" cy="68" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="82" cy="68" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.2" />

      {/* 1 - base dimension */}
      <line x1="26" y1="91" x2="94" y2="91" stroke="currentColor" strokeWidth="1" />
      <line x1="26" y1="87" x2="26" y2="95" stroke="currentColor" strokeWidth="1" />
      <line x1="94" y1="87" x2="94" y2="95" stroke="currentColor" strokeWidth="1" />
      <Badge x={60} y={102} n={1} />

      {/* 2 - height dimension */}
      <line x1="14" y1="12" x2="14" y2="80" stroke="currentColor" strokeWidth="1" />
      <line x1="10" y1="12" x2="18" y2="12" stroke="currentColor" strokeWidth="1" />
      <line x1="10" y1="80" x2="18" y2="80" stroke="currentColor" strokeWidth="1" />
      <Badge x={8} y={46} n={2} />

      {/* 3 - thickness (side view of the plate edge) */}
      <rect
        x="104"
        y="38"
        width="6"
        height="34"
        fill="currentColor"
        fillOpacity="0.25"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <Badge x={107} y={28} n={3} />
    </svg>
  );
}