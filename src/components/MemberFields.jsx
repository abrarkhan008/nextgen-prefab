import MemberDiagram from "./MemberDiagram";

export default function MemberFields({ label, value, onChange }) {
  const set = (patch) => onChange({ ...value, ...patch });

  const fields = [
    { key: "flangeWidth", num: 1, label: "Flange Width (mm)" },
    { key: "flangeThick", num: 2, label: "Flange Thick (mm)" },
    { key: "webWidth", num: 3, label: "Web Width (mm)" },
    { key: "webThick", num: 4, label: "Web Thick (mm)" },
    { key: "length", num: 5, label: "Length (m)" },
    { key: "qty", num: 6, label: "Qty" },
  ];

  return (
    <div className="rounded-xl border border-steel-100 bg-steel-50/60 p-3">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-steel-600">
        {label}
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex-1 space-y-2">
          {fields.map((f) => (
            <div key={f.key} className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-steel-700 text-[10px] font-bold text-white">
                {f.num}
              </span>
              <div className="flex-1">
                <label className="mb-0.5 block text-[10px] font-semibold text-steel-500">
                  {f.label}
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  className="field-input py-1.5 text-sm"
                  value={value[f.key] ?? ""}
                  onChange={(e) => set({ [f.key]: e.target.value })}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex w-full items-center justify-center sm:w-32">
          <MemberDiagram />
        </div>
      </div>
    </div>
  );
}
