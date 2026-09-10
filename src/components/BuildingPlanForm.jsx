import { useState } from "react";

const emptyPlan = () => ({
  length: "",
  width: "",
  height: "",
  baySpacing: "",
  slopeRatio: "1:10",
  purlinSpacing: "",
  xBracingBays: "",
});

export default function BuildingPlanForm({ onGenerate, onClose }) {
  const [plan, setPlan] = useState(emptyPlan());
  const set = (patch) => setPlan((p) => ({ ...p, ...patch }));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-4">
        <p className="mb-3 text-sm font-bold text-steel-800">
          Building Plan (auto-fill Workout)
        </p>

        <div className="space-y-3">
          <div>
            <label className="field-label">Building Length (m)</label>
            <input
              type="number"
              className="field-input"
              value={plan.length}
              onChange={(e) => set({ length: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">Building Width / Span (m)</label>
            <input
              type="number"
              className="field-input"
              value={plan.width}
              onChange={(e) => set({ width: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">
              Building Height / Eave Height (m)
            </label>
            <input
              type="number"
              className="field-input"
              value={plan.height}
              onChange={(e) => set({ height: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">Bay Spacing (m)</label>
            <input
              type="number"
              className="field-input"
              value={plan.baySpacing}
              onChange={(e) => set({ baySpacing: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">Roof Slope Ratio (e.g. 1:10)</label>
            <input
              className="field-input"
              value={plan.slopeRatio}
              onChange={(e) => set({ slopeRatio: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">Purlin Spacing (m)</label>
            <input
              type="number"
              className="field-input"
              value={plan.purlinSpacing}
              onChange={(e) => set({ purlinSpacing: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">No. of Bays with X Bracing</label>
            <input
              type="number"
              className="field-input"
              value={plan.xBracingBays}
              onChange={(e) => set({ xBracingBays: e.target.value })}
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button className="btn-secondary flex-1" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-accent flex-1"
            onClick={() => onGenerate(plan)}
          >
            Generate
          </button>
        </div>
      </div>
    </div>
  );
}
