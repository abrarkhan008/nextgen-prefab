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
    let loadingTask = null;
    setLoading(true);

    async function render() {
      const container = containerRef.current;
      if (!container) return;
      container.innerHTML = "";

      const data = new Uint8Array(pdf.output("arraybuffer"));
            loadingTask = pdfjsLib.getDocument({ data });
      const pdfDoc = await loadingTask.promise;
      if (cancelled) return;

         const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const targetWidth = (container.clientWidth || window.innerWidth) * dpr;

      const first = await pdfDoc.getPage(1);
      const base = first.getViewport({ scale: 1 });
      const scale = targetWidth / base.width;

      const canvases = [];
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(base.width * scale);
        canvas.height = Math.floor(base.height * scale);
        canvas.style.width = "100%";
        canvas.style.background = "#fff";
        canvas.style.marginBottom = "8px";
        canvas.style.boxShadow = "0 1px 4px rgba(0,0,0,0.3)";
        container.appendChild(canvas);
        canvases.push(canvas);
      }

      await Promise.all(
        canvases.map(async (canvas, idx) => {
          const page = idx === 0 ? first : await pdfDoc.getPage(idx + 1);
          if (cancelled) return;
          const viewport = page.getViewport({ scale });
          await page.render({
            canvasContext: canvas.getContext("2d"),
            viewport,
          }).promise;
          if (idx === 0 && !cancelled) setLoading(false);
        }),
      );
      if (!cancelled) setLoading(false);
    }

    render().catch((e) => {
      console.error("Preview failed:", e);
      setLoading(false);
    });

    return () => {
      cancelled = true;
            if (loadingTask) loadingTask.destroy();
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
