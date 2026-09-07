import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "../components/TopBar";
import { getDocument } from "../utils/storage";
import { getCompany } from "../utils/company";
import { downloadPdf } from "../utils/pdfActions";
import { generateMaterialListPdf } from "../utils/pdf/materialListPdf";
import { SECTIONS, SECTION_TYPES, blankWorkout } from "../utils/workout";
import { memberRows, plateWeight, round2, STEEL_DENSITY } from "../utils/calc";

function fmt(n) {
  return (Number(n) || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

export default function MaterialList() {
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

  // thickness(mm) -> { weight, pieces }
  const groups = {};
  const addToGroup = (thicknessMm, weight, pieces) => {
    if (!thicknessMm || !weight) return;
    const key = `${Number(thicknessMm)}mm`;
    if (!groups[key]) groups[key] = { weight: 0, pieces: 0 };
    groups[key].weight += weight;
    groups[key].pieces += pieces;
  };

  SECTIONS.forEach((section) => {
    if (section.type !== SECTION_TYPES.MEMBER) return;
    (doc_.workout[section.key] || []).forEach((row) => {
      const qty = Number(row.qty) || 0;
      const m = memberRows(row.label, row);

      addToGroup(row.flangeThick, m.flangeUnitWt * 2 * qty, qty * 2); // 2 flanges/member
      addToGroup(row.webThick, m.webUnitWt * qty, qty);

      if (row.plate) {
        const pQty = Number(row.plate.qty) || 0;
        const pw = plateWeight(
          row.plate.width,
          row.plate.length,
          row.plate.thickness,
          Number(row.plate.density) || STEEL_DENSITY,
        );
        addToGroup(row.plate.thickness, pw * pQty, pQty);
      }
    });
  });

  const sortedKeys = Object.keys(groups).sort(
    (a, b) => parseFloat(a) - parseFloat(b),
  );
  const grandTotal = sortedKeys.reduce((s, k) => s + groups[k].weight, 0);

  // ---- FIX: this used to just call window.print(), which on mobile
  // browsers often does nothing useful (no print driver / silently
  // fails). Now it builds a real PDF with jsPDF, same as every other
  // "Download" button in the app, and saves it to the device.
  const handleDownloadPdf = () => {
    const rows = sortedKeys.map((k) => ({
      label: `${k} Plate`,
      pieces: groups[k].pieces,
      weight: groups[k].weight,
    }));
    const pdf = generateMaterialListPdf(doc_, rows, grandTotal, getCompany());
    downloadPdf(pdf, `Material_List_${doc_.docNo || "quotation"}.pdf`);
  };

  return (
    <div className="min-h-full bg-steel-50 pb-28">
      <TopBar title="Material List" subtitle={`Quotation No. ${doc_.docNo}`} />
      <div className="space-y-2 p-4">
        <p className="text-xs text-steel-400">
          Grouped by plate/flange/web thickness — for factory material planning.
          Optional, print for reference only.
        </p>
        {sortedKeys.length === 0 && (
          <div className="card text-center text-sm text-steel-400">
            No thickness data yet. Fill in the PEB Workout first.
          </div>
        )}
        {sortedKeys.map((k) => (
          <div key={k} className="card flex items-center justify-between py-2">
            <span className="text-sm font-semibold text-steel-800">
              {k} Plate — {round2(groups[k].weight)}kg × {groups[k].pieces} pcs
            </span>
            <span className="font-mono text-sm font-bold text-steel-900">
              {fmt(groups[k].weight)} KG
            </span>
          </div>
        ))}
        {sortedKeys.length > 0 && (
          <div className="card flex items-center justify-between bg-steel-100">
            <span className="text-sm font-bold text-steel-900">TOTAL</span>
            <span className="font-mono text-base font-bold text-steel-900">
              {fmt(grandTotal)} KG
            </span>
          </div>
        )}
        <button className="btn-secondary w-full" onClick={handleDownloadPdf}>
          ⬇️ Download Material List (PDF)
        </button>
        <button
          className="btn-secondary w-full"
          onClick={() => navigate(`/quotation/${id}`)}
        >
          Continue to Quotation →
        </button>
      </div>
    </div>
  );
}
