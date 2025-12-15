const { validateLeaderboardMatch } = require("../middleware/validation");
const express = require("express");
const LeaderboardEntry = require("../models/LeaderboardEntry");
const Match = require("../models/Match");
const authenticate = require("../middleware/authMiddleware");
const { calculateElo, BASE_ELO } = require("../utils/elo");
const { applyUserMatchResult } = require("../utils/user-stats");

const router = express.Router();
const TIMEOUT_DURATION = 30000; // 30 sec
const WAITING_MATCH_TIMEOUT = 5 * 60 * 1000; // 5 minutes max to find a match

/**
 * @swagger
 * tags:
 *   name: Leaderboard
 *   description: API for leaderboard and match management
 */

/**
 * @swagger
 * /leaderboard:
 *   get:
 *     summary: Get the global leaderboard
 *     tags: [Leaderboard]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of players sorted by ELO with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: Total number of leaderboard entries
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       username:
 *                         type: string
 *                       elo:
 *                         type: number
 *                       totalWins:
 *                         type: number
 *                       totalLosses:
 *                         type: number
 *                       totalDraws:
 *                         type: number
 *       500:
 *         description: Failed to fetch leaderboard
 */
router.get("/", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 10, 1),
      50,
    );
    const skip = (page - 1) * limit;

    const [results, total] = await Promise.all([
      LeaderboardEntry.find().sort({ elo: -1 }).skip(skip).limit(limit),
      LeaderboardEntry.countDocuments(),
    ]);

    res.json({ results, total, page, limit });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

/**
 * @swagger
 * /leaderboard/match:
 *   post:
 *     summary: Report a match result between two players
 *     tags: [Leaderboard]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               player:
 *                 type: string
 *                 description: Username of the player
 *               opponent:
 *                 type: string
 *                 description: Username of the opponent
 *               result:
 *                 type: string
 *                 enum: [win, loss, draw]
 *                 description: Result of the match
 *               difficulty:
 *                 type: string
 *                 enum: [easy, medium, hard, impossible]
 *                 description: Difficulty level of the match
 *     responses:
 *       201:
 *         description: Match result recorded successfully
 *       400:
 *         description: Invalid data provided
 *       500:
 *         description: Failed to save match result
 */
router.post("/match", authenticate, validateLeaderboardMatch, async (req, res) => {
  const { player, opponent, result, difficulty } = req.body;

  try {
    const playerEntry = await LeaderboardEntry.findOneAndUpdate(
      { username: player },
      {
        $setOnInsert: {
          elo: BASE_ELO,
          totalWins: 0,
          totalLosses: 0,
          totalDraws: 0,
        },
      },
      { upsert: true, new: true },
    );

    const opponentElo = opponent
      ? (await LeaderboardEntry.findOne({ username: opponent }))?.elo ||
      BASE_ELO
      : BASE_ELO;
    const newElo = calculateElo(
      playerEntry.elo,
      opponentElo,
      result,
      difficulty,
    );

    const incrementFields = {};
    if (result === "win") incrementFields.totalWins = 1;
    if (result === "loss") incrementFields.totalLosses = 1;
    if (result === "draw") incrementFields.totalDraws = 1;

    const updatedPlayer = await LeaderboardEntry.findOneAndUpdate(
      { username: player },
      {
        $set: { elo: newElo },
        $inc: incrementFields,
      },
      { new: true },
    );

    await applyUserMatchResult(player, newElo, result);

    res
      .status(201)
      .json({ message: "Match result recorded successfully", updatedPlayer });
  } catch (error) {
    console.error("Error updating match result:", error);
    res.status(500).json({ error: "Failed to save match result" });
  }
});

