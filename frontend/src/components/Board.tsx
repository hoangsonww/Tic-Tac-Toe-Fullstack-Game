import React, { useState, useEffect, useRef } from "react";
import Cell from "./Cell";
import { calculateWinner } from "../utils/helpers";
import { getAIMove } from "../utils/ai";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  LinearProgress,
} from "@mui/material";
import { useTheme } from "@mui/system";

interface BoardProps {
  boardSize: number;
  isAI: boolean;
  aiDifficulty: "easy" | "medium" | "hard" | "impossible";
  isTimerEnabled: boolean;
  timerDuration: number;
  gameMode: "ai" | "local" | "online";
}

const Board: React.FC<BoardProps> = ({
  boardSize,
  isAI,
  aiDifficulty,
  isTimerEnabled,
  timerDuration,
  gameMode,
}) => {
  const [board, setBoard] = useState(
    Array.from({ length: boardSize }, () => Array(boardSize).fill("")),
  );
  const [winner, setWinner] = useState<string | null>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isMatchmaking, setIsMatchmaking] = useState(false);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [opponent, setOpponent] = useState<string | null>(null);
  const [matchStatus, setMatchStatus] = useState<
    "waiting" | "active" | "complete" | null
  >(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const theme = useTheme();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [moves, setMoves] = useState<any[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(false);
  const [playerSymbol, setPlayerSymbol] = useState<"X" | "O">("X");
  const [opponentSymbol, setOpponentSymbol] = useState<"X" | "O">("O");
  const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X");
  const timeoutPollingInterval = useRef<NodeJS.Timeout | null>(null);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const username = sessionStorage.getItem("TicTacToeUsername");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    resetBoard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardSize, isAI, aiDifficulty, isTimerEnabled, timerDuration, gameMode]);

  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isTimerActive && timeLeft === 0) {
      handleTimeOut();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTimerActive, timeLeft]);

  useEffect(() => {
    if (gameMode === "online" && matchId && matchStatus === "active") {
      startPollingMatchState();
      // Start polling for timeout
      startPollingTimeout();
    } else {
      stopPollingMatchState();
      stopPollingTimeout();
    }
    // Cleanup on unmount
    return () => {
      stopPollingMatchState();
      stopPollingTimeout();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameMode, matchId, matchStatus]);

  useEffect(() => {
    if (!winner && !isDraw) {
      if (gameMode === "online" || gameMode === "local") {
        // For online and local modes, reset timer when turn changes
        setTimeLeft(30);
        setIsTimerActive(true);
      } else if (gameMode === "ai" && isAI && currentPlayer === "X") {
        // For AI mode, reset timer when it's the player's turn
        setTimeLeft(30);
        setIsTimerActive(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlayerTurn, currentPlayer]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const url =
        "https://tic-tac-toe-fullstack-game.onrender.com/leaderboard/matchmaking/cancel";
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({ player: username }),
        keepalive: true,
      }).catch((error) => {
        console.error("Error canceling matchmaking:", error);
      });

      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [winner, isDraw, board, matchStatus, gameMode, isMatchmaking, username]);

  const handleTimeOut = () => {
    if (winner || isDraw) return;

    if (gameMode === "ai" && isAI) {
      setWinner("AI wins due to timeout!");
      handleAIMatchResult("loss");
    } else if (gameMode === "online") {
      // Handle timeout in PvP
      setWinner(opponent === null ? "" : `${opponent} wins due to timeout!`);
      handlePVPMatchResult(opponent!);
      stopPollingMatchState();
      stopPollingTimeout();
    } else {
      setWinner(
        `${isPlayerTurn ? "Player 2" : "Player 1"} wins due to timeout!`,
      );
    }
    setIsTimerActive(false);
  };

  // 3 cases: play online PvP, play against AI, play locally PvP
  const handleCellClick = (row: number, col: number) => {
    if (board[row][col] || winner) return;

    if (gameMode === "online") {
      if (!isPlayerTurn) return;
      setIsLoading(true);
      syncMove(row, col);
    } else if (isAI && gameMode === "ai") {
      // AI Mode logic
      if (currentPlayer !== "X") return;

      const updatedBoard = board.map((r, i) =>
        r.map((cell, j) => (i === row && j === col ? currentPlayer : cell)),
      );
      setBoard(updatedBoard);

      const gameWinner = calculateWinner(updatedBoard);
      if (gameWinner) {
        const resultMessage =
          gameWinner === "X" ? "Player X wins!" : "Player O wins!";
        setWinner(resultMessage);

        handleAIMatchResult(gameWinner === "X" ? "win" : "loss");
        setIsTimerActive(false);
        return;
      }

      if (isBoardFull(updatedBoard)) {
        setIsDraw(true);
        handleAIMatchResult("draw");
        setIsTimerActive(false);
        return;
      }

      setCurrentPlayer("O");
      setTimeLeft(timerDuration);

      // AI's turn
      setTimeout(() => {
        const aiMove = getAIMove(updatedBoard, aiDifficulty);
        if (aiMove) {
          const aiUpdatedBoard = updatedBoard.map((r, i) =>
            r.map((cell, j) =>
              i === aiMove.row && j === aiMove.col ? "O" : cell,
            ),
          );
          setBoard(aiUpdatedBoard);

          const aiWinner = calculateWinner(aiUpdatedBoard);

          if (aiWinner) {
            setWinner("AI wins!");
            handleAIMatchResult("loss"); // Player loses to AI
            setIsTimerActive(false);
            return;
          }

          if (isBoardFull(aiUpdatedBoard)) {
            setIsDraw(true);
            handleAIMatchResult("draw"); // Draw condition
            setIsTimerActive(false);
            return;
          }

          setCurrentPlayer("X");
          setTimeLeft(timerDuration);
        }
      }, 300);
    } else if (gameMode === "local") {
      // Local game
      const symbol = isPlayerTurn ? playerSymbol : opponentSymbol;
      const updatedBoard = board.map((r, i) =>
        r.map((cell, j) => (i === row && j === col ? symbol : cell)),
      );
      setBoard(updatedBoard);

      const gameWinner = calculateWinner(updatedBoard);
      if (gameWinner) {
        const resultMessage =
          gameWinner === playerSymbol ? "Player 1 wins!" : "Player 2 wins!";
        setWinner(resultMessage);
        setIsTimerActive(false);
        return;
      }

      if (isBoardFull(updatedBoard)) {
        setIsDraw(true);
        setIsTimerActive(false);
        return;
      }

      setIsPlayerTurn(!isPlayerTurn);
      setTimeLeft(timerDuration);
    }
  };

  const handleAIMatchResult = async (result: "win" | "loss" | "draw") => {
    if (!username) return;

    try {
      const response = await fetch(
        "https://tic-tac-toe-fullstack-game.onrender.com/leaderboard/ai-match",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            player: username,
            result,
            difficulty: aiDifficulty,
          }),
        },
      );

      if (!response.ok) {
        console.error("Failed to update leaderboard:", await response.json());
      }
    } catch (error) {
      console.error("Error updating leaderboard:", error);
    }
  };

  const handlePVPMatchResult = async (winnerUsername: string) => {
    if (!matchId || !username) return;

    try {
      const response = await fetch(
        "https://tic-tac-toe-fullstack-game.onrender.com/leaderboard/match/finish",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            matchId,
            winner: winnerUsername,
          }),
        },
      );

      if (!response.ok) {
        console.error("Failed to finish match:", await response.json());
      }
    } catch (error) {
      console.error("Error finishing match:", error);
    }
  };

  const isBoardFull = (board: string[][]): boolean => {
    return board.every((row) => row.every((cell) => cell !== ""));
  };

  const resetBoard = () => {
    // If game is over or board is empty, reset the board
    setBoard(
      Array.from({ length: boardSize }, () => Array(boardSize).fill("")),
    );
    setWinner(null);
    setIsDraw(false);
    setTimeLeft(30);
    setIsTimerActive(true);
    setIsMatchmaking(false);
    setMatchId(null);
    setOpponent(null);
    setMatchStatus(null);
    setMoves([]);
    setIsPlayerTurn(true);
    setPlayerSymbol("X");
    setOpponentSymbol("O");
    setCurrentPlayer("X");
    stopPollingMatchState();
    stopPollingTimeout();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const startTimer = () => {
    setTimeLeft(30);
    setIsTimerActive(true);
  };

  const startMatchmaking = async () => {
    const token = sessionStorage.getItem("token");

    if (!token || !username) {
      alert("You must be logged in to start matchmaking with another player.");
      setIsMatchmaking(false);
      return;
    }

    setIsMatchmaking(true);

    try {
      const response = await fetch(
        "https://tic-tac-toe-fullstack-game.onrender.com/leaderboard/matchmaking",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            player: username,
          }),
        },
      );

      const data = await response.json();

      if (response.status === 200) {
        // Match found immediately
        setMatchId(data.matchId);
        setOpponent(data.opponent);
        setMatchStatus("active");

        // Determine symbols based on who was the first player
        if (data.player === username) {
          // You are the first player
          setPlayerSymbol("X");
          setOpponentSymbol("O");
          setIsPlayerTurn(true);
        } else {
          // You are the second player
          setPlayerSymbol("O");
          setOpponentSymbol("X");
          setIsPlayerTurn(false);
        }

        alert("Match found! Opponent: " + data.opponent);
      } else if (response.status === 202) {
        // Searching for opponent
        setMatchStatus("waiting");
        setPlayerSymbol("X");
        setOpponentSymbol("O");
        setIsPlayerTurn(true);
        checkMatchmakingStatus();
      } else if (response.status === 401) {
        alert("You must be logged in to start matchmaking.");
        setIsMatchmaking(false);
        return;
      } else {
        console.error("Matchmaking error:", data);
        setIsMatchmaking(false);
      }
    } catch (error) {
      console.error("Matchmaking error:", error);
      setIsMatchmaking(false);
    }
  };

  const checkMatchmakingStatus = async () => {
    try {
      const response = await fetch(
        `https://tic-tac-toe-fullstack-game.onrender.com/leaderboard/matchmaking/status?player=${username}`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );

      const data = await response.json();

      if (response.ok) {
        if (data.matchId) {
          // Match found
          setMatchId(data.matchId);
          setOpponent(data.opponent);
          setMatchStatus("active");

          // Symbols and turn have already been set when matchmaking started
          alert("Match found! Opponent: " + data.opponent);
        } else if (data.message === "Still searching for an opponent...") {
          setTimeout(checkMatchmakingStatus, 2000);
        } else {
          setIsMatchmaking(false);
          alert("No matchmaking in progress.");
        }
      } else {
        console.error("Error checking matchmaking status:", data);
        setIsMatchmaking(false);
      }
    } catch (error) {
      console.error("Error checking matchmaking status:", error);
      setIsMatchmaking(false);
    }
  };

  const fetchMatchState = async () => {
    if (!matchId) return;

    try {
      const response = await fetch(
        `https://tic-tac-toe-fullstack-game.onrender.com/leaderboard/match/state?matchId=${matchId}`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );

      const data = await response.json();

      if (response.ok) {
        setMoves(data.moves);
        setMatchStatus(data.status);

        updateBoardFromMoves(data.moves);

        // Determine if it's the player's turn based on the number of moves
        const totalMoves = data.moves.length;
        const isMyTurn =
          (totalMoves % 2 === 0 && playerSymbol === "X") ||
          (totalMoves % 2 === 1 && playerSymbol === "O");

        setIsPlayerTurn(isMyTurn);

        if (data.winner) {
          setWinner(
            data.winner === username ? "You win!" : `${opponent} wins!`,
          );
          stopPollingMatchState();
          stopPollingTimeout();
          setIsTimerActive(false);
        } else if (data.status === "complete") {
          setIsDraw(true);
          stopPollingMatchState();
          stopPollingTimeout();
          setIsTimerActive(false);
        }
      } else {
        console.error("Error fetching match state:", data);
      }
    } catch (error) {
      console.error("Error fetching match state:", error);
    }
  };

  const updateBoardFromMoves = (moves: any[]) => {
    const newBoard = Array.from({ length: boardSize }, () =>
      Array(boardSize).fill(""),
    );

    moves.forEach((move) => {
      const symbol = move.player === username ? playerSymbol : opponentSymbol;
      newBoard[move.move.row][move.move.column] = symbol;
    });

    setBoard(newBoard);

    const gameWinner = calculateWinner(newBoard);
    if (gameWinner) {
      const winnerUsername =
        gameWinner === playerSymbol ? username! : opponent!;
      setWinner(winnerUsername === username ? "You win!" : `${opponent} wins!`);
      handlePVPMatchResult(winnerUsername);
      stopPollingMatchState();
      stopPollingTimeout();
      setIsTimerActive(false);
    } else if (isBoardFull(newBoard)) {
      setIsDraw(true);
      handlePVPMatchResult("draw");
      stopPollingMatchState();
      stopPollingTimeout();
      setIsTimerActive(false);
    }
  };

  const syncMove = async (row: number, col: number) => {
    if (!matchId || !username) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "https://tic-tac-toe-fullstack-game.onrender.com/leaderboard/match/move",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            matchId,
            player: username,
            move: { row, column: col },
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        fetchMatchState();
      } else {
        console.error("Error syncing move:", data);
        alert(data.error || "Error syncing move");
      }
    } catch (error) {
      console.error("Error syncing move:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMatchTimeout = async () => {
    if (!matchId || !username) return;

    try {
      const response = await fetch(
        "https://tic-tac-toe-fullstack-game.onrender.com/leaderboard/match/timeout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            matchId,
            player: username,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        if (data.winner) {
          setWinner(
            data.winner === null
              ? "Match ended due to timeout - Please try again"
              : data.winner === username
                ? "You win by timeout!"
                : `${opponent} wins by timeout!`,
          );
          handlePVPMatchResult(data.winner);
          stopPollingMatchState();
          stopPollingTimeout();
          setIsTimerActive(false);
        }
      } else {
        console.error("Error checking timeout:", data);
      }
    } catch (error) {
      console.error("Error checking timeout:", error);
    }
  };

  // Function to start polling for timeout
  const startPollingTimeout = () => {
    if (timeoutPollingInterval.current) return;
    timeoutPollingInterval.current = setInterval(handleMatchTimeout, 5000);
  };

  const stopPollingTimeout = () => {
    if (timeoutPollingInterval.current) {
      clearInterval(timeoutPollingInterval.current);
      timeoutPollingInterval.current = null;
    }
  };

  const startPollingMatchState = () => {
    if (pollingInterval.current) return;
    pollingInterval.current = setInterval(fetchMatchState, 2000);
  };

  const stopPollingMatchState = () => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  };

  // Format timeLeft into MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  // Calculate progress percentage
  const progressPercentage = (timeLeft / 30) * 100;

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <Typography variant="h6" sx={{ fontFamily: "Poppins", mb: 2 }}>
        Game Board
      </Typography>
      {gameMode === "online" && !matchId && (
        <>
          {isMatchmaking && <CircularProgress sx={{ mb: 2 }} />}
          <Button
            variant="contained"
            color="primary"
            onClick={startMatchmaking}
            sx={{ mb: 2 }}
            disabled={isMatchmaking}
          >
            {isMatchmaking ? "Searching for opponent..." : "Start Matchmaking"}
          </Button>
        </>
      )}

      {/* New Labels */}
      {(gameMode !== "online" || opponent) && (
        <>
          <Typography variant="h6" sx={{ fontFamily: "Poppins", mt: 2 }}>
            {gameMode === "online" && opponent ? (
              <>
                You (
                <span
                  style={{
                    color: playerSymbol === "X" ? "#1976d2" : "red",
                    fontWeight: "bold",
                  }}
                >
                  {playerSymbol}
                </span>
                ) vs {opponent} (
                <span
                  style={{
                    color: opponentSymbol === "X" ? "#1976d2" : "red",
                    fontWeight: "bold",
                  }}
                >
                  {opponentSymbol}
                </span>
                )
              </>
            ) : isAI ? (
              <>
                Player (
                <span style={{ color: "#1976d2", fontWeight: "bold" }}>X</span>)
                vs AI (
                <span style={{ color: "red", fontWeight: "bold" }}>O</span>)
              </>
            ) : (
              <>
                Player 1 (
                <span style={{ color: "#1976d2", fontWeight: "bold" }}>X</span>)
                vs Player 2 (
                <span style={{ color: "red", fontWeight: "bold" }}>O</span>)
              </>
            )}
          </Typography>
          <Typography variant="h6" sx={{ fontFamily: "Poppins", mt: 2 }}>
            {winner || isDraw ? (
              "Game Over"
            ) : gameMode === "local" ? (
              isPlayerTurn ? (
                <span>
                  <span style={{ color: "#1976d2" }}>X</span>'s Turn
                </span>
              ) : (
                <span>
                  <span style={{ color: "red" }}>O</span>'s Turn
                </span>
              )
            ) : isPlayerTurn ? (
              "Your Turn"
            ) : gameMode === "online" ? (
              `${opponent}'s Turn`
            ) : isAI ? (
              "AI's Turn"
            ) : (
              "Opponent's Turn"
            )}
          </Typography>

          {/* Timer with Progress Circle */}
          {isTimerActive && !winner && !isDraw && (
            <Box
              sx={{
                position: "relative",
                display: "inline-flex",
                mt: 2,
              }}
            >
              <CircularProgress
                variant="determinate"
                value={progressPercentage}
                size={80}
                thickness={5}
              />
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: "absolute",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="h6" component="div" color="textSecondary">
                  {formatTime(timeLeft)}
                </Typography>
              </Box>
            </Box>
          )}
        </>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
          gap: "1px",
          mt: 2,
        }}
      >
        {board.map((row, i) =>
          row.map((cell, j) => (
            <Cell
              key={`${i}-${j}`}
              value={cell}
              onClick={() => handleCellClick(i, j)}
            />
          )),
        )}
      </Box>
      {winner && (
        <Typography variant="h6" sx={{ mt: 2 }} color="success.main">
          {winner}
        </Typography>
      )}
      {isDraw && (
        <Typography variant="h6" sx={{ mt: 2 }} color="warning.main">
          It's a draw!
        </Typography>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={resetBoard}
        sx={{ margin: 2, fontFamily: "Poppins" }}
      >
        Reset Board
      </Button>

      {/* Divider */}
      <div
        style={{
          width: "100%",
          borderBottom: "1px solid #e0e0e0",
          margin: "0 auto 20px",
        }}
      />

      <Typography
        variant="body1"
        sx={{ fontFamily: "Poppins", margin: "20px" }}
      >
        Please use a wide screen like a laptop or desktop for the best
        experience. Thank you for playing Tic Tac Toe Pro today! 🚀
      </Typography>

      {/* Loading Spinner Overlay */}
      {isLoading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(128, 128, 128, 0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default Board;
