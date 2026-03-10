// backend/server.js (Update this part)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas Connected!"))
  .catch(err => console.error("❌ DB Error:", err));

// --- ১. ডাটাবেজ মডেলসমূহ ---

// অভিযোগ ও মেসেজ মডেল
const MessageSchema = new mongoose.Schema({
    name: String, phone: String, area: String, subject: String, message: String,
    type: String, date: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', MessageSchema);

// প্রজেক্ট ও ব্লগ মডেল (Dynamic Content)
const ContentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    image: String,
    category: String, // 'project' অথবা 'blog'
    location: String, // শুধু প্রজেক্টের জন্য
    date: { type: String },
    status: String,   // 'সম্পন্ন', 'চলমান' ইত্যাদি
    createdAt: { type: Date, default: Date.now }
});
const Content = mongoose.model('Content', ContentSchema);

// --- ২. রুটস (API Routes) ---

// অভিযোগগুলো দেখার API
app.get('/api/complaints', async (req, res) => {
    const data = await Message.find().sort({ date: -1 });
    res.json(data);
});

// নতুন প্রজেক্ট বা ব্লগ যোগ করার API
app.post('/api/content', async (req, res) => {
    try {
        const newContent = new Content(req.body);
        await newContent.save();
        res.status(201).json({ success: true, message: "আপলোড সফল হয়েছে!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// সব প্রজেক্ট ও ব্লগ পাওয়ার API
app.get('/api/content', async (req, res) => {
    const data = await Content.find().sort({ createdAt: -1 });
    res.json(data);
});

// এডিট বা আপডেট করার API
app.put('/api/content/:id', async (req, res) => {
    await Content.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: "আপডেট সফল হয়েছে!" });
});

// ডিলিট করার API
app.delete('/api/content/:id', async (req, res) => {
    await Content.findByIdAndDelete(req.params.id);
    res.json({ message: "ডিলিট করা হয়েছে!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
module.exports = app;