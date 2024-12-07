const mongoose = require("mongoose");

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       description: >
 *         The `User` schema represents the structure for storing user data in the application.
 *         It includes personal information such as email, username, and date of birth,
 *         as well as metadata like ELO rating, games played, and links to social media accounts.
 *         Users have a unique email and username for identification.
 *       required:
 *         - email
 *         - password
 *         - username
 *       properties:
 *         email:
 *           type: string
 *           description: The user's email (unique).
 *           example: user@example.com
 *         password:
 *           type: string
 *           description: The user's password (hashed in production).
 *           example: password123
 *         username:
 *           type: string
 *           description: The unique username of the user.
 *           example: gamer123
 *         elo:
 *           type: number
 *           description: The ELO rating of the user, used for rankings.
 *           default: 1200
 *           example: 1440
 *         dob:
 *           type: string
 *           description: The user's date of birth.
 *           example: 2000-01-01
 *         bio:
 *           type: string
 *           description: A short biography of the user.
 *           example: Loves strategy games and coding.
 *         gamesPlayed:
 *           type: number
 *           description: The total number of games the user has played.
 *           default: 0
 *           example: 25
 *         profilePicture:
 *           type: string
 *           description: A URL to the user's profile picture.
 *           example: https://example.com/profile-pic.jpg
 *         socialMedia:
 *           type: object
 *           description: Links to the user's social media accounts.
 *           properties:
 *             github:
 *               type: string
 *               description: The user's GitHub username or link.
 *               example: https://github.com/example
 *             linkedin:
 *               type: string
 *               description: The user's LinkedIn profile link.
 *               example: https://linkedin.com/in/example
 *             twitter:
 *               type: string
 *               description: The user's Twitter handle or link.
 *               example: https://twitter.com/example
 *             facebook:
 *               type: string
 *               description: The user's Facebook profile link.
 *               example: https://facebook.com/example
 *             instagram:
 *               type: string
 *               description: The user's Instagram profile link.
 *               example: https://instagram.com/example
 *       example:
 *         email: user@example.com
 *         password: password123
 *         username: gamer123
 *         elo: 1440
 *         dob: 2000-01-01
 *         bio: Loves strategy games and coding.
 *         gamesPlayed: 25
 *         profilePicture: https://example.com/profile-pic.jpg
 *         socialMedia:
 *           github: https://github.com/example
 *           linkedin: https://linkedin.com/in/example
 *           twitter: https://twitter.com/example
 *           facebook: https://facebook.com/example
 *           instagram: https://instagram.com/example
 */

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  elo: { type: Number, default: 1200 },
  dob: { type: String },
  bio: { type: String },
  gamesPlayed: { type: Number, default: 0 },
  profilePicture: { type: String },
  socialMedia: {
    github: { type: String },
    linkedin: { type: String },
    twitter: { type: String },
    facebook: { type: String },
    instagram: { type: String },
  },
});

module.exports = mongoose.model("User", UserSchema);
