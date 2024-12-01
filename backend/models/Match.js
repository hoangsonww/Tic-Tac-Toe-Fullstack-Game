const mongoose = require("mongoose");

/**
 * @swagger
 * components:
 *   schemas:
 *     Match:
 *       type: object
 *       required:
 *         - player
 *       properties:
 *         player:
 *           type: string
 *           description: The username of the player who initiated the match.
 *         opponent:
 *           type: string
 *           description: The username of the opponent (optional).
 *         status:
 *           type: string
 *           description: The current status of the match.
 *           enum:
 *             - waiting
 *             - active
 *             - complete
 *           default: waiting
 *         moves:
 *           type: array
 *           description: A list of moves made during the match.
 *           items:
 *             type: object
 *             properties:
 *               player:
 *                 type: string
 *                 description: The username of the player making the move.
 *               move:
 *                 type: object
 *                 properties:
 *                   row:
 *                     type: integer
 *                     description: The row index of the move.
 *                   column:
 *                     type: integer
 *                     description: The column index of the move.
 *         winner:
 *           type: string
 *           description: The username of the match winner (if any).
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The timestamp when the match was created.
 *         lastMoveTime:
 *           type: string
 *           format: date-time
 *           description: The timestamp of the last move made in the match.
 */

const matchSchema = new mongoose.Schema({
  player: { type: String, required: true },
  opponent: { type: String },
  status: {
    type: String,
    enum: ["waiting", "active", "complete"],
    default: "waiting",
  },
  moves: [{ player: String, move: { row: Number, column: Number } }],
  winner: { type: String },
  createdAt: { type: Date, default: Date.now },
  lastMoveTime: { type: Date },
});

module.exports = mongoose.model("Match", matchSchema);
