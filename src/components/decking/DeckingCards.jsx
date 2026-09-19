import BoltDiagram from "../BoltDiagram";
import FoundationBoltDiagram from "../FoundationBoltDiagram";
import MemberDiagram from "../MemberDiagram";
import TubeDiagram from "../TubeDiagram";
import { NumField, RowHeader, InfoBar, MemberTotals } from "./DeckingFields";
import PlateAttachments from "./PlateLists";
import {
  STEEL_CATEGORIES,
  CUSTOM_SECTION,
  findSection,
  sectionsInCategory,
  sectionLabel,
} from "../../utils/steelTables";
import {
  TUBE_SHAPES,
  DECK_THICKNESSES,
  deckWeightPerSqft,
  deckAreaSqft,
  deckRowWeight,
  foundationBoltRowWeight,
  boltRowWeight,
  studRowWeight,
  memberBreakdown,
  sectionKgm,
  tubeWeightPerMeter,
  fmtKg,
} from "../../utils/decking";
import { boltWeight } from "../../utils/calc";

const card = "space-y-1.5 rounded-lg border border-steel-200 p-2";

// ---------------------------------------------------------------------
// Foundation bolt  (pedestals x bolts x weight of one bolt)
// ---------------------------------------------------------------------
export function FoundationBoltCard({ row, onChange, onRemove }) {
  const set = (patch) => onChange({ ...row, ...patch });
  return (
    <div className={card}>
      <RowHeader
        value={row.label}
        placeholder="Label, e.g. FB1"
        onChange={(v) => set({ label: v })}
        onRemove={onRemove}
      />
      <div className="flex gap-3">
        <div className="flex-1 space-y-2">
          <NumField
            label="No. of Pedestals"
            value={row.pedestals}
            onChange={(v) => set({ pedestals: v })}
          />
          <NumField
            label="No. of Bolts / Pedestal"
            value={row.boltsPerPedestal}
            onChange={(v) => set({ boltsPerPedestal: v })}
          />
          <NumField
            label="Bolt Diameter (mm)"
            placeholder="Example: 20"
            value={row.diameter}
            onChange={(v) => set({ diameter: v })}
          />
          <NumField
            label="Bolt Length (mm)"
            placeholder="Example: 600"
            value={row.length}
            onChange={(v) => set({ length: v })}
          />
        </div>
        <div className="flex w-32 shrink-0 items-center justify-center">
          <FoundationBoltDiagram />
        </div>
      </div>
      <InfoBar>
        Weight / Bolt: {fmtKg(boltWeight(row.diameter, row.length))} KG
        &nbsp;|&nbsp; Total: {fmtKg(foundationBoltRowWeight(row))} KG
      </InfoBar>
    </div>
  );
}

// ---------------------------------------------------------------------
// Bolts & nuts / studs  (0.000006165 x d^2 x l x qty)
// ---------------------------------------------------------------------
function RoundBarCard({ row, onChange, onRemove, labelPlaceholder, dLabel, lLabel, weight }) {
  const set = (patch) => onChange({ ...row, ...patch });
  return (
    <div className={card}>
      <RowHeader
        value={row.label}
        placeholder={labelPlaceholder}
        onChange={(v) => set({ label: v })}
        onRemove={onRemove}
      />
      <div className="flex gap-3">
        <div className="flex-1 space-y-2">
          <NumField
            label={`1. ${dLabel} d (mm)`}
            value={row.d}
            onChange={(v) => set({ d: v })}
          />
          <NumField
            label={`2. ${lLabel} l (mm)`}
            value={row.l}
            onChange={(v) => set({ l: v })}
          />
          <NumField label="Qty" value={row.qty} onChange={(v) => set({ qty: v })} />
        </div>
        <div className="flex items-center justify-center">
          <BoltDiagram />
        </div>
      </div>
      <InfoBar>
        Weight / Piece: {fmtKg(boltWeight(row.d, row.l))} KG &nbsp;|&nbsp;
        Total: {fmtKg(weight)} KG
      </InfoBar>
    </div>
  );
}

export function BoltNutCard(props) {
  return (
    <RoundBarCard
      {...props}
      labelPlaceholder="Label, e.g. BN1"
      dLabel="Diameter"
      lLabel="Length"
      weight={boltRowWeight(props.row)}
    />
  );
}

export function StudCard(props) {
  return (
    <RoundBarCard
      {...props}
      labelPlaceholder="Label, e.g. ST1"
      dLabel="Stud Diameter"
      lLabel="Stud Length"
      weight={studRowWeight(props.row)}
    />
  );
}