/**
 * @swagger
 * /leaderboard/ai-match:
 *   post:
 *     summary: Report a match result against AI
 *     tags: [Leaderboard]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               player:
 *                 type: string
 *                 description: Username of the player
 *               result:
 *                 type: string
 *                 enum: [win, loss, draw]
 *                 description: Result of the match
 *               difficulty:
 *                 type: string
 *                 enum: [easy, medium, hard, impossible]
 *                 description: Difficulty level of the match
 *     responses:
 *       201:
 *         description: AI match result recorded successfully
 *       400:
 *         description: Invalid data provided
 *       500:
 *         description: Failed to save match result
 */
router.post("/ai-match", authenticate, async (req, res) => {
  const { player, result, difficulty } = req.body;

  if (
    !player ||
    !result ||
    !difficulty ||
    !["win", "loss", "draw"].includes(result) ||
    !["easy", "medium", "hard", "impossible"].includes(difficulty.toLowerCase())
  ) {
    return res.status(400).json({ error: "Invalid data" });
  }

  try {
    const playerEntry = await LeaderboardEntry.findOneAndUpdate(
      { username: player },
      {
        $setOnInsert: {
          elo: BASE_ELO,
          totalWins: 0,
          totalLosses: 0,
          totalDraws: 0,
        },
      },
      { upsert: true, new: true },
    );

    const newElo = calculateElo(playerEntry.elo, BASE_ELO, result, difficulty);

    const incrementFields = {};
    if (result === "win") incrementFields.totalWins = 1;
    if (result === "loss") incrementFields.totalLosses = 1;
    if (result === "draw") incrementFields.totalDraws = 1;

    const updatedPlayer = await LeaderboardEntry.findOneAndUpdate(
      { username: player },
      {
        $set: { elo: newElo },
        $inc: incrementFields,
      },
      { new: true },
    );

    await applyUserMatchResult(player, newElo, result);

    res.status(201).json({
      message: "AI match result recorded successfully",
      updatedPlayer,
    });
  } catch (error) {
    console.error("Error updating AI match result:", error);
    res.status(500).json({ error: "Failed to save match result" });
  }
});

/**
 * @swagger
 * /leaderboard/search:
 *   get:
 *     summary: Search the leaderboard for a specific username
 *     tags: [Leaderboard]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         description: The username to search for in the leaderboard
 *     responses:
 *       200:
 *         description: Search results containing matched usernames
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   username:
 *                     type: string
 *                     description: Player's username
 *                   elo:
 *                     type: number
 *                     description: Player's ELO rating
 *                   totalWins:
 *                     type: number
 *                     description: Total number of wins
 *                   totalLosses:
 *                     type: number
 *                     description: Total number of losses
 *                   totalDraws:
 *                     type: number
 *                     description: Total number of draws
 *       400:
 *         description: Username query parameter is required
 *       500:
 *         description: Failed to search leaderboard
 */
router.get("/search", async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res
      .status(400)
      .json({ error: "Username query parameter is required." });
  }

  try {
    const results = await LeaderboardEntry.find({
      username: { $regex: username, $options: "i" }, // Case-insensitive partial match
    }).sort({ elo: -1 });

    res.json(results);
  } catch (error) {
    console.error("Error searching leaderboard:", error);
    res.status(500).json({ error: "Failed to search leaderboard" });
  }
});

/**
 * @swagger
 * /leaderboard/matchmaking:
 *   post:
 *     summary: Initiate matchmaking for a PvP match
 *     tags: [Leaderboard]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               player:
 *                 type: string
 *                 description: Username of the player
 *     responses:
 *       200:
 *         description: Opponent found
 *       202:
 *         description: Searching for an opponent
 *       500:
 *         description: Internal server error
 */
