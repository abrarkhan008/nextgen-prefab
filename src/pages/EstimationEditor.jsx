import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "../components/TopBar";
import ActionBar from "../components/ActionBar";
import {
  getDocument,
  saveDocument,
  newId,
  getNextNumber,
} from "../utils/storage";
import { getCompany } from "../utils/company";
import { generateEstimationPdf } from "../utils/pdf/estimationPdf";
import { downloadPdf, sharePdf } from "../utils/pdfActions";

const emptyEstItem = () => ({
  id: newId(),
  category: "",
  qty: "",
  unit: "RFT",
  rate: "",
  amount: 0,
});

const DEFAULT_NOTES = [
  "The above estimate is an approximate and may vary according to design, gauge, weight, and number of square feet.",
  "All ordered work that is not specified will be charged on actuals.",
  "70% of the contract price shall be payable before receipt of materials at site, 25% during work progress, and 5% after completion of work.",
  "Carpenter, painting, concrete (masonry) work, and earthwork are under the client's scope.",
  "Our offer is valid for 4 days from the date of receipt of this estimate.",
  "The above estimation is prepared based on the client's requirements.",
  "18% GST extra.",
];

function blankDoc() {
  return {
    id: newId(),
    type: "estimation",
    docNo: getNextNumber("estimation"),
    date: new Date().toISOString().slice(0, 10),
    client: { name: "", address: "" },
    items: [emptyEstItem()],
    designNote: "",
    materialUsed: "",
    notes: [...DEFAULT_NOTES],
  };
}

export default function EstimationEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc_, setDoc] = useState(blankDoc);
  const company = getCompany();

  useEffect(() => {
    if (id && id !== "new") {
      const existing = getDocument(id);
      if (existing) setDoc(existing);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const update = (patch) => setDoc((d) => ({ ...d, ...patch }));
  const updateClient = (patch) =>
    setDoc((d) => ({ ...d, client: { ...d.client, ...patch } }));

  const updateItem = (itemId, patch) =>
    setDoc((d) => ({
      ...d,
      items: d.items.map((it) => {
        if (it.id !== itemId) return it;
        const merged = { ...it, ...patch };
        merged.amount = (Number(merged.qty) || 0) * (Number(merged.rate) || 0);
        return merged;
      }),
    }));
  const addItem = () =>
    setDoc((d) => ({ ...d, items: [...d.items, emptyEstItem()] }));
  const removeItem = (itemId) =>
    setDoc((d) => ({ ...d, items: d.items.filter((it) => it.id !== itemId) }));

  const grandTotal = doc_.items.reduce(
    (s, it) => s + (Number(it.amount) || 0),
    0,
  );

  const linesToArray = (text) => (text || "").split("\n");
  const arrayToLines = (arr) => (arr || []).join("\n");

  const buildPdf = () =>
    generateEstimationPdf({ ...doc_, grandTotal }, getCompany());
  const filename = () =>
    `Estimation_${doc_.docNo}_${(doc_.client.name || "client").replace(
      /\s+/g,
      "_",
    )}.pdf`;

  const handleSave = () => {
    saveDocument(doc_);
    if (id === "new") navigate(`/estimation/${doc_.id}`, { replace: true });
    else alert("Estimation saved successfully");
  };
  const handleDownload = () => {
    saveDocument(doc_);
    downloadPdf(buildPdf(), filename());
  };
  const handleShare = async () => {
    saveDocument(doc_);
    await sharePdf(buildPdf(), filename());
  };

  return (
    <div className="min-h-full bg-steel-50 pb-28">
      <TopBar title="Estimation" subtitle={`E.O. No. ${doc_.docNo}`} />

      <div className="space-y-4 p-4">
        <div className="card grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">E.O. No</label>
            <input
              className="field-input"
              value={doc_.docNo}
              onChange={(e) => update({ docNo: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">Date</label>
            <input
              type="date"
              className="field-input"
              value={doc_.date}
              onChange={(e) => update({ date: e.target.value })}
            />
          </div>
        </div>

        <div className="card space-y-3">
          <p className="text-sm font-bold text-steel-800">Client</p>
          <div>
            <label className="field-label">Client Name</label>
            <input
              className="field-input"
              value={doc_.client.name}
              onChange={(e) => updateClient({ name: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">Address</label>
            <input
              className="field-input"
              value={doc_.client.address}
              onChange={(e) => updateClient({ address: e.target.value })}
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-bold text-steel-800">Items</p>
          </div>
          <div className="space-y-3">
            {doc_.items.map((it, idx) => (
              <div key={it.id} className="card space-y-2">
                <div className="flex items-start gap-2">
                  <span className="mt-2 text-xs font-bold text-steel-400">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <label className="field-label">
                      Category (with material)
                    </label>
                    <textarea
                      className="field-input resize-none"
                      rows={2}
                      placeholder="e.g. SS RAILING (304 GRADE)"
                      value={it.category}
                      onChange={(e) =>
                        updateItem(it.id, { category: e.target.value })
                      }
                    />
                  </div>
                  <button
                    className="mt-6 text-steel-400 hover:text-red-500"
                    onClick={() => removeItem(it.id)}
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="field-label">Qty</label>
                    <input
                      type="number"
                      className="field-input"
                      value={it.qty}
                      onChange={(e) =>
                        updateItem(it.id, { qty: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="field-label">Unit</label>
                    <input
                      className="field-input"
                      value={it.unit}
                      onChange={(e) =>
                        updateItem(it.id, { unit: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="field-label">Rate (₹)</label>
                    <input
                      type="number"
                      className="field-input"
                      value={it.rate}
                      onChange={(e) =>
                        updateItem(it.id, { rate: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-steel-50 px-3 py-2">
                  <span className="text-xs font-semibold text-steel-500">
                    AMOUNT
                  </span>
                  <span className="font-mono text-sm font-bold text-steel-800">
                    ₹{" "}
                    {Number(it.amount || 0).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            ))}
            <button className="btn-secondary w-full" onClick={addItem}>
              + Add Item
            </button>
          </div>
        </div>

        <div className="card">
          <label className="field-label">
            Design Note (shown next to total)
          </label>
          <input
            className="field-input"
            placeholder="e.g. Design : inner to inner design"
            value={doc_.designNote}
            onChange={(e) => update({ designNote: e.target.value })}
          />
        </div>

        <div className="card flex items-center justify-between">
          <span className="text-sm font-bold text-steel-800">TOTAL</span>
          <span className="font-mono text-base font-bold text-steel-900">
            ₹{" "}
            {Number(grandTotal || 0).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>

        <div className="card">
          <label className="field-label">Material Used</label>
          <textarea
            rows={3}
            className="field-input resize-none"
            value={doc_.materialUsed}
            onChange={(e) => update({ materialUsed: e.target.value })}
          />
        </div>

        <div className="card">
          <label className="field-label">
            Notes (one line = one numbered point)
          </label>
          <textarea
            rows={7}
            className="field-input resize-none"
            value={arrayToLines(doc_.notes)}
            onChange={(e) => update({ notes: linesToArray(e.target.value) })}
          />
        </div>
      </div>

      <ActionBar
        onSave={handleSave}
        onDownload={handleDownload}
        onShare={handleShare}
      />
    </div>
  );
}
