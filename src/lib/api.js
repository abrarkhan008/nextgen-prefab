// src/lib/api.js
// One place that knows how to talk to your backend server.
// After you deploy server.js (see instructions), put that server's
// web address here, e.g. "https://nextgen-prefab-server.onrender.com"
export const API_BASE = "PASTE_YOUR_SERVER_URL_HERE";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ---------- Payment history ----------
export const getPayments = (month) => request(`/api/payments${month ? `?month=${month}` : ""}`);
export const addPayment = (data) => request("/api/payments", { method: "POST", body: JSON.stringify(data) });
export const updatePayment = (id, data) => request(`/api/payments/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deletePayment = (id) => request(`/api/payments/${id}`, { method: "DELETE" });

// ---------- GST payments ----------
export const getGstPayments = (month) => request(`/api/gst${month ? `?month=${month}` : ""}`);
export const addGstPayment = (data) => request("/api/gst", { method: "POST", body: JSON.stringify(data) });
export const updateGstPayment = (id, data) => request(`/api/gst/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteGstPayment = (id) => request(`/api/gst/${id}`, { method: "DELETE" });