const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

let playersData = []; // Stores all submitted players

// --- POST a player's result ---
app.post("/players", (req, res) => {
  const { name, survived, mode } = req.body;
  if (!name || survived === undefined || !mode) {
    return res.status(400).json({ error: "Missing name, survived, or mode" });
  }

  // Check if player already exists for same mode and update
  const existingIndex = playersData.findIndex(p => p.name === name && p.mode === mode);
  if (existingIndex >= 0) {
    playersData[existingIndex].survived = survived;
  } else {
    playersData.push({ name, survived, mode });
  }

  res.json({ success: true, message: "Player saved", player: { name, survived, mode } });
});

// --- GET all players ---
app.get("/players", (req, res) => {
  res.json(playersData);
});

// --- GET players by mode ---
app.get("/players/:mode", (req, res) => {
  const mode = parseInt(req.params.mode);
  res.json(playersData.filter(p => p.mode === mode));
});

// --- GET top players (ignore mode) ---
app.get("/top", (req, res) => {
  if (playersData.length === 0) return res.json([]);
  const maxSurvived = Math.max(...playersData.map(p => p.survived));
  res.json(playersData.filter(p => p.survived === maxSurvived));
});

// --- GET top players by mode ---
app.get("/top/:mode", (req, res) => {
  const mode = parseInt(req.params.mode);
  const filtered = playersData.filter(p => p.mode === mode);
  if (filtered.length === 0) return res.json([]);
  const maxSurvived = Math.max(...filtered.map(p => p.survived));
  res.json(filtered.filter(p => p.survived === maxSurvived));
});

// --- DELETE all players ---
app.delete("/players", (req, res) => {
  playersData = [];
  res.json({ success: true, message: "All players deleted." });
});

// --- DELETE specific player by name ---
app.delete("/players/:name", (req, res) => {
  const name = req.params.name;
  const initialLength = playersData.length;
  playersData = playersData.filter(p => p.name !== name);
  if (playersData.length === initialLength) {
    return res.status(404).json({ error: "Player not found" });
  }
  res.json({ success: true, message: `${name} deleted.` });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
