import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "../components/TopBar";
import { getDocument, saveDocument, newId } from "../utils/storage";

import {
  SECTIONS,
  SECTION_TYPES,
  emptyMemberRow,
  emptyRateRow,
  emptyBracingRow,
  emptyPlate,
  emptyBoltRow,
  emptyPurlinRow,
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
  boltWeight,
  round2,
} from "../utils/calc";
import BoltDiagram from "../components/BoltDiagram";
import BracingDiagram from "../components/BracingDiagram";
import StripDiagram from "../components/StripDiagram";
import MemberDiagram from "../components/MemberDiagram";
import FoundationBoltDiagram from "../components/FoundationBoltDiagram";
import ConnectionPlateDiagram from "../components/ConnectionPlateDiagram";
import { emptyItem } from "../components/ItemsTable";
import BuildingPlanForm from "../components/BuildingPlanForm";
import CollapsibleRow from "../components/CollapsibleRow";
import ThicknessInput from "../components/ThicknessInput";
import LengthInput from "../components/LengthInput";
import PlateBoltsEditor from "../components/decking/PlateBoltsEditor";
import ExtraPlates from "../components/decking/ExtraPlates";
import { NumField } from "../components/decking/DeckingFields";

// Same formulas already used in QuotationEditor.jsx, repeated here so this
// page shows the identical numbers without importing a page component.
// function foundationBoltTotalWeight(f) {
//   const pedestals = Number(f?.pedestals) || 0;
//   const boltsPerPedestal = Number(f?.boltsPerPedestal) || 0;

//   const diameter = Number(f?.diameter) || 0;
//   const length = Number(f?.length) || 0;

//   const totalBolts = pedestals * boltsPerPedestal;
//   const singleBoltWeight = boltWeight(diameter, length);