router.post("/matchmaking", authenticate, async (req, res) => {
  const { player } = req.body;

  try {
    // Clean up stale 'waiting' matches
    await Match.deleteMany({
      status: "waiting",
      createdAt: { $lt: new Date(Date.now() - WAITING_MATCH_TIMEOUT) },
    });

    // Mark any active matches the player is in as 'abandoned'
    await Match.updateMany(
      {
        $or: [{ player }, { opponent: player }],
        status: "active",
      },
      { $set: { status: "abandoned" } },
    );

    // Try to find a pending match from another player
    const pendingMatch = await Match.findOne({
      status: "waiting",
      opponent: null,
      player: { $ne: player },
    }).sort({ createdAt: 1 }); // Get the oldest waiting match

    if (pendingMatch) {
      // If found, assign current player as opponent and activate match
      pendingMatch.opponent = player;
      pendingMatch.status = "active";
      pendingMatch.lastMoveTime = new Date();
      await pendingMatch.save();

      return res.status(200).json({
        message: "Opponent found!",
        matchId: pendingMatch._id,
        opponent: pendingMatch.player,
      });
    }

    // No pending match found, create a new waiting match for this user
    const newMatch = new Match({
      player,
      opponent: null,
      status: "waiting",
      createdAt: new Date(),
    });
    await newMatch.save();

    // Remove all other waiting matches associated with this user,
    // keeping only the most recently created one (newMatch)
    await Match.deleteMany({
      player,
      status: "waiting",
      _id: { $ne: newMatch._id },
    });

    res.status(202).json({ message: "Searching for an opponent..." });
  } catch (error) {
    console.error("Matchmaking error:", error);
    res.status(500).json({ error: "Failed to initiate matchmaking" });
  }
});

/**
 * @swagger
 * /leaderboard/match/move:
 *   post:
 *     summary: Record and synchronize a player's move during an active PvP match
 *     tags: [Leaderboard]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               matchId:
 *                 type: string
 *                 description: The unique identifier for the match
 *               player:
 *                 type: string
 *                 description: The username of the player making the move
 *               move:
 *                 type: object
 *                 description: The position on the game board where the player wants to move
 *                 properties:
 *                   row:
 *                     type: number
 *                     description: The row index of the move (0-based)
 *                   column:
 *                     type: number
 *                     description: The column index of the move (0-based)
 *     responses:
 *       200:
 *         description: The move was successfully synchronized and updated
 *       400:
 *         description: The move is invalid (e.g., the position is already taken, or the match is inactive)
 *       500:
 *         description: An error occurred while processing the move
 */
router.post("/match/move", authenticate, async (req, res) => {
  const { matchId, player, move } = req.body;

  try {
    // Fetch the match by ID
    const match = await Match.findById(matchId);
    if (!match || match.status !== "active") {
      return res.status(400).json({ error: "Invalid or inactive match" });
    }

    // Validate the move to ensure it's not already taken
    const isMoveTaken = match.moves.some(
      (existingMove) =>
        existingMove.move.row === move.row &&
        existingMove.move.column === move.column,
    );

    if (isMoveTaken) {
      return res.status(400).json({ error: "Move already taken" });
    }

    // Save the move
    match.moves.push({ player, move });
    match.lastMoveTime = new Date();
    await match.save();

    res.status(200).json({ message: "Move synchronized", moves: match.moves });
  } catch (error) {
    console.error("Error syncing move:", error);
    res.status(500).json({ error: "Failed to sync move" });
  }
});

/**
 * @swagger
 * /leaderboard/matchmaking/status:
 *   get:
 *     summary: Get the status of the matchmaking process
 *     tags: [Leaderboard]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: player
 *         schema:
 *           type: string
 *         description: The username of the player checking matchmaking status
 *     responses:
 *       200:
 *         description: Matchmaking status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Status message
 *                 matchId:
 *                   type: string
 *                   description: Match ID if a match is found
 *                 opponent:
 *                   type: string
 *                   description: Opponent's username if a match is found
 *       400:
 *         description: Invalid data provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Failed to check matchmaking status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
router.get("/matchmaking/status", authenticate, async (req, res) => {
  const { player } = req.query;

  if (!player) {
    return res.status(400).json({ error: "Player username is required." });
  }

  try {
    // Check if there's an active or waiting match for the player, excluding 'abandoned' matches
    const match = await Match.findOne({
      $or: [{ player }, { opponent: player }],
      status: { $in: ["waiting", "active"] },
    });

    if (match) {
      if (match.status === "active") {
        return res.status(200).json({
          message: "Match found",
          matchId: match._id,
          opponent: match.player === player ? match.opponent : match.player,
        });
      } else if (match.status === "waiting") {
        return res.status(200).json({
          message: "Still searching for an opponent...",
        });
      }
    }

    // If neither, indicate no matchmaking in progress
    res.status(200).json({
      message: "No matchmaking in progress",
    });
  } catch (error) {
    console.error("Error checking matchmaking status:", error);
    res.status(500).json({ error: "Failed to check matchmaking status" });
  }
});

/**
 * @swagger
 * /leaderboard/match/finish:
 *   post:
 *     summary: Finalize and record the result of a PvP match
 *     tags: [Leaderboard]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               matchId:
 *                 type: string
 *                 description: Match ID
 *               winner:
 *                 type: string
 *                 description: Username of the winner
 *     responses:
 *       200:
 *         description: Match result recorded successfully
 *       500:
 *         description: Internal server error
 */
