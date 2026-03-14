const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB কানেকশন স্ট্রিং
const DB_LINK = process.env.MONGO_URI || process.env.MONGO_URL;

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    try {
        await mongoose.connect(DB_LINK, { 
            serverSelectionTimeoutMS: 15000, 
            dbName: "tareq_db" 
        });
        console.log("✅ MongoDB Connected");
    } catch (error) { 
        console.error("❌ DB Error:", error.message); 
    }
};

// --- Database Models ---

// ১. কন্টেন্ট মডেল (Hero, Project, Blog এর জন্য)
const Content = mongoose.models.Content || mongoose.model("Content", new mongoose.Schema({
    title: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, default: 'project' },
    lang: { type: String, default: 'bn' },
    createdAt: { type: Date, default: Date.now }
}));

// ২. নেভবার মডেল (মেনু আইটেমের জন্য)
const Nav = mongoose.models.Nav || mongoose.model("Nav", new mongoose.Schema({
    name: { type: String, required: true },
    link: { type: String, required: true },
    lang: { type: String, default: 'bn' }
}));

// ৩. অভিযোগ মডেল (User Complaints)
const Complaint = mongoose.models.Complaint || mongoose.model("Complaint", new mongoose.Schema({
    name: String, 
    phone: String, 
    area: String, 
    message: String, 
    createdAt: { type: Date, default: Date.now }
}));

// ৪. পেজ মডেল (ডাইনামিক পেজের জন্য)
const Page = mongoose.models.Page || mongoose.model("Page", new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    lang: { type: String, default: 'bn' },
    createdAt: { type: Date, default: Date.now }
}));

// মিডলওয়্যার হিসেবে ডাটাবেস কানেকশন কল করা
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

// --- API Routes ---

// [Content Routes]
app.get("/api/content", async (req, res) => {
    try { const data = await Content.find().sort({ createdAt: -1 }); res.json(data); } 
    catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post("/api/content", async (req, res) => {
    try { const newItem = new Content(req.body); await newItem.save(); res.json({ success: true }); } 
    catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.put("/api/content/:id", async (req, res) => {
    try { await Content.findByIdAndUpdate(req.params.id, req.body); res.json({ success: true }); } 
    catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.delete("/api/content/:id", async (req, res) => {
    try { await Content.findByIdAndDelete(req.params.id); res.json({ success: true }); } 
    catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// [Nav Routes]
app.get("/api/nav", async (req, res) => {
    try { const data = await Nav.find(); res.json(data); } 
    catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post("/api/nav", async (req, res) => {
    try { const newNav = new Nav(req.body); await newNav.save(); res.json({ success: true }); } 
    catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.delete("/api/nav/:id", async (req, res) => {
    try { await Nav.findByIdAndDelete(req.params.id); res.json({ success: true }); } 
    catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// [Complaint Routes]
app.get("/api/complaints", async (req, res) => {
    try { const data = await Complaint.find().sort({ createdAt: -1 }); res.json(data); } 
    catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post("/api/complaints", async (req, res) => {
    try { const newComp = new Complaint(req.body); await newComp.save(); res.json({ success: true }); } 
    catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.delete("/api/complaints/:id", async (req, res) => {
    try { await Complaint.findByIdAndDelete(req.params.id); res.json({ success: true }); } 
    catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// [Dynamic Page Routes]
app.get("/api/pages", async (req, res) => {
    try { const data = await Page.find().sort({ createdAt: -1 }); res.json(data); } 
    catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.get("/api/pages/:slug", async (req, res) => {
    try { const page = await Page.findOne({ slug: req.params.slug }); res.json(page); } 
    catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post("/api/pages", async (req, res) => {
    try { const newPage = new Page(req.body); await newPage.save(); res.json({ success: true }); } 
    catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.put("/api/pages/:id", async (req, res) => {
    try { await Page.findByIdAndUpdate(req.params.id, req.body); res.json({ success: true }); } 
    catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.delete("/api/pages/:id", async (req, res) => {
    try { await Page.findByIdAndDelete(req.params.id); res.json({ success: true }); } 
    catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// Root Route
app.get("/", (req, res) => res.send("Backend is Live and Working! 🚀"));

// সার্ভার লিসেনিং
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = app;