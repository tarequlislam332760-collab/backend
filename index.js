const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection String
const DB_LINK = process.env.MONGO_URI || process.env.MONGO_URL;

// Database Connection logic for Vercel (Serverless)
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    try {
        await mongoose.connect(DB_LINK, { 
            serverSelectionTimeoutMS: 15000, 
            dbName: "tareq_db" 
        });
        console.log("✅ MongoDB Connected Successfully");
    } catch (error) { 
        console.error("❌ MongoDB Connection Error:", error.message); 
    }
};

// --- Database Models ---

// ১. Content Model (Hero, Project, Blog, Logo)
const Content = mongoose.models.Content || mongoose.model("Content", new mongoose.Schema({
    title: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, default: 'project' },
    lang: { type: String, default: 'bn' },
    createdAt: { type: Date, default: Date.now }
}));

// ২. Navbar Model
const Nav = mongoose.models.Nav || mongoose.model("Nav", new mongoose.Schema({
    name: { type: String, required: true },
    link: { type: String, required: true },
    lang: { type: String, default: 'bn' }
}));

// ৩. Complaint Model
const Complaint = mongoose.models.Complaint || mongoose.model("Complaint", new mongoose.Schema({
    name: String,
    email: String,
    message: String,
    createdAt: { type: Date, default: Date.now }
}));

// Auto-connect DB middleware
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

// --- API ROUTES ---

// --- 1. Content API ---
app.get("/api/content", async (req, res) => {
    try {
        const data = await Content.find().sort({ createdAt: -1 });
        res.json(data);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post("/api/content", async (req, res) => {
    try {
        const newItem = new Content(req.body);
        await newItem.save();
        res.json({ success: true, data: newItem });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.put("/api/content/:id", async (req, res) => {
    try {
        await Content.findByIdAndUpdate(req.params.id, req.body);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.delete("/api/content/:id", async (req, res) => {
    try {
        await Content.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- 2. Navbar API ---
app.get("/api/nav", async (req, res) => {
    try {
        const data = await Nav.find();
        res.json(data);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post("/api/nav", async (req, res) => {
    try {
        const newNav = new Nav(req.body);
        await newNav.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.delete("/api/nav/:id", async (req, res) => {
    try {
        await Nav.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- 3. Complaints API ---
app.get("/api/complaints", async (req, res) => {
    try {
        const data = await Complaint.find().sort({ createdAt: -1 });
        res.json(data);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post("/api/complaints", async (req, res) => {
    try {
        const newComp = new Complaint(req.body);
        await newComp.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.delete("/api/complaints/:id", async (req, res) => {
    try {
        await Complaint.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Root Route
app.get("/", (req, res) => {
    res.send("Backend is Live and Running!");
});

// Server Listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;