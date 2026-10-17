// src/utils/drawingPdf.js
// Converts the drawing SVG sheets into a multi-page A3 landscape PDF (jsPDF).
import { jsPDF } from "jspdf";

function svgToJpeg(svg, scale = 2) {
  return new Promise((resolve, reject) => {
    const clone = svg.cloneNode(true);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    clone.setAttribute("width", 1190 * scale);
    clone.setAttribute("height", 842 * scale);
    clone.removeAttribute("style");
    const xml = new XMLSerializer().serializeToString(clone);
    const url = URL.createObjectURL(
      new Blob([xml], { type: "image/svg+xml;charset=utf-8" }),
    );
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1190 * scale;
      canvas.height = 842 * scale;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

export async function drawingToPdf(svgElements) {
  const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a3" });
  for (let i = 0; i < svgElements.length; i++) {
    if (i > 0) pdf.addPage("a3", "landscape");
    const jpg = await svgToJpeg(svgElements[i]);
    pdf.addImage(jpg, "JPEG", 0, 0, 1190.55, 841.89, undefined, "FAST");
  }
  return pdf; // pass to downloadPdf(pdf, filename) / sharePdf(pdf, filename)
}
