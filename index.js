const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // ১. এটি অবশ্যই থাকতে হবে

const app = express();

// ২. মিডলওয়্যার কনফিগারেশন (এটি API গুলোর উপরে থাকবে)
app.use(cors()); // যাতে অন্য ওয়েবসাইট থেকে ডাটা আসতে পারে
app.use(express.json()); // যাতে ফ্রন্টএন্ড থেকে পাঠানো JSON ডাটা ব্যাকএন্ড বুঝতে পারে

// --- এরপর আপনার দেওয়া সেই কোডগুলো বসান ---

// প্রজেক্ট ও ব্লগের জন্য Schema
const projectSchema = new mongoose.Schema({
  title: String,
  image: String,
  desc: String,
  category: String,
  date: { type: Date, default: Date.now }
});

const Project = mongoose.model('Project', projectSchema);

// ২. ডাটা সেভ করার API (Save)
app.post('/api/projects', async (req, res) => {
  try {
    const newProject = new Project(req.body);
    await newProject.save();
    res.status(201).json(newProject);
  } catch (err) { res.status(500).json(err); }
});

// ৩. সব ডাটা দেখার API (Fetch)
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find().sort({ date: -1 });
    res.json(projects);
  } catch (err) { res.status(500).json(err); }
});

// বাকি API গুলো (PUT, DELETE) নিচে থাকবে...