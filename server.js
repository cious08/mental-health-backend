import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const app = express();

// MIDDLEWARES
app.use(cors());
app.use(express.json());

// DATABASE CONNECTION
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
});

// TEST ROUTE (To check if backend is alive)
app.get("/", (req, res) => {
  res.send("Mental Health API is Running!");
});

// GET ALL MOODS
app.get("/api/moods", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM moods ORDER BY created_at DESC");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST A NEW MOOD
app.post("/api/moods", async (req, res) => {
  const { name, mood } = req.body;
  try {
    const [result] = await db.query(
      "INSERT INTO moods (name, mood) VALUES (?, ?)",
      [name, mood]
    );
    res.status(201).json({ id: result.insertId, name, mood });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});