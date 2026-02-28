import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import moodRoutes from "./routes/moods.js";

dotenv.config();

// 1. DAPAT NAUNA ITO: Gagawa muna tayo ng app
const app = express();

// 2. MIDDLEWARES
app.use(cors());
app.use(express.json()); // Mahalaga ito para mabasa ang "mood" data

// 3. ROUTES: Dito tinatawag ang moodRoutes
app.use("/api/moods", moodRoutes);

// 4. PORT BINDING
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
});