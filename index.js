const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 

const app = express();

// ২. মিডলওয়্যার কনফিগারেশন
app.use(cors()); 
app.use(express.json()); 

// ৩. ডাটাবেস কানেকশন (এখানে আপনার নিজের MongoDB URI লিঙ্কটি দিন)
mongoose.connect('আপনার_মোঙ্গোডিবি_লিঙ্ক_এখানে', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected..."))
  .catch(err => console.error("Could not connect to MongoDB:", err));

// ৪. প্রজেক্ট ও ব্লগের জন্য Schema
const projectSchema = new mongoose.Schema({
  title: String,
  image: String,
  desc: String,
  category: String,
  date: { type: Date, default: Date.now }
});
const Project = mongoose.model('Project', projectSchema);

// ৫. জনগণের অভিযোগের (Complaints) জন্য Schema
const complaintSchema = new mongoose.Schema({
  name: String,
  phone: String,
  message: String,
  date: { type: Date, default: Date.now }
});
const Complaint = mongoose.model('Complaint', complaintSchema);

// --- API রুটস (Routes) ---

// নতুন প্রজেক্ট/ব্লগ সেভ করার API
app.post('/api/projects', async (req, res) => {
  try {
    const newProject = new Project(req.body);
    await newProject.save();
    res.status(201).json(newProject);
  } catch (err) { res.status(500).json(err); }
});

// সব প্রজেক্ট/ব্লগ দেখার API
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find().sort({ date: -1 });
    res.json(projects);
  } catch (err) { res.status(500).json(err); }
});

// সব অভিযোগ (Complaints) দেখার API
app.get('/api/complaints', async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ date: -1 });
    res.json(complaints);
  } catch (err) { res.status(500).json(err); }
});

// প্রজেক্ট আপডেট বা এডিট করার API
app.put('/api/projects/:id', async (req, res) => {
  try {
    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) { res.status(500).json(err); }
});

// প্রজেক্ট ডিলিট করার API
app.delete('/api/projects/:id', async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted Successfully" });
  } catch (err) { res.status(500).json(err); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));