//   return round2(totalBolts * singleBoltWeight);
// }
function purlinTotalWeight(p) {
  return purlinSectionWeight(p).totalWeight;
}
function fmt(n) {
  return (Number(n) || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

const emptyFoundationRow = (label = "") => ({
  id: newId(),
  label,
  pedestals: "",
  boltsPerPedestal: "",
  diameter: "",
  length: "",
});
function foundationRowWeight(f) {
  return (
    (Number(f?.pedestals) || 0) *
    (Number(f?.boltsPerPedestal) || 0) *
    boltWeight(f?.diameter, f?.length)
  );
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

      {/* <div className="space-y-2">
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
      </div> */}
      <div className="flex gap-3">
        <div className="flex-1 space-y-2">
          <div>
            <label className="field-label">Flange Width (mm)</label>
            <input
              type="number"
              className="field-input"
              value={row.flangeWidth}
              onChange={(e) => set({ flangeWidth: e.target.value })}
            />
          </div>

          <ThicknessInput
            label="Flange Thick (mm)"
            value={row.flangeThick}
            onChange={(v) => set({ flangeThick: v })}
          />

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
            <label className="field-label">
              Web Width B (mm) - big end (blank = same as A)
            </label>
            <input
              type="number"
              className="field-input"
              value={row.webWidthB || ""}
              onChange={(e) => set({ webWidthB: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">
              Web Width B (mm) - big end (blank = same as A)
            </label>
            <input
              type="number"
              className="field-input"
              value={row.webWidthB || ""}
              onChange={(e) => set({ webWidthB: e.target.value })}
            />
          </div>

          <ThicknessInput
            label="Web Thick (mm)"
            value={row.webThick}
            onChange={(v) => set({ webThick: v })}
          />

          <LengthInput
            label="Length (m)"
            value={row.length}
            onChange={(v) => set({ length: v })}
          />

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

        <div className="flex w-32 items-center justify-center">
          <MemberDiagram />
        </div>
      </div>
      <p className="pt-1 text-xs font-bold text-steel-600">
        Connection Plates (optional)
      </p>
      {row.plates.map((p, idx) => (
        <div key={idx} className="border-t border-steel-200 pt-1.5">
          <div className="flex gap-3">
            {/* LEFT SIDE - CONNECTION PLATE INPUTS */}
            <div className="flex-1 space-y-1.5">
              <LengthInput
                label="1. Length (m)"
                value={p.length}
                onChange={(v) => updatePlate(idx, { length: v })}
              />

              <div>
                <label className="field-label">2. Width (mm)</label>
                <input
                  type="number"
                  className="field-input"
                  value={p.width}
                  onChange={(e) =>
                    updatePlate(idx, {
                      width: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="field-label">3. Thickness (mm)</label>
                <input
                  type="number"
                  className="field-input"
                  value={p.thickness}
                  onChange={(e) =>
                    updatePlate(idx, {
                      thickness: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="field-label">4. No. of Plates</label>
                <input
                  type="number"
                  className="field-input"
                  value={p.qty}
                  onChange={(e) =>
                    updatePlate(idx, {
                      qty: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* RIGHT SIDE - VERTICAL CONNECTION PLATE DIAGRAM */}
            <div className="flex w-24 shrink-0 items-center justify-center">
              <ConnectionPlateDiagram />
            </div>
          </div>

          {/* DENSITY + REMOVE */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1">
              <label className="field-label">
                Density (edit if not 0.00785)
              </label>

              <input
                type="number"
                step="0.00001"
                className="field-input"
                value={p.density}
                onChange={(e) =>
                  updatePlate(idx, {
                    density: e.target.value,
                  })
                }
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

      {/* RIGHT SIDE - CONNECTION PLATE DIAGRAM
          <div className="flex w-32 shrink-0 items-center justify-center">
            <ConnectionPlateDiagram />
          </div>
        </div>
      ))} */}
      <button
        className="btn-secondary w-full py-1.5 text-xs"
        onClick={addPlate}
      >
        + Add Connection Plate
      </button>
      <PlateBoltsEditor row={row} onChange={onChange} />
      <ExtraPlates row={row} onChange={onChange} showAuto withGussets />

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

      <div className="flex gap-3">
        <div className="flex-1 space-y-2">
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
            <ThicknessInput
              label="1. Thickness (mm)"
              value={row.thickness}
              onChange={(v) => set({ thickness: v })}
            />
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

        {section?.hasThickness && (
          <div className="flex items-center justify-center">
            <StripDiagram />
          </div>
        )}
      </div>

      <div className="rounded-lg bg-steel-50 px-3 py-2 text-xs font-semibold text-steel-600">
        Computed Weight: {fmt(weight)} KG
      </div>
    </div>
  );
}
// function SagRodRowCard({ row, onChange, onRemove }) {
//   const size = Number(row.size) || 0;
//   const qty = Number(row.qty) || 0;

//   const weightPerPiece = (size * size) / 162;
//   const totalWeight = weightPerPiece * qty;

//   const set = (patch) => onChange({ ...row, ...patch });

//   return (
//     <div className="space-y-1.5 rounded-lg border border-steel-200 p-2">
//       <div className="flex items-center gap-2">
//         <input
//           className="field-input flex-1"
//           placeholder="Label, e.g. SR1"
//           value={row.label}
//           onChange={(e) => set({ label: e.target.value })}
//         />

//         <button className="text-xs font-bold text-red-500" onClick={onRemove}>
//           Remove
//         </button>
//       </div>

//       <div className="grid grid-cols-2 gap-2">
//         <div>
//           <label className="field-label">Size (mm)</label>
//           <input
//             type="number"
//             className="field-input"
//             value={row.size || ""}
//             onChange={(e) => set({ size: e.target.value })}
//           />
//         </div>

//         <div>
//           <label className="field-label">Qty</label>
//           <input
//             type="number"
//             className="field-input"
//             value={row.qty}
//             onChange={(e) => set({ qty: e.target.value })}
//           />
//         </div>
//       </div>

//       <div className="rounded-lg bg-steel-50 px-3 py-2 text-xs font-semibold text-steel-600">
//         Weight / Piece: {fmt(weightPerPiece)} KG
//         <br />
//         Total Weight: {fmt(totalWeight)} KG
//       </div>
//     </div>
//   );
// }
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

      <div className="flex gap-3">
        <div className="flex-1 space-y-2">
          <div>
            <label className="field-label">1. Size (mm)</label>
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
        <div className="flex items-center justify-center">
          <BracingDiagram type="Rod Bracing" />
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

      <div className="flex gap-3">
        <div className="flex-1 space-y-2">
          <div>
            <label className="field-label">1. Diameter d (mm)</label>
            <input
              type="number"
              className="field-input"
              value={row.d}
              onChange={(e) => set({ d: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">2. Length l (mm)</label>
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
        <div className="flex items-center justify-center">
          <BoltDiagram />
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

      <div className="flex gap-3">
        <div className="flex-1 space-y-2">
          <div>
            <label className="field-label">
              1. Size / Dia {row.type === "Pipe Bracing" ? "(OD)" : ""} (mm)
            </label>
            <input
              type="number"
              className="field-input"
              value={row.size}
              onChange={(e) => set({ size: e.target.value })}
            />
          </div>
          {row.type === "Pipe Bracing" && (
            <ThicknessInput
              label="2. Thickness (mm)"
              value={row.thickness}
              onChange={(v) => set({ thickness: v })}
            />
          )}
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
        <div className="flex items-center justify-center">
          <BracingDiagram type={row.type} />
        </div>
      </div>

      <div className="rounded-lg bg-steel-50 px-3 py-2 text-xs font-semibold text-steel-600">
        Weight / Piece: {fmt(unitWeight)} KG &nbsp;|&nbsp; Total:{" "}
        {fmt(totalWeight)} KG
      </div>
    </div>
  );
}
function PurlinRowCard({ row, onChange, onRemove }) {
  const { totalWeight } = purlinSectionWeight(row);
  const set = (patch) => onChange({ ...row, ...patch });

  return (
    <div className="space-y-1.5 rounded-lg border border-steel-200 p-2">
      <div className="flex items-center gap-2">
        <input
          className="field-input flex-1"
          placeholder="Label, e.g. P1"
          value={row.label}
          onChange={(e) => set({ label: e.target.value })}
        />
        <button className="text-xs font-bold text-red-500" onClick={onRemove}>
          Remove
        </button>
      </div>

      <div>
        <label className="field-label">Purlin Type</label>
        <select
          className="field-input"
          value={row.type || "Z-Purlin"}
          onChange={(e) => set({ type: e.target.value })}
        >
          <option value="Z-Purlin">Z-Purlin</option>
          <option value="C-Purlin">C-Purlin</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-2">
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
          <label className="field-label">Web Width (mm)</label>
          <input
            type="number"
            className="field-input"
            value={row.webWidth}
            onChange={(e) => set({ webWidth: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">Lip Width (mm)</label>
          <input
            type="number"
            className="field-input"
            value={row.lipWidth}
            onChange={(e) => set({ lipWidth: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <ThicknessInput
          label="Thickness (mm)"
          value={row.thickness}
          onChange={(v) => set({ thickness: v })}
        />
        <LengthInput
          label="Length (m)"
          value={row.length}
          onChange={(v) => set({ length: v })}
        />
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
        Computed Weight: {fmt(totalWeight)} KG
      </div>
    </div>
  );
}

export default function QuotationWorkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc_, setDoc] = useState(null);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [closed, setClosed] = useState({});
  const toggle = (rid) => setClosed((c) => ({ ...c, [rid]: !c[rid] }));

  useEffect(() => {
    const existing = getDocument(id);
    if (!existing) {
      navigate("/quotation/new");
      return;
    }
    const old = existing.project?.foundationBolt;
    const hasOld =
      old &&
      (old.pedestals || old.boltsPerPedestal || old.diameter || old.length);
    setDoc({
      ...existing,
      workout: { ...blankWorkout(), ...existing.workout },
      project: {
        ...existing.project,
        foundationBolts:
          existing.project?.foundationBolts ??
          (hasOld
            ? [
                {
                  id: newId(),
                  label: "CL1",
                  pedestals: old.pedestals || "",
                  boltsPerPedestal: old.boltsPerPedestal || "",
                  diameter: old.diameter || "",
                  length: old.length || "",
                },
              ]
            : []),
      },
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
  const addSectionRow = (section) => {
    const rows = doc_.workout[section.key] || [];
    addRow(section.key, () => {
      const label = `${section.prefix}${rows.length + 1}`;
      if (section.key === "boltsNuts") return emptyBoltRow(label);
      if (section.type === SECTION_TYPES.MEMBER) return emptyMemberRow(label);
      if (section.type === SECTION_TYPES.BRACING) return emptyBracingRow(label);
      return emptyRateRow(label, section.defaultUnit);
    });
  };

  const rowWeightOf = (section, r) => {
    if (section.key === "boltsNuts") return boltRowWeight(r);
    if (section.type === SECTION_TYPES.MEMBER) return memberRowWeight(r);
    if (section.type === SECTION_TYPES.BRACING) return bracingTotalWeight(r);
    if (section.key === "sagRods")
      return ((Number(r.size) || 0) ** 2 / 162) * (Number(r.qty) || 0);
    return rateRowWeight(r);
  };
  const foundationRows = doc_.project.foundationBolts || [];
  const foundationWeight = round2(
    foundationRows.reduce((s, f) => s + foundationRowWeight(f), 0),
  );
  const addFoundationRow = () =>
    updateProject({
      foundationBolts: [
        ...foundationRows,
        emptyFoundationRow(`CL${foundationRows.length + 1}`),
      ],
    });
  const updateFoundationRow = (rid, patch) =>
    updateProject({
      foundationBolts: foundationRows.map((r) =>
        r.id === rid ? { ...r, ...patch } : r,
      ),
    });
  const removeFoundationRow = (rid) =>
    updateProject({
      foundationBolts: foundationRows.filter((r) => r.id !== rid),
    });
  const purlins = doc_.project.purlins || [];
  const purlinWeight = purlins.reduce(
    (sum, p) => sum + purlinSectionWeight(p).totalWeight,
    0,
  );
  const addPurlinRow = () =>
    updateProject({
      purlins: [...purlins, emptyPurlinRow(`P${purlins.length + 1}`)],
    });
  const updatePurlinRow = (rowId, updated) =>
    updateProject({
      purlins: purlins.map((r) => (r.id === rowId ? updated : r)),
    });
  const removePurlinRow = (rowId) =>
    updateProject({ purlins: purlins.filter((r) => r.id !== rowId) });
  const sectionsTotal = SECTIONS.reduce(
    (sum, s) => sum + sectionTotalWeight(s, doc_.workout[s.key] || []),
    0,
  );
  const grandTotal = foundationWeight + purlinWeight + sectionsTotal;
  // Fills workout sections automatically based on simple building
  // dimensions. Edit the numbers marked "ADJUST" below to match your
  // company's standard practice — these are simple starting formulas.
  const applyBuildingPlan = (plan) => {
    const length = Number(plan.length) || 0;
    const width = Number(plan.width) || 0;
    const height = Number(plan.height) || 0;
    const baySpacing = Number(plan.baySpacing) || 6; // ADJUST default
    const purlinSpacing = Number(plan.purlinSpacing) || 1.2; // ADJUST default
    const xBracingBays = Number(plan.xBracingBays) || 0;

    const numberOfBays = baySpacing ? Math.round(length / baySpacing) : 0;
    const numberOfFrames = numberOfBays + 1; // frames at each bay division

    // Rough rafter length from slope ratio, e.g. "1:10"
    const slopeParts = (plan.slopeRatio || "1:10").split(":").map(Number);
    const riseRatio = slopeParts[1] ? slopeParts[0] / slopeParts[1] : 0.1;
    const halfSpan = width / 2;
    const rafterLength = Math.sqrt(
      halfSpan * halfSpan + (halfSpan * riseRatio) ** 2,
    );

    // ---- Pillars: 2 per frame ----
    const pillarRows = Array.from({ length: numberOfFrames * 2 }, (_, i) => ({
      ...emptyMemberRow(`C${i + 1}`),
      flangeWidth: "150", // ADJUST default section size
      flangeThick: "5",
      webWidth: "200",
      webThick: "5",
      length: String(height),
      qty: "1",
    }));

    // ---- Rafters: 2 slopes per frame ----
    const rafterRows = Array.from({ length: numberOfFrames * 2 }, (_, i) => ({
      ...emptyMemberRow(`R${i + 1}`),
      flangeWidth: "150", // ADJUST default section size
      flangeThick: "5",
      webWidth: "200",
      webThick: "5",
      length: rafterLength.toFixed(2),
      qty: "1",
    }));

    // ---- X Bracing: 2 diagonals per braced bay ----
    const xBracingRows = Array.from({ length: xBracingBays * 2 }, (_, i) => ({
      ...emptyBracingRow(`XB${i + 1}`),
      type: "Rod Bracing",
      size: "16", // ADJUST default rod size (mm)
      qty: "1",
    }));

    // ---- Purlin: quantity and length from slope + spacing ----
    const purlinLinesPerSlope = purlinSpacing
      ? Math.ceil(rafterLength / purlinSpacing)
      : 0;
    const purlinQty = purlinLinesPerSlope * 2 * numberOfBays; // 2 slopes x bays

    const next = {
      ...doc_,
      workout: {
        ...doc_.workout,
        pillars: pillarRows,
        rafters: rafterRows,
        xBracing: xBracingRows,
      },
      project: {
        ...doc_.project,
        length: String(length),
        width: String(width),
        height: String(height),
        purlin: {
          ...doc_.project.purlin,
          length: String(baySpacing),
          qty: String(purlinQty),
        },
      },
    };

    setDoc(next);
    saveDocument(next);
    setShowPlanForm(false);
    alert("Workout filled from Building Plan. You can edit any row now.");
  };
  const pushWorkoutToItems = () => {
    const rate = Number(doc_.steelRate) || 0;
    const newItems = [];

    if (foundationWeight) {
      const row = emptyItem();
      row.description = "FOUNDATION BOLT";
      row.qty = foundationWeight;
      row.unit = "KGS";
      row.rate = rate;
      row.amount = foundationWeight * rate;
      newItems.push(row);
    }

    SECTIONS.forEach((section) => {
      (doc_.workout[section.key] || []).forEach((r) => {
        const w =
          section.key === "boltsNuts"
            ? boltRowWeight(r)
            : section.type === SECTION_TYPES.MEMBER
            ? memberRowWeight(r)
            : section.type === SECTION_TYPES.BRACING
            ? bracingTotalWeight(r)
            : rateRowWeight(r);
        if (!w) return;
        const row = emptyItem();
        row.description = `${r.label || section.prefix} (${section.title})`;
        row.qty = w;
        row.unit = "KGS";
        row.rate = rate;
        row.amount = w * rate;
        newItems.push(row);
      });
    });

    purlins.forEach((p) => {
      const w = purlinSectionWeight(p).totalWeight;
      if (!w) return;
      const row = emptyItem();
      row.description = `${p.label || "PURLIN"} (${p.type || "Z-Purlin"})`;
      row.qty = w;
      row.unit = "KGS";
      row.rate = rate;
      row.amount = w * rate;
      newItems.push(row);
    });

    const next = { ...doc_, items: newItems };
    setDoc(next);
    saveDocument(next);
    alert("Items updated in Quotation from Workout!");
  };

  return (
    <div className="min-h-full bg-steel-50 pb-28">
      <TopBar title="PEB Workout" subtitle={`Quotation No. ${doc_.docNo}`} />

      <div className="space-y-4 p-4">
        <button
          className="btn-accent w-full"
          onClick={() => setShowPlanForm(true)}
        >
          📋 Generate from Building Plan
        </button>
        {/* 1. Foundation Bolts */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-steel-800">
              1. Foundation Bolts
            </p>
            <button
              className="btn-secondary px-3 py-1 text-xs"
              onClick={addFoundationRow}
            >
              + Add
            </button>
          </div>

          {foundationRows.length === 0 && (
            <p className="text-xs text-steel-400">No rows yet. Tap + Add.</p>
          )}

          {foundationRows.map((f) => (
            <CollapsibleRow
              key={f.id}
              title={f.label}
              weight={fmt(foundationRowWeight(f))}
              open={!closed[f.id]}
              onToggle={() => toggle(f.id)}
            >
              <div className="space-y-1.5 rounded-lg border border-steel-200 p-2">
                <div className="flex items-center gap-2">
                  <input
                    className="field-input flex-1"
                    placeholder="Label, e.g. CL1"
                    value={f.label}
                    onChange={(e) =>
                      updateFoundationRow(f.id, { label: e.target.value })
                    }
                  />
                  <button
                    className="text-xs font-bold text-red-500"
                    onClick={() => removeFoundationRow(f.id)}
                  >
                    Remove
                  </button>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1 space-y-2">
                    {[
                      ["pedestals", "No. of Pedestals"],
                      ["boltsPerPedestal", "No. of Bolts per Pedestal"],
                      ["diameter", "Bolt Diameter (mm)"],
                      ["length", "Bolt Length (mm)"],
                    ].map(([k, lbl]) => (
                      <div key={k}>
                        <label className="field-label">{lbl}</label>
                        <input
                          type="number"
                          className="field-input"
                          value={f[k]}
                          onChange={(e) =>
                            updateFoundationRow(f.id, { [k]: e.target.value })
                          }
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex w-32 shrink-0 items-center justify-center">
                    <FoundationBoltDiagram />
                  </div>
                </div>
                <div className="rounded-lg bg-steel-50 px-3 py-2 text-xs font-semibold text-steel-600">
                  Computed Weight: {fmt(foundationRowWeight(f))} KG
                </div>
              </div>
            </CollapsibleRow>
          ))}

          {foundationRows.length > 0 && (
            <button className="btn-secondary w-full" onClick={addFoundationRow}>
              + Add Foundation Bolt
            </button>
          )}

          <div className="rounded-lg bg-steel-100 px-3 py-2 text-xs font-bold text-steel-700">
            Foundation Bolts Total: {fmt(foundationWeight)} KG
          </div>
        </div>

        {/* 2-13. all repeating sections, driven by SECTIONS array */}
        {/* {SECTIONS.map((section, idx) => {
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
        })} */}
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
                  onClick={() => addSectionRow(section)}
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
                  row,
                  onChange: (updated) =>
                    updateRow(section.key, row.id, updated),
                  onRemove: () => removeRow(section.key, row.id),
                };
                let card;
                if (section.key === "boltsNuts")
                  card = <BoltRowCard {...commonProps} />;
                else if (section.type === SECTION_TYPES.MEMBER)
                  card = <MemberRowCard {...commonProps} />;
                else if (section.type === SECTION_TYPES.BRACING)
                  card = <BracingRowCard {...commonProps} />;
                else if (section.key === "sagRods")
                  card = <SagRodRowCard {...commonProps} />;
                else card = <RateRowCard {...commonProps} section={section} />;

                return (
                  <CollapsibleRow
                    key={row.id}
                    title={row.label}
                    weight={fmt(rowWeightOf(section, row))}
                    open={!closed[row.id]}
                    onToggle={() => toggle(row.id)}
                  >
                    {card}
                  </CollapsibleRow>
                );
              })}

              {rows.length > 0 && (
                <button
                  className="btn-secondary w-full"
                  onClick={() => addSectionRow(section)}
                >
                  + Add {section.title}
                </button>
              )}

              <div className="rounded-lg bg-steel-100 px-3 py-2 text-xs font-bold text-steel-700">
                Section Total: {fmt(total)} KG
              </div>
            </div>
          );
        })}

        {/* 14. Purlin (roof / cladding) */}
        {/* 14. Purlin (roof / cladding) */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-steel-800">14. Purlin</p>
            <button
              className="btn-secondary px-3 py-1 text-xs"
              onClick={addPurlinRow}
            >
              + Add
            </button>
          </div>

          {purlins.length === 0 && (
            <p className="text-xs text-steel-400">
              No purlin rows yet. Tap + Add.
            </p>
          )}

          {purlins.map((p) => (
            <CollapsibleRow
              key={p.id}
              title={p.label}
              weight={fmt(purlinSectionWeight(p).totalWeight)}
              open={!closed[p.id]}
              onToggle={() => toggle(p.id)}
            >
              <PurlinRowCard
                row={p}
                onChange={(updated) => updatePurlinRow(p.id, updated)}
                onRemove={() => removePurlinRow(p.id)}
              />
            </CollapsibleRow>
          ))}

          {purlins.length > 0 && (
            <button className="btn-secondary w-full" onClick={addPurlinRow}>
              + Add Purlin
            </button>
          )}

          <div className="rounded-lg bg-steel-100 px-3 py-2 text-xs font-bold text-steel-700">
            Purlin Total: {fmt(purlinWeight)} KG
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

        <button className="btn-secondary w-full" onClick={pushWorkoutToItems}>
          ⬆️ Push Weights to Quotation Items
        </button>
        <button
          className="btn-secondary w-full"
          onClick={() => navigate(`/quotation/${id}`)}
        >
          Continue to Quotation / Pricing →
        </button>
      </div>
      {showPlanForm && (
        <BuildingPlanForm
          onClose={() => setShowPlanForm(false)}
          onGenerate={applyBuildingPlan}
        />
      )}
    </div>
  );
}
