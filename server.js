import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const app = express();

// MIDDLEWARES
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST"]
}));
app.use(express.json());

// DATABASE CONNECTION
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// TEST ROUTE - Check this in your browser to see if API is alive
app.get("/", (req, res) => {
  res.send("🚀 Mental Health API is Running and Connected!");
});

// GET ALL MOODS - Matches your fetchHistory() in Vue
app.get("/api/moods", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM moods ORDER BY created_at DESC");
    res.json(rows);
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Failed to fetch moods from database." });
  }
});

// POST A NEW MOOD - Fixed labels to match MoodForm.vue
app.post("/api/moods", async (req, res) => {
  const { full_name, mood_text } = req.body;
  
  // Validation check
  if (!full_name || !mood_text) {
    return res.status(400).json({ error: "Name and mood are required." });
  }

  try {
    // 1. Simple AI Logic (Simulator)
    const responses = [
      "Remember that it's okay to feel this way. Take a deep breath.",
      "You're doing your best, and that is enough.",
      "Take a small break today; you've earned it.",
      "Stay positive! Every small step counts toward progress."
    ];
    const ai_message = `Hello ${full_name}, ${responses[Math.floor(Math.random() * responses.length)]}`;

    // 2. Insert into Cloud Database
    const [result] = await db.query(
      "INSERT INTO moods (full_name, mood_text, ai_message) VALUES (?, ?, ?)",
      [full_name, mood_text, ai_message]
    );

    // 3. Send back response to Vue
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