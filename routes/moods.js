import express from "express";
import { db } from "../db.js";
import { getAIResponse } from "../services/aiService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { full_name, mood_text } = req.body;

  if (!full_name || !mood_text) {
    return res.status(400).json({ error: "Name and mood are required." });
  }

  try {
    // 1. Get Dynamic AI Message
    const ai_message = await getAIResponse(mood_text);

    // 2. Find/Create User
    let [user] = await db.query("SELECT id FROM users WHERE full_name = ?", [full_name]);
    let userId = user.length === 0 
      ? (await db.query("INSERT INTO users (full_name) VALUES (?)", [full_name]))[0].insertId 
      : user[0].id;

    // 3. Save Mood
    const [moodRes] = await db.query("INSERT INTO mood_entries (user_id, mood_text) VALUES (?, ?)", [userId, mood_text]);
    
    // 4. Save AI Response
    await db.query("INSERT INTO ai_responses (mood_entry_id, ai_message) VALUES (?, ?)", [moodRes.insertId, ai_message]);

    res.json({ ai_message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  const [rows] = await db.query(`
    SELECT u.full_name, m.mood_text, a.ai_message 
    FROM users u 
    JOIN mood_entries m ON u.id = m.user_id 
    JOIN ai_responses a ON m.id = a.mood_entry_id 
    ORDER BY m.id DESC
  `);
  res.json(rows);
});

export default router;