import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "../components/TopBar";
import { getDocument, saveDocument } from "../utils/storage";
import {
  BUILDING_TYPES,
  CONVENTIONAL_TYPES,
  DECK_SECTION_DEFS,
  blankDeckingDoc,
  normalizeDeckingDoc,
  buildDeckingSummary,
  createRow,
  getRows,
  setRowsIn,
  modeKey,
  fmtKg,
} from "../utils/decking";
import {
  FoundationBoltCard,
  BoltNutCard,
  StudCard,
  DeckSheetCard,
  PebMemberCard,
  SectionMemberCard,
  TubeMemberCard,
} from "../components/decking/DeckingCards";

const MODE_HINT = {
  peb: "PEB: built-up members (flange + web plates) with connection and gusset plates.",
  single:
    "Conventional single section: pick the section from the IS 808 steel table (MB, LB, WB, HB, SC, MC ...).",
  tubular:
    "Conventional tubular: square / rectangular tube or round pipe, weight from size, thickness and length.",
};

function loadDoc(id) {
  if (id && id !== "new") {
    const existing = getDocument(id);
    if (existing) return normalizeDeckingDoc(existing);
  }
  return blankDeckingDoc();
}

export default function DeckingEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc_, setDoc] = useState(() => loadDoc(id));
  const [saved, setSaved] = useState(false);

  // A brand-new document is only stored once something is typed, so opening
  // and leaving the page never leaves an empty entry in History.
  const dirty = useRef(false);
  const change = (updater) => {
    dirty.current = true;
    setDoc(updater);
  };

  useEffect(() => {
    if (id !== "new" && id !== doc_.id) {
      const existing = getDocument(id);
      if (existing) setDoc(normalizeDeckingDoc(existing));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Auto-save on every change (same behaviour as the PEB Workout page)
  useEffect(() => {
    if (!dirty.current) return;
    saveDocument(doc_);
    if (id === "new") navigate(`/decking/${doc_.id}`, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc_]);

  const update = (patch) => change((d) => ({ ...d, ...patch }));
  const updateClient = (patch) =>
    change((d) => ({ ...d, client: { ...d.client, ...patch } }));

  const addRow = (def) =>
    change((d) =>
      setRowsIn(d, def.key, [...getRows(d, def.key), createRow(def, d)]),
    );
  const removeRow = (key, rowId) =>
    change((d) =>
      setRowsIn(
        d,
        key,
        getRows(d, key).filter((r) => r.id !== rowId),
      ),
    );
  const updateRow = (key, rowId, updated) =>
    change((d) =>
      setRowsIn(
        d,
        key,
        getRows(d, key).map((r) => (r.id === rowId ? updated : r)),
      ),
    );

  const summary = useMemo(() => buildDeckingSummary(doc_), [doc_]);
  const mode = modeKey(doc_);

  const renderRow = (def, row) => {
    const props = {
      row,
      onChange: (updated) => updateRow(def.key, row.id, updated),
      onRemove: () => removeRow(def.key, row.id),
    };
    switch (def.kind) {
      case "foundationBolt":
        return <FoundationBoltCard key={row.id} {...props} />;
      case "stud":
        return <StudCard key={row.id} {...props} />;
      case "bolt":
        return <BoltNutCard key={row.id} {...props} />;
      case "deck":
        return <DeckSheetCard key={row.id} {...props} />;
      default:
        if (mode === "peb") return <PebMemberCard key={row.id} {...props} />;
        if (mode === "single")
          return <SectionMemberCard key={row.id} {...props} />;
        return <TubeMemberCard key={row.id} {...props} />;
    }
  };

  const handleSave = () => {
    saveDocument(doc_);
    if (id === "new") navigate(`/decking/${doc_.id}`, { replace: true });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const openSummary = () => {
    saveDocument(doc_);
    navigate(`/decking/${doc_.id}/summary`);
  };

  const typeBtn = (active) => (active ? "btn-primary" : "btn-secondary");

  return (
    <div className="min-h-full bg-steel-50 pb-28">
      <TopBar
        title="Decking Sheet"
        subtitle={`Decking No. ${doc_.docNo || "-"}`}
      />

      <div className="space-y-4 p-4">
        {/* ---------- document details ---------- */}
        <div className="card grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">Decking No</label>
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
          <div className="col-span-2">
            <label className="field-label">Client Name</label>
            <input
              className="field-input"
              value={doc_.client.name}
              onChange={(e) => updateClient({ name: e.target.value })}
            />
          </div>
          <div className="col-span-2">
            <label className="field-label">Site / Place</label>
            <input
              className="field-input"
              value={doc_.site}
              onChange={(e) => update({ site: e.target.value })}
            />
          </div>
        </div>

        {/* ---------- building type ---------- */}
        <div className="card space-y-3">
          <p className="text-sm font-bold text-steel-800">Building Type</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className={typeBtn(doc_.buildingType === BUILDING_TYPES.PEB)}
              onClick={() => update({ buildingType: BUILDING_TYPES.PEB })}
            >
              PEB
            </button>
            <button
              type="button"
              className={typeBtn(
                doc_.buildingType === BUILDING_TYPES.CONVENTIONAL,
              )}
              onClick={() =>
                update({ buildingType: BUILDING_TYPES.CONVENTIONAL })
              }
            >
              Conventional
            </button>
          </div>

          {doc_.buildingType === BUILDING_TYPES.CONVENTIONAL && (
            <div>
              <label className="field-label">Conventional Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className={typeBtn(
                    doc_.conventionalType === CONVENTIONAL_TYPES.SINGLE,
                  )}
                  onClick={() =>
                    update({ conventionalType: CONVENTIONAL_TYPES.SINGLE })
                  }
                >
                  Single Section
                </button>
                <button
                  type="button"
                  className={typeBtn(
                    doc_.conventionalType === CONVENTIONAL_TYPES.TUBULAR,
                  )}
                  onClick={() =>
                    update({ conventionalType: CONVENTIONAL_TYPES.TUBULAR })
                  }
                >
                  Tubular (Pipe)
                </button>
              </div>
            </div>
          )}
          <p className="text-xs text-steel-400">{MODE_HINT[mode]}</p>
        </div>

        {/* ---------- sections ---------- */}
        {DECK_SECTION_DEFS.map((def, idx) => {
          const rows = getRows(doc_, def.key);
          const total = summary.sections.find((s) => s.key === def.key)?.total;
          return (
            <div key={def.key} className="card space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-steel-800">
                  {idx + 1}. {def.title}
                </p>
                <button
                  type="button"
                  className="btn-secondary px-3 py-1 text-xs"
                  onClick={() => addRow(def)}
                >
                  + Add
                </button>
              </div>

              {rows.length === 0 && (
                <p className="text-xs text-steel-400">
                  No rows yet. Tap + Add.
                </p>
              )}

              {rows.map((row) => renderRow(def, row))}

              <div className="rounded-lg bg-steel-100 px-3 py-2 text-xs font-bold text-steel-700">
                Section Total: {fmtKg(total)} KG
              </div>
            </div>
          );
        })}

        <div className="card flex items-center justify-between">
          <span className="text-sm font-bold text-steel-800">
            Total Weight (all sections)
          </span>
          <span className="font-mono text-base font-bold text-steel-900">
            {fmtKg(summary.grandTotal)} KG
          </span>
        </div>
      </div>

      {/* ---------- bottom bar: same for PEB and Conventional ---------- */}
      <div className="fixed bottom-0 left-0 right-0 grid grid-cols-2 gap-2 border-t border-steel-100 bg-white p-3 safe-bottom">
        <button type="button" className="btn-secondary" onClick={handleSave}>
          {saved ? "✓ Saved" : "💾 Save"}
        </button>
        <button type="button" className="btn-accent" onClick={openSummary}>
          🏗 Members Weight
        </button>
      </div>
    </div>
  );
}
