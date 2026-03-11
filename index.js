const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ CORS এ "OPTIONS" মেথড যোগ করা হয়েছে যাতে ব্রাউজার ব্লক না করে
app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"] }));
app.use(express.json());

const DB_LINK = process.env.MONGO_URI || process.env.MONGO_URL;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  try {
    await mongoose.connect(DB_LINK, {
      serverSelectionTimeoutMS: 15000,
      dbName: "tareq_db" 
    });
    console.log("✅ MongoDB Connected to tareq_db");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
  }
};

// 🛠️ মডেলগুলো ডিফাইন করা হলো
const NavItem = mongoose.models.NavItem || mongoose.model("NavItem", new mongoose.Schema({
    name: String,
    link: String,
    createdAt: { type: Date, default: Date.now }
}));

const Complaint = mongoose.models.Complaint || mongoose.model("Complaint", new mongoose.Schema({
    name: String,
    phone: String,
    message: String,
    createdAt: { type: Date, default: Date.now }
}));

const Content = mongoose.models.Content || mongoose.model("Content", new mongoose.Schema({
    title: String,
    image: String,
    category: String,
    createdAt: { type: Date, default: Date.now }
}));

app.get("/", (req, res) => res.send("Backend Server Running Successfully"));

// 🌐 Nav Items Routes
app.get("/api/nav", async (req, res) => {
  try { await connectDB(); const items = await NavItem.find().sort({ createdAt: 1 }); res.json(items); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/nav", async (req, res) => {
  try { await connectDB(); const newItem = new NavItem(req.body); await newItem.save(); res.json({ success: true }); } 
  catch (err) { res.status(500).json({ error: err.message }); }
});

// 📩 Complaints Routes
app.get("/api/complaints", async (req, res) => {
    try { await connectDB(); const data = await Complaint.find().sort({ createdAt: -1 }); res.json(data); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});

// 📁 Content Routes
app.get("/api/content", async (req, res) => {
    try { await connectDB(); const data = await Content.find().sort({ createdAt: -1 }); res.json(data); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/content", async (req, res) => {
    try { await connectDB(); const data = new Content(req.body); await data.save(); res.json({ success: true }); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/content/:id", async (req, res) => {
    try { await connectDB(); await Content.findByIdAndDelete(req.params.id); res.json({ success: true }); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));

module.exports = app;