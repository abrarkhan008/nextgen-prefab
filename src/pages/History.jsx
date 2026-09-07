import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TopBar from "../components/TopBar";
import { getAllDocuments, deleteDocument } from "../utils/storage";

const TYPE_META = {
  quotation: { label: "Quotation", color: "bg-steel-800", icon: "📋", path: "/quotation" },
  dc: { label: "DC Bill", color: "bg-safety-500", icon: "🚚", path: "/dc" },
  invoice: { label: "Tax Invoice", color: "bg-emerald-700", icon: "🧾", path: "/invoice" },
};

export default function History() {
  const [docs, setDocs] = useState([]);
  const [filter, setFilter] = useState("all");

  const load = () => setDocs(getAllDocuments());
  useEffect(load, []);

  const remove = (id) => {
    if (!confirm("Delete this document?")) return;
    deleteDocument(id);
    load();
  };

  const visible = filter === "all" ? docs : docs.filter((d) => d.type === filter);

  return (
    <div className="min-h-full bg-steel-50 pb-10">
      <TopBar title="All Documents" subtitle={`${docs.length} saved`} />

      <div className="flex gap-2 overflow-x-auto px-4 py-3 no-scrollbar">
        {["all", "quotation", "dc", "invoice"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold ${
              filter === f ? "bg-steel-800 text-white" : "bg-white text-steel-500 border border-steel-200"
            }`}
          >
            {f === "all" ? "All" : TYPE_META[f].label}
          </button>
        ))}
      </div>

      <div className="space-y-2 px-4">
        {visible.length === 0 && (
          <div className="card text-center text-sm text-steel-400">No documents found.</div>
        )}
        {visible.map((d) => {
          const meta = TYPE_META[d.type];
          return (
            <div key={d.id} className="card flex items-center justify-between gap-2">
              <Link to={`${meta.path}/${d.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.color} text-white`}>
                  {meta.icon}
                </span>
                <span className="min-w-0">
                  <p className="truncate text-sm font-semibold text-steel-800">
                    {meta.label} #{d.docNo} — {d.client?.name || "No client"}
                  </p>
                  <p className="text-xs text-steel-400">{d.date}</p>
                </span>
              </Link>
              <button onClick={() => remove(d.id)} className="p-2 text-steel-300 hover:text-red-500">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
