const KEY = "ngpf_documents";

export function getAllDocuments() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getDocumentsByType(type) {
  return getAllDocuments().filter((d) => d.type === type);
}

export function getDocument(id) {
  return getAllDocuments().find((d) => d.id === id) || null;
}

export function saveDocument(doc) {
  const all = getAllDocuments();
  const idx = all.findIndex((d) => d.id === doc.id);
  const updated = { ...doc, updatedAt: new Date().toISOString() };
  if (idx >= 0) all[idx] = updated;
  else all.unshift(updated);
  localStorage.setItem(KEY, JSON.stringify(all));
  return updated;
}

export function deleteDocument(id) {
  const all = getAllDocuments().filter((d) => d.id !== id);
  localStorage.setItem(KEY, JSON.stringify(all));
}

/** Returns next running number for a doc type, e.g. next DC No, next Invoice No */
export function getNextNumber(type) {
  const docs = getDocumentsByType(type);
  const nums = docs
    .map((d) => parseInt((d.docNo || "").replace(/\D/g, ""), 10))
    .filter((n) => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return String(max + 1);
}

export function newId() {
  return `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
