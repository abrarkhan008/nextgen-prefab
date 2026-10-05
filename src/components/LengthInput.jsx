import { useEffect, useState } from "react";

export default function LengthInput({ label, value, onChange }) {
  const [unit, setUnit] = useState("m");
  const [text, setText] = useState(value ?? "");

  // keep in sync when unit is metres
  useEffect(() => {
    if (unit === "m") setText(value ?? "");
  }, [value, unit]);

  const handle = (t) => {
    setText(t);
    const n = parseFloat(t);
    if (isNaN(n)) return onChange("");
    onChange(unit === "mm" ? String(n / 1000) : t);
  };

  const switchUnit = (u) => {
    setUnit(u);
    const n = parseFloat(value);
    if (u === "mm")
      setText(isNaN(n) ? "" : String(Math.round(n * 1000 * 1000) / 1000));
    else setText(value ?? "");
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="field-label">{label}</label>
        <div className="flex gap-1">
          {["m", "mm"].map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => switchUnit(u)}
              className={`rounded px-2 py-0.5 text-xs font-bold ${
                unit === u
                  ? "bg-steel-800 text-white"
                  : "bg-steel-100 text-steel-600"
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>
      <input
        type="number"
        className="field-input"
        value={text}
        onChange={(e) => handle(e.target.value)}
      />
      {unit === "mm" && value !== "" && (
        <p className="mt-0.5 text-xs text-steel-500">= {value} m</p>
      )}
    </div>
  );
}