router.post("/match/finish", authenticate, async (req, res) => {
  const { matchId, winner } = req.body;

  try {
    const match = await Match.findById(matchId);
    if (!match || match.status !== "active") {
      return res.status(400).json({ error: "Invalid or inactive match" });
    }

    // Fetch ELO for both players
    const playerEntry = (await LeaderboardEntry.findOne({
      username: match.player,
    })) || {
      username: match.player,
      elo: BASE_ELO,
      totalWins: 0,
      totalLosses: 0,
      totalDraws: 0,
    };
    const opponentEntry = (await LeaderboardEntry.findOne({
      username: match.opponent,
    })) || {
      username: match.opponent,
      elo: BASE_ELO,
      totalWins: 0,
      totalLosses: 0,
      totalDraws: 0,
    };

    // Determine match results
    const playerResult = match.player === winner ? "win" : "loss";
    const opponentResult = match.opponent === winner ? "win" : "loss";

    // Calculate new ELOs
    const newPlayerElo = calculateElo(
      playerEntry.elo,
      opponentEntry.elo,
      playerResult,
      "human",
    );

    console.log("playerEntry.elo", newPlayerElo);

    const newOpponentElo = calculateElo(
      opponentEntry.elo,
      playerEntry.elo,
      opponentResult,
      "human",
    );

    console.log("opponentEntry.elo", newOpponentElo);

    // Update LeaderboardEntry for both players
    // Increment fields dynamically
    const playerIncrementFields = {};
    if (playerResult === "win") playerIncrementFields.totalWins = 1;
    if (playerResult === "loss") playerIncrementFields.totalLosses = 1;
    if (playerResult === "draw") playerIncrementFields.totalDraws = 1;

    const opponentIncrementFields = {};
    if (opponentResult === "win") opponentIncrementFields.totalWins = 1;
    if (opponentResult === "loss") opponentIncrementFields.totalLosses = 1;
    if (opponentResult === "draw") opponentIncrementFields.totalDraws = 1;

    // Update player entry
    await LeaderboardEntry.findOneAndUpdate(
      { username: match.player },
      {
        $set: { elo: newPlayerElo },
        $inc: playerIncrementFields,
      },
      { upsert: true, new: true },
    );

    // Update opponent entry
    await LeaderboardEntry.findOneAndUpdate(
      { username: match.opponent },
      {
        $set: { elo: newOpponentElo },
        $inc: opponentIncrementFields,
      },
      { upsert: true, new: true },
    );

    await applyUserMatchResult(match.player, newPlayerElo, playerResult);
    await applyUserMatchResult(match.opponent, newOpponentElo, opponentResult);

    // Update the match record
    match.status = "complete";
    match.winner = winner;
    await match.save();

    res.status(200).json({ message: "Match finished successfully", match });
  } catch (error) {
    console.error("Match finish error:", error);
    res.status(500).json({ error: "Failed to finish match" });
  }
});

