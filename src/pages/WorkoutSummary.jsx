import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "../components/TopBar";
import { getDocument } from "../utils/storage";
import {
  SECTIONS,
  SECTION_TYPES,
  memberRowWeight,
  rateRowWeight,
  blankWorkout,
} from "../utils/workout";
import { bracingTotalWeight, purlinSectionWeight } from "../utils/calc";

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

export default function WorkoutSummary() {
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

  const lines = [];

  const fb = foundationBoltTotalWeight(doc_.project.foundationBolt);
  if (fb) lines.push({ label: "FOUNDATION BOLTS", weight: fb });

  SECTIONS.forEach((section) => {
    (doc_.workout[section.key] || []).forEach((row) => {
      const weight =
        section.type === SECTION_TYPES.MEMBER
          ? memberRowWeight(row)
          : section.type === SECTION_TYPES.BRACING
          ? bracingTotalWeight(row)
          : rateRowWeight(row);
      if (weight) lines.push({ label: row.label || section.prefix, weight });
    });
  });
  const purlinW = purlinTotalWeight(doc_.project.purlin);
  if (purlinW) lines.push({ label: "PURLIN", weight: purlinW });

  const grandTotal = lines.reduce((s, l) => s + l.weight, 0);

  return (
    <div className="min-h-full bg-steel-50 pb-28">
      <TopBar
        title="Workout Summary"
        subtitle={`Quotation No. ${doc_.docNo}`}
      />
      <div className="space-y-2 p-4">
        {lines.length === 0 && (
          <div className="card text-center text-sm text-steel-400">
            No weights yet. Fill in the PEB Workout first.
          </div>
        )}
        {lines.map((l, i) => (
          <div key={i} className="card flex items-center justify-between py-2">
            <span className="text-sm font-semibold text-steel-800">
              {l.label}
            </span>
            <span className="font-mono text-sm font-bold text-steel-900">
              {fmt(l.weight)} KG
            </span>
          </div>
        ))}
        {lines.length > 0 && (
          <div className="card flex items-center justify-between bg-steel-100">
            <span className="text-sm font-bold text-steel-900">TOTAL</span>
            <span className="font-mono text-base font-bold text-steel-900">
              {fmt(grandTotal)} KG
            </span>
          </div>
        )}
        <button
          className="btn-secondary w-full"
          onClick={() => navigate(`/quotation/${id}/materials`)}
        >
          View Material List →
        </button>
      </div>
    </div>
  );
}
