const express = require("express");
const LeaderboardEntry = require("../models/LeaderboardEntry");
const User = require("../models/User");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

// ELO configuration
const BASE_ELO = 1200; // Default starting ELO
const K_FACTOR = {
  easy: 16,      // Lowest impact for Easy mode
  medium: 24,    // Medium impact
  hard: 32,      // Higher impact for Hard mode
  impossible: 40 // Highest impact for Impossible mode
};

/**
 * Calculate new ELO based on the result and difficulty
 * @param {number} playerElo - Current ELO of the player
 * @param {number} opponentElo - Current ELO of the opponent
 * @param {string} result - Result of the match ("win", "loss", "draw")
 * @param {string} difficulty - Difficulty of the match ("easy", "medium", "hard", "impossible")
 * @returns {number} New ELO
 */
const calculateElo = (playerElo, opponentElo, result, difficulty) => {
  const kFactor = K_FACTOR[difficulty.toLowerCase()] || K_FACTOR.medium; // Default to medium if invalid
  const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
  const actualScore = result === "win" ? 1 : result === "draw" ? 0.5 : 0;
  return Math.round(playerElo + kFactor * (actualScore - expectedScore));
};

// Get leaderboard
router.get("/", async (req, res) => {
  try {
    const leaderboard = await LeaderboardEntry.find().sort({ elo: -1 }); // Sort by ELO descending
    res.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// Helper function to update user data
const updateUserStats = async (username, elo, result) => {
  try {
    const user = await User.findOne({ username });
    if (!user) {
      throw new Error("User not found");
    }

    user.elo = elo;
    user.gamesPlayed += 1;

    if (result === "win") user.totalWins += 1;
    if (result === "loss") user.totalLosses += 1;
    if (result === "draw") user.totalDraws += 1;

    await user.save();
  } catch (error) {
    console.error("Error updating user stats:", error);
  }
};

// Report match result
router.post("/match", authenticate, async (req, res) => {
  const { player, opponent, result, difficulty } = req.body;

  if (
    !player ||
    !result ||
    !difficulty ||
    !["win", "loss", "draw"].includes(result) ||
    !["easy", "medium", "hard", "impossible"].includes(difficulty.toLowerCase())
  ) {
    return res.status(400).json({ error: "Invalid data" });
  }

  try {
    const playerEntry = await LeaderboardEntry.findOneAndUpdate(
      { username: player },
      {
        $setOnInsert: { elo: BASE_ELO, totalWins: 0, totalLosses: 0, totalDraws: 0 },
      },
      { upsert: true, new: true }
    );

    const opponentElo = opponent
      ? (await LeaderboardEntry.findOne({ username: opponent }))?.elo || BASE_ELO
      : BASE_ELO;
    const newElo = calculateElo(playerEntry.elo, opponentElo, result, difficulty);

    // Update player's leaderboard stats
    const incrementFields = {};
    if (result === "win") incrementFields.totalWins = 1;
    if (result === "loss") incrementFields.totalLosses = 1;
    if (result === "draw") incrementFields.totalDraws = 1;

    const updatedPlayer = await LeaderboardEntry.findOneAndUpdate(
      { username: player },
      {
        $set: { elo: newElo },
        $inc: incrementFields, // Increment wins/losses/draws
      },
      { new: true }
    );

    // Synchronize user stats
    await updateUserStats(player, newElo, result);

    res.status(201).json({ message: "Match result recorded successfully", updatedPlayer });
  } catch (error) {
    console.error("Error updating match result:", error);
    res.status(500).json({ error: "Failed to save match result" });
  }
});

// Report AI match result
router.post("/ai-match", authenticate, async (req, res) => {
  const { player, result, difficulty } = req.body;

  if (
    !player ||
    !result ||
    !difficulty ||
    !["win", "loss", "draw"].includes(result) ||
    !["easy", "medium", "hard", "impossible"].includes(difficulty.toLowerCase())
  ) {
    return res.status(400).json({ error: "Invalid data" });
  }

  try {
    const playerEntry = await LeaderboardEntry.findOneAndUpdate(
      { username: player },
      {
        $setOnInsert: { elo: BASE_ELO, totalWins: 0, totalLosses: 0, totalDraws: 0 },
      },
      { upsert: true, new: true }
    );

    const newElo = calculateElo(playerEntry.elo, BASE_ELO, result, difficulty);

    // Update player's leaderboard stats
    const incrementFields = {};
    if (result === "win") incrementFields.totalWins = 1;
    if (result === "loss") incrementFields.totalLosses = 1;
    if (result === "draw") incrementFields.totalDraws = 1;

    const updatedPlayer = await LeaderboardEntry.findOneAndUpdate(
      { username: player },
      {
        $set: { elo: newElo },
        $inc: incrementFields, // Increment wins/losses/draws
      },
      { new: true }
    );

    // Synchronize user stats
    await updateUserStats(player, newElo, result);

    res.status(201).json({ message: "AI match result recorded successfully", updatedPlayer });
  } catch (error) {
    console.error("Error updating AI match result:", error);
    res.status(500).json({ error: "Failed to save AI match result" });
  }
});

module.exports = router;
