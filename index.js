const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ডাটাবেজ কানেকশন
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas Connected!"))
  .catch(err => console.error("❌ DB Error:", err));

// --- ১. ডাটাবেজ মডেলসমূহ ---

// অভিযোগ ও মেসেজ মডেল
const MessageSchema = new mongoose.Schema({
    name: String, 
    phone: String, 
    area: String, 
    subject: String, 
    message: String,
    type: String, 
    date: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', MessageSchema);

// প্রজেক্ট ও ব্লগ মডেল
const ContentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    image: String,
    category: String, // 'project' অথবা 'blog'
    location: String,
    date: { type: String },
    status: String,   
    createdAt: { type: Date, default: Date.now }
});
const Content = mongoose.model('Content', ContentSchema);

// --- ২. রুটস (API Routes) ---

// হোম রুট (সার্ভার চেক করার জন্য)
app.get('/', (req, res) => {
    res.send("<h1>Naser Rahman MP Backend is Running!</h1>");
});

// সব অভিযোগ দেখার API
app.get('/api/complaints', async (req, res) => {
    try {
        const data = await Message.find().sort({ date: -1 });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// নতুন কন্টেন্ট (প্রজেক্ট/ব্লগ) আপলোড করার API
app.post('/api/content', async (req, res) => {
    try {
        const newContent = new Content(req.body);
        await newContent.save();
        res.status(201).json({ success: true, message: "আপলোড সফল হয়েছে!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// সব কন্টেন্ট পাওয়ার API
app.get('/api/content', async (req, res) => {
    try {
        const data = await Content.find().sort({ createdAt: -1 });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ডিলিট করার API
app.delete('/api/content/:id', async (req, res) => {
    try {
        await Content.findByIdAndDelete(req.params.id);
        res.json({ message: "ডিলিট সফল হয়েছে!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// সার্ভার পোর্ট সেটআপ
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = app;