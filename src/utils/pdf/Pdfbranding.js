import { PAGE_WIDTH, MARGIN } from "./common";
import watermarkImage from "../../assets/watermark-logo.png";
import { SIGNATURE_DATA_URL } from "../assets";

export function drawLogo(pdf, company) {
  const logo = company?.logoDataUrl;

  if (!logo) {
    console.log("Company logo is missing");
    return;
  }

  try {
    // Logo on the LEFT side
    pdf.addImage(logo, "PNG", MARGIN, 6, 40, 26);
  } catch (e) {
    console.error("Logo error:", e);
  }
}

export function drawSignatureStamp(pdf, sigY, company, opts = {}) {
  const signature = company?.signatureDataUrl || SIGNATURE_DATA_URL;

  if (!signature) return;

  const w = opts.width || 42;
  const h = opts.height || w * (169 / 550);

  const rightBlockCenterX = opts.centerX ?? PAGE_WIDTH - MARGIN - 30;

  const x = rightBlockCenterX - w / 2;
  const y = sigY - h - 3;

  try {
    pdf.addImage(signature, "PNG", x, y, w, h);
  } catch (e) {
    console.warn("drawSignatureStamp failed:", e);
  }
}

export function drawWatermark(pdf) {
  try {
    // Get the real image dimensions
    const props = pdf.getImageProperties(watermarkImage);

    const imageWidth = props.width;
    const imageHeight = props.height;

    // Maximum watermark size on A4
    const maxWidth = 180;
    const maxHeight = 180;

    // Keep the original image ratio
    const ratio = imageHeight / imageWidth;

    let w = maxWidth;
    let h = w * ratio;

    // If height is too large, calculate from height instead
    if (h > maxHeight) {
      h = maxHeight;
      w = h / ratio;
    }

    // Center the watermark on A4
    const x = (PAGE_WIDTH - w) / 2;
    const y = (297 - h) / 2;

    pdf.saveGraphicsState();

    pdf.setGState(
      new pdf.GState({
        opacity: 0.08,
      }),
    );

    pdf.addImage(watermarkImage, "PNG", x, y, w, h);

    pdf.restoreGraphicsState();
  } catch (e) {
    console.warn("Watermark error:", e);
  }
}
