import { useState } from "react";
import TopBar from "../components/TopBar";
import { getCompany, saveCompany } from "../utils/company";

export default function Settings() {
  const [company, setCompany] = useState(getCompany());
  const [saved, setSaved] = useState(false);

  const update = (patch) => setCompany((c) => ({ ...c, ...patch }));

  const onLogo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update({ logoDataUrl: reader.result });
    reader.readAsDataURL(file);
  };

  const save = () => {
    saveCompany(company);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="min-h-full bg-steel-50 pb-24">
      <TopBar title="Company Settings" subtitle="Shown on every PDF" />
      <div className="space-y-4 p-4">
        <div className="card space-y-3">
          <div>
            <label className="field-label">Company Name</label>
            <input
              className="field-input"
              value={company.name}
              onChange={(e) => update({ name: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">Address Line 1</label>
            <input
              className="field-input"
              value={company.addressLine1}
              onChange={(e) => update({ addressLine1: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">Address Line 2</label>
            <input
              className="field-input"
              value={company.addressLine2}
              onChange={(e) => update({ addressLine2: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">Address Line 3</label>
            <input
              className="field-input"
              value={company.addressLine3 || ""}
              onChange={(e) => update({ addressLine3: e.target.value })}
              placeholder="GSTIN: 29DCJPM1107A1Z1 | State Code: 29"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Email</label>
              <input
                className="field-input"
                value={company.email}
                onChange={(e) => update({ email: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">Phone</label>
              <input
                className="field-input"
                value={company.phone}
                onChange={(e) => update({ phone: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="field-label">GST Number</label>
            <input
              className="field-input"
              value={company.gstNo}
              onChange={(e) => update({ gstNo: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">Declaration</label>
            <textarea
              className="field-input min-h-[140px]"
              value={company.declaration || ""}
              onChange={(e) => update({ declaration: e.target.value })}
              placeholder="Enter declaration"
            />
            <p className="mt-1 text-xs text-steel-500">
              Enter each declaration point on a new line.
            </p>
          </div>
          <div>
            <label className="field-label">Logo (shown top-left of PDF)</label>
            <input
              type="file"
              accept="image/*"
              onChange={onLogo}
              className="field-input"
            />
            {company.logoDataUrl && (
              <img
                src={company.logoDataUrl}
                alt="logo preview"
                className="mt-2 h-14 w-14 rounded-lg border border-steel-200 object-contain"
              />
            )}
          </div>
        </div>

        <div className="card space-y-3">
          <p className="text-sm font-bold text-steel-800">
            Bank Details (for Tax Invoice)
          </p>
          <div>
            <label className="field-label">Bank Name</label>
            <input
              className="field-input"
              value={company.bankName}
              onChange={(e) => update({ bankName: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Account No.</label>
              <input
                className="field-input"
                value={company.bankAccountNo}
                onChange={(e) => update({ bankAccountNo: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">Branch / IFSC</label>
              <input
                className="field-input"
                value={company.bankIfsc}
                onChange={(e) => update({ bankIfsc: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="card space-y-3">
          <p className="text-sm font-bold text-steel-800">
            GST Rates &amp; Jurisdiction
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">CGST %</label>
              <input
                type="number"
                className="field-input"
                value={company.cgstPercent}
                onChange={(e) => update({ cgstPercent: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">SGST %</label>
              <input
                type="number"
                className="field-input"
                value={company.sgstPercent}
                onChange={(e) => update({ sgstPercent: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="field-label">Jurisdiction line</label>
            <input
              className="field-input"
              value={company.jurisdiction}
              onChange={(e) => update({ jurisdiction: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-steel-100 bg-white p-4 safe-bottom">
        <button onClick={save} className="btn-primary w-full">
          {saved ? "✓ Saved" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
