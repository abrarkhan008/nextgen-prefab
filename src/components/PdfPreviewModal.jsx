import { useEffect, useState } from "react";
import { downloadPdf, sharePdf } from "../utils/pdfActions";

export default function PdfPreviewModal({ pdf, filename, onClose }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!pdf) return;
    const blobUrl = pdf.output("bloburl");
    setUrl(blobUrl);
    return () => URL.revokeObjectURL(blobUrl);
  }, [pdf]);

  if (!pdf) return null; // nothing to show, modal stays hidden

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/70">
      <div className="flex items-center justify-between bg-white p-3">
        <span className="text-sm font-bold text-steel-800">Preview</span>
        <button onClick={onClose} className="text-lg text-steel-500">
          ✕
        </button>
      </div>

      <div className="flex-1 bg-steel-100">
        {url && (
          <iframe title="pdf-preview" src={url} className="h-full w-full" />
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-steel-100 bg-white p-3 safe-bottom">
        <button className="btn-secondary" onClick={onClose}>
          ✏️ Edit
        </button>
        <button
          className="btn-secondary"
          onClick={() => downloadPdf(pdf, filename)}
        >
          💾 Save
        </button>
        <button className="btn-accent" onClick={() => sharePdf(pdf, filename)}>
          📤 Share
        </button>
      </div>
    </div>
  );
}
