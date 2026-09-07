import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { getGstPayments, addGstPayment, updateGstPayment } from "../lib/api";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function GstPayment() {
  const navigate = useNavigate();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      setEntries(await getGstPayments());
    } catch (e) {
      setError("Could not load — check your internet connection.");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd() {
    if (!amount) return;
    try {
      await addGstPayment({
        amount,
        note,
        date: todayStr(),
        status: "pending",
      });
      setAmount("");
      setNote("");
      load();
    } catch (e) {
      setError("Could not save — try again.");
    }
  }

  async function markComplete(entry) {
    try {
      await updateGstPayment(entry.id, { status: "completed" });
      load();
    } catch (e) {
      setError("Could not update — try again.");
    }
  }

  // Build a PDF for one GST entry and open the phone's share sheet
  // (so you can send it via WhatsApp, Email, etc.)
  async function shareAsPdf(entry) {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("GST Payment Receipt", 20, 20);
    doc.setFontSize(11);
    doc.text(`Date: ${entry.date}`, 20, 35);
    doc.text(`Amount: Rs. ${entry.amount}`, 20, 45);
    doc.text(`Status: ${entry.status}`, 20, 55);
    doc.text(`Note: ${entry.note || "-"}`, 20, 65);

    // jsPDF gives us the file as a base64 string
    const base64 = doc.output("datauristring").split(",")[1];
    const fileName = `gst-payment-${entry.date}.pdf`;

    // Save it into the app's cache folder so we have a real file to share
    const saved = await Filesystem.writeFile({
      path: fileName,
      data: base64,
      directory: Directory.Cache,
    });

    await Share.share({
      title: "GST Payment",
      text: `GST payment for ${entry.date}`,
      url: saved.uri, // opens native share sheet: WhatsApp, Email, etc.
    });
  }

  return (
    <div className="p-4 pb-24">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500">
          ← Back
        </button>
        <h1 className="text-lg font-semibold">GST Payments</h1>
        <button onClick={load} className="text-sm text-blue-600">
          Refresh
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      <div className="border rounded-xl p-3 mb-4 space-y-2">
        <input
          className="w-full border rounded-lg p-2"
          placeholder="GST Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input
          className="w-full border rounded-lg p-2"
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button
          onClick={handleAdd}
          className="w-full bg-black text-white rounded-lg py-2"
        >
          Add GST Entry
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-center">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="text-gray-400 text-center">No GST entries yet.</p>
      ) : (
        entries.map((e) => (
          <div key={e.id} className="border rounded-xl p-3 mb-3 text-sm">
            <div className="flex justify-between">
              <p className="font-medium">₹{e.amount}</p>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  e.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {e.status}
              </span>
            </div>
            <p className="text-gray-400">{e.date}</p>
            {e.note && <p className="text-gray-400">{e.note}</p>}
            <div className="flex gap-2 mt-2">
              {e.status !== "completed" && (
                <button
                  onClick={() => markComplete(e)}
                  className="flex-1 border rounded-lg py-1.5 text-xs"
                >
                  Mark Completed
                </button>
              )}
              <button
                onClick={() => shareAsPdf(e)}
                className="flex-1 bg-black text-white rounded-lg py-1.5 text-xs"
              >
                Share as PDF
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
