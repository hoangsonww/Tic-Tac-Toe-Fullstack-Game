import React, { useState } from "react";
import Board from "../components/Board";
import Settings from "../components/Settings";
import { Box, Typography } from "@mui/material";

const Home: React.FC = () => {
  const [boardSize, setBoardSize] = useState(4);
  const [isAI, setIsAI] = useState(false);
  const [aiDifficulty, setAIDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [isTimerEnabled, setIsTimerEnabled] = useState(false);
  const [timerDuration, setTimerDuration] = useState(30); // Default timer duration in seconds

  return (
    <Box sx={{ textAlign: "center", py: 5 }}>
      <Typography variant="h4" gutterBottom sx={{ fontFamily: "Poppins" }}>
        Tic Tac Toe
      </Typography>
      <Settings
        boardSize={boardSize}
        setBoardSize={setBoardSize}
        isAI={isAI}
        setIsAI={setIsAI}
        aiDifficulty={aiDifficulty}
        setAIDifficulty={setAIDifficulty}
        isTimerEnabled={isTimerEnabled}
        setIsTimerEnabled={setIsTimerEnabled}
        timerDuration={timerDuration}
        setTimerDuration={setTimerDuration}
      />
      <Board
        boardSize={boardSize}
        isAI={isAI}
        aiDifficulty={aiDifficulty}
        isTimerEnabled={isTimerEnabled}
        timerDuration={timerDuration}
      />
    </Box>
  );
};

export default Home;
