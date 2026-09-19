import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "../components/TopBar";
import ActionBar from "../components/ActionBar";
import PdfPreviewModal from "../components/PdfPreviewModal";
import { getDocument, saveDocument } from "../utils/storage";
import { getCompany } from "../utils/company";
import { downloadPdf, sharePdf } from "../utils/pdfActions";
import { generateDeckingPdf } from "../utils/pdf/deckingPdf";
import {
  normalizeDeckingDoc,
  buildDeckingSummary,
  fmtKg,
} from "../utils/decking";

export default function DeckingSummary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc_, setDoc] = useState(null);
  const [previewPdf, setPreviewPdf] = useState(null);

  useEffect(() => {
    const existing = getDocument(id);
    if (!existing) {
      navigate("/decking/new");
      return;
    }
    setDoc(normalizeDeckingDoc(existing));
  }, [id, navigate]);

  const summary = useMemo(
    () => (doc_ ? buildDeckingSummary(doc_) : null),
    [doc_],
  );

  if (!doc_ || !summary) return null;

  const filename = `Decking_${doc_.docNo || "draft"}_${(
    doc_.client?.name || "client"
  ).replace(/\s+/g, "_")}.pdf`;

  const buildPdf = () => generateDeckingPdf(doc_, getCompany());

  const filledSections = summary.sections.filter((s) => s.lines.length > 0);
  const hasAny = filledSections.length > 0;

  return (
    <div className="min-h-full bg-steel-50 pb-28">
      <TopBar
        title="Members Weight"
        subtitle={`Decking No. ${doc_.docNo || "-"}`}
      />

      <div className="space-y-3 p-4">
        <div className="card space-y-0.5">
          <p className="text-sm font-bold text-steel-800">
            {doc_.client?.name || "No client"}
          </p>
          {doc_.site && <p className="text-xs text-steel-500">{doc_.site}</p>}
          <p className="text-xs font-semibold text-steel-600">
            {summary.modeLabel}
          </p>
        </div>

        {!hasAny && (
          <div className="card text-center text-sm text-steel-400">
            No weights yet. Go back and fill in the Decking Sheet first.
          </div>
        )}

        {/* ---------- every section, row by row ---------- */}
        {filledSections.map((section) => (
          <div key={section.key} className="card space-y-2">
            <p className="text-sm font-bold text-steel-800">{section.title}</p>

            {section.lines.map((line, i) => (
              <div key={i} className="border-t border-steel-100 pt-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-steel-800">
                      {line.label}
                    </p>
                    <p className="text-xs text-steel-500">{line.detail}</p>
                  </div>
                  <span className="shrink-0 font-mono text-sm font-bold text-steel-900">
                    {fmtKg(line.weight)} KG
                  </span>
                </div>
                {line.parts.length > 1 &&
                  line.parts.map((p) => (
                    <div
                      key={p.label}
                      className="flex justify-between pl-3 text-xs text-steel-500"
                    >
                      <span>{p.label}</span>
                      <span className="font-mono">{fmtKg(p.weight)} KG</span>
                    </div>
                  ))}
              </div>
            ))}

            <div className="flex items-center justify-between rounded-lg bg-steel-100 px-3 py-2 text-xs font-bold text-steel-700">
              <span>Section Total</span>
              <span className="font-mono">{fmtKg(section.total)} KG</span>
            </div>
          </div>
        ))}

        {/* ---------- thickness-wise weight (2 mm, 6 mm ...) ---------- */}
        {summary.thicknessRows.length > 0 && (
          <div className="card space-y-2">
            <p className="text-sm font-bold text-steel-800">
              Thickness-wise Weight
            </p>
            <p className="text-xs text-steel-400">
              Plates, flanges, webs, tube walls and decking sheet grouped by
              thickness.
            </p>
            {summary.thicknessRows.map((r) => (
              <div
                key={r.label}
                className="flex items-center justify-between border-t border-steel-100 pt-2"
              >
                <span className="text-sm font-semibold text-steel-800">
                  {r.label}
                </span>
                <span className="font-mono text-sm font-bold text-steel-900">
                  {fmtKg(r.weight)} KG
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between rounded-lg bg-steel-100 px-3 py-2 text-xs font-bold text-steel-700">
              <span>Thickness-wise Total</span>
              <span className="font-mono">
                {fmtKg(summary.thicknessTotal)} KG
              </span>
            </div>
          </div>
        )}

        {/* ---------- rolled sections, bolts, studs ---------- */}
        {summary.otherRows.length > 0 && (
          <div className="card space-y-2">
            <p className="text-sm font-bold text-steel-800">
              Sections, Bolts &amp; Studs
            </p>
            {summary.otherRows.map((r) => (
              <div
                key={r.label}
                className="flex items-center justify-between border-t border-steel-100 pt-2"
              >
                <span className="text-sm font-semibold text-steel-800">
                  {r.label}
                </span>
                <span className="font-mono text-sm font-bold text-steel-900">
                  {fmtKg(r.weight)} KG
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between rounded-lg bg-steel-100 px-3 py-2 text-xs font-bold text-steel-700">
              <span>Sections, Bolts &amp; Studs Total</span>
              <span className="font-mono">{fmtKg(summary.otherTotal)} KG</span>
            </div>
          </div>
        )}

        {/* ---------- metal summary ---------- */}
        {hasAny && (
          <div className="card space-y-2 bg-steel-100">
            <p className="text-sm font-bold text-steel-900">Metal Summary</p>
            <div className="flex justify-between text-sm text-steel-700">
              <span>Thickness-wise material</span>
              <span className="font-mono">
                {fmtKg(summary.thicknessTotal)} KG
              </span>
            </div>
            <div className="flex justify-between text-sm text-steel-700">
              <span>Sections, bolts &amp; studs</span>
              <span className="font-mono">{fmtKg(summary.otherTotal)} KG</span>
            </div>
            <div className="flex items-center justify-between border-t border-steel-300 pt-2">
              <span className="text-sm font-bold text-steel-900">
                TOTAL WEIGHT
              </span>
              <span className="font-mono text-base font-bold text-steel-900">
                {fmtKg(summary.grandTotal)} KG
              </span>
            </div>
            <div className="flex justify-between text-xs text-steel-500">
              <span>In tonnes</span>
              <span className="font-mono">
                {(summary.grandTotal / 1000).toLocaleString("en-IN", {
                  minimumFractionDigits: 3,
                  maximumFractionDigits: 3,
                })}{" "}
                MT
              </span>
            </div>
          </div>
        )}

        <button
          type="button"
          className="btn-secondary w-full"
          onClick={() => navigate(`/decking/${id}`)}
        >
          ← Back to Decking Sheet
        </button>
      </div>

      <ActionBar
        onSave={async () => {
          saveDocument(doc_);
          alert("Saved");
        }}
        onPreview={async () => setPreviewPdf(buildPdf())}
        onDownload={async () => downloadPdf(buildPdf(), filename)}
        onShare={async () => sharePdf(buildPdf(), filename)}
      />

      <PdfPreviewModal
        pdf={previewPdf}
        filename={filename}
        onClose={() => setPreviewPdf(null)}
      />
    </div>
  );
}
