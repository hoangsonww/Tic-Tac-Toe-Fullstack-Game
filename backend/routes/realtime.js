const express = require("express");
const authenticate = require("../middleware/authMiddleware");
const Match = require("../models/Match");
const LeaderboardEntry = require("../models/LeaderboardEntry");
const { calculateElo, BASE_ELO } = require("../utils/elo");
const { applyUserMatchResult } = require("../utils/user-stats");

const router = express.Router();

const buildBoardFromMoves = (match) => {
  const board = Array(9).fill(null);
  const moves = match.moves || [];

  moves.forEach((move, idx) => {
    const row = move.move?.row ?? Math.floor((move.index ?? 0) / 3);
    const column = move.move?.column ?? (move.index ?? 0) % 3;
    const index = row * 3 + column;
    const symbol = move.symbol || (idx % 2 === 0 ? "X" : "O"); // fallback if symbol absent (legacy data)
    if (index >= 0 && index < 9 && !board[index]) {
      board[index] = symbol;
    }
  });

  return board;
};

const deriveTurn = (match) => {
  const moves = match.moves || [];
  if (match.status === "complete") return null;
  return moves.length % 2 === 0 ? "X" : "O";
};

const winnerFromBoard = (board) => {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (board.every(Boolean)) return "draw";
  return null;
};

const normalizeMatchResponse = (match, since) => {
  const sinceDate = since ? new Date(since) : null;
  const board = buildBoardFromMoves(match);
  const turn = deriveTurn(match);

  const filterBySince = (items = []) =>
    sinceDate
      ? items.filter((item) => new Date(item.at || item.createdAt) > sinceDate)
      : items;

  return {
    matchId: match._id,
    gameId: match.gameId,
    status: match.status,
    winner: match.winner,
    endedReason: match.endedReason,
    player: match.player,
    opponent: match.opponent,
    players: {
      X: match.player,
      O: match.opponent,
    },
    turn,
    board,
    moves: match.moves,
    chat: filterBySince(match.chat),
    events: filterBySince(match.events),
    drawOfferFrom: match.drawOfferFrom || null,
    createdAt: match.createdAt,
    lastMoveTime: match.lastMoveTime,
    watchers: match.spectators || [],
    eloChanges: match.eloChanges || null,
  };
};

const finalizeMatch = async (match, winnerUsername, reason) => {
  if (!match || match.status === "complete") return match;

  // Determine results for each side
  const playerResult =
    winnerUsername === null
      ? "draw"
      : winnerUsername === match.player
        ? "win"
        : "loss";
  const opponentResult =
    winnerUsername === null
      ? "draw"
      : winnerUsername === match.opponent
        ? "win"
        : "loss";

  // Fetch existing ELOs
  const [playerEntry, opponentEntry] = await Promise.all([
    LeaderboardEntry.findOne({ username: match.player }),
    LeaderboardEntry.findOne({ username: match.opponent }),
  ]);
  const playerElo = playerEntry?.elo ?? BASE_ELO;
  const opponentElo = opponentEntry?.elo ?? BASE_ELO;

  // Calculate new ratings
  const newPlayerElo = calculateElo(
    playerElo,
    opponentElo,
    playerResult,
    "human",
  );
  const newOpponentElo = calculateElo(
    opponentElo,
    playerElo,
    opponentResult,
    "human",
  );

  // Persist leaderboard + user stats
  await Promise.all([
    LeaderboardEntry.findOneAndUpdate(
      { username: match.player },
      {
        $set: { elo: newPlayerElo },
        $inc: {
          totalWins: playerResult === "win" ? 1 : 0,
          totalLosses: playerResult === "loss" ? 1 : 0,
          totalDraws: playerResult === "draw" ? 1 : 0,
        },
      },
      { upsert: true, new: true },
    ),
    LeaderboardEntry.findOneAndUpdate(
      { username: match.opponent },
      {
        $set: { elo: newOpponentElo },
        $inc: {
          totalWins: opponentResult === "win" ? 1 : 0,
          totalLosses: opponentResult === "loss" ? 1 : 0,
          totalDraws: opponentResult === "draw" ? 1 : 0,
        },
      },
      { upsert: true, new: true },
    ),
    applyUserMatchResult(match.player, newPlayerElo, playerResult),
    applyUserMatchResult(match.opponent, newOpponentElo, opponentResult),
  ]);

  match.status = "complete";
  match.winner = winnerUsername;
  match.endedReason = reason;
  match.eloChanges = {
    playerDelta: newPlayerElo - playerElo,
    opponentDelta: newOpponentElo - opponentElo,
  };
  match.events.push({
    type: "end",
    player: winnerUsername,
    payload: { reason },
    at: new Date(),
  });
  await match.save();
  return match;
};

router.post("/poll", authenticate, async (req, res) => {
  const { matchId, gameId, since } = req.body || {};
  try {
    const match = await Match.findOne(matchId ? { _id: matchId } : { gameId });
    if (!match) return res.status(404).json({ error: "Match not found" });
    return res.json({ state: normalizeMatchResponse(match, since) });
  } catch (error) {
    console.error("Error in realtime poll", error);
    res.status(500).json({ error: "Failed to poll state" });
  }
});

