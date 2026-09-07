import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPayments, addPayment } from "../lib/api";

function todayStr() {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function monthLabel(dateStr) {
  return new Date(dateStr).toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

export default function PaymentHistory() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // form fields
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [addedBy, setAddedBy] = useState(
    localStorage.getItem("employeeName") || "",
  );

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await getPayments();
      setPayments(data);
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
    localStorage.setItem("employeeName", addedBy);
    try {
      await addPayment({ amount, note, date: todayStr(), addedBy });
      setAmount("");
      setNote("");
      load(); // refresh so the new entry shows immediately for this phone
    } catch (e) {
      setError("Could not save — try again.");
    }
  }

  // group entries by month for display
  const grouped = payments.reduce((acc, p) => {
    const key = monthLabel(p.date);
    acc[key] = acc[key] || [];
    acc[key].push(p);
    return acc;
  }, {});

  return (
    <div className="p-4 pb-24">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500">
          ← Back
        </button>
        <h1 className="text-lg font-semibold">Payment History</h1>
        <button onClick={load} className="text-sm text-blue-600">
          Refresh
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      {/* Add new entry */}
      <div className="border rounded-xl p-3 mb-4 space-y-2">
        <input
          className="w-full border rounded-lg p-2"
          placeholder="Your name"
          value={addedBy}
          onChange={(e) => setAddedBy(e.target.value)}
        />
        <input
          className="w-full border rounded-lg p-2"
          placeholder="Amount"
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
          Add Payment
        </button>
      </div>

      {loading ? (
        <p className="text-gray-400 text-center">Loading…</p>
      ) : Object.keys(grouped).length === 0 ? (
        <p className="text-gray-400 text-center">No payments yet.</p>
      ) : (
        Object.entries(grouped).map(([month, items]) => (
          <div key={month} className="mb-4">
            <h2 className="text-sm font-semibold text-gray-500 mb-2">
              {month}
            </h2>
            {items.map((p) => (
              <div
                key={p.id}
                className="flex justify-between border-b py-2 text-sm"
              >
                <div>
                  <p className="font-medium">₹{p.amount}</p>
                  <p className="text-gray-400">{p.note}</p>
                </div>
                <div className="text-right text-gray-400">
                  <p>{p.date}</p>
                  <p>{p.addedBy}</p>
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
