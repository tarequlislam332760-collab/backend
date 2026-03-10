const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ ১. Middleware - CORS এবং JSON সাপোর্ট
// origin: "*" দিলে যেকোনো ডোমেইন থেকে রিকোয়েস্ট কাজ করবে
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true
}));
app.use(express.json());

// ✅ ২. ডাটাবেজ কানেকশন (Timeout ফিক্সসহ)
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Atlas Connected!"))
.catch(err => console.error("❌ DB Error:", err));

// --- ৩. ডাটাবেজ মডেলসমূহ ---

// অভিযোগ মডেল
const Message = mongoose.model('Message', new mongoose.Schema({
    name: String, 
    phone: String, 
    area: String, 
    subject: String, 
    message: String,
    date: { type: Date, default: Date.now }
}));

// কন্টেন্ট মডেল (Project/Blog)
const Content = mongoose.model('Content', new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    image: String,
    category: String, 
    location: String,
    date: { type: String },
    status: String,    
    createdAt: { type: Date, default: Date.now }
}));

// নতুন পেজ মডেল (Add/Edit Pages)
const Page = mongoose.model('Page', new mongoose.Schema({
    type: String, // 'home', 'about', or 'custom'
    title: String,
    subtitle: String,
    content: String,
    slug: String
}));

// --- ৪. API Routes ---

// হোম রুট
app.get('/', (req, res) => {
    res.send("<h1>Naser Rahman MP Backend is Running!</h1>");
});

// ⭐ অভিযোগ (Complaints) API
app.get('/api/complaints', async (req, res) => {
    try {
        const data = await Message.find().sort({ date: -1 });
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/complaints', async (req, res) => {
    try {
        const newMessage = new Message(req.body);
        await newMessage.save();
        res.status(201).json({ success: true, message: "আপনার অভিযোগ সফলভাবে জমা হয়েছে!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ⭐ কন্টেন্ট (Project/Blog) API
app.get('/api/content', async (req, res) => {
    try {
        const data = await Content.find().sort({ createdAt: -1 });
        res.json(data);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/content', async (req, res) => {
    try {
        const newContent = new Content(req.body);
        await newContent.save();
        res.status(201).json({ success: true, message: "আপলোড সফল হয়েছে!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/content/:id', async (req, res) => {
    try {
        await Content.findByIdAndDelete(req.params.id);
        res.json({ message: "ডিলিট সফল হয়েছে!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ⭐ পেজ ম্যানেজমেন্ট (Page Add/Edit) API
app.get('/api/pages', async (req, res) => {
    try {
        const pages = await Page.find();
        res.json(pages);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/page-content', async (req, res) => {
    try {
        const { type, data } = req.body;
        const updatedPage = await Page.findOneAndUpdate(
            { type: type },
            { $set: data },
            { upsert: true, new: true }
        );
        res.json({ success: true, updatedPage });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/pages/:id', async (req, res) => {
    try {
        await Page.findByIdAndDelete(req.params.id);
        res.json({ message: "পেজ ডিলিট সফল হয়েছে!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = app;