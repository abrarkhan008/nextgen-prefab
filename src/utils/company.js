import { LOGO_DATA_URL, SIGNATURE_DATA_URL } from "./assets";

const KEY = "ngpf_company";

export const defaultCompany = {
  name: "NextGen Pre Fab",
  addressLine1: "#568/11, SRIRANGAPATNA BY PASS ROAD, GANJAM,",
  addressLine2: "SRIRANGAPATNA, MANDYA DISTRICT-571438.",
  addressLine3: "GSTIN: 29DCJPM1107A1Z1 | State Code: 29",
  email: "nextgenprefab.mysore@gmail.com",
  phone: "9880048884 / 9844155244",
  gstNo: "29DCJPM1107A1Z1",
  bankName: "STATE BANK OF INDIA",
  bankAccountNo: "44766697514",
  bankIfsc: "SBIN0040037",
  jurisdiction: "SUBJECT TO MYSURE JURISDICTION",
  // ADD THIS
  declaration: `1. Please inspect the goods before delivery, Hence forth no claim will be entertained.
2. Our risk and responsibility ceases after the goods despatch from our godown.
3. Goods once sold can't be taken back or exchanged.`,

  cgstPercent: 9,
  sgstPercent: 9,
  logoDataUrl: LOGO_DATA_URL, // base64 image, shown top-left of every page
  signatureDataUrl: SIGNATURE_DATA_URL, // base64 stamp+signature, shown above "For NextGen Pre Fab"
};

export function getCompany() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultCompany;
    return { ...defaultCompany, ...JSON.parse(raw) };
  } catch {
    return defaultCompany;
  }
}

export function saveCompany(company) {
  localStorage.setItem(KEY, JSON.stringify(company));
}
