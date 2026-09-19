import { fmtKg } from "../../utils/decking";

export function NumField({ label, value, onChange, placeholder, step }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <input
        type="number"
        inputMode="decimal"
        step={step}
        className="field-input"
        placeholder={placeholder}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

// Label box + Remove button, the same header every row card uses
export function RowHeader({ value, placeholder, onChange, onRemove }) {
  return (
    <div className="flex items-center gap-2">
      <input
        className="field-input flex-1"
        placeholder={placeholder}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        className="text-xs font-bold text-red-500"
        onClick={onRemove}
      >
        Remove
      </button>
    </div>
  );
}

export function InfoBar({ children }) {
  return (
    <div className="rounded-lg bg-steel-50 px-3 py-2 text-xs font-semibold text-steel-600">
      {children}
    </div>
  );
}

// Weight break-up shown at the bottom of every pillar / beam card
export function MemberTotals({ breakdown }) {
  const b = breakdown;
  return (
    <div className="space-y-0.5 rounded-lg bg-steel-50 px-3 py-2 text-xs font-semibold text-steel-600">
      <div>Main member: {fmtKg(b.main)} KG</div>
      {b.plates > 0 && <div>Connection plates: {fmtKg(b.plates)} KG</div>}
      {b.gussets > 0 && <div>Gusset plates: {fmtKg(b.gussets)} KG</div>}
      <div className="font-bold text-steel-800">
        Total Weight: {fmtKg(b.total)} KG
      </div>
    </div>
  );
}