import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { downloadPdf, sharePdf } from "../utils/pdfActions";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function PdfPreviewModal({ pdf, filename, onClose }) {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pdf) return;
    let cancelled = false;
    setLoading(true);

    async function render() {
      const arrayBuffer = pdf.output("arraybuffer");
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      if (cancelled || !containerRef.current) return;
      containerRef.current.innerHTML = "";

      for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = "100%";
        canvas.style.marginBottom = "8px";
        canvas.style.boxShadow = "0 1px 4px rgba(0,0,0,0.3)";

        const ctx = canvas.getContext("2d");
        await page.render({ canvasContext: ctx, viewport }).promise;

        if (cancelled) return;
        containerRef.current.appendChild(canvas);
      }

      if (!cancelled) setLoading(false);
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [pdf]);

  if (!pdf) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/70">
      <div className="flex items-center justify-between bg-white p-3">
        <span className="text-sm font-bold text-steel-800">Preview</span>
        <button onClick={onClose} className="text-lg text-steel-500">
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-steel-100 p-2">
        {loading && (
          <p className="mt-10 text-center text-sm text-steel-500">
            Loading preview...
          </p>
        )}
        <div ref={containerRef} />
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
