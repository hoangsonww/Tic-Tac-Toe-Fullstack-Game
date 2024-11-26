import React, { useState, useEffect } from "react";
import Cell from "./Cell";
import { calculateWinner } from "../utils/helpers";
import { getAIMove } from "../utils/ai";
import { Box, Typography, Button } from "@mui/material";

interface BoardProps {
  boardSize: number;
  isAI: boolean;
  aiDifficulty: "easy" | "medium" | "hard";
  isTimerEnabled: boolean;
  timerDuration: number; // Duration in seconds
}

const Board: React.FC<BoardProps> = ({
                                       boardSize,
                                       isAI,
                                       aiDifficulty,
                                       isTimerEnabled,
                                       timerDuration,
                                     }) => {
  const [board, setBoard] = useState(
    Array.from({ length: boardSize }, () => Array(boardSize).fill(""))
  );
  const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X");
  const [winner, setWinner] = useState<string | null>(null);
  const [isDraw, setIsDraw] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const [isTimerActive, setIsTimerActive] = useState(false); // Tracks if the timer is started

  useEffect(() => {
    resetBoard();
  }, [boardSize, isAI, aiDifficulty, isTimerEnabled, timerDuration]);

  useEffect(() => {
    if (isTimerEnabled && isTimerActive && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isTimerEnabled && isTimerActive && timeLeft === 0) {
      handleTimeOut();
    }
  }, [isTimerEnabled, isTimerActive, timeLeft]);

  const handleTimeOut = () => {
    if (winner || isDraw) return;

    if (isAI && currentPlayer === "O") {
      setWinner("AI wins due to timeout!");
    } else {
      setWinner(`${currentPlayer === "X" ? "O" : "X"} wins due to timeout!`);
    }
  };

  const handleCellClick = (row: number, col: number) => {
    if (board[row][col] || winner) return;

    const updatedBoard = board.map((r, i) =>
      r.map((cell, j) => (i === row && j === col ? currentPlayer : cell))
    );
    setBoard(updatedBoard);

    const gameWinner = calculateWinner(updatedBoard);
    if (gameWinner) {
      setWinner(gameWinner === "X" ? "Player X wins!" : "Player O wins!");
      return;
    }

    if (isBoardFull(updatedBoard)) {
      setIsDraw(true);
      return;
    }

    setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
    setTimeLeft(timerDuration);

    if (isAI && currentPlayer === "X") {
      setTimeout(() => {
        const aiMove = getAIMove(updatedBoard, aiDifficulty);
        if (aiMove) {
          const aiUpdatedBoard = updatedBoard.map((r, i) =>
            r.map((cell, j) => (i === aiMove.row && j === aiMove.col ? "O" : cell))
          );
          setBoard(aiUpdatedBoard);

          const aiWinner = calculateWinner(aiUpdatedBoard);
          if (aiWinner) {
            setWinner("AI wins!");
            return;
          }

          if (isBoardFull(aiUpdatedBoard)) {
            setIsDraw(true);
            return;
          }

          setCurrentPlayer("X");
          setTimeLeft(timerDuration);
        }
      }, 300);
    }
  };

  const isBoardFull = (board: string[][]): boolean => {
    return board.every((row) => row.every((cell) => cell !== ""));
  };

  const resetBoard = () => {
    setBoard(Array.from({ length: boardSize }, () => Array(boardSize).fill("")));
    setWinner(null);
    setIsDraw(false);
    setCurrentPlayer("X");
    setTimeLeft(timerDuration);
    setIsTimerActive(false); // Reset timer activation state
  };

  const startTimer = () => {
    setTimeLeft(timerDuration);
    setIsTimerActive(true);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}
    >
      {isTimerEnabled && (
        <>
          <Typography variant="h6" sx={{ mb: 2, fontFamily: "Poppins" }}>
            {currentPlayer}'s Turn - Time Left: {isTimerActive ? `${timeLeft}s` : "Paused"}
          </Typography>
          {!isTimerActive && (
            <Button
              variant="contained"
              color="primary"
              onClick={startTimer}
              sx={{ mb: 2 }}
            >
              Start Timer
            </Button>
          )}
        </>
      )}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
          gap: "1px",
        }}
      >
        {board.map((row, i) =>
          row.map((cell, j) => (
            <Cell key={`${i}-${j}`} value={cell} onClick={() => handleCellClick(i, j)} />
          ))
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
      <Button variant="contained" color="primary" onClick={resetBoard} sx={{ mt: 2 }}>
        Reset Board
      </Button>
    </Box>
  );
};

export default Board;
