const express = require("express");
const User = require("../models/User");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

// Get user profile
router.get("/", authenticate, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

// Update user profile
router.put("/", authenticate, async (req, res) => {
  const { username, dob, bio, profilePicture, socialMedia } = req.body;

  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  if (username && username !== user.username) {
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: "Username already exists" });
    }
  }

  user.username = username || user.username;
  user.dob = dob || user.dob;
  user.bio = bio || user.bio;
  user.profilePicture = profilePicture || user.profilePicture;
  user.socialMedia = socialMedia || user.socialMedia;

  await user.save();
  res.json({ message: "Profile updated successfully" });
});

// Update games played
router.put("/games", authenticate, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  user.gamesPlayed += 1;
  await user.save();
  res.json({ message: "Games played updated successfully", gamesPlayed: user.gamesPlayed });
});

module.exports = router;
