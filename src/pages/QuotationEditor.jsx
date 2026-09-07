import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "../components/TopBar";
import ActionBar from "../components/ActionBar";
import ItemsTable, { emptyItem } from "../components/ItemsTable";
import MemberFields from "../components/MemberFields";
import MicButton from "../components/MicButton";
import {
  getDocument,
  saveDocument,
  newId,
  getNextNumber,
} from "../utils/storage";
import { getCompany } from "../utils/company";
import { generateQuotationPdf } from "../utils/pdf/quotationPdf";
import { blankWorkout } from "../utils/workout";
import { downloadPdf, sharePdf } from "../utils/pdfActions";
import {
  memberRows,
  sumItems,
  gstSummary,
  BRACING_TYPES,
  bracingUnitWeight,
  bracingTotalWeight,
  purlinSectionWeight,
} from "../utils/calc";

const emptyMember = () => ({
  flangeWidth: "",
  flangeThick: "",
  webWidth: "",
  webThick: "",
  length: "",
  qty: "",
});

// =====================================================================
// WEIGHT FORMULAS
// =====================================================================

// Single plate weight (kg) = Width(mm) x Length(m) x Thickness(mm) x 0.00785 x Qty
function plateWeight(p) {
  const w = Number(p?.width) || 0;
  const l = Number(p?.length) || 0;
  const t = Number(p?.thickness) || 0;
  const qty = Number(p?.qty) || 0;
  return w * l * t * 0.00785 * qty;
}

// Generic rate-based weight (kg) = Qty x Weight-per-unit(kg)
function rateItemWeight(r) {
  const qty = Number(r?.qty) || 0;
  const rate = Number(r?.weightPerUnit) || 0;
  return qty * rate;
}

// Purlin: kg/m x length(m) x qty
// Purlin (Z/C section): 2 flanges + web + 2 lips, computed in calc.js
function purlinTotalWeight(p) {
  return purlinSectionWeight(p).totalWeight;
}

// Foundation Bolt: pedestals x bolts-per-pedestal x weight-per-bolt(kg)
function foundationBoltTotalWeight(f) {
  const pedestals = Number(f?.pedestals) || 0;
  const boltsPerPedestal = Number(f?.boltsPerPedestal) || 0;
  const boltWeight = Number(f?.boltWeight) || 0;
  return pedestals * boltsPerPedestal * boltWeight;
}

const PURLIN_TYPES = ["Z-Purlin", "C-Purlin"];

// Same default text used by the PDF generator, kept here so the form
// starts pre-filled with the same words you already see in output.pdf.
// Edit these three arrays if you want the DEFAULT wording (for every
// new quotation) to be different.
const DEFAULT_OUR_SCOPE = [
  "Fabrication and erection of PEB structure.",
  "Bed bolts fixing work as per foundation drawing.",
  "Loading of material in factory.",
  "Tools & Machinery's.",
  "Installation work with crane.",
  "One coat yellow primer and enamel paint.",
  "Supply of required material.",
];

const DEFAULT_CLIENT_SCOPE = [
  "Accommodation in Site.",
  "Power and Water.",
  "All Civil Works. (Site clear, Floor leveling, Civil foundation).",
  "Electrical lights for working area need to be provided if required.",
  "Necessary Statutory Approvals.",
  "Any Testing of Materials is Your Scope.",
];

const DEFAULT_PAYMENT_TERMS = [
  "Advance of 60% along with the Work order.",
  "After quality inspection material will be dispatched from factory; before dispatch, 25% to be released.",
  "10% payment will be released during erection work under progress.",
  "5% as Final Payment after sheet fixing completed.",
];

const emptyPlateRow = () => ({
  id: newId(),
  label: "",
  width: "",
  length: "",
  thickness: "",
  qty: "",
});

const emptyMemberRow = () => ({
  id: newId(),
  label: "",
  ...emptyMember(),
});

const emptyRateRow = () => ({
  id: newId(),
  label: "",
  qty: "",
  unit: "NOS",
  weightPerUnit: "",
});

// ---- Bracing row (Rod / Pipe / Rope) ----
const emptyBracingRow = () => ({
  id: newId(),
  type: "Rod Bracing",
  label: "",
  size: "",
  thickness: "",
  qty: "",
});

// Turn a textarea's raw text into a clean array of lines for storage,
// and back again for display. Kept simple on purpose.
const linesToArray = (text) => (text || "").split("\n");
const arrayToLines = (arr) => (arr || []).join("\n");
const cleanLines = (arr) => (arr || []).map((l) => l.trim()).filter(Boolean);

function blankSpecs() {
  return {
    polycarbonateSheet: "CONSIDERED",
    rollingShutter: "NOT CONSIDERED",
    msGrill: "NOT CONSIDERED",
    canopyWidth: "",
    gutterDownTake: "CONSIDERED",
    flashing: "CONSIDERED",
    roofSheet: "",
    wallSheet: "",
    canopyLength: "",
    baySpacing: "",
    craneBeams: "NOT CONSIDERED",
    intermediateColumn: "NOT CONSIDERED",
    mezzanineLeanth: "N/A",
    mezzanineSpan: "N/A",
    mezzanineHeight: "N/A",
    eaveHeight: "",
    shedModel: "",
    wallHeight: "",
    leanth: "",
    span: "",
  };
}

