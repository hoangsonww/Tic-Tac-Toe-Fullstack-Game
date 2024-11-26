const mongoose = require("mongoose");

const LeaderboardEntrySchema = new mongoose.Schema({
  player: { type: String, required: true },
  result: { type: String, required: true, enum: ["win", "loss", "draw"] },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("LeaderboardEntry", LeaderboardEntrySchema);