// ---------------------------------------------------------------------
// Decking sheet  (length x width x weight per sq ft)
// ---------------------------------------------------------------------
export function DeckSheetCard({ row, onChange, onRemove }) {
  const set = (patch) => onChange({ ...row, ...patch });
  const unit = row.unit || "m";
  return (
    <div className={card}>
      <RowHeader
        value={row.label}
        placeholder="Label, e.g. FIRST FLOOR"
        onChange={(v) => set({ label: v })}
        onRemove={onRemove}
      />

      <div>
        <label className="field-label">Length &amp; Width in</label>
        <select
          className="field-input"
          value={unit}
          onChange={(e) => set({ unit: e.target.value })}
        >
          <option value="m">Metre (m)</option>
          <option value="ft">Feet (ft)</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <NumField
          label={`Building Length (${unit})`}
          value={row.length}
          onChange={(v) => set({ length: v })}
        />
        <NumField
          label={`Building Width (${unit})`}
          value={row.width}
          onChange={(v) => set({ width: v })}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="field-label">Sheet Thickness</label>
          <select
            className="field-input"
            value={row.thickness}
            onChange={(e) =>
              set({
                thickness: e.target.value,
                weightPerSqft: String(deckWeightPerSqft(e.target.value)),
              })
            }
          >
            {DECK_THICKNESSES.map((t) => (
              <option key={t} value={t}>
                {t} mm
              </option>
            ))}
          </select>
        </div>
        <NumField
          label="Weight / Sq Ft (kg)"
          step="0.001"
          value={row.weightPerSqft}
          onChange={(v) => set({ weightPerSqft: v })}
        />
      </div>

      <InfoBar>
        Area: {fmtKg(deckAreaSqft(row))} sq ft &nbsp;|&nbsp; Total Weight:{" "}
        {fmtKg(deckRowWeight(row))} KG
        <br />
        <span className="font-normal">
          Length x Width x Weight / Sq Ft. Weight / Sq Ft fills in from the
          thickness (flat steel) - overwrite it with your supplier's value if
          the sheet profile is heavier.
        </span>
      </InfoBar>
    </div>
  );
}

// ---------------------------------------------------------------------
// PEB member  (2 flanges + web) + connection / gusset plates
// ---------------------------------------------------------------------
export function PebMemberCard({ row, onChange, onRemove }) {
  const set = (patch) => onChange({ ...row, ...patch });
  return (
    <div className={card}>
      <RowHeader
        value={row.label}
        placeholder="Label, e.g. C1"
        onChange={(v) => set({ label: v })}
        onRemove={onRemove}
      />
      <div className="flex gap-3">
        <div className="flex-1 space-y-2">
          <NumField
            label="Flange Width (mm)"
            value={row.flangeWidth}
            onChange={(v) => set({ flangeWidth: v })}
          />
          <NumField
            label="Flange Thick (mm)"
            value={row.flangeThick}
            onChange={(v) => set({ flangeThick: v })}
          />
          <NumField
            label="Web Width (mm)"
            value={row.webWidth}
            onChange={(v) => set({ webWidth: v })}
          />
          <NumField
            label="Web Thick (mm)"
            value={row.webThick}
            onChange={(v) => set({ webThick: v })}
          />
          <NumField
            label="Length (m)"
            value={row.length}
            onChange={(v) => set({ length: v })}
          />
          <NumField label="Qty" value={row.qty} onChange={(v) => set({ qty: v })} />
        </div>
        <div className="flex w-32 items-center justify-center">
          <MemberDiagram />
        </div>
      </div>

      <PlateAttachments row={row} onChange={onChange} />
      <MemberTotals breakdown={memberBreakdown(row, "peb")} />
    </div>
  );
}

