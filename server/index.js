import express from "express";
import cors from "cors";
import "dotenv/config";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, timestamp: Date.now() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
