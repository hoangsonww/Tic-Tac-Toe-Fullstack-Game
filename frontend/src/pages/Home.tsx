import React, { useState } from "react";
import Board from "../components/Board";
import Settings from "../components/Settings";
import { Box, Typography } from "@mui/material";

const Home: React.FC = () => {
    const [boardSize, setBoardSize] = useState(3);
    const [isAI, setIsAI] = useState(false);
    const [aiDifficulty, setAIDifficulty] = useState<"easy" | "medium" | "hard">("medium");

    return (
        <Box sx={{ textAlign: "center", py: 5 }}>
            <Typography variant="h4" gutterBottom>
                Tic Tac Toe
            </Typography>
            <Settings
                boardSize={boardSize}
                setBoardSize={setBoardSize}
                isAI={isAI}
                setIsAI={setIsAI}
                aiDifficulty={aiDifficulty}
                setAIDifficulty={setAIDifficulty}
            />
            <Board boardSize={boardSize} isAI={isAI} aiDifficulty={aiDifficulty} />
        </Box>
    );
};

export default Home;
