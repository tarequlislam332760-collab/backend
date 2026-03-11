const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors({ origin: "*", methods: ["GET", "POST", "PUT", "DELETE"] }));
app.use(express.json());

const DB_LINK = process.env.MONGO_URI || process.env.MONGO_URL;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  try {
    await mongoose.connect(DB_LINK, {
      serverSelectionTimeoutMS: 15000,
      dbName: "tareq_db" 
    });
    console.log("✅ MongoDB Connected to tareq_db");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    throw error;
  }
};

// ✅ মডেলটি ফাংশনের বাইরে একবার ডিফাইন করুন (Overwrite এরর থেকে বাঁচতে)
const navSchema = new mongoose.Schema({
    name: String,
    link: String,
    createdAt: { type: Date, default: Date.now }
});

// যদি মডেল আগে তৈরি করা থাকে তবে সেটি নিবে, না থাকলে নতুন বানাবে
const NavItem = mongoose.models.NavItem || mongoose.model("NavItem", navSchema);

app.get("/", (req, res) => res.send("Backend Server Running"));

app.get("/api/nav", async (req, res) => {
  try { 
    await connectDB(); 
    // ✅ এখানে সরাসরি NavItem ব্যবহার করুন
    const items = await NavItem.find().sort({ createdAt: 1 }); 
    res.json(items); 
  } catch (err) { 
    res.status(500).json({ error: "DB Error: " + err.message }); 
  }
});

// --- অন্যান্য রুট (যদি থাকে) এখানে যোগ করুন ---

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));

module.exports = app;