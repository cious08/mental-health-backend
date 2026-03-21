import express from 'express';
import mysql from 'mysql2/promise'; // This is what was missing!
import cors from 'cors';

const app = express();
app.use(express.json());
// This tells the server: "I only trust my Vite app"
app.use(cors({ 
  origin: "*" 
}));

const db = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "mental_health_db",
  port: 3306
});

// --- ROUTE 1: GET ALL MOODS ---
app.get("/api/moods", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM moods ORDER BY id DESC LIMIT 5");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/moods", async (req, res) => {
  const { full_name, mood_text } = req.body;
  
  // VULNERABLE: We take exactly what the user typed (the script/image tag)
  // and we send it back as the ai_message too.
  let ai_message = mood_text; 

  try {
    const [result] = await db.query(
      "INSERT INTO moods (full_name, mood_text, ai_message) VALUES (?, ?, ?)",
      [full_name, mood_text, ai_message]
    );
    
    // Return the data so Vue can render it immediately
    res.status(201).json({ id: result.insertId, full_name, mood_text, ai_message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/moods", async (req, res) => {
  try {
    // This pulls the last 5 entries, including your malicious script/image
    const [rows] = await db.query("SELECT * FROM moods ORDER BY id DESC LIMIT 5");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log("🚀 Server running in SECURE mode on port 3000"));