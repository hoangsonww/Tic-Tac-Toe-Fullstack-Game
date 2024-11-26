const express = require("express");
const LeaderboardEntry = require("../models/LeaderboardEntry");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

// Get leaderboard
router.get("/", async (req, res) => {
  const leaderboard = await LeaderboardEntry.find().sort({ date: -1 });
  res.json(leaderboard);
});

// Add a new result to the leaderboard
router.post("/", authenticate, async (req, res) => {
  const { player, result } = req.body;

  if (!player || !result || !["win", "loss", "draw"].includes(result)) {
    return res.status(400).json({ error: "Invalid data" });
  }

  const entry = new LeaderboardEntry({ player, result });
  await entry.save();

  res.status(201).json(entry);
});

module.exports = router;
