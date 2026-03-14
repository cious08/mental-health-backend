import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

dotenv.config();

const app = express();

// --- NEW MIDDLEWARES ---
// 1. Request Logging (Professional Grade)
app.use(morgan('dev')); 

// 2. Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, // Temporarily 100 for testing, change to 5 for your final submission
  message: "Too many requests from this IP, please try again later."
});
app.use(limiter); 
// -----------------------

// ORIGINAL MIDDLEWARES
app.use(cors({
  origin: "http://localhost:5173", 
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.json());

// DATABASE CONNECTION
const db = mysql.createPool({
  host: "localhost",
  user: "root", 
  password: "", 
  database: "wellness_db", 
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// PART 4 – System Health Check Endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "API running" });
});

// GET ALL MOODS
app.get("/api/moods", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM moods ORDER BY created_at DESC");
    res.json(rows);
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Failed to fetch moods." });
  }
});

// POST A NEW MOOD
app.post("/api/moods", async (req, res) => {
  // --- PART 0.2 LOGGING ---
  console.log("POST /api/moods request received");
  console.log("Request body:", req.body);

  const { full_name, mood_text } = req.body;
  
  if (!full_name || !mood_text) {
    return res.status(400).json({ error: "Name and mood are required." });
  }

  try {
    const responses = [
      "Remember that it's okay to feel this way. Take a deep breath.",
      "You're doing your best, and that is enough.",
      "Take a small break today; you've earned it.",
      "Stay positive! Every small step counts toward progress."
    ];
    const ai_message = `Hello ${full_name}, ${responses[Math.floor(Math.random() * responses.length)]}`;

    const [result] = await db.query(
      "INSERT INTO moods (full_name, mood_text, ai_message) VALUES (?, ?, ?)",
      [full_name, mood_text, ai_message]
    );

    // --- PART 0.2 LOGGING ---
    console.log("Database insert result:", result);

    res.status(201).json({ 
      id: result.insertId, 
      full_name, 
      mood_text, 
      ai_message 
    });
  } catch (error) {
    console.error("Insert Error:", error);
    res.status(500).json({ error: "Could not save your mood." });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});