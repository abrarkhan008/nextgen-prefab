import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "../components/TopBar";
import { getDocument, saveDocument } from "../utils/storage";
import {
  SECTIONS,
  SECTION_TYPES,
  emptyMemberRow,
  emptyRateRow,
  emptyBracingRow,
  emptyPlate,
  emptyBoltRow,
  memberRowWeight,
  rateRowWeight,
  boltRowWeight,
  sectionTotalWeight,
  blankWorkout,
} from "../utils/workout";
import {
  BRACING_TYPES,
  bracingUnitWeight,
  bracingTotalWeight,
  purlinSectionWeight,
} from "../utils/calc";

// Same formulas already used in QuotationEditor.jsx, repeated here so this
// page shows the identical numbers without importing a page component.
function foundationBoltTotalWeight(f) {
  const pedestals = Number(f?.pedestals) || 0;
  const boltsPerPedestal = Number(f?.boltsPerPedestal) || 0;
  const boltWeight = Number(f?.boltWeight) || 0;
  return pedestals * boltsPerPedestal * boltWeight;
}
function purlinTotalWeight(p) {
  return purlinSectionWeight(p).totalWeight;
}
function fmt(n) {
  return (Number(n) || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

function MemberRowCard({ row, onChange, onRemove }) {
  const weight = memberRowWeight(row);
  const set = (patch) => onChange({ ...row, ...patch });
  const addPlate = () =>
    onChange({ ...row, plates: [...(row.plates || []), emptyPlate()] });
  const updatePlate = (idx, patch) =>
    onChange({
      ...row,
      plates: row.plates.map((p, i) => (i === idx ? { ...p, ...patch } : p)),
    });
  const removePlate = (idx) =>
    onChange({
      ...row,
      plates: row.plates.filter((_, i) => i !== idx),
    });

  return (
    <div className="space-y-1.5 rounded-lg border border-steel-200 p-2">
      <div className="flex items-center gap-2">
        <input
          className="field-input flex-1"
          placeholder="Label, e.g. C1"
          value={row.label}
          onChange={(e) => set({ label: e.target.value })}
        />
        <button className="text-xs font-bold text-red-500" onClick={onRemove}>
          Remove
        </button>
      </div>

      <div className="space-y-2">
        <div>
          <label className="field-label">Flange Width (mm)</label>
          <input
            type="number"
            className="field-input"
            value={row.flangeWidth}
            onChange={(e) => set({ flangeWidth: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">Flange Thick (mm)</label>
          <input
            type="number"
            className="field-input"
            value={row.flangeThick}
            onChange={(e) => set({ flangeThick: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">Web Width (mm)</label>
          <input
            type="number"
            className="field-input"
            value={row.webWidth}
            onChange={(e) => set({ webWidth: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">Web Thick (mm)</label>
          <input
            type="number"
            className="field-input"
            value={row.webThick}
            onChange={(e) => set({ webThick: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">Length (m)</label>
          <input
            type="number"
            className="field-input"
            value={row.length}
            onChange={(e) => set({ length: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">Qty</label>
          <input
            type="number"
            className="field-input"
            value={row.qty}
            onChange={(e) => set({ qty: e.target.value })}
          />
        </div>
      </div>
      <p className="pt-1 text-xs font-bold text-steel-600">
        Connection Plates (optional)
      </p>
      {row.plates.map((p, idx) => (
        <div key={idx} className="space-y-1.5 border-t border-steel-200 pt-1.5">
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="field-label">Length (m)</label>
              <input
                type="number"
                className="field-input"
                value={p.length}
                onChange={(e) => updatePlate(idx, { length: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">Width (mm)</label>
              <input
                type="number"
                className="field-input"
                value={p.width}
                onChange={(e) => updatePlate(idx, { width: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">Thickness (mm)</label>
              <input
                type="number"
                className="field-input"
                value={p.thickness}
                onChange={(e) =>
                  updatePlate(idx, { thickness: e.target.value })
                }
              />
            </div>
            <div>
              <label className="field-label">No. of Plates</label>
              <input
                type="number"
                className="field-input"
                value={p.qty}
                onChange={(e) => updatePlate(idx, { qty: e.target.value })}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="field-label">
                Density (edit if not 0.00785)
              </label>
              <input
                type="number"
                step="0.00001"
                className="field-input"
                value={p.density}
                onChange={(e) => updatePlate(idx, { density: e.target.value })}
              />
            </div>
            <button
              className="text-xs font-bold text-red-500"
              onClick={() => removePlate(idx)}
            >
              Remove Plate
            </button>
          </div>
        </div>
      ))}
      <button
        className="btn-secondary w-full py-1.5 text-xs"
        onClick={addPlate}
      >
        + Add Connection Plate
      </button>

      <div className="rounded-lg bg-steel-50 px-3 py-2 text-xs font-semibold text-steel-600">
        Computed Weight: {fmt(weight)} KG
      </div>
    </div>
  );
}

// `section` carries the optional hasThickness / qtyLabel flags set in
// utils/workout.js SECTIONS (used right now by Flange Bracing, which needs
// a Thickness field and reports its Qty in metres instead of NOS).
function RateRowCard({ row, section, onChange, onRemove }) {
  const weight = rateRowWeight(row);
  const set = (patch) => onChange({ ...row, ...patch });
  const qtyLabel = section?.qtyLabel || "Qty";

  return (
    <div className="space-y-1.5 rounded-lg border border-steel-200 p-2">
      <div className="flex items-center gap-2">
        <input
          className="field-input flex-1"
          placeholder="Label"
          value={row.label}
          onChange={(e) => set({ label: e.target.value })}
        />
        <button className="text-xs font-bold text-red-500" onClick={onRemove}>
          Remove
        </button>
      </div>
      <div
        className={`grid gap-2 ${
          section?.hasThickness ? "grid-cols-4" : "grid-cols-3"
        }`}
      >
        <div>
          <label className="field-label">{qtyLabel}</label>
          <input
            type="number"
            className="field-input"
            value={row.qty}
            onChange={(e) => set({ qty: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">Unit</label>
          <input
            className="field-input"
            value={row.unit}
            onChange={(e) => set({ unit: e.target.value })}
          />
        </div>
        {section?.hasThickness && (
          <div>
            <label className="field-label">Thickness (mm)</label>
            <input
              type="number"
              className="field-input"
              value={row.thickness}
              onChange={(e) => set({ thickness: e.target.value })}
            />
          </div>
        )}
        <div>
          <label className="field-label">Weight / Unit (kg)</label>
          <input
            type="number"
            className="field-input"
            value={row.weightPerUnit}
            onChange={(e) => set({ weightPerUnit: e.target.value })}
          />
        </div>
      </div>
      <div className="rounded-lg bg-steel-50 px-3 py-2 text-xs font-semibold text-steel-600">
        Computed Weight: {fmt(weight)} KG
      </div>
    </div>
  );
}
function SagRodRowCard({ row, onChange, onRemove }) {
  const size = Number(row.size) || 0;
  const qty = Number(row.qty) || 0;

  const weightPerPiece = (size * size) / 162;
  const totalWeight = weightPerPiece * qty;

  const set = (patch) => onChange({ ...row, ...patch });

  return (
    <div className="space-y-1.5 rounded-lg border border-steel-200 p-2">
      <div className="flex items-center gap-2">
        <input
          className="field-input flex-1"
          placeholder="Label, e.g. SR1"
          value={row.label}
          onChange={(e) => set({ label: e.target.value })}
        />

        <button className="text-xs font-bold text-red-500" onClick={onRemove}>
          Remove
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="field-label">Size (mm)</label>
          <input
            type="number"
            className="field-input"
            value={row.size || ""}
            onChange={(e) => set({ size: e.target.value })}
          />
        </div>

        <div>
          <label className="field-label">Qty</label>
          <input
            type="number"
            className="field-input"
            value={row.qty}
            onChange={(e) => set({ qty: e.target.value })}
          />
        </div>
      </div>

      <div className="rounded-lg bg-steel-50 px-3 py-2 text-xs font-semibold text-steel-600">
        Weight / Piece: {fmt(weightPerPiece)} KG
        <br />
        Total Weight: {fmt(totalWeight)} KG
      </div>
    </div>
  );
}

function BoltRowCard({ row, onChange, onRemove }) {
  const weight = boltRowWeight(row);
  const set = (patch) => onChange({ ...row, ...patch });

  return (
    <div className="space-y-1.5 rounded-lg border border-steel-200 p-2">
      <div className="flex items-center gap-2">
        <input
          className="field-input flex-1"
          placeholder="Label, e.g. BN1"
          value={row.label}
          onChange={(e) => set({ label: e.target.value })}
        />
        <button className="text-xs font-bold text-red-500" onClick={onRemove}>
          Remove
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="field-label">Diameter d (mm)</label>
          <input
            type="number"
            className="field-input"
            value={row.d}
            onChange={(e) => set({ d: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">Length l (mm)</label>
          <input
            type="number"
            className="field-input"
            value={row.l}
            onChange={(e) => set({ l: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">Qty</label>
          <input
            type="number"
            className="field-input"
            value={row.qty}
            onChange={(e) => set({ qty: e.target.value })}
          />
        </div>
      </div>

      <div className="rounded-lg bg-steel-50 px-3 py-2 text-xs font-semibold text-steel-600">
        Computed Weight: {fmt(weight)} KG
      </div>
    </div>
  );
}

function BracingRowCard({ row, onChange, onRemove }) {
  const unitWeight = bracingUnitWeight(row);
  const totalWeight = bracingTotalWeight(row);
  const set = (patch) => onChange({ ...row, ...patch });

  return (
    <div className="space-y-1.5 rounded-lg border border-steel-200 p-2">
      <div className="flex items-center gap-2">
        <input
          className="field-input flex-1"
          placeholder="Label"
          value={row.label}
          onChange={(e) => set({ label: e.target.value })}
        />
        <button className="text-xs font-bold text-red-500" onClick={onRemove}>
          Remove
        </button>
      </div>

      <div>
        <label className="field-label">Bracing Type</label>
        <select
          className="field-input"
          value={row.type}
          onChange={(e) => set({ type: e.target.value })}
        >
          {BRACING_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {row.type === "Pipe Bracing" ? (
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="field-label">Size / OD (mm)</label>
            <input
              type="number"
              className="field-input"
              value={row.size}
              onChange={(e) => set({ size: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">Thickness (mm)</label>
            <input
              type="number"
              className="field-input"
              value={row.thickness}
              onChange={(e) => set({ thickness: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">Qty</label>
            <input
              type="number"
              className="field-input"
              value={row.qty}
              onChange={(e) => set({ qty: e.target.value })}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="field-label">Size / Dia (mm)</label>
            <input
              type="number"
              className="field-input"
              value={row.size}
              onChange={(e) => set({ size: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">Qty</label>
            <input
              type="number"
              className="field-input"
              value={row.qty}
              onChange={(e) => set({ qty: e.target.value })}
            />
          </div>
        </div>
      )}

      <div className="rounded-lg bg-steel-50 px-3 py-2 text-xs font-semibold text-steel-600">
        Weight / Piece: {fmt(unitWeight)} KG &nbsp;|&nbsp; Total:{" "}
        {fmt(totalWeight)} KG
      </div>
    </div>
  );
}

export default function QuotationWorkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc_, setDoc] = useState(null);

  useEffect(() => {
    const existing = getDocument(id);
    if (!existing) {
      navigate("/quotation/new");
      return;
    }
    setDoc({
      ...existing,
      workout: { ...blankWorkout(), ...existing.workout },
    });
  }, [id, navigate]);

  if (!doc_) return null;

  const updateWorkout = (patch) => {
    const next = { ...doc_, workout: { ...doc_.workout, ...patch } };
    setDoc(next);
    saveDocument(next);
  };
  const updateProject = (patch) => {
    const next = { ...doc_, project: { ...doc_.project, ...patch } };
    setDoc(next);
    saveDocument(next);
  };

  const addRow = (sectionKey, factory) =>
    updateWorkout({
      [sectionKey]: [...(doc_.workout[sectionKey] || []), factory()],
    });
  const removeRow = (sectionKey, rowId) =>
    updateWorkout({
      [sectionKey]: doc_.workout[sectionKey].filter((r) => r.id !== rowId),
    });
  const updateRow = (sectionKey, rowId, updated) =>
    updateWorkout({
      [sectionKey]: doc_.workout[sectionKey].map((r) =>
        r.id === rowId ? updated : r,
      ),
    });

  const foundationWeight = foundationBoltTotalWeight(
    doc_.project.foundationBolt,
  );
  const purlinWeight = purlinTotalWeight(doc_.project.purlin);
  const sectionsTotal = SECTIONS.reduce(
    (sum, s) => sum + sectionTotalWeight(s, doc_.workout[s.key] || []),
    0,
  );
  const grandTotal = foundationWeight + purlinWeight + sectionsTotal;

  return (
    <div className="min-h-full bg-steel-50 pb-28">
      <TopBar title="PEB Workout" subtitle={`Quotation No. ${doc_.docNo}`} />

      <div className="space-y-4 p-4">
        {/* 1. Base Plate / Foundation Bolts */}
        <div className="card space-y-3">
          <p className="text-sm font-bold text-steel-800">
            1. Base Plate / Foundation Bolts
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="field-label">No. of Pedestals</label>
              <input
                type="number"
                className="field-input"
                value={doc_.project.foundationBolt.pedestals}
                onChange={(e) =>
                  updateProject({
                    foundationBolt: {
                      ...doc_.project.foundationBolt,
                      pedestals: e.target.value,
                    },
                  })
                }
              />
            </div>
            <div>
              <label className="field-label">Bolts / Pedestal</label>
              <input
                type="number"
                className="field-input"
                value={doc_.project.foundationBolt.boltsPerPedestal}
                onChange={(e) =>
                  updateProject({
                    foundationBolt: {
                      ...doc_.project.foundationBolt,
                      boltsPerPedestal: e.target.value,
                    },
                  })
                }
              />
            </div>
            <div>
              <label className="field-label">Weight / Bolt (kg)</label>
              <input
                type="number"
                className="field-input"
                value={doc_.project.foundationBolt.boltWeight}
                onChange={(e) =>
                  updateProject({
                    foundationBolt: {
                      ...doc_.project.foundationBolt,
                      boltWeight: e.target.value,
                    },
                  })
                }
              />
            </div>
          </div>
          <div className="rounded-lg bg-steel-50 px-3 py-2 text-xs font-semibold text-steel-600">
            Computed Weight: {fmt(foundationWeight)} KG
          </div>
        </div>

        {/* 2-13. all repeating sections, driven by SECTIONS array */}
        {SECTIONS.map((section, idx) => {
          const rows = doc_.workout[section.key] || [];
          const total = sectionTotalWeight(section, rows);
          return (
            <div key={section.key} className="card space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-steel-800">
                  {idx + 2}. {section.title}
                </p>
                <button
                  className="btn-secondary px-3 py-1 text-xs"
                  onClick={() =>
                    addRow(section.key, () => {
                      const label = `${section.prefix}${rows.length + 1}`;
                      if (section.key === "boltsNuts")
                        return emptyBoltRow(label);
                      if (section.type === SECTION_TYPES.MEMBER)
                        return emptyMemberRow(label);
                      if (section.type === SECTION_TYPES.BRACING)
                        return emptyBracingRow(label);
                      return emptyRateRow(label, section.defaultUnit);
                    })
                  }
                >
                  + Add
                </button>
              </div>

              {rows.length === 0 && (
                <p className="text-xs text-steel-400">
                  No rows yet. Tap + Add.
                </p>
              )}

              {rows.map((row) => {
                const commonProps = {
                  key: row.id,
                  row,
                  onChange: (updated) =>
                    updateRow(section.key, row.id, updated),
                  onRemove: () => removeRow(section.key, row.id),
                };
                if (section.key === "boltsNuts")
                  return <BoltRowCard {...commonProps} />;

                if (section.type === SECTION_TYPES.MEMBER)
                  return <MemberRowCard {...commonProps} />;

                if (section.type === SECTION_TYPES.BRACING)
                  return <BracingRowCard {...commonProps} />;

                if (section.key === "sagRods")
                  return <SagRodRowCard {...commonProps} />;

                return <RateRowCard {...commonProps} section={section} />;
              })}

              <div className="rounded-lg bg-steel-100 px-3 py-2 text-xs font-bold text-steel-700">
                Section Total: {fmt(total)} KG
              </div>
            </div>
          );
        })}

        {/* 14. Purlin (roof / cladding) */}
        {/* 14. Purlin (roof / cladding) */}
        <div className="card space-y-3">
          <p className="text-sm font-bold text-steel-800">14. Purlin</p>
          <div>
            <label className="field-label">Purlin Type</label>
            <select
              className="field-input"
              value={doc_.project.purlin.type || "Z-Purlin"}
              onChange={(e) =>
                updateProject({
                  purlin: { ...doc_.project.purlin, type: e.target.value },
                })
              }
            >
              <option value="Z-Purlin">Z-Purlin</option>
              <option value="C-Purlin">C-Purlin</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="field-label">Flange Width (mm)</label>
            <input
              type="number"
              className="field-input"
              value={doc_.project.purlin.flangeWidth}
              onChange={(e) =>
                updateProject({
                  purlin: {
                    ...doc_.project.purlin,
                    flangeWidth: e.target.value,
                  },
                })
              }
            />
          </div>
          <div>
            <label className="field-label">Web Width (mm)</label>
            <input
              type="number"
              className="field-input"
              value={doc_.project.purlin.webWidth}
              onChange={(e) =>
                updateProject({
                  purlin: { ...doc_.project.purlin, webWidth: e.target.value },
                })
              }
            />
          </div>
          <div>
            <label className="field-label">Lip Width (mm)</label>
            <input
              type="number"
              className="field-input"
              value={doc_.project.purlin.lipWidth}
              onChange={(e) =>
                updateProject({
                  purlin: { ...doc_.project.purlin, lipWidth: e.target.value },
                })
              }
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="field-label">Thickness (mm)</label>
            <input
              type="number"
              className="field-input"
              value={doc_.project.purlin.thickness}
              onChange={(e) =>
                updateProject({
                  purlin: { ...doc_.project.purlin, thickness: e.target.value },
                })
              }
            />
          </div>
          <div>
            <label className="field-label">Length (m)</label>
            <input
              type="number"
              className="field-input"
              value={doc_.project.purlin.length}
              onChange={(e) =>
                updateProject({
                  purlin: { ...doc_.project.purlin, length: e.target.value },
                })
              }
            />
          </div>
          <div>
            <label className="field-label">Qty</label>
            <input
              type="number"
              className="field-input"
              value={doc_.project.purlin.qty}
              onChange={(e) =>
                updateProject({
                  purlin: { ...doc_.project.purlin, qty: e.target.value },
                })
              }
            />
          </div>

          <div className="rounded-lg bg-steel-50 px-3 py-2 text-xs font-semibold text-steel-600">
            Computed Weight: {fmt(purlinWeight)} KG
          </div>
        </div>

        <div className="card flex items-center justify-between">
          <span className="text-sm font-bold text-steel-800">
            Grand Total (Workout)
          </span>
          <span className="font-mono text-base font-bold text-steel-900">
            {fmt(grandTotal)} KG
          </span>
        </div>

        <div className="flex gap-2">
          <button
            className="btn-secondary flex-1"
            onClick={() => navigate(`/quotation/${id}/summary`)}
          >
            View Summary
          </button>
          <button
            className="btn-secondary flex-1"
            onClick={() => navigate(`/quotation/${id}/materials`)}
          >
            Material List
          </button>
        </div>
        <button
          className="btn-secondary w-full"
          onClick={() => navigate(`/quotation/${id}`)}
        >
          Continue to Quotation / Pricing →
        </button>
      </div>
    </div>
  );
}
