import React, { useState } from "react";
import Cell from "./Cell";
import { calculateWinner } from "../utils/helpers";
import { getAIMove } from "../utils/ai";
import { Box, Typography, Button } from "@mui/material";

interface BoardProps {
    boardSize: number;
    isAI: boolean;
    aiDifficulty: "easy" | "medium" | "hard";
}

const Board: React.FC<BoardProps> = ({ boardSize, isAI, aiDifficulty }) => {
    const [board, setBoard] = useState(
        Array.from({ length: boardSize }, () => Array(boardSize).fill(""))
    );
    const [currentPlayer, setCurrentPlayer] = useState<"X" | "O">("X");
    const [winner, setWinner] = useState<string | null>(null);

    const handleCellClick = (row: number, col: number) => {
        // Prevent clicking on an already filled cell or after the game ends
        if (board[row][col] || winner || currentPlayer !== "X") return;

        // Update board with the user's move (X)
        const updatedBoard = board.map((r, i) =>
            r.map((cell, j) => (i === row && j === col ? "X" : cell))
        );
        setBoard(updatedBoard);

        // Check if the user's move wins the game
        const gameWinner = calculateWinner(updatedBoard);
        if (gameWinner) {
            if (gameWinner === "X") {
                window.alert("You wins!");
                setWinner("You wins!");
            }
            return;
        }

        // Switch to AI's turn (O)
        setCurrentPlayer("O");

        // AI's turn logic
        if (isAI) {
            setTimeout(() => {
                const aiMove = getAIMove(updatedBoard, aiDifficulty);
                if (aiMove) {
                    const aiUpdatedBoard = updatedBoard.map((r, i) =>
                        r.map((cell, j) => (i === aiMove.row && j === aiMove.col ? "O" : cell))
                    );
                    setBoard(aiUpdatedBoard);

                    // Check if AI's move wins the game
                    const aiWinner = calculateWinner(aiUpdatedBoard);
                    if (aiWinner) {
                        if (aiWinner === "O") {
                            window.alert("You lost - The AI wins!");
                            setWinner("You lost - The AI wins!");
                        }
                        return;
                    }

                    // Switch back to the user's turn (X)
                    setCurrentPlayer("X");
                }
            }, 300); // Add delay for better UX
        }
    };

    const resetBoard = () => {
        setBoard(Array.from({ length: boardSize }, () => Array(boardSize).fill("")));
        setWinner(null);
        setCurrentPlayer("X");
    };

    return (
        <Box>
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
                    gap: 1,
                    maxWidth: "400px",
                    margin: "0 auto",
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
            <Button variant="contained" color="primary" onClick={resetBoard} sx={{ mt: 2 }}>
                Reset Board
            </Button>
        </Box>
    );
};

export default Board;
