const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ডাটাবেজ কানেকশন
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Atlas Connected!"))
  .catch(err => console.error("❌ DB Error:", err));

// ১. কমন স্কিমা (যাতে সব ধরনের মেসেজ সেভ করা যায়)
const MessageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    area: { type: String },    // শুধু অভিযোগের জন্য
    subject: { type: String }, // শুধু কন্টাক্টের জন্য
    message: { type: String, required: true },
    type: { type: String },    // 'contact' অথবা 'complaint' চেনার জন্য
    date: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', MessageSchema);

// ২. অভিযোগ জমা দেওয়ার রুট (Complaint)
app.post('/api/complaints', async (req, res) => {
    try {
        const data = { ...req.body, type: 'complaint' };
        const newMessage = new Message(data);
        await newMessage.save();
        res.status(200).json({ success: true, message: "Complaint saved!" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ৩. কন্টাক্ট মেসেজ জমা দেওয়ার রুট (Contact) - এটাই আপনার মিসিং ছিল
app.post('/api/messages', async (req, res) => {
    try {
        const data = { ...req.body, type: 'contact' };
        const newMessage = new Message(data);
        await newMessage.save();
        res.status(200).json({ success: true, message: "Message saved!" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));