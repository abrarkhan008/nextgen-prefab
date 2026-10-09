import { NumField } from "./DeckingFields";
import {
  GUSSET_SHAPES,
  emptyGussetPlate,
  emptyMiscPlate,
  gussetPlateWeight,
  miscPlateWeight,
  autoPlates,
  emptyAuto,
  AUTO_EXTRA,
  fmtKg,
} from "../../utils/decking";

const ops = (row, onChange, key, factory) => ({
  items: row[key] || [],
  onAdd: () => onChange({ ...row, [key]: [...(row[key] || []), factory()] }),
  onUpdate: (i, patch) =>
    onChange({
      ...row,
      [key]: (row[key] || []).map((x, idx) =>
        idx === i ? { ...x, ...patch } : x,
      ),
    }),
  onRemove: (i) =>
    onChange({ ...row, [key]: (row[key] || []).filter((_, idx) => idx !== i) }),
});

function ListBlock({ title, addLabel, o, weightOf, children }) {
  return (
    <div className="space-y-1.5">
      <p className="pt-1 text-xs font-bold text-steel-600">{title}</p>
      {o.items.map((it, i) => (
        <div
          key={it.id || i}
          className="space-y-1.5 border-t border-steel-200 pt-1.5"
        >
          {children(it, (patch) => o.onUpdate(i, patch))}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-steel-600">
              Weight: {fmtKg(weightOf(it))} KG
            </span>
            <button
              type="button"
              className="text-xs font-bold text-red-500"
              onClick={() => o.onRemove(i)}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        className="btn-secondary w-full py-1.5 text-xs"
        onClick={o.onAdd}
      >
        + {addLabel}
      </button>
    </div>
  );
}

export function GussetEditor({ row, onChange }) {
  return (
    <ListBlock
      title="Gusset Plates (optional)"
      addLabel="Add Gusset Plate"
      o={ops(row, onChange, "gussets", emptyGussetPlate)}
      weightOf={gussetPlateWeight}
    >
      {(g, set) => (
        <>
          <div>
            <label className="field-label">Shape</label>
            <select
              className="field-input"
              value={g.shape}
              onChange={(e) => set({ shape: e.target.value })}
            >
              {GUSSET_SHAPES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <NumField
              label="Base (mm)"
              value={g.base}
              onChange={(v) => set({ base: v })}
            />
            <NumField
              label="Height (mm)"
              value={g.height}
              onChange={(v) => set({ height: v })}
            />
            <NumField
              label="Thickness (mm)"
              value={g.thickness}
              onChange={(v) => set({ thickness: v })}
            />
            <NumField
              label="Qty"
              value={g.qty}
              onChange={(v) => set({ qty: v })}
            />
          </div>
          <NumField
            label="Density"
            step="0.00001"
            value={g.density}
            onChange={(v) => set({ density: v })}
          />
        </>
      )}
    </ListBlock>
  );
}

function MiscFields({ p, set }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <NumField
          label="Length (mm)"
          value={p.length}
          onChange={(v) => set({ length: v })}
        />
        <NumField
          label="Width (mm)"
          value={p.width}
          onChange={(v) => set({ width: v })}
        />
        <NumField
          label="Thickness (mm)"
          value={p.thickness}
          onChange={(v) => set({ thickness: v })}
        />
        <NumField label="Qty" value={p.qty} onChange={(v) => set({ qty: v })} />
      </div>
      <NumField
        label="Density"
        step="0.00001"
        value={p.density}
        onChange={(v) => set({ density: v })}
      />
    </>
  );
}

function AutoBlock({ row, onChange }) {
  const au = row.auto;
  const ap = autoPlates(row);
  const setAuto = (patch) => onChange({ ...row, auto: { ...au, ...patch } });

  if (!au) {
    return (
      <button
        type="button"
        className="btn-secondary w-full py-1.5 text-xs"
        onClick={() => onChange({ ...row, auto: emptyAuto() })}
      >
        + Auto End Plates & Stiffener (from flange / web a / web b)
      </button>
    );
  }
  return (
    <div className="space-y-1.5 rounded-lg border border-steel-200 p-2">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs font-bold text-steel-700">
          <input
            type="checkbox"
            checked={!!au.enabled}
            onChange={(e) => setAuto({ enabled: e.target.checked })}
          />
          Auto End Plates & Stiffener
        </label>
        <button
          type="button"
          className="text-xs font-bold text-red-500"
          onClick={() => onChange({ ...row, auto: null })}
        >
          Remove
        </button>
      </div>
      <div className="text-xs text-steel-500">
        Plate A: {ap.a + AUTO_EXTRA} x {ap.F + AUTO_EXTRA} mm | Plate B:{" "}
        {ap.b + AUTO_EXTRA} x {ap.F + AUTO_EXTRA} mm
        <br />
        Stiffener: {(ap.a + ap.b) / 2} x {ap.F / 2} mm x {ap.nos} nos
      </div>
      <div className="grid grid-cols-2 gap-2">
        <NumField
          label="Plate A Thick (mm)"
          value={au.thickA}
          onChange={(v) => setAuto({ thickA: v })}
        />
        <NumField
          label="Plate B Thick (mm)"
          value={au.thickB}
          onChange={(v) => setAuto({ thickB: v })}
        />
        <NumField
          label="Stiffener Thick (mm)"
          value={au.stiffThick}
          onChange={(v) => setAuto({ stiffThick: v })}
        />
        <NumField
          label="Stiffener every (m)"
          step="0.1"
          value={au.pitch}
          onChange={(v) => setAuto({ pitch: v })}
        />
      </div>
      <div className="text-xs font-semibold text-steel-600">
        Auto plates weight: {fmtKg(ap.total)} KG
      </div>
    </div>
  );
}

export default function ExtraPlates({
  row,
  onChange,
  showAuto = false,
  withGussets = false,
}) {
  return (
    <div className="space-y-2">
      {showAuto && <AutoBlock row={row} onChange={onChange} />}
      {withGussets && <GussetEditor row={row} onChange={onChange} />}
      <ListBlock
        title="Stiffener Plates (optional)"
        addLabel="Add Stiffener Plate"
        o={ops(row, onChange, "stiffeners", emptyMiscPlate)}
        weightOf={miscPlateWeight}
      >
        {(p, set) => <MiscFields p={p} set={set} />}
      </ListBlock>
      <ListBlock
        title="Cleats (optional)"
        addLabel="Add Cleat"
        o={ops(row, onChange, "cleats", emptyMiscPlate)}
        weightOf={miscPlateWeight}
      >
        {(p, set) => <MiscFields p={p} set={set} />}
      </ListBlock>
    </div>
  );
}
