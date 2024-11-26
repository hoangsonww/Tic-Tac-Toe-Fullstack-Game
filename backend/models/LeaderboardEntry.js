const mongoose = require("mongoose");

const LeaderboardEntrySchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // One entry per user
  elo: { type: Number, default: 1200 }, // Starting ELO
  totalWins: { type: Number, default: 0 },
  totalLosses: { type: Number, default: 0 },
  totalDraws: { type: Number, default: 0 },
});

module.exports = mongoose.model("LeaderboardEntry", LeaderboardEntrySchema);
