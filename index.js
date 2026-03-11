const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ✅ CORS (Vercel-এর জন্য credentials ও origin সেট করা ভালো)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use(express.json());

// ✅ MongoDB Connection (Serverless-এ এটি এভাবে হ্যান্ডেল করতে হয়)
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return; // আগে কানেক্ট থাকলে আর করবে না

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // ৫ সেকেন্ডের বেশি সময় নিলে এরর দিবে
    });
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    // সার্ভারলেস ফাংশনে এরর থ্রো করা জরুরি যাতে পরের ধাপ না চলে
    throw new Error("Database connection failed");
  }
};

// ---------------- MODELS ----------------
const Message = mongoose.models.Message || mongoose.model("Message", new mongoose.Schema({
  name: String, phone: String, area: String, subject: String, message: String,
  date: { type: Date, default: Date.now },
}));

// (অন্যান্য মডেলগুলো এখানে থাকবে...)
const Content = mongoose.models.Content || mongoose.model("Content", new mongoose.Schema({
  title: { type: String, required: true }, description: String, image: String,
  category: String, createdAt: { type: Date, default: Date.now },
}));

// ---------------- ROUTES ----------------

app.get("/", (req, res) => res.send("Backend Server Running"));

// ⭐ complaints GET (এখানেই মূল পরিবর্তন)
app.get("/api/complaints", async (req, res) => {
  try {
    await connectDB(); // রিকোয়েস্ট আসার পর আগে কানেকশন নিশ্চিত করবে
    const data = await Message.find().sort({ date: -1 });
    res.json(data);
  } catch (error) {
    console.log("Error details:", error.message);
    res.status(500).json({ error: "Database Connection Error. Please refresh." });
  }
});

// ⭐ complaints POST
app.post("/api/complaints", async (req, res) => {
  try {
    await connectDB();
    const newMessage = new Message(req.body);
    await newMessage.save();
    res.status(201).json({ success: true, message: "সফলভাবে জমা হয়েছে!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// (অন্যান্য API গুলোতেও একইভাবে await connectDB() যোগ করুন)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;