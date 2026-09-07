// server.js
// This is a small backend. It is the ONLY thing that talks to MongoDB.
// Your app (on all phones) talks to THIS server over the internet.
// That is how "one person updates, everyone sees it" works.
//
// NOTE: MongoDB's old "Data API" (direct phone-to-database HTTPS calls)
// was shut down by MongoDB in 2025. So we run this small server instead —
// it is free to host (see README notes at the bottom) and takes ~10 minutes.

const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());

// Paste your MongoDB Atlas connection string here, or set it as an
// environment variable called MONGODB_URI on your host (recommended).
const MONGODB_URI =
  process.env.MONGODB_URI || "PASTE_YOUR_MONGODB_CONNECTION_STRING_HERE";

let db;
async function connectDB() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db("nextgen_prefab"); // database name — change if you like
  console.log("Connected to MongoDB");
}

// ---------- Helper to send back clean JSON (converts _id to id) ----------
function clean(doc) {
  if (!doc) return doc;
  return { ...doc, id: doc._id.toString(), _id: undefined };
}

// =========================================================
// PAYMENT HISTORY  (shared across all employees/phones)
// =========================================================

// Get all payments. Optional ?month=2026-07 to filter one month.
app.get("/api/payments", async (req, res) => {
  try {
    const { month } = req.query; // e.g. "2026-07"
    const filter = month ? { date: { $regex: `^${month}` } } : {};
    const docs = await db
      .collection("payments")
      .find(filter)
      .sort({ date: -1 })
      .toArray();
    res.json(docs.map(clean));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new payment entry
app.post("/api/payments", async (req, res) => {
  try {
    const { amount, note, date, addedBy } = req.body;
    if (!amount || !date)
      return res.status(400).json({ error: "amount and date are required" });
    const doc = {
      amount: Number(amount),
      note: note || "",
      date, // "YYYY-MM-DD"
      addedBy: addedBy || "Unknown",
      updatedAt: new Date().toISOString(),
    };
    const result = await db.collection("payments").insertOne(doc);
    res.json(clean({ ...doc, _id: result.insertedId }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update an existing payment entry (e.g. someone edits an amount)
app.put("/api/payments/:id", async (req, res) => {
  try {
    const { amount, note, date, addedBy } = req.body;
    const update = { updatedAt: new Date().toISOString() };
    if (amount !== undefined) update.amount = Number(amount);
    if (note !== undefined) update.note = note;
    if (date !== undefined) update.date = date;
    if (addedBy !== undefined) update.addedBy = addedBy;
    await db
      .collection("payments")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: update });
    const doc = await db
      .collection("payments")
      .findOne({ _id: new ObjectId(req.params.id) });
    res.json(clean(doc));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a payment entry
app.delete("/api/payments/:id", async (req, res) => {
  try {
    await db
      .collection("payments")
      .deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =========================================================
// GST PAYMENT HISTORY
// =========================================================

app.get("/api/gst", async (req, res) => {
  try {
    const { month } = req.query;
    const filter = month ? { date: { $regex: `^${month}` } } : {};
    const docs = await db
      .collection("gst_payments")
      .find(filter)
      .sort({ date: -1 })
      .toArray();
    res.json(docs.map(clean));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/gst", async (req, res) => {
  try {
    const { amount, note, date, status } = req.body;
    if (!amount || !date)
      return res.status(400).json({ error: "amount and date are required" });
    const doc = {
      amount: Number(amount),
      note: note || "",
      date,
      status: status || "pending", // "pending" or "completed"
      updatedAt: new Date().toISOString(),
    };
    const result = await db.collection("gst_payments").insertOne(doc);
    res.json(clean({ ...doc, _id: result.insertedId }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/gst/:id", async (req, res) => {
  try {
    const { amount, note, date, status } = req.body;
    const update = { updatedAt: new Date().toISOString() };
    if (amount !== undefined) update.amount = Number(amount);
    if (note !== undefined) update.note = note;
    if (date !== undefined) update.date = date;
    if (status !== undefined) update.status = status;
    await db
      .collection("gst_payments")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: update });
    const doc = await db
      .collection("gst_payments")
      .findOne({ _id: new ObjectId(req.params.id) });
    res.json(clean(doc));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/gst/:id", async (req, res) => {
  try {
    await db
      .collection("gst_payments")
      .deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
