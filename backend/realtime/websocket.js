const { randomUUID } = require("crypto");
const { WebSocketServer, WebSocket } = require("ws");
const Match = require("../models/Match");
const LeaderboardEntry = require("../models/LeaderboardEntry");
const { calculateElo, BASE_ELO } = require("../utils/elo");
const { applyUserMatchResult } = require("../utils/user-stats");

const WEBSOCKET_PATH = "/ws";
const HEARTBEAT_INTERVAL_MS = 30000;
const DISCONNECT_GRACE_MS = 15000;
const REMATCH_WINDOW_MS = 60000;

let wss;
let heartbeat;

const state = {
  queue: [],
  games: new Map(),
  clientBySocket: new Map(),
  clientById: new Map(),
  presence: new Map(), // username -> { status, updatedAt }
};

const createPayload = (type, data = {}) => JSON.stringify({ type, ...data });

const now = () => new Date();

const send = (socket, payload) => {
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(payload);
  }
};

const updatePresence = (username, status) => {
  if (!username) return;
  state.presence.set(username, { status, updatedAt: now() });
};

const getPresenceSnapshot = (usernames = []) => {
  if (!usernames.length) {
    return Object.fromEntries(state.presence);
  }
  const snapshot = {};
  usernames.forEach((name) => {
    if (state.presence.has(name)) {
      snapshot[name] = state.presence.get(name);
    }
  });
  return snapshot;
};

const broadcastToParticipants = (game, payload, includeWatchers = true) => {
  const sockets = [];
  if (game.players.X?.socket) sockets.push(game.players.X.socket);
  if (game.players.O?.socket) sockets.push(game.players.O.socket);
  if (includeWatchers && game.watchers) {
    game.watchers.forEach(
      (watcher) => watcher.socket && sockets.push(watcher.socket),
    );
  }
  sockets.forEach((socket) => send(socket, payload));
};

const broadcastState = (game, extra = {}) => {
  const payload = createPayload("state", {
    gameId: game.id,
    matchId: game.matchId,
    board: game.board,
    turn: game.turn,
    status: game.status,
    winner: game.winner,
    lastMoveAt: game.lastMoveAt,
    players: {
      X: {
        username: game.players.X?.username,
        connected: !!game.players.X?.socket,
      },
      O: {
        username: game.players.O?.username,
        connected: !!game.players.O?.socket,
      },
    },
    watchers: Array.from(game.watchers || []).map(
      (w) => w.username || "spectator",
    ),
    ...extra,
  });

  broadcastToParticipants(game, payload);
};

