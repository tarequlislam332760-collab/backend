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

// --- ১. অভিযোগ ও কন্টাক্টের জন্য Schema ---
const MessageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    area: { type: String },    
    subject: { type: String }, 
    message: { type: String, required: true },
    type: { type: String },    
    date: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', MessageSchema);

// --- ২. ব্লগ ও প্রজেক্টের জন্য নতুন Schema ---
const ProjectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    image: { type: String, required: true },
    desc: { type: String, required: true },
    category: { type: String, required: true }, // 'project' or 'blog'
    date: { type: Date, default: Date.now }
});
const Project = mongoose.model('Project', ProjectSchema);


// --- রুটস (Routes) ---

app.get('/', (req, res) => {
    res.send("<h1>Backend Server is Running with CRUD!</h1>");
});

// --- অভিযোগের API ---
app.get('/api/complaints', async (req, res) => {
    try {
        const complaints = await Message.find({ type: 'complaint' }).sort({ date: -1 });
        res.status(200).json(complaints);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- প্রজেক্ট ও ব্লগের CRUD API ---

// ১. সব প্রজেক্ট/ব্লগ দেখা (Fetch)
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await Project.find().sort({ date: -1 });
        res.status(200).json(projects);
    } catch (err) {
        res.status(500).json(err);
    }
});

// ২. নতুন প্রজেক্ট/ব্লগ যোগ করা (Save)
app.post('/api/projects', async (req, res) => {
    try {
        const newProject = new Project(req.body);
        const saved = await newProject.save();
        res.status(201).json(saved);
    } catch (err) {
        res.status(500).json(err);
    }
});

// ৩. প্রজেক্ট/ব্লগ আপডেট করা (Edit)
app.put('/api/projects/:id', async (req, res) => {
    try {
        const updated = await Project.findByIdAndUpdate(
            req.params.id, 
            { $set: req.body }, 
            { new: true }
        );
        res.status(200).json(updated);
    } catch (err) {
        res.status(500).json(err);
    }
});

// ৪. প্রজেক্ট/ব্লগ ডিলিট করা (Delete)
app.delete('/api/projects/:id', async (req, res) => {
    try {
        await Project.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json(err);
    }
});

// সার্ভার লিসেন
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = app;