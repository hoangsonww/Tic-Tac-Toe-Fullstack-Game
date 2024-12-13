const mongoose = require("mongoose");

/**
 * @swagger
 * components:
 *   schemas:
 *     LeaderboardEntry:
 *       type: object
 *       description: >
 *         The `LeaderboardEntry` schema represents a player's standing on the leaderboard.
 *         It tracks the player's username, ELO rating (used for rankings), and performance
 *         metrics such as total wins, losses, and draws. Each player has a unique entry.
 *       required:
 *         - username
 *       properties:
 *         username:
 *           type: string
 *           description: The unique username of the player.
 *           example: player123
 *         elo:
 *           type: number
 *           description: The player's ELO rating, used for ranking on the leaderboard.
 *           default: 1200
 *           example: 1450
 *         totalWins:
 *           type: number
 *           description: The total number of matches the player has won.
 *           default: 0
 *           example: 30
 *         totalLosses:
 *           type: number
 *           description: The total number of matches the player has lost.
 *           default: 0
 *           example: 15
 *         totalDraws:
 *           type: number
 *           description: The total number of matches that ended in a draw for the player.
 *           default: 0
 *           example: 5
 *       example:
 *         username: player123
 *         elo: 1450
 *         totalWins: 30
 *         totalLosses: 15
 *         totalDraws: 5
 */

const LeaderboardEntrySchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  elo: { type: Number, default: 1200 },
  totalWins: { type: Number, default: 0 },
  totalLosses: { type: Number, default: 0 },
  totalDraws: { type: Number, default: 0 },
});

module.exports = mongoose.model("LeaderboardEntry", LeaderboardEntrySchema);
