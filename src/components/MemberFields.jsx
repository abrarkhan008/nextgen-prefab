export default function MemberFields({ label, value, onChange }) {
  const set = (patch) => onChange({ ...value, ...patch });
  return (
    <div className="rounded-xl border border-steel-100 bg-steel-50/60 p-3">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-steel-600">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        <Box label="Flange Width (mm)" value={value.flangeWidth} onChange={(v) => set({ flangeWidth: v })} />
        <Box label="Flange Thick (mm)" value={value.flangeThick} onChange={(v) => set({ flangeThick: v })} />
        <Box label="Web Width (mm)" value={value.webWidth} onChange={(v) => set({ webWidth: v })} />
        <Box label="Web Thick (mm)" value={value.webThick} onChange={(v) => set({ webThick: v })} />
        <Box label="Length (m)" value={value.length} onChange={(v) => set({ length: v })} />
        <Box label="Qty" value={value.qty} onChange={(v) => set({ qty: v })} />
      </div>
    </div>
  );
}

function Box({ label, value, onChange }) {
  return (
    <div>
      <label className="mb-0.5 block text-[10px] font-semibold text-steel-500">{label}</label>
      <input
        type="number"
        inputMode="decimal"
        className="field-input py-1.5 text-sm"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
