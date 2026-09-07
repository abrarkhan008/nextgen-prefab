import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "../components/TopBar";
import ActionBar from "../components/ActionBar";
import ItemsTable, { emptyItem } from "../components/ItemsTable";
import MicButton from "../components/MicButton";
import {
  getDocument,
  saveDocument,
  newId,
  getNextNumber,
} from "../utils/storage";
import { getCompany } from "../utils/company";
import { generateDcPdf } from "../utils/pdf/dcPdf";
import { downloadPdf, sharePdf } from "../utils/pdfActions";

function blankDoc() {
  return {
    id: newId(),
    type: "dc",
    docNo: getNextNumber("dc"),
    date: new Date().toISOString().slice(0, 10),
    // woNo: "",
    vehicleNo: "",
    ewayBillNo: "",
    termsOfDelivery: "",
    client: {
      name: "",
      gstNo: "",
      address: "",
      email: "",
    },

    shipTo: {
      name: "",
      gstNo: "",
      address: "",
    },
    driverName: "",
    driverPhone: "",
    items: [emptyItem()],
    notes:
      "We hereby certify that the goods mentioned above are being transported for the purpose of ______ only.",
  };
}

export default function DCEditor() {
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
  const updateShipTo = (patch) =>
    setDoc((d) => ({ ...d, shipTo: { ...d.shipTo, ...patch } }));
  const copyBillToShipTo = () => {
    setDoc((d) => ({
      ...d,
      shipTo: {
        name: d.client?.name || "",
        gstNo: d.client?.gstNo || "",
        address: d.client?.address || "",
      },
    }));
  };

  const buildPdf = () => generateDcPdf(doc_, company);
  const filename = () =>
    `DC_${doc_.docNo}_${(doc_.client.name || "client").replace(
      /\s+/g,
      "_",
    )}.pdf`;

  const handleSave = async () => {
    try {
      const saved = saveDocument(doc_);

      setDoc(saved);

      if (id === "new") {
        navigate(`/dc/${saved.id}`, { replace: true });
      } else {
        alert("DC saved successfully");
      }
    } catch (error) {
      console.error("DC save error:", error);
      alert("Could not save DC");
    }
  };
  const handleDownload = async () => {
    try {
      saveDocument(doc_);

      const pdf = buildPdf();

      await downloadPdf(pdf, filename());
    } catch (error) {
      console.error("DC PDF error:", error);
    }
  };
  const handleShare = async () => {
    try {
      saveDocument(doc_);

      const pdf = buildPdf();

      await sharePdf(pdf, filename());
    } catch (error) {
      console.error("DC share error:", error);
    }
  };

  return (
    <div className="min-h-full bg-steel-50 pb-28">
      <TopBar title="DC Bill" subtitle={`DC No. ${doc_.docNo}`} />

      <div className="space-y-4 p-4">
        <div className="card grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">DC No</label>
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
          {/* <div>
            <label className="field-label">W O No</label>
            <input
              className="field-input"
              value={doc_.woNo}
              onChange={(e) => update({ woNo: e.target.value })}
            />
          </div> */}
          <div>
            <label className="field-label">Vehicle No</label>
            <input
              className="field-input"
              value={doc_.vehicleNo}
              onChange={(e) => update({ vehicleNo: e.target.value })}
            />
          </div>
          {doc_.type !== "proforma" && (
            <div className="col-span-2">
              <label className="field-label">E-way Bill No</label>

              <input
                className="field-input"
                value={doc_.ewayBillNo}
                onChange={(e) => update({ ewayBillNo: e.target.value })}
              />
            </div>
          )}
          <div className="col-span-2">
            <label className="field-label">Terms of Delivery</label>
            <input
              className="field-input"
              placeholder="e.g. Door Delivery"
              value={doc_.termsOfDelivery || ""}
              onChange={(e) => update({ termsOfDelivery: e.target.value })}
            />
          </div>
        </div>

        <div className="card space-y-3">
          <p className="text-sm font-bold text-steel-800">Bill To</p>
          <div>
            <label className="field-label">Client Name</label>
            <input
              className="field-input"
              value={doc_.client.name}
              onChange={(e) => updateClient({ name: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">Client GST No</label>
            <input
              className="field-input"
              value={doc_.client.gstNo}
              onChange={(e) => updateClient({ gstNo: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">Client Address</label>
            <textarea
              rows={2}
              className="field-input resize-none"
              value={doc_.client.address}
              onChange={(e) => updateClient({ address: e.target.value })}
            />
          </div>
        </div>

        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-steel-800">Ship To</p>

            <button
              type="button"
              onClick={copyBillToShipTo}
              className="rounded-lg bg-steel-800 px-3 py-2 text-xs font-semibold text-white"
            >
              Same as Bill To
            </button>
          </div>

          <div>
            <label className="field-label">Ship To Name</label>
            <input
              className="field-input"
              value={doc_.shipTo?.name || ""}
              onChange={(e) => updateShipTo({ name: e.target.value })}
            />
          </div>

          <div>
            <label className="field-label">Ship To GST No</label>
            <input
              className="field-input"
              value={doc_.shipTo?.gstNo || ""}
              onChange={(e) => updateShipTo({ gstNo: e.target.value })}
            />
          </div>

          <div>
            <label className="field-label">Ship To Address</label>
            <textarea
              rows={2}
              className="field-input resize-none"
              value={doc_.shipTo?.address || ""}
              onChange={(e) => updateShipTo({ address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Driver Name</label>
              <input
                className="field-input"
                value={doc_.driverName}
                onChange={(e) => update({ driverName: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">Driver Phone</label>
              <input
                className="field-input"
                value={doc_.driverPhone}
                onChange={(e) => update({ driverPhone: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-bold text-steel-800">Items</p>
          <ItemsTable
            items={doc_.items}
            onChange={(items) => update({ items })}
          />
        </div>

        <div className="card space-y-2">
          <p className="text-sm font-bold text-steel-800">
            Note (printed on the DC bill)
          </p>
          <div className="flex gap-2">
            <textarea
              rows={2}
              className="field-input resize-none"
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
