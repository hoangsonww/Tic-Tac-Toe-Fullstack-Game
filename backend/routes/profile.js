const express = require("express");
const User = require("../models/User");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: User profile management
 */

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get the authenticated user's profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The user's profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *                 dob:
 *                   type: string
 *                 bio:
 *                   type: string
 *                 profilePicture:
 *                   type: string
 *                 socialMedia:
 *                   type: object
 *                   additionalProperties:
 *                     type: string
 *                 elo:
 *                   type: number
 *                 gamesPlayed:
 *                   type: number
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to load profile data
 */
router.get("/", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      "username email dob bio profilePicture socialMedia elo gamesPlayed"
    );
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Failed to load profile data" });
  }
});

/**
 * @swagger
 * /profile:
 *   put:
 *     summary: Update the authenticated user's profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dob:
 *                 type: string
 *                 description: Date of birth
 *               bio:
 *                 type: string
 *                 description: User's bio
 *               socialMedia:
 *                 type: object
 *                 description: Social media links
 *                 properties:
 *                   github:
 *                     type: string
 *                   twitter:
 *                     type: string
 *                   facebook:
 *                     type: string
 *                   instagram:
 *                     type: string
 *                   linkedin:
 *                     type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to update profile
 */
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

      user.socialMedia = user.socialMedia || {};

      allowedPlatforms.forEach((platform) => {
        if (socialMedia[platform] !== undefined) {
          user.socialMedia[platform] = socialMedia[platform];
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

/**
 * @swagger
 * /profile/games:
 *   put:
 *     summary: Increment the user's games played count
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Games played updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 gamesPlayed:
 *                   type: number
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to update games played
 */
router.put("/games", authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.gamesPlayed += 1;
    await user.save();
    res.json({
      message: "Games played updated successfully",
      gamesPlayed: user.gamesPlayed,
    });
  } catch (error) {
    console.error("Error updating games played:", error);
    res.status(500).json({ error: "Failed to update games played" });
  }
});

module.exports = router;
