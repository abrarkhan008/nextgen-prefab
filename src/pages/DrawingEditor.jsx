// src/pages/DrawingEditor.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "../components/TopBar";
import {
  DrawingSheet,
  getSheetKeys,
  SHEET_LABELS,
} from "../components/DrawingSheets";
import { getCompany } from "../utils/company";
import {
  getDocument,
  saveDocument,
  getNextNumber,
  newId,
} from "../utils/storage";
import { downloadPdf, sharePdf } from "../utils/pdfActions";
import { drawingToPdf } from "../utils/drawingPdf";
import { defaultDrawing, EXTRA_KINDS, newExtra } from "../utils/drawing";

/* ---------- small form helpers ---------- */
function Txt({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <input
        className="field-input"
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
function Num({ label, value, onChange }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <input
        type="number"
        inputMode="decimal"
        className="field-input"
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value === "" ? "" : Number(e.target.value))
        }
      />
    </div>
  );
}
function Sel({ label, value, onChange, options }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <select
        className="field-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map(([v, t]) => (
          <option key={v} value={v}>
            {t}
          </option>
        ))}
      </select>
    </div>
  );
}
function NeedToggle({ label, value, onChange }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={value ? "btn-primary" : "btn-secondary"}
        >
          NEED
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={!value ? "btn-primary" : "btn-secondary"}
        >
          NOT NEED
        </button>
      </div>
    </div>
  );
}

const TABS = ["Details", "Openings", "Extras", "Preview"];

