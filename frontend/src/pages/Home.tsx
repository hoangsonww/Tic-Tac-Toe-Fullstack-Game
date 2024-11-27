import React, { useState } from "react";
import Board from "../components/Board";
import Settings from "../components/Settings";
import { Box, Typography } from "@mui/material";

const Home: React.FC = () => {
  const [boardSize, setBoardSize] = useState(4);
  const [isAI, setIsAI] = useState(false);
  const [aiDifficulty, setAIDifficulty] = useState<
    "easy" | "medium" | "hard" | "impossible"
  >("medium");
  const [isTimerEnabled, setIsTimerEnabled] = useState(false);
  const [timerDuration, setTimerDuration] = useState(30); // Default timer duration in seconds

  return (
    <Box sx={{ textAlign: "center", py: 5 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontFamily: "Poppins", mb: 2, fontWeight: "bold" }}
      >
        Tic Tac Toe Pro Game
      </Typography>
      {/* Divider */}
      <div
        style={{
          width: "100%",
          borderBottom: "1px solid #e0e0e0",
          margin: "0 auto 20px",
        }}
      />
      <Typography
        variant="h6"
        gutterBottom
        sx={{ fontFamily: "Poppins", mb: 0 }}
      >
        Settings
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
      {/* Divider */}
      <div
        style={{
          width: "100%",
          borderBottom: "1px solid #e0e0e0",
          margin: "0 auto 20px",
        }}
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