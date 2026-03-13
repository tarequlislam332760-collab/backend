const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware - CORS এবং JSON পার্সার
app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"] }));
app.use(express.json());

// MongoDB Connection Logic
const DB_LINK = process.env.MONGO_URI || process.env.MONGO_URL;

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    try {
        await mongoose.connect(DB_LINK, { 
            serverSelectionTimeoutMS: 15000, 
            dbName: "tareq_db" 
        });
        console.log("✅ MongoDB Connected Successfully");
    } catch (error) { 
        console.error("❌ DB Error:", error.message); 
    }
};

// --- Models ---
const Complaint = mongoose.models.Complaint || mongoose.model("Complaint", new mongoose.Schema({
    name: String, 
    phone: String, 
    area: String, 
    message: String, 
    createdAt: { type: Date, default: Date.now }
}));

const Content = mongoose.models.Content || mongoose.model("Content", new mongoose.Schema({
    title: String, 
    image: String, 
    description: String, // হিরো বা ব্লগের ডেসক্রিপশনের জন্য যোগ করা হলো
    category: { type: String, enum: ['project', 'blog', 'hero', 'logo'], default: 'project' }, 
    lang: { type: String, default: 'bn' }, 
    createdAt: { type: Date, default: Date.now }
}));

const NavItem = mongoose.models.NavItem || mongoose.model("NavItem", new mongoose.Schema({
    name: String, 
    link: String, 
    lang: { type: String, default: 'bn' }, 
    createdAt: { type: Date, default: Date.now }
}));

// --- Routes ---

app.get("/", (req, res) => {
    res.send("🚀 Nasir Rahman MP Backend is running perfectly!");
});

// Complaints API
app.get("/api/complaints", async (req, res) => {
    try { await connectDB(); const data = await Complaint.find().sort({ createdAt: -1 }); res.json(data); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/complaints", async (req, res) => {
    try { await connectDB(); const data = new Complaint(req.body); await data.save(); res.json({ success: true }); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/complaints/:id", async (req, res) => {
    try { await connectDB(); await Complaint.findByIdAndDelete(req.params.id); res.json({ success: true }); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});

// Content API
app.get("/api/content", async (req, res) => {
    try { await connectDB(); const data = await Content.find().sort({ createdAt: -1 }); res.json(data); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/content", async (req, res) => {
    try { await connectDB(); const data = new Content(req.body); await data.save(); res.json({ success: true }); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.put("/api/content/:id", async (req, res) => {
    try { await connectDB(); await Content.findByIdAndUpdate(req.params.id, req.body); res.json({ success: true }); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete("/api/content/:id", async (req, res) => {
    try { await connectDB(); await Content.findByIdAndDelete(req.params.id); res.json({ success: true }); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});

// Navbar API
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

// Server Listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = app;