function blankDoc() {
  return {
    id: newId(),
    type: "quotation",
    docNo: getNextNumber("quotation"),
    rev: "00",
    date: new Date().toISOString().slice(0, 10),
    woNo: "",
    client: { name: "", gstNo: "", address: "" },

    // ---- NEW: these feed PAGE 1 & 2 of the PDF (cover + cover letter) ----
    siteLocation: "",
    contactPerson: "",
    contactMobile: "",
    contactEmail: "",
    scopeOfWorkLine: "Making & Installation of Pre-engineered Building.",

    project: {
      place: "",
      length: "",
      width: "",
      height: "",
      pillars: { c1: emptyMember(), c2: emptyMember(), c3: emptyMember() },
      rafters: {
        r1: emptyMember(),
        r2: emptyMember(),
        r3: emptyMember(),
        r4: emptyMember(),
        r5: emptyMember(),
      },
      members: [],
      plates: [],
      purlin: {
        type: "Z-Purlin",
        flangeWidth: "",
        webWidth: "",
        lipWidth: "",
        thickness: "",
        length: "",
        qty: "",
        density: "0.00785",
      },
      foundationBolt: {
        pedestals: "",
        boltsPerPedestal: "",
        boltWeight: "",
      },
      rateItems: [],
      bracingItems: [],
      cladding: { type: "2C (Two-side coated) Cladding", notes: "" },
      workout: blankWorkout(),
    },

    // ---- NEW: feeds PAGE 3 (Specifications) of the PDF ----
    specs: blankSpecs(),

    // ---- NEW: feeds PAGE 5 (Scope / Payment Terms) of the PDF ----
    ourScope: [...DEFAULT_OUR_SCOPE],
    clientScope: [...DEFAULT_CLIENT_SCOPE],
    paymentTerms: [...DEFAULT_PAYMENT_TERMS],

    steelRate: "62.5",
    applyGst: false,
    items: [emptyItem()],
    notes: "",
  };
}

