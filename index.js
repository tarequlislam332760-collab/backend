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

// কমন স্কিমা
const MessageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    area: { type: String },    // শুধু অভিযোগের জন্য
    subject: { type: String }, // শুধু কন্টাক্টের জন্য
    message: { type: String, required: true },
    type: { type: String },    // 'contact' অথবা 'complaint'
    date: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', MessageSchema);

// --- রুটস (Routes) ---

// ১. সার্ভার চেক করার জন্য হোম রুট (GET)
app.get('/', (req, res) => {
    res.send("<h1>Backend Server is Running!</h1>");
});

// ২. অভিযোগ দেখার জন্য রুট (GET) - এটি আপনার ব্রাউজারে চেক করতে সাহায্য করবে
app.get('/api/complaints', async (req, res) => {
    try {
        const complaints = await Message.find({ type: 'complaint' });
        res.status(200).json(complaints);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ৩. অভিযোগ জমা দেওয়ার রুট (POST)
app.post('/api/complaints', async (req, res) => {
    try {
        const data = { ...req.body, type: 'complaint' };
        const newMessage = new Message(data);
        await newMessage.save();
        res.status(200).json({ success: true, message: "Complaint saved successfully!" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ৪. কন্টাক্ট মেসেজ জমা দেওয়ার রুট (POST)
app.post('/api/messages', async (req, res) => {
    try {
        const data = { ...req.body, type: 'contact' };
        const newMessage = new Message(data);
        await newMessage.save();
        res.status(200).json({ success: true, message: "Message saved successfully!" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// সার্ভার লিসেন (লোকাল হোস্টের জন্য)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// Vercel এর জন্য এক্সপোর্ট
module.exports = app;