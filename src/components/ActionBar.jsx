import { useState } from "react";

export default function ActionBar({ onSave, onDownload, onShare }) {
  const [busy, setBusy] = useState("");

  const run = async (key, fn) => {
    setBusy(key);
    try {
      await fn();
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 grid grid-cols-3 gap-2 border-t border-steel-100 bg-white p-3 safe-bottom">
      <button className="btn-secondary" disabled={!!busy} onClick={() => run("save", onSave)}>
        {busy === "save" ? "Saving…" : "💾 Save"}
      </button>
      <button className="btn-secondary" disabled={!!busy} onClick={() => run("pdf", onDownload)}>
        {busy === "pdf" ? "Building…" : "📄 PDF"}
      </button>
      <button className="btn-accent" disabled={!!busy} onClick={() => run("share", onShare)}>
        {busy === "share" ? "Opening…" : "📤 Share"}
      </button>
    </div>
  );
}
