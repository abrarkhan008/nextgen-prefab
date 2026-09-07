import MicButton from "./MicButton";
import { computeItemAmount } from "../utils/calc";

let rowSeq = 0;
export function emptyItem() {
  rowSeq += 1;
  return {
    id: `row_${Date.now()}_${rowSeq}`,
    description: "",
    hsnCode: "",
    qty: "",
    unit: "KGS",
    weight: "", // ADD THIS
    rate: "",
    amount: 0,
    note: "",
  };
}

const UNITS = ["KGS", "NO'S", "RFT", "SFT", "MTR", "LTR", "DAYS", "SET"];

export default function ItemsTable({ items, onChange }) {
  const update = (id, patch) => {
    const next = items.map((it) => {
      if (it.id !== id) return it;
      const merged = { ...it, ...patch };
      merged.amount = computeItemAmount(merged);
      return merged;
    });
    onChange(next);
  };
  // const update = (id, patch) => {
  //   const next = items.map((it) => {
  //     if (it.id !== id) return it;
  //     const merged = { ...it, ...patch };
  //     merged.amount = computeItemAmount(merged);
  //     return merged;
  //   });
  //   onChange(next);
  // };

  const removeRow = (id) => onChange(items.filter((it) => it.id !== id));
  const addRow = () => onChange([...items, emptyItem()]);

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={item.id} className="card space-y-2">
          <div className="flex items-start gap-2">
            <span className="mt-2 text-xs font-bold text-steel-400">
              {idx + 1}
            </span>
            <div className="flex-1">
              <label className="field-label">Description / Category</label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <textarea
                    className="field-input resize-none"
                    rows={2}
                    placeholder="e.g. PUFF SHEET CEILING AND VERTICAL SUPPORT STRUCTURE"
                    value={item.description}
                    onChange={(e) =>
                      update(item.id, { description: e.target.value })
                    }
                  />

                  <MicButton
                    onResult={(text) =>
                      update(item.id, {
                        description: item.description
                          ? `${item.description} ${text}`
                          : text,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="field-label">HSN Code</label>
                  <input
                    className="field-input"
                    placeholder="HSN Code"
                    value={item.hsnCode || ""}
                    onChange={(e) =>
                      update(item.id, { hsnCode: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeRow(item.id)}
              className="mt-6 shrink-0 text-steel-400 hover:text-red-500"
              title="Remove row"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="field-label">Qty</label>
              <input
                type="number"
                inputMode="decimal"
                className="field-input"
                value={item.qty}
                onChange={(e) => update(item.id, { qty: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">Unit</label>
              <select
                className="field-input"
                value={item.unit}
                onChange={(e) => update(item.id, { unit: e.target.value })}
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
            {/* <div>
              <label className="field-label">Weight (KG)</label>

              <input
                type="number"
                inputMode="decimal"
                className="field-input"
                placeholder="0.00"
                value={item.weight}
                onChange={(e) =>
                  update(item.id, {
                    weight: e.target.value,
                  })
                }
              />
            </div> */}
            <div>
              <label className="field-label">Rate (₹)</label>
              <input
                type="number"
                inputMode="decimal"
                className="field-input"
                value={item.rate}
                onChange={(e) => update(item.id, { rate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="flex-1">
              <label className="field-label">
                Note (optional, for your terms/rules)
              </label>
              <div className="flex gap-2">
                <input
                  className="field-input"
                  placeholder="Add a note about this item"
                  value={item.note}
                  onChange={(e) => update(item.id, { note: e.target.value })}
                />
                <MicButton
                  onResult={(text) =>
                    update(item.id, {
                      note: item.note ? `${item.note} ${text}` : text,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-steel-50 px-3 py-2">
            <span className="text-xs font-semibold text-steel-500">AMOUNT</span>
            <span className="font-mono text-sm font-bold text-steel-800">
              ₹{" "}
              {Number(item.amount || 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      ))}

      <button type="button" onClick={addRow} className="btn-secondary w-full">
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
          <path
            d="M12 5v14M5 12h14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        Add Item
      </button>
    </div>
  );
}
