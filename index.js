const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// CORS Settings - ভার্সেলের জন্য এটি পারফেক্ট
app.use(cors());
app.use(express.json());

const DB_LINK = process.env.MONGO_URI || process.env.MONGO_URL;

// Database Connection Function
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

// --- Models ---
const Content = mongoose.models.Content || mongoose.model("Content", new mongoose.Schema({
    title: String, 
    image: String, 
    category: { type: String, enum: ['project', 'blog', 'hero', 'logo'], default: 'project' },
    lang: { type: String, default: 'bn' }, 
    createdAt: { type: Date, default: Date.now }
}));

const Nav = mongoose.models.Nav || mongoose.model("Nav", new mongoose.Schema({
    name: String,
    link: String,
    lang: { type: String, default: 'bn' }
}));

const Complaint = mongoose.models.Complaint || mongoose.model("Complaint", new mongoose.Schema({
    name: String,
    email: String,
    message: String,
    createdAt: { type: Date, default: Date.now }
}));

// --- Middleware to Connect DB ---
// এটি প্রতিটি রিকোয়েস্টে অটোমেটিক ডাটাবেস কানেক্ট করবে
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

// --- Routes ---

// Content
app.get("/api/content", async (req, res) => {
    try { const data = await Content.find().sort({ createdAt: -1 }); res.json(data); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/content", async (req, res) => {
    try { const data = new Content(req.body); await data.save(); res.json({ success: true }); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.put("/api/content/:id", async (req, res) => {
    try { await Content.findByIdAndUpdate(req.params.id, req.body); res.json({ success: true }); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/content/:id", async (req, res) => {
    try { await Content.findByIdAndDelete(req.params.id); res.json({ success: true }); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});

// Nav
app.get("/api/nav", async (req, res) => {
    try { const data = await Nav.find(); res.json(data); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/nav", async (req, res) => {
    try { const data = new Nav(req.body); await data.save(); res.json({ success: true }); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/nav/:id", async (req, res) => {
    try { await Nav.findByIdAndDelete(req.params.id); res.json({ success: true }); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});

// Complaints
app.get("/api/complaints", async (req, res) => {
    try { const data = await Complaint.find().sort({ createdAt: -1 }); res.json(data); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/complaints", async (req, res) => {
    try { const data = new Complaint(req.body); await data.save(); res.json({ success: true }); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/complaints/:id", async (req, res) => {
    try { await Complaint.findByIdAndDelete(req.params.id); res.json({ success: true }); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/", (req, res) => res.send("Backend Running Successfully!"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server on ${PORT}`));

module.exports = app;