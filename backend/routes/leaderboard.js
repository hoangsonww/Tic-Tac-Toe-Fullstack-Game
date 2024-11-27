const express = require("express");
const LeaderboardEntry = require("../models/LeaderboardEntry");
const User = require("../models/User");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

// ELO configuration
const BASE_ELO = 1200; // Default starting ELO
const K_FACTOR = {
  easy: 16,
  medium: 24,
  hard: 32,
  impossible: 40,
};

/**
 * @swagger
 * tags:
 *   name: Leaderboard
 *   description: API for leaderboard and match management
 */

/**
 * @swagger
 * /leaderboard:
 *   get:
 *     summary: Get the global leaderboard
 *     tags: [Leaderboard]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of players sorted by ELO
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   username:
 *                     type: string
 *                     description: Player's username
 *                   elo:
 *                     type: number
 *                     description: Player's ELO rating
 *                   totalWins:
 *                     type: number
 *                     description: Total number of wins
 *                   totalLosses:
 *                     type: number
 *                     description: Total number of losses
 *                   totalDraws:
 *                     type: number
 *                     description: Total number of draws
 *       500:
 *         description: Failed to fetch leaderboard
 */
router.get("/", async (req, res) => {
  try {
    const leaderboard = await LeaderboardEntry.find().sort({ elo: -1 });
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

/**
 * @swagger
 * /leaderboard/match:
 *   post:
 *     summary: Report a match result between two players
 *     tags: [Leaderboard]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               player:
 *                 type: string
 *                 description: Username of the player
 *               opponent:
 *                 type: string
 *                 description: Username of the opponent
 *               result:
 *                 type: string
 *                 enum: [win, loss, draw]
 *                 description: Result of the match
 *               difficulty:
 *                 type: string
 *                 enum: [easy, medium, hard, impossible]
 *                 description: Difficulty level of the match
 *     responses:
 *       201:
 *         description: Match result recorded successfully
 *       400:
 *         description: Invalid data provided
 *       500:
 *         description: Failed to save match result
 */
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

    const incrementFields = {};
    if (result === "win") incrementFields.totalWins = 1;
    if (result === "loss") incrementFields.totalLosses = 1;
    if (result === "draw") incrementFields.totalDraws = 1;

    const updatedPlayer = await LeaderboardEntry.findOneAndUpdate(
      { username: player },
      {
        $set: { elo: newElo },
        $inc: incrementFields,
      },
      { new: true }
    );

    await updateUserStats(player, newElo, result);

    res.status(201).json({ message: "Match result recorded successfully", updatedPlayer });
  } catch (error) {
    console.error("Error updating match result:", error);
    res.status(500).json({ error: "Failed to save match result" });
  }
});

/**
 * @swagger
 * /leaderboard/ai-match:
 *   post:
 *     summary: Report a match result against AI
 *     tags: [Leaderboard]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               player:
 *                 type: string
 *                 description: Username of the player
 *               result:
 *                 type: string
 *                 enum: [win, loss, draw]
 *                 description: Result of the match
 *               difficulty:
 *                 type: string
 *                 enum: [easy, medium, hard, impossible]
 *                 description: Difficulty level of the match
 *     responses:
 *       201:
 *         description: AI match result recorded successfully
 *       400:
 *         description: Invalid data provided
 *       500:
 *         description: Failed to save match result
 */
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

    const incrementFields = {};
    if (result === "win") incrementFields.totalWins = 1;
    if (result === "loss") incrementFields.totalLosses = 1;
    if (result === "draw") incrementFields.totalDraws = 1;

    const updatedPlayer = await LeaderboardEntry.findOneAndUpdate(
      { username: player },
      {
        $set: { elo: newElo },
        $inc: incrementFields,
      },
      { new: true }
    );

    await updateUserStats(player, newElo, result);

    res.status(201).json({ message: "AI match result recorded successfully", updatedPlayer });
  } catch (error) {
    console.error("Error updating AI match result:", error);
    res.status(500).json({ error: "Failed to save match result" });
  }
});

/**
 * @swagger
 * /leaderboard/search:
 *   get:
 *     summary: Search the leaderboard for a specific username
 *     tags: [Leaderboard]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         description: The username to search for in the leaderboard
 *     responses:
 *       200:
 *         description: Search results containing matched usernames
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   username:
 *                     type: string
 *                     description: Player's username
 *                   elo:
 *                     type: number
 *                     description: Player's ELO rating
 *                   totalWins:
 *                     type: number
 *                     description: Total number of wins
 *                   totalLosses:
 *                     type: number
 *                     description: Total number of losses
 *                   totalDraws:
 *                     type: number
 *                     description: Total number of draws
 *       400:
 *         description: Username query parameter is required
 *       500:
 *         description: Failed to search leaderboard
 */
router.get("/search", async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: "Username query parameter is required." });
  }

  try {
    const results = await LeaderboardEntry.find({
      username: { $regex: username, $options: "i" }, // Case-insensitive partial match
    }).sort({ elo: -1 });

    res.json(results);
  } catch (error) {
    console.error("Error searching leaderboard:", error);
    res.status(500).json({ error: "Failed to search leaderboard" });
  }
});

module.exports = router;
