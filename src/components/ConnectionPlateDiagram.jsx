export default function FoundationBoltDiagram() {
  return (
    <svg
      viewBox="0 0 100 180"
      className="h-44 w-24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Concrete pedestal */}
      <rect
        x="25"
        y="105"
        width="50"
        height="55"
        fill="#e2e8f0"
        stroke="#334155"
        strokeWidth="2"
      />

      {/* Base plate */}
      <rect
        x="15"
        y="95"
        width="70"
        height="10"
        fill="#64748b"
        stroke="#1e293b"
        strokeWidth="2"
      />

      {/* Anchor bolts */}
      <line x1="30" y1="55" x2="30" y2="145" stroke="#334155" strokeWidth="5" />

      <line x1="70" y1="55" x2="70" y2="145" stroke="#334155" strokeWidth="5" />

      {/* Nuts */}
      <rect x="24" y="82" width="12" height="8" fill="#1e293b" />

      <rect x="64" y="82" width="12" height="8" fill="#1e293b" />

      {/* Number 1 - Pedestals */}
      <circle cx="12" cy="130" r="8" fill="#1e293b" />
      <text
        x="12"
        y="134"
        textAnchor="middle"
        fontSize="10"
        fontWeight="bold"
        fill="#fff"
      >
        1
      </text>

      {/* Number 2 - Bolts / Pedestal */}
      <circle cx="88" cy="65" r="8" fill="#1e293b" />
      <text
        x="88"
        y="69"
        textAnchor="middle"
        fontSize="10"
        fontWeight="bold"
        fill="#fff"
      >
        2
      </text>

      {/* Number 3 - Weight / Bolt */}
      <circle cx="88" cy="145" r="8" fill="#1e293b" />
      <text
        x="88"
        y="149"
        textAnchor="middle"
        fontSize="10"
        fontWeight="bold"
        fill="#fff"
      >
        3
      </text>
    </svg>
  );
}
