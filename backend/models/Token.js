const mongoose = require("mongoose");

/**
 * @swagger
 * components:
 *   schemas:
 *     Token:
 *       type: object
 *       required:
 *         - username
 *         - token
 *         - createdAt
 *         - expiresAt
 *       properties:
 *         username:
 *           type: string
 *           description: The unique username associated with the token.
 *           example: johndoe123
 *         token:
 *           type: string
 *           description: The JWT or authentication token issued to the user.
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNjIzMjIzOTAyfQ.sflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the token was created.
 *           example: 2023-12-07T10:20:30Z
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: The expiration date and time for the token.
 *           example: 2023-12-10T10:20:30Z
 *       description: >
 *         Represents a token used for user authentication in the application.
 *         Each token is associated with a specific user and has an expiration time.
 */

const tokenSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  token: { type: String, required: true },
  createdAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
});

module.exports = mongoose.model("Token", tokenSchema);
