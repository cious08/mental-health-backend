import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const app = express();

// MIDDLEWARES
app.use(cors({
  origin: "*", // Allows all websites to connect for now to fix your error
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

// TEST ROUTE
app.get("/", (req, res) => {
  res.send("Mental Health API is Running and Connected!");
});

// GET ALL MOODS
app.get("/api/moods", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM moods ORDER BY created_at DESC");
    res.json(rows);
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Failed to fetch moods from database." });
  }
});

// POST A NEW MOOD
app.post("/api/moods", async (req, res) => {
  const { name, mood } = req.body;
  
  if (!name || !mood) {
    return res.status(400).json({ error: "Name and mood are required." });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO moods (name, mood) VALUES (?, ?)",
      [name, mood]
    );
    res.status(201).json({ id: result.insertId, name, mood });
  } catch (error) {
    console.error("Insert Error:", error);
    res.status(500).json({ error: "Could not save your mood." });
  }
});

const PORT = process.env.PORT || 10000; // Standard for Render
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});