/**
 * @swagger
 * /leaderboard/match/timeout:
 *   post:
 *     summary: Check if a match has timed out and determine the winner if applicable
 *     tags: [Leaderboard]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               matchId:
 *                 type: string
 *                 description: The unique identifier for the match
 *               player:
 *                 type: string
 *                 description: The username of the player making the timeout request
 *     responses:
 *       200:
 *         description: Timeout status of the match
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Timeout status message
 *                 winner:
 *                   type: string
 *                   description: Username of the winner (if the match timed out)
 *                 elapsedTime:
 *                   type: number
 *                   description: Time elapsed since the last move or match creation in milliseconds
 *       400:
 *         description: Invalid or inactive match
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message
 */
router.post("/match/timeout", authenticate, async (req, res) => {
  const { matchId, player } = req.body;

  try {
    const match = await Match.findById(matchId);
    if (!match || match.status !== "active") {
      return res.status(400).json({ error: "Invalid or inactive match" });
    }

    const currentTime = new Date();
    const lastMoveTime = new Date(match.lastMoveTime || match.createdAt);
    const timeElapsed = currentTime - lastMoveTime;

    if (timeElapsed > TIMEOUT_DURATION) {
      // Determine winner and loser based on timeout
      const winner = match.player === player ? match.opponent : match.player;
      const loser = match.player === player ? match.player : match.opponent;

      // Fetch leaderboard entries for both players
      const winnerEntry = (await LeaderboardEntry.findOne({
        username: winner,
      })) || {
        username: winner,
        elo: BASE_ELO,
        totalWins: 0,
        totalLosses: 0,
        totalDraws: 0,
      };

      const loserEntry = (await LeaderboardEntry.findOne({
        username: loser,
      })) || {
        username: loser,
        elo: BASE_ELO,
        totalWins: 0,
        totalLosses: 0,
        totalDraws: 0,
      };

      // Calculate ELO changes
      const newWinnerElo = calculateElo(
        winnerEntry.elo,
        loserEntry.elo,
        "win",
        "human",
      );
      const newLoserElo = calculateElo(
        loserEntry.elo,
        winnerEntry.elo,
        "loss",
        "human",
      );

      // Update leaderboard stats for winner
      await LeaderboardEntry.findOneAndUpdate(
        { username: winner },
        {
          $set: { elo: newWinnerElo },
          $inc: { totalWins: 1 },
        },
        { upsert: true, new: true },
      );

      // Update leaderboard stats for loser
      await LeaderboardEntry.findOneAndUpdate(
        { username: loser },
        {
          $set: { elo: newLoserElo },
          $inc: { totalLosses: 1 },
        },
        { upsert: true, new: true },
      );

      // Update user stats if needed
      await applyUserMatchResult(winner, newWinnerElo, "win");
      await applyUserMatchResult(loser, newLoserElo, "loss");

      // Finalize match status in the database
      match.status = "complete";
      match.winner = winner;
      await match.save();

      return res.status(200).json({
        message: "Timeout! Match completed.",
        winner,
        loser,
        elapsedTime: timeElapsed,
      });
    }

    res.status(200).json({
      message: "No timeout detected",
      elapsedTime: timeElapsed,
    });
  } catch (error) {
    console.error("Timeout check error:", error);
    res.status(500).json({ error: "Failed to check timeout" });
  }
});

/**
 * @swagger
 * /leaderboard/match/state:
 *   get:
 *     summary: Retrieve the current state of the board for a match
 *     tags: [Leaderboard]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: matchId
 *         schema:
 *           type: string
 *         description: The unique identifier for the match
 *     responses:
 *       200:
 *         description: Current state of the match
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 matchId:
 *                   type: string
 *                   description: The unique identifier of the match
 *                 moves:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       player:
 *                         type: string
 *                       move:
 *                         type: object
 *                         properties:
 *                           row:
 *                             type: number
 *                           column:
 *                             type: number
 *                 currentPlayer:
 *                   type: string
 *                   description: The username of the player whose turn it is
 *                 status:
 *                   type: string
 *                   enum: [active, complete]
 *                   description: Current status of the match
 *                 winner:
 *                   type: string
 *                   description: The username of the winner, if applicable
 *       400:
 *         description: Invalid match ID
 *       500:
 *         description: Internal server error
 */