// ---------------------------------------------------------------------
// Conventional single section (IS 808 steel table) + plates
// ---------------------------------------------------------------------
export function SectionMemberCard({ row, onChange, onRemove }) {
  const set = (patch) => onChange({ ...row, ...patch });
  const category = row.category || "medium";
  const groups = sectionsInCategory(category);
  const isCustom = row.designation === CUSTOM_SECTION;
  const section = isCustom ? null : findSection(row.designation);

  return (
    <div className={card}>
      <RowHeader
        value={row.label}
        placeholder="Label, e.g. C1"
        onChange={(v) => set({ label: v })}
        onRemove={onRemove}
      />

      <div>
        <label className="field-label">Section Type</label>
        <select
          className="field-input"
          value={category}
          onChange={(e) =>
            set({ category: e.target.value, designation: "", customKgm: "" })
          }
        >
          {STEEL_CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>
              {c.title} ({c.series.join(" / ")})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="field-label">Section (IS 808 : 1989)</label>
        <select
          className="field-input"
          value={row.designation || ""}
          onChange={(e) => set({ designation: e.target.value })}
        >
          <option value="">Select section...</option>
          {groups.map((g) => (
            <optgroup key={g.series} label={g.series}>
              {g.items.map((s) => (
                <option key={s.name} value={s.name}>
                  {sectionLabel(s)}
                </option>
              ))}
            </optgroup>
          ))}
          <option value={CUSTOM_SECTION}>Custom (enter kg/m)</option>
        </select>
      </div>

      {section && (
        <div className="grid grid-cols-2 gap-2">
          <InfoBar>
            Sectional Area
            <br />
            <span className="text-sm font-bold text-steel-800">
              {section.area} cm&sup2;
            </span>
          </InfoBar>
          <InfoBar>
            Weight / Metre
            <br />
            <span className="text-sm font-bold text-steel-800">
              {section.kgm} kg/m
            </span>
          </InfoBar>
          <div className="col-span-2 text-xs text-steel-500">
            Depth {section.D} x Flange {section.B} mm, web {section.t} mm,
            flange {section.T} mm
          </div>
        </div>
      )}

      {isCustom && (
        <NumField
          label="Weight / Metre (kg/m)"
          value={row.customKgm}
          onChange={(v) => set({ customKgm: v })}
        />
      )}

      <div className="grid grid-cols-2 gap-2">
        <NumField
          label="Length (m)"
          value={row.length}
          onChange={(v) => set({ length: v })}
        />
        <NumField label="Qty" value={row.qty} onChange={(v) => set({ qty: v })} />
      </div>
      <p className="text-xs text-steel-500">
        Section weight: {fmtKg(sectionKgm(row))} kg/m x Length x Qty
      </p>

      <PlateAttachments row={row} onChange={onChange} />
      <MemberTotals breakdown={memberBreakdown(row, "single")} />
    </div>
  );
}

// ---------------------------------------------------------------------
// Conventional tubular (square / rectangular tube or round pipe) + plates
// ---------------------------------------------------------------------
export function TubeMemberCard({ row, onChange, onRemove }) {
  const set = (patch) => onChange({ ...row, ...patch });
  const round = row.shape === TUBE_SHAPES.ROUND;
  return (
    <div className={card}>
      <RowHeader
        value={row.label}
        placeholder="Label, e.g. C1"
        onChange={(v) => set({ label: v })}
        onRemove={onRemove}
      />

      <div>
        <label className="field-label">Tube Shape</label>
        <select
          className="field-input"
          value={row.shape}
          onChange={(e) => set({ shape: e.target.value })}
        >
          <option value={TUBE_SHAPES.RECT}>Square / Rectangular Tube</option>
          <option value={TUBE_SHAPES.ROUND}>Round Pipe</option>
        </select>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 space-y-2">
          {round ? (
            <NumField
              label="Outer Diameter D (mm)"
              value={row.outerDia}
              onChange={(v) => set({ outerDia: v })}
            />
          ) : (
            <>
              <NumField
                label="Side (A) (mm)"
                value={row.sideA}
                onChange={(v) => set({ sideA: v })}
              />
              <NumField
                label="Side (B) (mm) - blank = square"
                value={row.sideB}
                onChange={(v) => set({ sideB: v })}
              />
            </>
          )}
          <NumField
            label="Thickness (T) (mm)"
            value={row.thickness}
            onChange={(v) => set({ thickness: v })}
          />
          <NumField
            label="Length (m)"
            value={row.length}
            onChange={(v) => set({ length: v })}
          />
          <NumField
            label="Pieces (Qty)"
            value={row.qty}
            onChange={(v) => set({ qty: v })}
          />
          <NumField
            label="Density (g/cm3)"
            step="0.01"
            value={row.density}
            onChange={(v) => set({ density: v })}
          />
        </div>
        <div className="flex w-28 shrink-0 items-center justify-center">
          <TubeDiagram round={round} />
        </div>
      </div>

      <InfoBar>
        Weight / Metre: {fmtKg(tubeWeightPerMeter(row))} kg/m &nbsp;|&nbsp;
        Weight / Piece:{" "}
        {fmtKg(tubeWeightPerMeter(row) * (Number(row.length) || 0))} KG
      </InfoBar>

      <PlateAttachments row={row} onChange={onChange} />
      <MemberTotals breakdown={memberBreakdown(row, "tubular")} />
    </div>
  );
}