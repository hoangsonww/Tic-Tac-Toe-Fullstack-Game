const User = require("../models/User");

const applyUserMatchResult = async (username, newElo, result) => {
  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.warn(`User ${username} not found while applying match result`);
      return null;
    }

    user.elo = newElo;
    user.gamesPlayed = (user.gamesPlayed || 0) + 1;
    user.lastPlayedAt = new Date();

    if (result === "win") {
      user.totalWins = (user.totalWins || 0) + 1;
      user.streak = (user.streak || 0) + 1;
      user.longestStreak = Math.max(user.longestStreak || 0, user.streak);
    } else if (result === "loss") {
      user.totalLosses = (user.totalLosses || 0) + 1;
      user.streak = 0;
    } else if (result === "draw") {
      user.totalDraws = (user.totalDraws || 0) + 1;
      user.streak = 0;
    }

    await user.save();
    return user;
  } catch (error) {
    console.error("Error applying match result to user", error);
    return null;
  }
};

module.exports = { applyUserMatchResult };
