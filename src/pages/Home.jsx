import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAllDocuments, deleteDocument } from "../utils/storage";

const TYPE_META = {
  quotation: {
    label: "Quotation",
    color: "bg-steel-800",
    icon: "📋",
    path: "/quotation",
  },
  dc: { label: "DC Bill", color: "bg-safety-500", icon: "🚚", path: "/dc" },
  invoice: {
    label: "Tax Invoice",
    color: "bg-emerald-700",
    icon: "🧾",
    path: "/invoice",
  },
};

export default function Home() {
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    setDocs(getAllDocuments().slice(0, 8));
  }, []);

  const remove = (id) => {
    if (!confirm("Delete this document?")) return;
    deleteDocument(id);
    setDocs(getAllDocuments().slice(0, 8));
  };

  return (
    <div className="min-h-full bg-steel-50 pb-10">
      <div className="bg-steel-900 px-5 pb-8 pt-10 safe-top">
        <p className="text-xs font-semibold uppercase tracking-widest text-steel-400">
          NextGen Pre Fab
        </p>
        <h1 className="mt-1 text-2xl font-extrabold text-white">
          Billing &amp; Quotation
        </h1>
        <p className="mt-1 text-sm text-steel-300">
          Create quotations, DC bills &amp; tax invoices — offline.
        </p>
      </div>

      <div className="-mt-5 grid grid-cols-3 gap-3 px-4">
        {Object.entries(TYPE_META).map(([key, meta]) => (
          <Link
            key={key}
            to={`${meta.path}/new`}
            className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl ${meta.color} px-2 py-5 text-white shadow-lg active:scale-95 transition`}
          >
            <span className="text-2xl">{meta.icon}</span>
            <span className="text-center text-xs font-bold leading-tight">
              {meta.label}
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between px-4">
        <h2 className="text-sm font-bold text-steel-700">Recent Documents</h2>
        <Link
          to="/history"
          className="text-xs font-semibold text-steel-500 underline"
        >
          View all
        </Link>
      </div>

      <div className="mt-3 space-y-2 px-4">
        {docs.length === 0 && (
          <div className="card text-center text-sm text-steel-400">
            No documents yet. Tap a button above to create your first one.
          </div>
        )}
        {docs.map((d) => {
          const meta = TYPE_META[d.type];

          if (!meta) return null;

          return (
            <div
              key={d.id}
              className="card flex items-center justify-between gap-2"
            >
              <Link
                to={`${meta.path}/${d.id}`}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.color} text-white`}
                >
                  {meta.icon}
                </span>
                <span className="min-w-0">
                  <p className="truncate text-sm font-semibold text-steel-800">
                    {meta.label} #{d.docNo} — {d.client?.name || "No client"}
                  </p>
                  <p className="text-xs text-steel-400">{d.date}</p>
                </span>
              </Link>
              <button
                onClick={() => remove(d.id)}
                className="p-2 text-steel-300 hover:text-red-500"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-8 px-4">
        <Link to="/settings" className="btn-secondary w-full">
          ⚙️ Company Settings (name, GST, bank details, logo)
        </Link>
      </div>
    </div>
  );
}
