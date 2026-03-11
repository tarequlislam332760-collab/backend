const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ ১. CORS ফিক্স
app.use(cors({
    origin: "*", 
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true
}));
app.use(express.json());

// ✅ ২. ডাটাবেজ কানেকশন ফাংশন (Serverless Friendly)
const connectDB = async () => {
    // যদি আগে থেকেই কানেক্টেড থাকে, তবে নতুন করে কানেক্ট করবে না
    if (mongoose.connection.readyState >= 1) return;

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            bufferCommands: false, 
        });
        console.log("✅ MongoDB Atlas Connected!");
    } catch (err) {
        console.error("❌ DB Error:", err);
    }
};

// কানেকশন শুরু করুন
connectDB();

// --- ৩. ডাটাবেজ মডেলসমূহ ---
const Message = mongoose.model('Message', new mongoose.Schema({
    name: String, phone: String, area: String, subject: String, message: String,
    date: { type: Date, default: Date.now }
}));

const Content = mongoose.model('Content', new mongoose.Schema({
    title: { type: String, required: true }, description: String, image: String,
    category: String, createdAt: { type: Date, default: Date.now }
}));

const Page = mongoose.model('Page', new mongoose.Schema({
    type: String, title: String, subtitle: String, content: String, slug: String
}));

// --- ৪. API Routes ---

app.get('/', (req, res) => res.send("<h1>Naser Rahman MP Backend is Running!</h1>"));

// ⭐ অভিযোগ API (এখানে কানেকশন নিশ্চিত করা হয়েছে)
app.get('/api/complaints', async (req, res) => {
    try {
        await connectDB(); // রুট কল হওয়ার সময় নিশ্চিত করবে কানেক্টেড কি না
        const data = await Message.find().sort({ date: -1 });
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/complaints', async (req, res) => {
    try {
        await connectDB();
        const newMessage = new Message(req.body);
        await newMessage.save();
        res.status(201).json({ success: true, message: "সফলভাবে জমা হয়েছে!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ⭐ কন্টেন্ট এবং পেজ API-গুলোতেও একইভাবে await connectDB() যোগ করা হয়েছে

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));

module.exports = app;