const checkWinner = (board) => {
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

const startHeartbeat = () => {
  if (heartbeat || !wss) return;
  heartbeat = setInterval(() => {
    wss.clients.forEach((socket) => {
      if (socket.isAlive === false) return socket.terminate();
      socket.isAlive = false;
      socket.ping();
    });
  }, HEARTBEAT_INTERVAL_MS);
  heartbeat.unref?.();
};

const removeFromQueue = (clientId) => {
  const index = state.queue.findIndex((entry) => entry.client.id === clientId);
  if (index !== -1) state.queue.splice(index, 1);
};

const createMatchDocument = async (game) => {
  try {
    const doc = await Match.create({
      gameId: game.id,
      player: game.players.X?.username,
      opponent: game.players.O?.username,
      status: "active",
      createdAt: now(),
      lastMoveTime: now(),
      moves: [],
      events: [
        {
          type: "start",
          payload: { gameId: game.id },
          at: now(),
        },
      ],
    });
    game.matchId = doc._id.toString();
  } catch (error) {
    console.error("Failed to create match document", error);
  }
};

const persistMoveToMatch = async (game, move) => {
  if (!game.matchId) return;
  try {
    await Match.findByIdAndUpdate(game.matchId, {
      $push: {
        moves: {
          player: move.player,
          symbol: move.symbol,
          move: { row: Math.floor(move.index / 3), column: move.index % 3 },
          at: move.at,
        },
      },
      $set: { lastMoveTime: move.at },
    });
  } catch (error) {
    console.error("Failed to persist move", error);
  }
};

const persistChatToMatch = async (game, chatEntry) => {
  if (!game.matchId) return;
  try {
    await Match.findByIdAndUpdate(game.matchId, {
      $push: {
        chat: chatEntry,
        events: {
          type: "chat",
          player: chatEntry.sender,
          payload: chatEntry,
          at: chatEntry.at,
        },
      },
    });
  } catch (error) {
    console.error("Failed to persist chat", error);
  }
};

const persistDrawOffer = async (game, fromSymbol) => {
  if (!game.matchId) return;
  try {
    await Match.findByIdAndUpdate(game.matchId, {
      $set: { drawOfferFrom: fromSymbol },
    });
  } catch (error) {
    console.error("Failed to persist draw offer", error);
  }
};

const persistSpectator = async (game, username) => {
  if (!game.matchId || !username) return;
  try {
    await Match.findByIdAndUpdate(game.matchId, {
      $addToSet: { spectators: username },
    });
  } catch (error) {
    console.error("Failed to persist spectator", error);
  }
};

const createGame = async (playerX, playerO, rematchOf = null) => {
  const gameId = randomUUID();
  playerX.gameId = gameId;
  playerO.gameId = gameId;
  playerX.symbol = "X";
  playerO.symbol = "O";

  const game = {
    id: gameId,
    matchId: null,
    players: { X: playerX, O: playerO },
    board: Array(9).fill(null),
    turn: "X",
    status: "active",
    winner: null,
    lastMoveAt: now(),
    moves: [],
    watchers: new Set(),
    chat: [],
    events: [],
    drawOfferFrom: null,
    rematchRequests: new Set(),
    rematchOf,
    createdAt: now(),
  };

  state.games.set(gameId, game);
  updatePresence(playerX.username, "playing");
  updatePresence(playerO.username, "playing");
  await createMatchDocument(game);
  broadcastState(game, { message: "Game created" });
  return game;
};

const recordMove = async (game, client, index) => {
  const move = {
    index,
    symbol: client.symbol,
    player: client.username,
    at: now(),
  };
  game.moves.push(move);
  game.events.push({
    type: "move",
    player: client.username,
    payload: move,
    at: now(),
  });
  game.lastMoveAt = now();
  await persistMoveToMatch(game, move);
};

const applyRatingsForGame = async (game) => {
  const playerXName = game.players.X?.username;
  const playerOName = game.players.O?.username;
  if (!playerXName || !playerOName) return null;

  const [xEntry, oEntry] = await Promise.all([
    LeaderboardEntry.findOne({ username: playerXName }),
    LeaderboardEntry.findOne({ username: playerOName }),
  ]);

  const xBaseline = xEntry?.elo ?? BASE_ELO;
  const oBaseline = oEntry?.elo ?? BASE_ELO;

  const xResult =
    game.winner === "draw" ? "draw" : game.winner === "X" ? "win" : "loss";
  const oResult =
    game.winner === "draw" ? "draw" : game.winner === "O" ? "win" : "loss";

  const newXElo = calculateElo(xBaseline, oBaseline, xResult, "human");
  const newOElo = calculateElo(oBaseline, xBaseline, oResult, "human");

  await Promise.all([
    LeaderboardEntry.findOneAndUpdate(
      { username: playerXName },
      {
        $set: { elo: newXElo },
        $inc: {
          totalWins: xResult === "win" ? 1 : 0,
          totalLosses: xResult === "loss" ? 1 : 0,
          totalDraws: xResult === "draw" ? 1 : 0,
        },
      },
      { upsert: true, new: true },
    ),
    LeaderboardEntry.findOneAndUpdate(
      { username: playerOName },
      {
        $set: { elo: newOElo },
        $inc: {
          totalWins: oResult === "win" ? 1 : 0,
          totalLosses: oResult === "loss" ? 1 : 0,
          totalDraws: oResult === "draw" ? 1 : 0,
        },
      },
      { upsert: true, new: true },
    ),
    applyUserMatchResult(playerXName, newXElo, xResult),
    applyUserMatchResult(playerOName, newOElo, oResult),
  ]);

  return {
    eloChanges: {
      playerDelta: newXElo - xBaseline,
      opponentDelta: newOElo - oBaseline,
    },
    newXElo,
    newOElo,
  };
};

const persistMatchResult = async (game, reason) => {
  if (!game.players.X?.username || !game.players.O?.username) return;
  try {
    const matchDoc =
      (game.matchId && (await Match.findById(game.matchId))) ||
      (await Match.create({
        gameId: game.id,
        player: game.players.X.username,
        opponent: game.players.O.username,
        status: "active",
        createdAt: game.createdAt || now(),
      }));

    const eloResult = await applyRatingsForGame(game);

    matchDoc.status = "complete";
    matchDoc.gameId = matchDoc.gameId || game.id;
    matchDoc.winner =
      game.winner === "draw"
        ? null
        : game.winner === "X"
          ? game.players.X.username
          : game.players.O.username;
    matchDoc.endedReason = reason;
    matchDoc.lastMoveTime = game.lastMoveAt || now();
    matchDoc.moves = game.moves.map((m) => ({
      player: m.player,
      symbol: m.symbol,
      move: { row: Math.floor(m.index / 3), column: m.index % 3 },
      at: m.at,
    }));
    matchDoc.events = [
      ...(matchDoc.events || []),
      ...game.events,
      { type: "end", player: matchDoc.winner, payload: { reason }, at: now() },
    ];
    matchDoc.chat = [...(matchDoc.chat || []), ...(game.chat || [])];
    matchDoc.spectators = Array.from(game.watchers || [])
      .map((w) => w.username)
      .filter(Boolean);
    matchDoc.eloChanges = eloResult?.eloChanges;
    await matchDoc.save();
  } catch (error) {
    console.error("Failed to persist match result", error);
  }
};

const finalizeGame = async (game, reason, winnerSymbol = null) => {
  if (!game || game.status !== "active") return;
  game.status = "ended";
  game.winner = winnerSymbol || "draw";
  game.events.push({
    type: "finalize",
    payload: { reason, winner: game.winner },
    at: now(),
  });

  broadcastState(game, {
    message: reason,
    winnerSymbol: winnerSymbol,
  });

  await persistMatchResult(game, reason);

  Object.values(game.players).forEach((player) => {
    if (player) {
      player.gameId = game.id;
      updatePresence(player.username, "online");
    }
  });

  setTimeout(() => state.games.delete(game.id), REMATCH_WINDOW_MS);
};

const handleJoinQueue = async (socket, username) => {
  const client = state.clientBySocket.get(socket);
  if (!client) return;

  if (client.gameId) {
    send(
      socket,
      createPayload("info", { message: "Already in a game session" }),
    );
    return;
  }

  client.username =
    username || client.username || `guest-${client.id.slice(0, 5)}`;
  updatePresence(client.username, "queue");

  if (state.queue.length === 0) {
    state.queue.push({ client, socket });
    send(
      socket,
      createPayload("waiting", { message: "Waiting for an opponent..." }),
    );
    return;
  }

  const opponent = state.queue.shift();
  const game = await createGame(
    { ...opponent.client, socket: opponent.socket },
    { ...client, socket },
  );

  send(
    opponent.socket,
    createPayload("match", {
      gameId: game.id,
      matchId: game.matchId,
      symbol: "X",
      opponent: client.username,
    }),
  );
  send(
    socket,
    createPayload("match", {
      gameId: game.id,
      matchId: game.matchId,
      symbol: "O",
      opponent: opponent.client.username,
    }),
  );
};

const handleMove = async (socket, index) => {
  const client = state.clientBySocket.get(socket);
  if (!client?.gameId) {
    send(socket, createPayload("error", { message: "Not in a game" }));
    return;
  }

  const game = state.games.get(client.gameId);
  if (!game || game.status !== "active") {
    send(socket, createPayload("error", { message: "Game is not active" }));
    return;
  }

  const playerSymbol =
    game.players.X?.id === client.id
      ? "X"
      : game.players.O?.id === client.id
        ? "O"
        : null;

  if (!playerSymbol) {
    send(socket, createPayload("error", { message: "Player not in game" }));
    return;
  }

  if (game.turn !== playerSymbol) {
    send(socket, createPayload("error", { message: "Not your turn" }));
    return;
  }

  if (!Number.isInteger(index) || index < 0 || index > 8) {
    send(socket, createPayload("error", { message: "Invalid move index" }));
    return;
  }

  if (game.board[index]) {
    send(socket, createPayload("error", { message: "Cell already taken" }));
    return;
  }

  game.board[index] = playerSymbol;
  await recordMove(game, client, index);

  const result = checkWinner(game.board);

  if (result === "draw") {
    await finalizeGame(game, "Game ended in a draw", null);
    return;
  }

  if (result) {
    await finalizeGame(game, `Player ${result} wins`, result);
    return;
  }

  game.turn = game.turn === "X" ? "O" : "X";
  broadcastState(game, { message: "Next turn" });
};

const handleChat = async (socket, message) => {
  const client = state.clientBySocket.get(socket);
  if (!client?.gameId) return;
  const game = state.games.get(client.gameId);
  if (!game) return;

  const chatEntry = { sender: client.username || "guest", message, at: now() };
  game.chat.push(chatEntry);
  game.events.push({
    type: "chat",
    player: client.username,
    payload: chatEntry,
    at: now(),
  });
  await persistChatToMatch(game, chatEntry);
  broadcastToParticipants(
    game,
    createPayload("chat", { gameId: game.id, chat: chatEntry }),
  );
};

const handleOfferDraw = (socket) => {
  const client = state.clientBySocket.get(socket);
  if (!client?.gameId) return;
  const game = state.games.get(client.gameId);
  if (!game || game.status !== "active") return;
  game.drawOfferFrom = client.symbol;
  persistDrawOffer(game, client.symbol);
  broadcastState(game, {
    message: `${client.username} offered a draw`,
    drawOfferFrom: client.symbol,
  });
};

const handleRespondDraw = async (socket, accept) => {
  const client = state.clientBySocket.get(socket);
  if (!client?.gameId) return;
  const game = state.games.get(client.gameId);
  if (!game || game.status !== "active" || !game.drawOfferFrom) return;

  if (!accept) {
    game.drawOfferFrom = null;
    persistDrawOffer(game, null);
    broadcastState(game, { message: `${client.username} declined the draw` });
    return;
  }

  await finalizeGame(game, "Draw accepted", null);
};

const handleResign = async (socket) => {
  const client = state.clientBySocket.get(socket);
  if (!client?.gameId) return;
  const game = state.games.get(client.gameId);
  if (!game || game.status !== "active") return;

  const winnerSymbol = client.symbol === "X" ? "O" : "X";
  await finalizeGame(
    game,
    `${client.username || "Player"} resigned`,
    winnerSymbol,
  );
};

const handleRematchRequest = async (socket) => {
  const client = state.clientBySocket.get(socket);
  if (!client?.gameId) return;
  const game = state.games.get(client.gameId);
  if (!game || game.status !== "ended") return;

  game.rematchRequests.add(client.symbol);
  broadcastToParticipants(
    game,
    createPayload("rematch_request", {
      from: client.symbol,
      pending: Array.from(game.rematchRequests),
    }),
  );

  if (game.rematchRequests.size === 2) {
    const first = Math.random() < 0.5 ? game.players.X : game.players.O;
    const second = first === game.players.X ? game.players.O : game.players.X;
    await createGame(first, second, game.id);
  }
};

const handleSpectate = (socket, gameId, username) => {
  const client = state.clientBySocket.get(socket);
  if (!client) return;
  const game = state.games.get(gameId);
  if (!game) {
    send(socket, createPayload("error", { message: "Game not found" }));
    return;
  }
  client.gameId = gameId;
  client.symbol = null;
  client.username =
    username || client.username || `spectator-${client.id.slice(0, 5)}`;
  if (!game.watchers) game.watchers = new Set();
  game.watchers.add(client);
  persistSpectator(game, client.username);
  broadcastState(game, { message: `${client.username} is spectating` });
  send(socket, createPayload("spectating", { gameId, matchId: game.matchId }));
};

const handleReconnect = (socket, clientId, username, gameId) => {
  const existing = clientId ? state.clientById.get(clientId) : null;
  if (!existing)
    return send(
      socket,
      createPayload("error", { message: "Session not found" }),
    );

  state.clientBySocket.delete(existing.socket);
  existing.socket = socket;
  existing.username = username || existing.username;
  existing.disconnectedAt = null;
  state.clientBySocket.set(socket, existing);
  updatePresence(existing.username, "online");

  if (existing.gameId && state.games.has(existing.gameId)) {
    broadcastState(state.games.get(existing.gameId), {
      message: `${existing.username} reconnected`,
    });
  }
};

const handleDisconnect = (socket) => {
  const client = state.clientBySocket.get(socket);
  if (!client) return;

  removeFromQueue(client.id);
  state.clientBySocket.delete(socket);

  if (!client.gameId) return;
  const game = state.games.get(client.gameId);
  if (!game) return;

  // Remove spectators quietly
  if (!client.symbol) {
    game.watchers?.delete?.(client);
    return;
  }

  if (game.status !== "active") return;

  client.socket = null;
  client.disconnectedAt = Date.now();
  updatePresence(client.username, "disconnected");

  broadcastState(game, {
    message: `${client.username || "A player"} disconnected`,
  });

  setTimeout(() => {
    if (client.socket) return;
    const winnerSymbol = client.symbol === "X" ? "O" : "X";
    finalizeGame(game, "Disconnected timeout", winnerSymbol);
  }, DISCONNECT_GRACE_MS);
};

const handleMessage = async (socket, raw) => {
  let payload;
  try {
    payload = JSON.parse(raw.toString());
  } catch (err) {
    send(socket, createPayload("error", { message: "Invalid JSON payload" }));
    return;
  }

  switch (payload.type) {
    case "join":
      await handleJoinQueue(socket, payload.username);
      break;
    case "move":
      await handleMove(socket, payload.index);
      break;
    case "ping":
      send(socket, createPayload("pong"));
      break;
    case "chat":
      await handleChat(socket, payload.message);
      break;
    case "offer_draw":
      handleOfferDraw(socket);
      break;
    case "respond_draw":
      await handleRespondDraw(socket, payload.accept);
      break;
    case "resign":
      await handleResign(socket);
      break;
    case "rematch":
      await handleRematchRequest(socket);
      break;
    case "spectate":
      handleSpectate(socket, payload.gameId, payload.username);
      break;
    case "reconnect":
      handleReconnect(
        socket,
        payload.clientId,
        payload.username,
        payload.gameId,
      );
      break;
    case "presence":
      updatePresence(payload.username, payload.status || "online");
      break;
    default:
      send(socket, createPayload("error", { message: "Unknown message type" }));
  }
};

const handleConnection = (socket) => {
  const client = {
    id: randomUUID(),
    socket,
    username: null,
    gameId: null,
    symbol: null,
  };
  state.clientBySocket.set(socket, client);
  state.clientById.set(client.id, client);

  socket.isAlive = true;
  socket.on("pong", () => {
    socket.isAlive = true;
  });
  socket.on("message", async (data) => handleMessage(socket, data));
  socket.on("close", () => handleDisconnect(socket));

  send(
    socket,
    createPayload("connected", {
      clientId: client.id,
      message:
        "Send {type:'join', username} to find a match or {type:'spectate', gameId}",
    }),
  );
};

const getWebsocketServer = () => {
  if (wss) return wss;

  wss = new WebSocketServer({ noServer: true, path: WEBSOCKET_PATH });
  wss.on("connection", handleConnection);
  startHeartbeat();

  return wss;
};

const handleUpgrade = (request, socket, head = Buffer.alloc(0)) => {
  const path = (request.url || "").split("?")[0];
  if (path !== WEBSOCKET_PATH) {
    socket.destroy();
    return;
  }

  const server = getWebsocketServer();
  server.handleUpgrade(request, socket, head, (ws) => {
    server.emit("connection", ws, request);
  });
};

const attachWebsocketServer = (httpServer) => {
  const server = getWebsocketServer();
  httpServer.on("upgrade", (request, socket, head) =>
    handleUpgrade(request, socket, head),
  );
  return server;
};

module.exports = {
  attachWebsocketServer,
  handleUpgrade,
  getWebsocketServer,
  WEBSOCKET_PATH,
  getPresenceSnapshot,
};
