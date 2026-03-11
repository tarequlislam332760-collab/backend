const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ ১. CORS ফিক্স (Network Error দূর করার জন্য)
app.use(cors({
    origin: "*", 
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true
}));
app.use(express.json());

// ✅ ২. ডাটাবেজ কানেকশন (Timeout এবং Buffering ফিক্স করা হয়েছে)
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // ৫ সেকেন্ডের মধ্যে কানেক্ট না হলে এরর দিবে
    bufferCommands: false,         // বাফারিং বন্ধ করা হয়েছে যাতে ঝুলে না থাকে
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
    createdAt: { type: Date, default: Date.now }
}));

// পেজ মডেল
const Page = mongoose.model('Page', new mongoose.Schema({
    type: String, 
    title: String, 
    subtitle: String, 
    content: String, 
    slug: String
}));

// --- ৪. API Routes ---

app.get('/', (req, res) => res.send("<h1>Naser Rahman MP Backend is Running!</h1>"));

// ⭐ অভিযোগ API
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
        res.status(201).json({ success: true, message: "সফলভাবে জমা হয়েছে!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ⭐ কন্টেন্ট API
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
        res.status(201).json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/content/:id', async (req, res) => {
    try {
        await Content.findByIdAndDelete(req.params.id);
        res.json({ message: "ডিলিট সফল!" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ⭐ পেজ এডিট API
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));

module.exports = app;