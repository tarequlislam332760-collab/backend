const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] }));
app.use(express.json());

// ✅ Stable MongoDB Connection
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, 
    });
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Error:", error.message);
    throw new Error("Database connection failed");
  }
};

// ---------------- MODELS ----------------
const Message = mongoose.models.Message || mongoose.model("Message", new mongoose.Schema({
  name: String, phone: String, area: String, subject: String, message: String,
  date: { type: Date, default: Date.now },
}));

const Content = mongoose.models.Content || mongoose.model("Content", new mongoose.Schema({
  title: { type: String, required: true }, image: String, category: String,
  createdAt: { type: Date, default: Date.now },
}));

// Navbar মডেল
const NavItem = mongoose.models.NavItem || mongoose.model("NavItem", new mongoose.Schema({
  name: String, link: String, createdAt: { type: Date, default: Date.now },
}));

// ---------------- ROUTES ----------------

app.get("/", (req, res) => res.send("Backend Server Running"));

// ⭐ Navbar Routes
app.get("/api/nav", async (req, res) => {
  try { await connectDB(); const items = await NavItem.find().sort({ createdAt: 1 }); res.json(items); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/nav", async (req, res) => {
  try { await connectDB(); const newItem = new NavItem(req.body); await newItem.save(); res.json({ success: true }); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/nav/:id", async (req, res) => {
  try { await connectDB(); await NavItem.findByIdAndDelete(req.params.id); res.json({ success: true }); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});

// ⭐ Complaints & Content
app.get("/api/complaints", async (req, res) => {
  try { await connectDB(); const data = await Message.find().sort({ date: -1 }); res.json(data); } 
  catch (err) { res.status(500).json({ error: "Database Error" }); }
});

app.get("/api/content", async (req, res) => {
  try { await connectDB(); const data = await Content.find().sort({ createdAt: -1 }); res.json(data); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/content", async (req, res) => {
  try { await connectDB(); const newItem = new Content(req.body); await newItem.save(); res.status(201).json({ success: true }); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/content/:id", async (req, res) => {
  try { await connectDB(); await Content.findByIdAndDelete(req.params.id); res.json({ success: true }); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = app;