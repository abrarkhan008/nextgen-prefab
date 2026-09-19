// Letters match the input labels, like the Square Tube calculator:
//   A = Side (A)   B = Side (B)   T = Thickness   D = Outer diameter (round pipe)
function Badge({ x, y, t }) {
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r="6.5"
        fill="white"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <text
        x={x}
        y={y + 3.6}
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        fill="currentColor"
      >
        {t}
      </text>
    </g>
  );
}

export default function TubeDiagram({ round = false }) {
  return (
    <svg
      viewBox="0 0 120 112"
      className="w-full text-steel-600"
      role="img"
      aria-label={
        round ? "Round pipe cross-section" : "Square tube cross-section"
      }
    >
      {round ? (
        <>
          <path
            fillRule="evenodd"
            fill="currentColor"
            fillOpacity="0.25"
            stroke="currentColor"
            strokeWidth="1.4"
            d="M20 46a32 32 0 1 0 64 0a32 32 0 1 0 -64 0Z M29 46a23 23 0 1 0 46 0a23 23 0 1 0 -46 0Z"
          />
          <line
            x1="20"
            y1="94"
            x2="84"
            y2="94"
            stroke="currentColor"
            strokeWidth="1"
          />
          <line
            x1="20"
            y1="90"
            x2="20"
            y2="98"
            stroke="currentColor"
            strokeWidth="1"
          />
          <line
            x1="84"
            y1="90"
            x2="84"
            y2="98"
            stroke="currentColor"
            strokeWidth="1"
          />
          <Badge x={52} y={104} t="D" />
          <Badge x={102} y={46} t="T" />
          <line
            x1="84"
            y1="46"
            x2="96"
            y2="46"
            stroke="currentColor"
            strokeWidth="1"
          />
        </>
      ) : (
        <>
          <path
            fillRule="evenodd"
            fill="currentColor"
            fillOpacity="0.25"
            stroke="currentColor"
            strokeWidth="1.4"
            d="M18 12h64v64h-64z M27 21h46v46h-46z"
          />
          {/* A (width) */}
          <line
            x1="18"
            y1="88"
            x2="82"
            y2="88"
            stroke="currentColor"
            strokeWidth="1"
          />
          <line
            x1="18"
            y1="84"
            x2="18"
            y2="92"
            stroke="currentColor"
            strokeWidth="1"
          />
          <line
            x1="82"
            y1="84"
            x2="82"
            y2="92"
            stroke="currentColor"
            strokeWidth="1"
          />
          <Badge x={50} y={101} t="A" />
          {/* B (height) */}
          <line
            x1="92"
            y1="12"
            x2="92"
            y2="76"
            stroke="currentColor"
            strokeWidth="1"
          />
          <line
            x1="88"
            y1="12"
            x2="96"
            y2="12"
            stroke="currentColor"
            strokeWidth="1"
          />
          <line
            x1="88"
            y1="76"
            x2="96"
            y2="76"
            stroke="currentColor"
            strokeWidth="1"
          />
          <Badge x={106} y={44} t="B" />
          {/* T (wall) */}
          <Badge x={9} y={44} t="T" />
          <line
            x1="14"
            y1="44"
            x2="18"
            y2="44"
            stroke="currentColor"
            strokeWidth="1"
          />
        </>
      )}
    </svg>
  );
}