router.get("/match/state", authenticate, async (req, res) => {
  const { matchId } = req.query;

  if (!matchId) {
    return res.status(400).json({ error: "Match ID is required." });
  }

  try {
    const match = await Match.findById(matchId);

    if (!match) {
      return res.status(400).json({ error: "Invalid match ID." });
    }

    const lastMove = match.moves[match.moves.length - 1];
    const currentPlayer =
      !lastMove || lastMove.player === match.opponent
        ? match.player
        : match.opponent;

    res.status(200).json({
      matchId: match._id,
      moves: match.moves, // Return only the moves
      currentPlayer,
      status: match.status,
      winner: match.winner || null,
    });
  } catch (error) {
    console.error("Error retrieving match state:", error);
    res.status(500).json({ error: "Failed to retrieve match state." });
  }
});

/**
 * @swagger
 * /leaderboard/matchmaking/cancel:
 *   post:
 *     summary: Cancel matchmaking and delete any waiting matches for the player
 *     tags: [Leaderboard]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               player:
 *                 type: string
 *                 description: Username of the player
 *     responses:
 *       200:
 *         description: Matchmaking canceled successfully
 *       400:
 *         description: No matchmaking in progress to cancel
 *       500:
 *         description: Failed to cancel matchmaking
 */
router.post("/matchmaking/cancel", async (req, res) => {
  const { player } = req.body;

  if (!player) {
    return res.status(400).json({ error: "Player username is required." });
  }

  try {
    // Find and delete the match where the player is in 'waiting' status
    const match = await Match.findOneAndDelete({
      player: player,
      opponent: null,
      status: "waiting",
    });

    if (match) {
      res.status(200).json({ message: "Matchmaking canceled successfully." });
    } else {
      res.status(400).json({ error: "No matchmaking in progress to cancel." });
    }
  } catch (error) {
    console.error("Error canceling matchmaking:", error);
    res.status(500).json({ error: "Failed to cancel matchmaking." });
  }
});

/**
 * @swagger
 * /leaderboard/match/history:
 *   get:
 *     summary: Get recent matches (with move timeline and events)
 *     tags: [Leaderboard]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         description: Optional username to filter results
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Max number of matches to return (default 20)
 *     responses:
 *       200:
 *         description: List of recent matches
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 matches:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Match'
 *       500:
 *         description: Failed to fetch match history
 */
router.get("/match/history", authenticate, async (req, res) => {
  const { username, limit = 20 } = req.query;
  const parsedLimit = Math.min(parseInt(limit, 10) || 20, 100);
  try {
    const query = username
      ? { $or: [{ player: username }, { opponent: username }] }
      : {};
    const matches = await Match.find(query)
      .sort({ createdAt: -1 })
      .limit(parsedLimit);
    res.json({ matches });
  } catch (error) {
    console.error("Error fetching match history", error);
    res.status(500).json({ error: "Failed to fetch match history" });
  }
});

router.get("/match/:id", authenticate, async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) return res.status(404).json({ error: "Match not found" });
    res.json({ match });
  } catch (error) {
    console.error("Error fetching match", error);
    res.status(500).json({ error: "Failed to fetch match" });
  }
});

router.post("/match/admin/end", async (req, res) => {
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret || req.headers["x-admin-secret"] !== adminSecret) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const { matchId, winner, reason = "admin" } = req.body;
  if (!matchId) return res.status(400).json({ error: "matchId is required" });

  try {
    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ error: "Match not found" });

    match.status = "complete";
    match.winner = winner || null;
    match.endedReason = reason;
    await match.save();
    res.json({ match });
  } catch (error) {
    console.error("Error administratively ending match", error);
    res.status(500).json({ error: "Failed to end match" });
  }
});

module.exports = router;