export default function QuotationEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc_, setDoc] = useState(blankDoc);
  const company = getCompany();

  useEffect(() => {
    if (id && id !== "new") {
      const existing = getDocument(id);
      if (existing) {
        // Backfill any field that didn't exist yet on old saved documents,
        // so opening an old quotation never crashes the new form.
        setDoc({
          ...existing,
          rev: existing.rev || "00",
          siteLocation: existing.siteLocation ?? "",
          contactPerson: existing.contactPerson ?? "",
          contactMobile: existing.contactMobile ?? "",
          contactEmail: existing.contactEmail ?? "",
          scopeOfWorkLine:
            existing.scopeOfWorkLine ??
            "Making & Installation of Pre-engineered Building.",
          specs: { ...blankSpecs(), ...existing.specs },
          workout: { ...blankWorkout(), ...existing.workout },
          ourScope: existing.ourScope?.length
            ? existing.ourScope
            : [...DEFAULT_OUR_SCOPE],
          clientScope: existing.clientScope?.length
            ? existing.clientScope
            : [...DEFAULT_CLIENT_SCOPE],
          paymentTerms: existing.paymentTerms?.length
            ? existing.paymentTerms
            : [...DEFAULT_PAYMENT_TERMS],
          project: {
            members: [],
            plates: [],
            rateItems: [],
            bracingItems: [],
            ...existing.project,
          },
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const update = (patch) => setDoc((d) => ({ ...d, ...patch }));
  const updateClient = (patch) =>
    setDoc((d) => ({ ...d, client: { ...d.client, ...patch } }));
  const updateProject = (patch) =>
    setDoc((d) => ({ ...d, project: { ...d.project, ...patch } }));
  const updateSpecs = (patch) =>
    setDoc((d) => ({ ...d, specs: { ...d.specs, ...patch } }));
  const updatePillar = (key, val) =>
    updateProject({ pillars: { ...doc_.project.pillars, [key]: val } });
  const updateRafter = (key, val) =>
    updateProject({ rafters: { ...doc_.project.rafters, [key]: val } });
  const updatePurlin = (patch) =>
    updateProject({ purlin: { ...doc_.project.purlin, ...patch } });
  const updateFoundationBolt = (patch) =>
    updateProject({
      foundationBolt: { ...doc_.project.foundationBolt, ...patch },
    });

  // Auto-fill Specifications (page 3) from Building Dimensions (page 1
  // of the form) the first time each spec field is still empty. This is
  // the "take a few automatically, like height" behaviour you asked for.
  // If the user types their own value into the Specifications box later,
  // it will NOT be overwritten again.
  useEffect(() => {
    setDoc((d) => {
      const specs = { ...d.specs };
      let changed = false;
      if (!specs.leanth && d.project.length) {
        specs.leanth = d.project.length;
        changed = true;
      }
      if (!specs.span && d.project.width) {
        specs.span = d.project.width;
        changed = true;
      }
      if (!specs.eaveHeight && d.project.height) {
        specs.eaveHeight = d.project.height;
        changed = true;
      }
      return changed ? { ...d, specs } : d;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc_.project.length, doc_.project.width, doc_.project.height]);

  // ---------- generic list helpers (members / plates / rateItems / bracingItems) ----------
  const addRow = (listKey, factory) =>
    updateProject({ [listKey]: [...(doc_.project[listKey] || []), factory()] });
  const removeRow = (listKey, id_) =>
    updateProject({
      [listKey]: doc_.project[listKey].filter((r) => r.id !== id_),
    });
  const updateRow = (listKey, id_, patch) =>
    updateProject({
      [listKey]: doc_.project[listKey].map((r) =>
        r.id === id_ ? { ...r, ...patch } : r,
      ),
    });

  // ---------- "add computed weight to items" actions ----------

  const addMemberToItems = (label, member) => {
    const r = memberRows(label, member);
    if (!r.totalWeight) {
      alert("Fill flange/web width, thickness, length and qty first.");
      return;
    }
    const row = emptyItem();
    row.description = `${label} - Flange ${member.flangeWidth}x${member.flangeThick}mm, Web ${member.webWidth}x${member.webThick}mm, L=${member.length}m x Qty ${member.qty}`;
    row.qty = r.totalWeight;
    row.unit = "KGS";
    row.rate = doc_.steelRate || 0;
    row.amount = Number(row.qty) * Number(row.rate);
    update({ items: [...doc_.items, row] });
  };

  const addMemberRowToItems = (m) => addMemberToItems(m.label || "MEMBER", m);

  const addPlateRowToItems = (p) => {
    const w = plateWeight(p);
    if (!w) {
      alert("Fill plate width, length, thickness and qty first.");
      return;
    }
    const row = emptyItem();
    row.description = `${p.label || "PLATE"} - ${p.width}mm x ${p.length}m x ${
      p.thickness
    }mm x Qty ${p.qty}`;
    row.qty = w;
    row.unit = "KGS";
    row.rate = doc_.steelRate || 0;
    row.amount = Number(row.qty) * Number(row.rate);
    update({ items: [...doc_.items, row] });
  };

  const addRateRowToItems = (r) => {
    const w = rateItemWeight(r);
    if (!w) {
      alert("Fill qty and weight per unit first.");
      return;
    }
    const row = emptyItem();
    row.description = `${r.label || "ITEM"} - ${r.qty} ${r.unit} x ${
      r.weightPerUnit
    } kg/${r.unit}`;
    row.qty = w;
    row.unit = "KGS";
    row.rate = doc_.steelRate || 0;
    row.amount = Number(row.qty) * Number(row.rate);
    update({ items: [...doc_.items, row] });
  };

  // Rod Bracing: weight = size^2 / 162
  // Pipe Bracing: weight = 0.02466 x thickness x (size - thickness)
  // Rope Bracing: weight = size^2 x 0.004
  const addBracingRowToItems = (b) => {
    const w = bracingTotalWeight(b);
    if (!w) {
      alert(
        b.type === "Pipe Bracing"
          ? "Fill size (OD), thickness and qty first."
          : "Fill size and qty first.",
      );
      return;
    }
    const detail =
      b.type === "Pipe Bracing"
        ? `${b.size}mm OD x ${b.thickness}mm thick`
        : `${b.size}mm dia`;
    const row = emptyItem();
    row.description = `${b.label || b.type.toUpperCase()} (${
      b.type
    }) - ${detail} x Qty ${b.qty}`;
    row.qty = w;
    row.unit = "KGS";
    row.rate = doc_.steelRate || 0;
    row.amount = Number(row.qty) * Number(row.rate);
    update({ items: [...doc_.items, row] });
  };

  const addPurlinToItems = () => {
    const p = doc_.project.purlin;
    const { totalWeight } = purlinSectionWeight(p);
    if (!totalWeight) {
      alert("Fill flange/web/lip width, thickness, length and qty first.");
      return;
    }
    const row = emptyItem();
    row.description = `PURLIN (${p.type}) - Flange ${p.flangeWidth}mm x2, Web ${p.webWidth}mm, Lip ${p.lipWidth}mm x2, t=${p.thickness}mm, L=${p.length}m x Qty ${p.qty}`;
    row.qty = totalWeight;
    row.unit = "KGS";
    row.rate = doc_.steelRate || 0;
    row.amount = Number(row.qty) * Number(row.rate);
    update({ items: [...doc_.items, row] });
  };

  const addFoundationBoltToItems = () => {
    const f = doc_.project.foundationBolt;
    const w = foundationBoltTotalWeight(f);
    if (!w) {
      alert("Fill No. of Pedestals, Bolts per Pedestal and Bolt Weight first.");
      return;
    }
    const row = emptyItem();
    row.description = `FOUNDATION BOLT - ${f.pedestals} pedestals x ${f.boltsPerPedestal} bolts/pedestal x ${f.boltWeight}kg/bolt`;
    row.qty = w;
    row.unit = "KGS";
    row.rate = doc_.steelRate || 0;
    row.amount = Number(row.qty) * Number(row.rate);
    update({ items: [...doc_.items, row] });
  };

  const buildPdf = () =>
    generateQuotationPdf(
      {
        ...doc_,
        ourScope: cleanLines(doc_.ourScope),
        clientScope: cleanLines(doc_.clientScope),
        paymentTerms: cleanLines(doc_.paymentTerms),
      },
      getCompany(),
    );
  const filename = () =>
    `Quotation_${doc_.docNo}_${(doc_.client.name || "client").replace(
      /\s+/g,
      "_",
    )}.pdf`;

  const handleSave = async () => {
    saveDocument(doc_);
    if (id === "new") navigate(`/quotation/${doc_.id}`, { replace: true });
  };
  const handleDownload = async () => {
    saveDocument(doc_);
    downloadPdf(buildPdf(), filename());
  };
  const handleShare = async () => {
    saveDocument(doc_);
    await sharePdf(buildPdf(), filename());
  };

  const total = doc_.applyGst
    ? gstSummary(doc_.items, company.cgstPercent, company.sgstPercent)
        .grandTotal
    : sumItems(doc_.items);

  // Small reusable dropdown for the "CONSIDERED / NOT CONSIDERED" style
  // fields so the Specifications card below stays short and readable.
  const ConsideredSelect = ({ label, value, onChange }) => (
    <div>
      <label className="field-label">{label}</label>
      <select
        className="field-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="CONSIDERED">CONSIDERED</option>
        <option value="NOT CONSIDERED">NOT CONSIDERED</option>
      </select>
    </div>
  );

  return (
    <div className="min-h-full bg-steel-50 pb-28">
      <TopBar title="Quotation" subtitle={`Quotation No. ${doc_.docNo}`} />

      <div className="space-y-4 p-4">
        <button
          className="btn-secondary w-full"
          onClick={async () => {
            saveDocument(doc_);
            if (id === "new")
              navigate(`/quotation/${doc_.id}/workout`, { replace: true });
            else navigate(`/quotation/${id}/workout`);
          }}
        >
          📐 Open PEB Workout
        </button>
        <div className="card grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">Quotation No</label>
            <input
              className="field-input"
              value={doc_.docNo}
              onChange={(e) => update({ docNo: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">Rev</label>
            <input
              className="field-input"
              value={doc_.rev}
              onChange={(e) => update({ rev: e.target.value })}
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
          <div>
            <label className="field-label">W O No</label>
            <input
              className="field-input"
              value={doc_.woNo}
              onChange={(e) => update({ woNo: e.target.value })}
            />
          </div>
        </div>

        <div className="card space-y-3">
          <p className="text-sm font-bold text-steel-800">
            Client &amp; Project
          </p>
          <div>
            <label className="field-label">Client Name</label>
            <input
              className="field-input"
              value={doc_.client.name}
              onChange={(e) => updateClient({ name: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">Client GST No (optional)</label>
            <input
              className="field-input"
              value={doc_.client.gstNo}
              onChange={(e) => updateClient({ gstNo: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">Site / Place</label>
            <input
              className="field-input"
              value={doc_.project.place}
              onChange={(e) => updateProject({ place: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">
              Site Location shown on cover page (leave blank to reuse Site /
              Place above)
            </label>
            <input
              className="field-input"
              value={doc_.siteLocation}
              onChange={(e) => update({ siteLocation: e.target.value })}
            />
          </div>
        </div>

        {/* ================= NEW: Cover letter contact details ================= */}
        <div className="card space-y-3">
          <p className="text-sm font-bold text-steel-800">
            Cover Letter (Page 2 signature block)
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Contact Person</label>
              <input
                className="field-input"
                placeholder="e.g. RIZWAN"
                value={doc_.contactPerson}
                onChange={(e) => update({ contactPerson: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">Mobile</label>
              <input
                className="field-input"
                placeholder="e.g. 9844155244, 7411896336"
                value={doc_.contactMobile}
                onChange={(e) => update({ contactMobile: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="field-label">Email</label>
              <input
                className="field-input"
                value={doc_.contactEmail}
                onChange={(e) => update({ contactEmail: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="field-label">Scope of Work line</label>
              <input
                className="field-input"
                value={doc_.scopeOfWorkLine}
                onChange={(e) => update({ scopeOfWorkLine: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="card space-y-3">
          <p className="text-sm font-bold text-steel-800">
            Building Dimensions
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="field-label">Length (m)</label>
              <input
                type="number"
                className="field-input"
                value={doc_.project.length}
                onChange={(e) => updateProject({ length: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">Width (m)</label>
              <input
                type="number"
                className="field-input"
                value={doc_.project.width}
                onChange={(e) => updateProject({ width: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">Height (m)</label>
              <input
                type="number"
                className="field-input"
                value={doc_.project.height}
                onChange={(e) => updateProject({ height: e.target.value })}
              />
            </div>
          </div>
          <p className="text-xs text-steel-400">
            These auto-fill Leanth, Span and Eave Height in the Specifications
            card below the first time they're empty. Change them there any time
            to override.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-bold text-steel-800">Pillars (Columns)</p>
          {["c1", "c2", "c3"].map((k) => {
            const r = memberRows(
              `PILLAR ${k.toUpperCase()}`,
              doc_.project.pillars[k],
            );
            return (
              <div key={k} className="space-y-1.5">
                <MemberFields
                  label={`Pillar ${k.toUpperCase()}`}
                  value={doc_.project.pillars[k]}
                  onChange={(v) => updatePillar(k, v)}
                />
                <div className="rounded-lg bg-steel-50 px-3 py-2 text-xs font-semibold text-steel-600">
                  Computed Weight:{" "}
                  {(r.totalWeight || 0).toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                  })}{" "}
                  KG
                </div>
                <button
                  className="btn-secondary w-full py-1.5 text-xs"
                  onClick={() =>
                    addMemberToItems(
                      `PILLAR ${k.toUpperCase()}`,
                      doc_.project.pillars[k],
                    )
                  }
                >
                  + Add computed weight to items
                </button>
              </div>
            );
          })}
        </div>

        <div className="space-y-3">
          <p className="text-sm font-bold text-steel-800">Rafters</p>
          {["r1", "r2", "r3", "r4", "r5"].map((k) => {
            const r = memberRows(
              `RAFTER ${k.toUpperCase()}`,
              doc_.project.rafters[k],
            );
            return (
              <div key={k} className="space-y-1.5">
                <MemberFields
                  label={`Rafter ${k.toUpperCase()}`}
                  value={doc_.project.rafters[k]}
                  onChange={(v) => updateRafter(k, v)}
                />
                <div className="rounded-lg bg-steel-50 px-3 py-2 text-xs font-semibold text-steel-600">
                  Computed Weight:{" "}
                  {(r.totalWeight || 0).toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                  })}{" "}
                  KG
                </div>
                <button
                  className="btn-secondary w-full py-1.5 text-xs"
                  onClick={() =>
                    addMemberToItems(
                      `RAFTER ${k.toUpperCase()}`,
                      doc_.project.rafters[k],
                    )
                  }
                >
                  + Add computed weight to items
                </button>
              </div>
            );
          })}
        </div>

        {/* ================= Other Flange+Web Members ================= */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-steel-800">
              Other Members (Truss / Adapter / Beams)
            </p>
            <button
              className="btn-secondary px-3 py-1 text-xs"
              onClick={() => addRow("members", emptyMemberRow)}
            >
              + Add Member
            </button>
          </div>
          {(doc_.project.members || []).length === 0 && (
            <p className="text-xs text-steel-400">
              e.g. Adapter Truss 1, Adapter Truss 2, Canopy Rafter, Primary
              Beam, Secondary Beam
            </p>
          )}
          {(doc_.project.members || []).map((m) => {
            const r = memberRows(m.label || "MEMBER", m);
            return (
              <div
                key={m.id}
                className="space-y-1.5 rounded-lg border border-steel-200 p-2"
              >
                <div className="flex items-center gap-2">
                  <input
                    className="field-input flex-1"
                    placeholder="Label, e.g. ADAPTER TRUSS 1"
                    value={m.label}
                    onChange={(e) =>
                      updateRow("members", m.id, { label: e.target.value })
                    }
                  />
                  <button
                    className="text-xs font-bold text-red-500"
                    onClick={() => removeRow("members", m.id)}
                  >
                    Remove
                  </button>
                </div>
                <MemberFields
                  label={m.label || "Member"}
                  value={m}
                  onChange={(v) => updateRow("members", m.id, v)}
                />
                <div className="rounded-lg bg-steel-50 px-3 py-2 text-xs font-semibold text-steel-600">
                  Computed Weight:{" "}
                  {(r.totalWeight || 0).toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                  })}{" "}
                  KG
                </div>
                <button
                  className="btn-secondary w-full py-1.5 text-xs"
                  onClick={() => addMemberRowToItems(m)}
                >
                  + Add computed weight to items
                </button>
              </div>
            );
          })}
        </div>

        {/* ================= Plate Items ================= */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-steel-800">Plate Items</p>
            <button
              className="btn-secondary px-3 py-1 text-xs"
              onClick={() => addRow("plates", emptyPlateRow)}
            >
              + Add Plate
            </button>
          </div>
          {(doc_.project.plates || []).length === 0 && (
            <p className="text-xs text-steel-400">
              e.g. Pillar Bottom Plate, Top-to-Rafter Plate, Connection Plate,
              HR Plate
            </p>
          )}
          {(doc_.project.plates || []).map((p) => (
            <div
              key={p.id}
              className="space-y-1.5 rounded-lg border border-steel-200 p-2"
            >
              <div className="flex items-center gap-2">
                <input
                  className="field-input flex-1"
                  placeholder="Label, e.g. PILLAR BOTTOM PLATE"
                  value={p.label}
                  onChange={(e) =>
                    updateRow("plates", p.id, { label: e.target.value })
                  }
                />
                <button
                  className="text-xs font-bold text-red-500"
                  onClick={() => removeRow("plates", p.id)}
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="field-label">Width (mm)</label>
                  <input
                    type="number"
                    className="field-input"
                    value={p.width}
                    onChange={(e) =>
                      updateRow("plates", p.id, { width: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="field-label">Length (m)</label>
                  <input
                    type="number"
                    className="field-input"
                    value={p.length}
                    onChange={(e) =>
                      updateRow("plates", p.id, { length: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="field-label">Thickness (mm)</label>
                  <input
                    type="number"
                    className="field-input"
                    value={p.thickness}
                    onChange={(e) =>
                      updateRow("plates", p.id, { thickness: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="field-label">Qty</label>
                  <input
                    type="number"
                    className="field-input"
                    value={p.qty}
                    onChange={(e) =>
                      updateRow("plates", p.id, { qty: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="rounded-lg bg-steel-50 px-3 py-2 text-xs font-semibold text-steel-600">
                Computed Weight:{" "}
                {plateWeight(p).toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                })}{" "}
                KG
              </div>
              <button
                className="btn-secondary w-full py-1.5 text-xs"
                onClick={() => addPlateRowToItems(p)}
              >
                + Add computed weight to items
              </button>
            </div>
          ))}
        </div>

        <div className="card space-y-3">
          <p className="text-sm font-bold text-steel-800">
            Purlins &amp; Roof Cladding
          </p>
          <div>
            <label className="field-label">Purlin Type</label>
            <select
              className="field-input"
              value={doc_.project.purlin.type}
              onChange={(e) => updatePurlin({ type: e.target.value })}
            >
              {PURLIN_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="field-label">Flange Width (mm)</label>
              <input
                type="number"
                className="field-input"
                value={doc_.project.purlin.flangeWidth}
                onChange={(e) => updatePurlin({ flangeWidth: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">Web Width (mm)</label>
              <input
                type="number"
                className="field-input"
                value={doc_.project.purlin.webWidth}
                onChange={(e) => updatePurlin({ webWidth: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">Lip Width (mm)</label>
              <input
                type="number"
                className="field-input"
                value={doc_.project.purlin.lipWidth}
                onChange={(e) => updatePurlin({ lipWidth: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="field-label">Thickness (mm)</label>
              <input
                type="number"
                className="field-input"
                value={doc_.project.purlin.thickness}
                onChange={(e) => updatePurlin({ thickness: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">Length (m)</label>
              <input
                type="number"
                className="field-input"
                value={doc_.project.purlin.length}
                onChange={(e) => updatePurlin({ length: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">Qty</label>
              <input
                type="number"
                className="field-input"
                value={doc_.project.purlin.qty}
                onChange={(e) => updatePurlin({ qty: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="field-label">Density (edit if not 0.00785)</label>
            <input
              type="number"
              step="0.00001"
              className="field-input"
              value={doc_.project.purlin.density}
              onChange={(e) => updatePurlin({ density: e.target.value })}
            />
          </div>

          <div className="rounded-lg bg-steel-50 px-3 py-2 text-xs font-semibold text-steel-600">
            Computed Weight:{" "}
            {purlinTotalWeight(doc_.project.purlin).toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })}{" "}
            KG
          </div>
          <button
            className="btn-secondary w-full py-1.5 text-xs"
            onClick={addPurlinToItems}
          >
            + Add computed weight to items
          </button>

          <div>
            <label className="field-label">Roof Cladding (e.g. 2C sheet)</label>
            <input
              className="field-input"
              value={doc_.project.cladding.type}
              onChange={(e) =>
                updateProject({
                  cladding: { ...doc_.project.cladding, type: e.target.value },
                })
              }
            />
          </div>
        </div>

        <div className="card space-y-3">
          <p className="text-sm font-bold text-steel-800">Foundation Bolts</p>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="field-label">No. of Pedestals</label>
              <input
                type="number"
                inputMode="decimal"
                className="field-input"
                value={doc_.project.foundationBolt.pedestals}
                onChange={(e) =>
                  updateFoundationBolt({ pedestals: e.target.value })
                }
              />
            </div>
            <div>
              <label className="field-label">Bolts / Pedestal</label>
              <input
                type="number"
                inputMode="decimal"
                className="field-input"
                value={doc_.project.foundationBolt.boltsPerPedestal}
                onChange={(e) =>
                  updateFoundationBolt({ boltsPerPedestal: e.target.value })
                }
              />
            </div>
            <div>
              <label className="field-label">Weight / Bolt (kg)</label>
              <input
                type="number"
                inputMode="decimal"
                className="field-input"
                placeholder="e.g. 3.85"
                value={doc_.project.foundationBolt.boltWeight}
                onChange={(e) =>
                  updateFoundationBolt({ boltWeight: e.target.value })
                }
              />
            </div>
          </div>
          <div className="rounded-lg bg-steel-50 px-3 py-2 text-xs font-semibold text-steel-600">
            Computed Weight:{" "}
            {foundationBoltTotalWeight(
              doc_.project.foundationBolt,
            ).toLocaleString("en-IN", { maximumFractionDigits: 2 })}{" "}
            KG
          </div>
          <button
            className="btn-secondary w-full py-1.5 text-xs"
            onClick={addFoundationBoltToItems}
          >
            + Add computed weight to items
          </button>
        </div>

        {/* ================= NEW: Bracing (Rod / Pipe / Rope) ================= */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-steel-800">Bracing</p>
            <button
              className="btn-secondary px-3 py-1 text-xs"
              onClick={() => addRow("bracingItems", emptyBracingRow)}
            >
              + Add Bracing
            </button>
          </div>
          {(doc_.project.bracingItems || []).length === 0 && (
            <p className="text-xs text-steel-400">
              Choose Rod, Pipe or Rope Bracing below, then enter size / qty to
              compute weight automatically.
            </p>
          )}
          {(doc_.project.bracingItems || []).map((b) => {
            const unitWeight = bracingUnitWeight(b);
            const totalWeight = bracingTotalWeight(b);
            return (
              <div
                key={b.id}
                className="space-y-1.5 rounded-lg border border-steel-200 p-2"
              >
                <div className="flex items-center gap-2">
                  <input
                    className="field-input flex-1"
                    placeholder="Label, e.g. ROOF BRACING"
                    value={b.label}
                    onChange={(e) =>
                      updateRow("bracingItems", b.id, { label: e.target.value })
                    }
                  />
                  <button
                    className="text-xs font-bold text-red-500"
                    onClick={() => removeRow("bracingItems", b.id)}
                  >
                    Remove
                  </button>
                </div>

                <div>
                  <label className="field-label">Bracing Type</label>
                  <select
                    className="field-input"
                    value={b.type}
                    onChange={(e) =>
                      updateRow("bracingItems", b.id, { type: e.target.value })
                    }
                  >
                    {BRACING_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {b.type === "Pipe Bracing" ? (
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="field-label">Size / OD (mm)</label>
                      <input
                        type="number"
                        className="field-input"
                        value={b.size}
                        onChange={(e) =>
                          updateRow("bracingItems", b.id, {
                            size: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="field-label">Thickness (mm)</label>
                      <input
                        type="number"
                        className="field-input"
                        value={b.thickness}
                        onChange={(e) =>
                          updateRow("bracingItems", b.id, {
                            thickness: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="field-label">Qty</label>
                      <input
                        type="number"
                        className="field-input"
                        value={b.qty}
                        onChange={(e) =>
                          updateRow("bracingItems", b.id, {
                            qty: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="field-label">Size / Dia (mm)</label>
                      <input
                        type="number"
                        className="field-input"
                        value={b.size}
                        onChange={(e) =>
                          updateRow("bracingItems", b.id, {
                            size: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="field-label">Qty</label>
                      <input
                        type="number"
                        className="field-input"
                        value={b.qty}
                        onChange={(e) =>
                          updateRow("bracingItems", b.id, {
                            qty: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                )}

                <div className="rounded-lg bg-steel-50 px-3 py-2 text-xs font-semibold text-steel-600">
                  Weight / Piece:{" "}
                  {unitWeight.toLocaleString("en-IN", {
                    maximumFractionDigits: 3,
                  })}{" "}
                  KG &nbsp;|&nbsp; Total Weight:{" "}
                  {totalWeight.toLocaleString("en-IN", {
                    maximumFractionDigits: 2,
                  })}{" "}
                  KG
                </div>
                <button
                  className="btn-secondary w-full py-1.5 text-xs"
                  onClick={() => addBracingRowToItems(b)}
                >
                  + Add computed weight to items
                </button>
              </div>
            );
          })}
        </div>

        {/* ================= Generic Rate x Qty Weight Items ================= */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-steel-800">
              Cleats / Stiffeners / Sag Rods
            </p>
            <button
              className="btn-secondary px-3 py-1 text-xs"
              onClick={() => addRow("rateItems", emptyRateRow)}
            >
              + Add Item
            </button>
          </div>
          {(doc_.project.rateItems || []).length === 0 && (
            <p className="text-xs text-steel-400">
              e.g. Purlin Cleat, Stiffeners, Additional Plate, Sag Rods
            </p>
          )}
          {(doc_.project.rateItems || []).map((r) => (
            <div
              key={r.id}
              className="space-y-1.5 rounded-lg border border-steel-200 p-2"
            >
              <div className="flex items-center gap-2">
                <input
                  className="field-input flex-1"
                  placeholder="Label, e.g. PURLIN CLEAT"
                  value={r.label}
                  onChange={(e) =>
                    updateRow("rateItems", r.id, { label: e.target.value })
                  }
                />
                <button
                  className="text-xs font-bold text-red-500"
                  onClick={() => removeRow("rateItems", r.id)}
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="field-label">Qty</label>
                  <input
                    type="number"
                    className="field-input"
                    value={r.qty}
                    onChange={(e) =>
                      updateRow("rateItems", r.id, { qty: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="field-label">Unit</label>
                  <input
                    className="field-input"
                    placeholder="NOS / RMTR / RFT"
                    value={r.unit}
                    onChange={(e) =>
                      updateRow("rateItems", r.id, { unit: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="field-label">Weight / Unit (kg)</label>
                  <input
                    type="number"
                    className="field-input"
                    value={r.weightPerUnit}
                    onChange={(e) =>
                      updateRow("rateItems", r.id, {
                        weightPerUnit: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="rounded-lg bg-steel-50 px-3 py-2 text-xs font-semibold text-steel-600">
                Computed Weight:{" "}
                {rateItemWeight(r).toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                })}{" "}
                KG
              </div>
              <button
                className="btn-secondary w-full py-1.5 text-xs"
                onClick={() => addRateRowToItems(r)}
              >
                + Add computed weight to items
              </button>
            </div>
          ))}
        </div>

        {/* ================= NEW: Specifications (matches PDF page 3) ================= */}
        <div className="card space-y-3">
          <p className="text-sm font-bold text-steel-800">
            Specifications (Page 3 of PDF)
          </p>
          <div className="grid grid-cols-2 gap-3">
            <ConsideredSelect
              label="Polycarbonate Sheet"
              value={doc_.specs.polycarbonateSheet}
              onChange={(v) => updateSpecs({ polycarbonateSheet: v })}
            />
            <ConsideredSelect
              label="Rolling Shutter"
              value={doc_.specs.rollingShutter}
              onChange={(v) => updateSpecs({ rollingShutter: v })}
            />
            <ConsideredSelect
              label="MS Grill and Side Louvers"
              value={doc_.specs.msGrill}
              onChange={(v) => updateSpecs({ msGrill: v })}
            />
            <ConsideredSelect
              label="Gutter and Down Take Pipe"
              value={doc_.specs.gutterDownTake}
              onChange={(v) => updateSpecs({ gutterDownTake: v })}
            />
            <ConsideredSelect
              label="Flashing"
              value={doc_.specs.flashing}
              onChange={(v) => updateSpecs({ flashing: v })}
            />
            <ConsideredSelect
              label="Crane Beams"
              value={doc_.specs.craneBeams}
              onChange={(v) => updateSpecs({ craneBeams: v })}
            />
            <ConsideredSelect
              label="Intermediate Column"
              value={doc_.specs.intermediateColumn}
              onChange={(v) => updateSpecs({ intermediateColumn: v })}
            />
            <div>
              <label className="field-label">Canopy Width (MTR)</label>
              <input
                className="field-input"
                value={doc_.specs.canopyWidth}
                onChange={(e) => updateSpecs({ canopyWidth: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">Canopy Length (MTR)</label>
              <input
                className="field-input"
                value={doc_.specs.canopyLength}
                onChange={(e) => updateSpecs({ canopyLength: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">Roof Sheet</label>
              <input
                className="field-input"
                placeholder="e.g. 0.45 JSW BARE GALVALUME"
                value={doc_.specs.roofSheet}
                onChange={(e) => updateSpecs({ roofSheet: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">Wall Sheet</label>
              <input
                className="field-input"
                placeholder="e.g. 0.45 JSW COLOUR COATED"
                value={doc_.specs.wallSheet}
                onChange={(e) => updateSpecs({ wallSheet: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">Bay Spacing (MTR)</label>
              <input
                className="field-input"
                value={doc_.specs.baySpacing}
                onChange={(e) => updateSpecs({ baySpacing: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">Shed Model</label>
              <input
                className="field-input"
                placeholder="e.g. MULTI SPAN"
                value={doc_.specs.shedModel}
                onChange={(e) => updateSpecs({ shedModel: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">Wall Height</label>
              <input
                className="field-input"
                value={doc_.specs.wallHeight}
                onChange={(e) => updateSpecs({ wallHeight: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">
                Eave Height (MTR) — auto-filled from Building Height
              </label>
              <input
                className="field-input"
                value={doc_.specs.eaveHeight}
                onChange={(e) => updateSpecs({ eaveHeight: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">
                Leanth / Length (MTR O/O) — auto-filled
              </label>
              <input
                className="field-input"
                value={doc_.specs.leanth}
                onChange={(e) => updateSpecs({ leanth: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">
                Span / Width (MTR O/O) — auto-filled
              </label>
              <input
                className="field-input"
                value={doc_.specs.span}
                onChange={(e) => updateSpecs({ span: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">Mezzanine Leanth (approx)</label>
              <input
                className="field-input"
                value={doc_.specs.mezzanineLeanth}
                onChange={(e) =>
                  updateSpecs({ mezzanineLeanth: e.target.value })
                }
              />
            </div>
            <div>
              <label className="field-label">Mezzanine Span (approx)</label>
              <input
                className="field-input"
                value={doc_.specs.mezzanineSpan}
                onChange={(e) => updateSpecs({ mezzanineSpan: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">Mezzanine Height (approx)</label>
              <input
                className="field-input"
                value={doc_.specs.mezzanineHeight}
                onChange={(e) =>
                  updateSpecs({ mezzanineHeight: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* ================= NEW: Scope & Payment Terms (matches PDF page 5) ================= */}
        <div className="card space-y-3">
          <p className="text-sm font-bold text-steel-800">
            Scope &amp; Payment Terms (Page 5 of PDF)
          </p>
          <p className="text-xs text-steel-400">
            One line = one numbered point in the PDF. Add or remove lines
            freely.
          </p>
          <div>
            <label className="field-label">Our Scope</label>
            <textarea
              rows={5}
              className="field-input resize-none"
              value={arrayToLines(doc_.ourScope)}
              onChange={(e) =>
                update({ ourScope: linesToArray(e.target.value) })
              }
            />
          </div>
          <div>
            <label className="field-label">Client Scope</label>
            <textarea
              rows={5}
              className="field-input resize-none"
              value={arrayToLines(doc_.clientScope)}
              onChange={(e) =>
                update({ clientScope: linesToArray(e.target.value) })
              }
            />
          </div>
          <div>
            <label className="field-label">Payment Terms</label>
            <textarea
              rows={5}
              className="field-input resize-none"
              value={arrayToLines(doc_.paymentTerms)}
              onChange={(e) =>
                update({ paymentTerms: linesToArray(e.target.value) })
              }
            />
          </div>
        </div>

        <div className="card">
          <label className="field-label">
            Steel Rate (Rs / Kg) — used when adding computed weight above
          </label>
          <input
            type="number"
            className="field-input"
            value={doc_.steelRate}
            onChange={(e) => update({ steelRate: e.target.value })}
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-bold text-steel-800">Cost Items</p>
            <label className="flex items-center gap-2 text-xs font-semibold text-steel-600">
              <input
                type="checkbox"
                checked={doc_.applyGst}
                onChange={(e) => update({ applyGst: e.target.checked })}
              />
              Apply GST
            </label>
          </div>
          <ItemsTable
            items={doc_.items}
            onChange={(items) => update({ items })}
          />
        </div>

        <div className="card flex items-center justify-between">
          <span className="text-sm font-bold text-steel-800">
            {doc_.applyGst ? "Grand Total (incl. GST)" : "Total Estimate"}
          </span>
          <span className="font-mono text-base font-bold text-steel-900">
            ₹{" "}
            {Number(total || 0).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>

        <div className="card space-y-2">
          <p className="text-sm font-bold text-steel-800">Terms &amp; Notes</p>
          <div className="flex gap-2">
            <textarea
              rows={3}
              className="field-input resize-none"
              placeholder="e.g. Payment terms, validity, exclusions..."
              value={doc_.notes}
              onChange={(e) => update({ notes: e.target.value })}
            />
            <MicButton
              onResult={(t) =>
                update({ notes: doc_.notes ? `${doc_.notes} ${t}` : t })
              }
            />
          </div>
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