export default function DrawingEditor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [d, setD] = useState(() => {
    if (id && id !== "new") {
      const existing = getDocument(id);
      if (existing) return existing;
    }
    return defaultDrawing(newId(), "Q" + getNextNumber("drawing"));
  });
  const [tab, setTab] = useState("Details");
  const [sheet, setSheet] = useState("plan");
  const [msg, setMsg] = useState("");
  const [zoom, setZoom] = useState(false);
  const sheetsRef = useRef(null);
  const company = getCompany();

  const dirty = useRef(false);
  const change = (fn) => {
    dirty.current = true;
    setD(fn);
  };
  const up = (patch) => change((x) => ({ ...x, ...patch }));
  const addTo = (key, item) =>
    change((x) => ({ ...x, [key]: [...(x[key] || []), item] }));
  const patchIn = (key, itemId, patch) =>
    change((x) => ({
      ...x,
      [key]: x[key].map((i) => (i.id === itemId ? { ...i, ...patch } : i)),
    }));
  const removeFrom = (key, itemId) =>
    change((x) => ({ ...x, [key]: x[key].filter((i) => i.id !== itemId) }));

  // Home and History read d.client.name, so store it in that shape
  const toSave = (x) => ({
    ...x,
    client: { name: x.clientName },
    title: `${x.buildingName} - ${x.clientName}`,
  });

  // Auto-save like the Decking page
  useEffect(() => {
    if (!dirty.current) return;
    saveDocument(toSave(d));
    if (id === "new") navigate(`/drawing/${d.id}`, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d]);

  const keys = getSheetKeys(d);
  const activeSheet = keys.includes(sheet) ? sheet : "plan";

  const flash = (t) => {
    setMsg(t);
    setTimeout(() => setMsg(""), 1800);
  };

  const save = () => {
    saveDocument(toSave(d));
    if (id === "new") navigate(`/drawing/${d.id}`, { replace: true });
    flash("✓ Saved");
  };

  const makePdf = async () => {
    const svgs = [...sheetsRef.current.querySelectorAll("svg")];
    return drawingToPdf(svgs);
  };
  const fileName = () =>
    `${d.docNo || "Drawing"}_${(d.clientName || "Drawing").replace(
      /\s+/g,
      "_",
    )}_R${d.rev}.pdf`;

  const onDownload = async () => {
    save();
    flash("Preparing PDF…");
    await downloadPdf(await makePdf(), fileName());
  };
  const onShare = async () => {
    save();
    flash("Preparing PDF…");
    await sharePdf(await makePdf(), fileName());
  };

  return (
    <div className="min-h-full bg-steel-50 pb-28">
      <TopBar title="PEB Drawing" subtitle={`${d.docNo} • Rev ${d.rev}`} />

      {/* tabs */}
      <div className="sticky top-0 z-10 grid grid-cols-4 gap-1 bg-white p-2 shadow-sm">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={tab === t ? "btn-primary" : "btn-secondary"}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-4 p-4">
        {/* ============ DETAILS ============ */}
        {tab === "Details" && (
          <>
            <div className="card space-y-3">
              <p className="text-sm font-bold text-steel-800">Title Block</p>
              <div className="grid grid-cols-2 gap-3">
                <Txt
                  label="Drawing / Q No."
                  value={d.docNo}
                  onChange={(v) => up({ docNo: v })}
                />
                <Txt
                  label="Revision"
                  value={d.rev}
                  onChange={(v) => up({ rev: v })}
                />
              </div>
              <Txt
                label="Client Name"
                value={d.clientName}
                onChange={(v) => up({ clientName: v })}
              />
              <Txt
                label="Building Name"
                value={d.buildingName}
                onChange={(v) => up({ buildingName: v })}
              />
              <Txt
                label="Building Location"
                value={d.location}
                onChange={(v) => up({ location: v })}
              />
              <div className="grid grid-cols-2 gap-3">
                <Txt
                  label="Date"
                  value={d.date}
                  onChange={(v) => up({ date: v })}
                />
                <Txt
                  label="Scale"
                  value={d.scale}
                  onChange={(v) => up({ scale: v })}
                />
                <Txt
                  label="Drawn By"
                  value={d.drawnBy}
                  onChange={(v) => up({ drawnBy: v })}
                />
                <Txt
                  label="Design By"
                  value={d.designBy}
                  onChange={(v) => up({ designBy: v })}
                />
              </div>
              <Txt
                label="Format No. (top right)"
                value={d.formatNo}
                onChange={(v) => up({ formatNo: v })}
              />
            </div>

            <div className="card space-y-3">
              <p className="text-sm font-bold text-steel-800">
                Building Size (mm)
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Num
                  label="Length (outer to outer)"
                  value={d.length}
                  onChange={(v) => up({ length: v })}
                />
                <Num
                  label="Width (outer to outer)"
                  value={d.width}
                  onChange={(v) => up({ width: v })}
                />
                <Num
                  label="Clear / Eave Height"
                  value={d.clearHeight}
                  onChange={(v) => up({ clearHeight: v })}
                />
                <Num
                  label="No. of Bays"
                  value={d.bayCount}
                  onChange={(v) => up({ bayCount: v })}
                />
                <Num
                  label="Roof Slope (1 in ...)"
                  value={d.slope}
                  onChange={(v) => up({ slope: v })}
                />
                <Num
                  label="Purlin Row Spacing"
                  value={d.rowSpacing}
                  onChange={(v) => up({ rowSpacing: v })}
                />
                <Num
                  label="Brick Wall Height (0 = none)"
                  value={d.brickWall}
                  onChange={(v) => up({ brickWall: v })}
                />
                <Num
                  label="Canopy Height"
                  value={d.canopyHeight}
                  onChange={(v) => up({ canopyHeight: v })}
                />
              </div>
              <p className="text-xs text-steel-500">
                Bay width = Length ÷ Bays ={" "}
                {d.bayCount ? Math.round(d.length / d.bayCount) : "-"} mm
              </p>
            </div>

            <div className="card space-y-3">
              <p className="text-sm font-bold text-steel-800">Options</p>
              <NeedToggle
                label="Jack Beams"
                value={!!d.jackBeam}
                onChange={(v) => up({ jackBeam: v })}
              />
              <NeedToggle
                label="Cross Bracing labels"
                value={!!d.crossBracing}
                onChange={(v) => up({ crossBracing: v })}
              />
              <NeedToggle
                label="3D View sheet"
                value={!!d.show3d}
                onChange={(v) => up({ show3d: v })}
              />
              <div>
                <label className="field-label">Notes (one per line)</label>
                <textarea
                  className="field-input min-h-[90px]"
                  value={d.notes || ""}
                  onChange={(e) => up({ notes: e.target.value })}
                />
              </div>
            </div>
          </>
        )}

        {/* ============ OPENINGS + CANOPIES ============ */}
        {tab === "Openings" && (
          <>
            <div className="card space-y-3">
              <p className="text-sm font-bold text-steel-800">
                Framed Openings (doors / rolling shutters)
              </p>
              {(d.openings || []).map((o) => (
                <div
                  key={o.id}
                  className="space-y-2 rounded-lg border border-steel-200 p-3"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <Sel
                      label="Wall"
                      value={o.wall}
                      onChange={(v) => patchIn("openings", o.id, { wall: v })}
                      options={[
                        ["front", "Front (Line A)"],
                        ["back", "Back"],
                      ]}
                    />
                    <Num
                      label="Bay No."
                      value={o.bay}
                      onChange={(v) => patchIn("openings", o.id, { bay: v })}
                    />
                    <Num
                      label="Width"
                      value={o.width}
                      onChange={(v) => patchIn("openings", o.id, { width: v })}
                    />
                    <Num
                      label="Height"
                      value={o.height}
                      onChange={(v) => patchIn("openings", o.id, { height: v })}
                    />
                  </div>
                  <Txt
                    label="Label"
                    value={o.label}
                    onChange={(v) => patchIn("openings", o.id, { label: v })}
                  />
                  <button
                    className="btn-secondary w-full"
                    onClick={() => removeFrom("openings", o.id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
              <button
                className="btn-primary w-full"
                onClick={() =>
                  addTo("openings", {
                    id: newId(),
                    wall: "front",
                    bay: 2,
                    width: 4000,
                    height: 4000,
                    label: "F.O",
                  })
                }
              >
                + Add Opening
              </button>
            </div>

            <div className="card space-y-3">
              <p className="text-sm font-bold text-steel-800">Canopies</p>
              {(d.canopies || []).map((c) => (
                <div
                  key={c.id}
                  className="space-y-2 rounded-lg border border-steel-200 p-3"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <Sel
                      label="Side"
                      value={c.side}
                      onChange={(v) => patchIn("canopies", c.id, { side: v })}
                      options={[
                        ["front", "Front"],
                        ["back", "Back"],
                        ["left", "Left (full)"],
                        ["right", "Right (full)"],
                      ]}
                    />
                    <Num
                      label="Width (projection)"
                      value={c.width}
                      onChange={(v) => patchIn("canopies", c.id, { width: v })}
                    />
                    <Num
                      label="From Bay"
                      value={c.fromBay}
                      onChange={(v) =>
                        patchIn("canopies", c.id, { fromBay: v })
                      }
                    />
                    <Num
                      label="To Bay"
                      value={c.toBay}
                      onChange={(v) => patchIn("canopies", c.id, { toBay: v })}
                    />
                  </div>
                  <button
                    className="btn-secondary w-full"
                    onClick={() => removeFrom("canopies", c.id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
              <button
                className="btn-primary w-full"
                onClick={() =>
                  addTo("canopies", {
                    id: newId(),
                    side: "front",
                    fromBay: 2,
                    toBay: 3,
                    width: 3048,
                  })
                }
              >
                + Add Canopy
              </button>
            </div>
          </>
        )}

        {/* ============ EXTRAS ============ */}
        {tab === "Extras" && (
          <div className="card space-y-3">
            <p className="text-sm font-bold text-steel-800">
              Pillars, Staircase, Walkway, Pipe, Angle
            </p>
            <p className="text-xs text-steel-500">
              X = distance from left wall (grid 1). Y = distance from front wall
              (line A). Z = height above floor.
            </p>
            {(d.extras || []).map((e) => (
              <div
                key={e.id}
                className="space-y-2 rounded-lg border border-steel-200 p-3"
              >
                <div className="grid grid-cols-2 gap-2">
                  <Sel
                    label="Type"
                    value={e.kind}
                    onChange={(v) => patchIn("extras", e.id, { kind: v })}
                    options={Object.entries(EXTRA_KINDS).map(([k, v]) => [
                      k,
                      v.name,
                    ])}
                  />
                  <Txt
                    label="Name on drawing"
                    value={e.label}
                    onChange={(v) => patchIn("extras", e.id, { label: v })}
                  />
                  <Num
                    label="Length (along X)"
                    value={e.length}
                    onChange={(v) => patchIn("extras", e.id, { length: v })}
                  />
                  <Num
                    label="Width (along Y)"
                    value={e.width}
                    onChange={(v) => patchIn("extras", e.id, { width: v })}
                  />
                  <Num
                    label="Height"
                    value={e.height}
                    onChange={(v) => patchIn("extras", e.id, { height: v })}
                  />
                  <Num
                    label="Z (from floor)"
                    value={e.z}
                    onChange={(v) => patchIn("extras", e.id, { z: v })}
                  />
                  <Num
                    label="X position"
                    value={e.x}
                    onChange={(v) => patchIn("extras", e.id, { x: v })}
                  />
                  <Num
                    label="Y position"
                    value={e.y}
                    onChange={(v) => patchIn("extras", e.id, { y: v })}
                  />
                </div>
                <button
                  className="btn-secondary w-full"
                  onClick={() => removeFrom("extras", e.id)}
                >
                  Delete
                </button>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(EXTRA_KINDS).map(([k, v]) => (
                <button
                  key={k}
                  className="btn-primary"
                  onClick={() => addTo("extras", newExtra(k, newId))}
                >
                  + {v.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ============ PREVIEW ============ */}
        {tab === "Preview" && (
          <div className="space-y-3">
            <div className="flex gap-2">
              {keys.map((k) => (
                <button
                  key={k}
                  onClick={() => setSheet(k)}
                  className={`flex-1 ${
                    activeSheet === k ? "btn-primary" : "btn-secondary"
                  }`}
                >
                  {SHEET_LABELS[k]}
                </button>
              ))}
            </div>
            <button
              className="btn-secondary w-full"
              onClick={() => setZoom((z) => !z)}
            >
              {zoom ? "Fit to screen" : "Zoom in (scroll sideways)"}
            </button>
            <p className="text-xs text-steel-500">
              Found a mistake? Go back to Details / Openings / Extras, change
              it, and come back here.
            </p>
          </div>
        )}
      </div>

      {/* Sheets are always rendered (hidden unless on Preview) so the PDF can use them */}
      <div
        ref={sheetsRef}
        className={tab === "Preview" ? "overflow-x-auto px-2" : ""}
        style={
          tab === "Preview"
            ? {}
            : { position: "absolute", left: -99999, top: 0, width: 1190 }
        }
      >
        {keys.map((k, i) => (
          <div
            key={k}
            style={{
              display:
                tab === "Preview" && k !== activeSheet ? "none" : "block",
              width: tab === "Preview" && zoom ? 1100 : "100%",
              marginBottom: 12,
              border: "1px solid #ddd",
            }}
          >
            <DrawingSheet
              d={d}
              company={company}
              sheetKey={k}
              no={i + 1}
              total={keys.length}
            />
          </div>
        ))}
      </div>

      {/* bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-steel-100 bg-white p-3 safe-bottom">
        <div className="grid grid-cols-3 gap-2">
          <button onClick={save} className="btn-secondary">
            {msg || "Save"}
          </button>
          <button onClick={onDownload} className="btn-primary">
            PDF
          </button>
          <button onClick={onShare} className="btn-primary">
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
