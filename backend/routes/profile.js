const express = require("express");
const User = require("../models/User");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

// Get user profile
router.get("/", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("username email dob bio profilePicture socialMedia elo gamesPlayed");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Failed to load profile data" });
  }
});

// Update user profile
router.put("/", authenticate, async (req, res) => {
  const { dob, bio, socialMedia } = req.body;

  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Update only allowed fields
    if (dob) user.dob = dob;
    if (bio) user.bio = bio;

    if (socialMedia) {
      const allowedPlatforms = ["github", "twitter", "facebook", "instagram", "linkedin"];

      // Ensure socialMedia object exists
      user.socialMedia = user.socialMedia || {};

      allowedPlatforms.forEach((platform) => {
        if (socialMedia[platform] !== undefined) {
          user.socialMedia[platform] = socialMedia[platform]; // Update or add platform field
        }
      });
    }

    await user.save();
    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Update games played
router.put("/games", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.gamesPlayed += 1;
    await user.save();
    res.json({ message: "Games played updated successfully", gamesPlayed: user.gamesPlayed });
  } catch (error) {
    console.error("Error updating games played:", error);
    res.status(500).json({ error: "Failed to update games played" });
  }
});

module.exports = router;
