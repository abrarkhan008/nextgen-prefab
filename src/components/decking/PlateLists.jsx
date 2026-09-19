import ConnectionPlateDiagram from "../ConnectionPlateDiagram";
import GussetPlateDiagram from "../GussetPlateDiagram";
import { NumField } from "./DeckingFields";
import {
  emptyConnectionPlate,
  emptyGussetPlate,
  connectionPlateWeight,
  gussetPlateWeight,
  GUSSET_SHAPES,
  fmtKg,
} from "../../utils/decking";

function ConnectionPlates({ plates, onChange }) {
  const set = (id, patch) =>
    onChange(plates.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  return (
    <div className="space-y-2">
      <p className="pt-1 text-xs font-bold text-steel-600">
        Connection Plates (optional)
      </p>

      {plates.map((p) => (
        <div key={p.id} className="border-t border-steel-200 pt-1.5">
          <div className="flex gap-3">
            <div className="flex-1 space-y-1.5">
              <NumField
                label="1. Length (m)"
                value={p.length}
                onChange={(v) => set(p.id, { length: v })}
              />
              <NumField
                label="2. Width (mm)"
                value={p.width}
                onChange={(v) => set(p.id, { width: v })}
              />
              <NumField
                label="3. Thickness (mm)"
                value={p.thickness}
                onChange={(v) => set(p.id, { thickness: v })}
              />
              <NumField
                label="4. No. of Plates"
                value={p.qty}
                onChange={(v) => set(p.id, { qty: v })}
              />
            </div>
            <div className="flex w-24 shrink-0 items-center justify-center">
              <ConnectionPlateDiagram />
            </div>
          </div>

          <div className="mt-2 flex items-end gap-2">
            <div className="flex-1">
              <NumField
                label="Density (edit if not 0.00785)"
                step="0.00001"
                value={p.density}
                onChange={(v) => set(p.id, { density: v })}
              />
            </div>
            <button
              type="button"
              className="pb-2 text-xs font-bold text-red-500"
              onClick={() => onChange(plates.filter((x) => x.id !== p.id))}
            >
              Remove Plate
            </button>
          </div>
          <p className="mt-1 text-xs font-semibold text-steel-500">
            Plate weight: {fmtKg(connectionPlateWeight(p))} KG
          </p>
        </div>
      ))}

      <button
        type="button"
        className="btn-secondary w-full py-1.5 text-xs"
        onClick={() => onChange([...plates, emptyConnectionPlate()])}
      >
        + Add Connection Plate
      </button>
    </div>
  );
}

function GussetPlates({ gussets, onChange }) {
  const set = (id, patch) =>
    onChange(gussets.map((g) => (g.id === id ? { ...g, ...patch } : g)));

  return (
    <div className="space-y-2">
      <p className="pt-1 text-xs font-bold text-steel-600">
        Gusset Plates (optional)
      </p>

      {gussets.map((g) => (
        <div key={g.id} className="border-t border-steel-200 pt-1.5">
          <div className="mb-1.5">
            <label className="field-label">Gusset Shape</label>
            <select
              className="field-input"
              value={g.shape}
              onChange={(e) => set(g.id, { shape: e.target.value })}
            >
              {GUSSET_SHAPES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 space-y-1.5">
              <NumField
                label="1. Base (mm)"
                value={g.base}
                onChange={(v) => set(g.id, { base: v })}
              />
              <NumField
                label="2. Height (mm)"
                value={g.height}
                onChange={(v) => set(g.id, { height: v })}
              />
              <NumField
                label="3. Thickness (mm)"
                value={g.thickness}
                onChange={(v) => set(g.id, { thickness: v })}
              />
              <NumField
                label="4. No. of Gussets"
                value={g.qty}
                onChange={(v) => set(g.id, { qty: v })}
              />
            </div>
            <div className="flex w-24 shrink-0 items-center justify-center">
              <GussetPlateDiagram shape={g.shape} />
            </div>
          </div>

          <div className="mt-2 flex items-end gap-2">
            <div className="flex-1">
              <NumField
                label="Density (edit if not 0.00785)"
                step="0.00001"
                value={g.density}
                onChange={(v) => set(g.id, { density: v })}
              />
            </div>
            <button
              type="button"
              className="pb-2 text-xs font-bold text-red-500"
              onClick={() => onChange(gussets.filter((x) => x.id !== g.id))}
            >
              Remove Gusset
            </button>
          </div>
          <p className="mt-1 text-xs font-semibold text-steel-500">
            Gusset weight: {fmtKg(gussetPlateWeight(g))} KG
            {g.shape !== "Rectangle" && " (triangle = 1/2 x base x height)"}
          </p>
        </div>
      ))}

      <button
        type="button"
        className="btn-secondary w-full py-1.5 text-xs"
        onClick={() => onChange([...gussets, emptyGussetPlate()])}
      >
        + Add Gusset Plate
      </button>
    </div>
  );
}

// Both lists for one pillar / beam row
export default function PlateAttachments({ row, onChange }) {
  return (
    <>
      <ConnectionPlates
        plates={row.plates || []}
        onChange={(plates) => onChange({ ...row, plates })}
      />
      <GussetPlates
        gussets={row.gussets || []}
        onChange={(gussets) => onChange({ ...row, gussets })}
      />
    </>
  );
}