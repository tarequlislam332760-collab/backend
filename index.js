const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"] }));
app.use(express.json());

const DB_LINK = process.env.MONGO_URI || process.env.MONGO_URL;

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    try {
        await mongoose.connect(DB_LINK, { serverSelectionTimeoutMS: 15000, dbName: "tareq_db" });
        console.log("✅ MongoDB Connected");
    } catch (error) { console.error("❌ DB Error:", error.message); }
};

// Content Model
const Content = mongoose.models.Content || mongoose.model("Content", new mongoose.Schema({
    title: String, 
    image: String, 
    description: String,
    category: { type: String, enum: ['project', 'blog', 'hero', 'logo'], default: 'project' },
    lang: { type: String, default: 'bn' }, 
    createdAt: { type: Date, default: Date.now }
}));

// API Routes
app.get("/api/content", async (req, res) => {
    try { 
        await connectDB(); 
        const data = await Content.find().sort({ createdAt: -1 }); 
        res.json(data); 
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post("/api/content", async (req, res) => {
    try { 
        await connectDB(); 
        const data = new Content(req.body); 
        await data.save(); 
        res.json({ success: true }); 
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/", (req, res) => res.send("API is running..."));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server on ${PORT}`));

module.exports = app;