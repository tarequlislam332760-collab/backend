const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware - CORS এবং JSON সাপোর্ট
app.use(cors());
app.use(express.json());

// ডাটাবেজ কানেকশন
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas Connected!"))
  .catch(err => console.error("❌ DB Error:", err));

// --- ১. ডাটাবেজ মডেলসমূহ ---

// অভিযোগ মডেল
const MessageSchema = new mongoose.Schema({
    name: String, 
    phone: String, 
    area: String, 
    subject: String, 
    message: String,
    date: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', MessageSchema);

// কন্টেন্ট মডেল
const ContentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    image: String,
    category: String, 
    location: String,
    date: { type: String },
    status: String,   
    createdAt: { type: Date, default: Date.now }
});
const Content = mongoose.model('Content', ContentSchema);

// --- ২. রুটস (API Routes) ---

// হোম রুট
app.get('/', (req, res) => {
    res.send("<h1>Naser Rahman MP Backend is Running!</h1>");
});

// ⭐ নতুন অভিযোগ সেভ করার API (এটি আগে ছিল না!)
app.post('/api/complaints', async (req, res) => {
    try {
        const newMessage = new Message(req.body);
        await newMessage.save();
        res.status(201).json({ success: true, message: "আপনার অভিযোগ সফলভাবে জমা হয়েছে!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// সব অভিযোগ দেখার API (অ্যাডমিন প্যানেলের জন্য)
app.get('/api/complaints', async (req, res) => {
    try {
        const data = await Message.find().sort({ date: -1 });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// কন্টেন্ট আপলোড API
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

// কন্টেন্ট ডিলিট করার API
app.delete('/api/content/:id', async (req, res) => {
    try {
        await Content.findByIdAndDelete(req.params.id);
        res.json({ message: "ডিলিট সফল হয়েছে!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = app;