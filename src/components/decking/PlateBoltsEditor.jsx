import { newId } from "../../utils/storage";
import { boltWeight } from "../../utils/calc";

export default function PlateBoltsEditor({ row, onChange }) {
  const bolts = row.plateBolts || [];
  const setBolts = (list) => onChange({ ...row, plateBolts: list });
  const setBolt = (id, patch) =>
    setBolts(bolts.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  return (
    <div className="space-y-1.5 border-t border-steel-200 pt-1.5">
      <p className="text-xs font-bold text-steel-600">
        Additional Bolts for Connection Plate (optional)
      </p>

      {bolts.map((b) => {
        const w = boltWeight(b.d, b.l) * (Number(b.qty) || 0);
        return (
          <div key={b.id} className="space-y-1.5 rounded-lg bg-steel-50 p-2">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="field-label">Dia d (mm)</label>
                <input
                  type="number"
                  className="field-input"
                  value={b.d}
                  onChange={(e) => setBolt(b.id, { d: e.target.value })}
                />
              </div>
              <div>
                <label className="field-label">Length l (mm)</label>
                <input
                  type="number"
                  className="field-input"
                  value={b.l}
                  onChange={(e) => setBolt(b.id, { l: e.target.value })}
                />
              </div>
              <div>
                <label className="field-label">Qty</label>
                <input
                  type="number"
                  className="field-input"
                  value={b.qty}
                  onChange={(e) => setBolt(b.id, { qty: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-steel-600">
              <span>Weight: {w.toFixed(2)} KG</span>
              <button
                className="font-bold text-red-500"
                onClick={() => setBolts(bolts.filter((x) => x.id !== b.id))}
              >
                Remove Bolt
              </button>
            </div>
          </div>
        );
      })}

      <button
        className="btn-secondary w-full py-1.5 text-xs"
        onClick={() =>
          setBolts([...bolts, { id: newId(), d: "", l: "", qty: "" }])
        }
      >
        + Add Bolt
      </button>
    </div>
  );
}