router.post("/move", authenticate, async (req, res) => {
  const { matchId, player, index } = req.body || {};
  if (!matchId || typeof index !== "number") {
    return res.status(400).json({ error: "matchId and index are required" });
  }
  try {
    const match = await Match.findById(matchId);
    if (!match || match.status !== "active") {
      return res.status(400).json({ error: "Invalid or inactive match" });
    }

    const board = buildBoardFromMoves(match);
    const symbol =
      player === match.player ? "X" : player === match.opponent ? "O" : null;
    if (!symbol) {
      return res.status(403).json({ error: "Player not part of this match" });
    }
    if (board[index]) {
      return res.status(400).json({ error: "Cell already taken" });
    }
    if (match.moves.length % 2 === 0 && symbol !== "X") {
      return res.status(400).json({ error: "Not your turn" });
    }
    if (match.moves.length % 2 === 1 && symbol !== "O") {
      return res.status(400).json({ error: "Not your turn" });
    }

    const row = Math.floor(index / 3);
    const column = index % 3;
    match.moves.push({
      player,
      symbol,
      move: { row, column },
      at: new Date(),
    });
    match.lastMoveTime = new Date();
    match.events.push({
      type: "move",
      player,
      payload: { index, symbol, row, column },
      at: new Date(),
    });

    const winnerSymbol = winnerFromBoard(buildBoardFromMoves(match));
    if (winnerSymbol === "draw") {
      await finalizeMatch(match, null, "Draw");
    } else if (winnerSymbol) {
      const winnerUsername =
        winnerSymbol === "X" ? match.player : match.opponent;
      await finalizeMatch(match, winnerUsername, "Win");
    } else {
      await match.save();
    }

    res.json({ state: normalizeMatchResponse(match) });
  } catch (error) {
    console.error("Error in realtime move", error);
    res.status(500).json({ error: "Failed to submit move" });
  }
});

router.post("/chat", authenticate, async (req, res) => {
  const { matchId, sender, message } = req.body || {};
  if (!matchId || !message) {
    return res.status(400).json({ error: "matchId and message are required" });
  }
  try {
    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ error: "Match not found" });
    const chatEntry = { sender, message, at: new Date() };
    match.chat.push(chatEntry);
    match.events.push({
      type: "chat",
      player: sender,
      payload: chatEntry,
      at: new Date(),
    });
    await match.save();
    res.json({ chat: chatEntry });
  } catch (error) {
    console.error("Error in realtime chat", error);
    res.status(500).json({ error: "Failed to send chat" });
  }
});

router.post("/offer-draw", authenticate, async (req, res) => {
  const { matchId, player } = req.body || {};
  if (!matchId || !player) {
    return res.status(400).json({ error: "matchId and player are required" });
  }
  try {
    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ error: "Match not found" });
    match.drawOfferFrom = player;
    match.events.push({
      type: "offer_draw",
      player,
      payload: {},
      at: new Date(),
    });
    await match.save();
    res.json({ state: normalizeMatchResponse(match) });
  } catch (error) {
    console.error("Error in offer draw", error);
    res.status(500).json({ error: "Failed to offer draw" });
  }
});

router.post("/respond-draw", authenticate, async (req, res) => {
  const { matchId, accept } = req.body || {};
  if (!matchId || typeof accept !== "boolean") {
    return res.status(400).json({ error: "matchId and accept are required" });
  }
  try {
    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ error: "Match not found" });

    if (!accept) {
      match.drawOfferFrom = null;
      match.events.push({
        type: "decline_draw",
        payload: {},
        at: new Date(),
      });
      await match.save();
      return res.json({ state: normalizeMatchResponse(match) });
    }

    await finalizeMatch(match, null, "Draw accepted");
    res.json({ state: normalizeMatchResponse(match) });
  } catch (error) {
    console.error("Error responding to draw", error);
    res.status(500).json({ error: "Failed to respond to draw" });
  }
});

router.post("/resign", authenticate, async (req, res) => {
  const { matchId, player } = req.body || {};
  if (!matchId || !player) {
    return res.status(400).json({ error: "matchId and player are required" });
  }
  try {
    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ error: "Match not found" });
    const winner =
      player === match.player
        ? match.opponent
        : player === match.opponent
          ? match.player
          : null;
    await finalizeMatch(match, winner, "Resign");
    res.json({ state: normalizeMatchResponse(match) });
  } catch (error) {
    console.error("Error in resign", error);
    res.status(500).json({ error: "Failed to resign" });
  }
});

router.post("/spectate", authenticate, async (req, res) => {
  const { matchId, username } = req.body || {};
  if (!matchId || !username) {
    return res.status(400).json({ error: "matchId and username are required" });
  }
  try {
    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ error: "Match not found" });
    const spectators = new Set(match.spectators || []);
    spectators.add(username);
    match.spectators = Array.from(spectators);
    match.events.push({
      type: "spectate",
      player: username,
      payload: {},
      at: new Date(),
    });
    await match.save();
    res.json({ state: normalizeMatchResponse(match) });
  } catch (error) {
    console.error("Error adding spectator", error);
    res.status(500).json({ error: "Failed to spectate" });
  }
});

module.exports = router;
