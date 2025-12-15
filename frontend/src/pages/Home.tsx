import React, { useState } from "react";
import Board from "../components/Board";
import Settings from "../components/Settings";
import { Box, Typography, Stack, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/system";

const Home: React.FC = () => {
  const [boardSize, setBoardSize] = useState(4);
  const [gameMode, setGameMode] = useState<"ai" | "local" | "online">("ai");
  const [aiDifficulty, setAIDifficulty] = useState<
    "easy" | "medium" | "hard" | "impossible"
  >("medium");
  const [isTimerEnabled, setIsTimerEnabled] = useState(false);
  const [timerDuration, setTimerDuration] = useState(30);
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box sx={{ textAlign: "center", py: 5, px: 2 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontFamily: "Poppins", mb: 2, fontWeight: "bold" }}
      >
        Tic Tac Toe Pro Game
      </Typography>
      <Box
        sx={{
          width: "100%",
          borderBottom: "1px solid #e0e0e0",
          margin: "0 auto 20px",
        }}
      />
      <Stack
        direction={isSmall ? "column" : "row"}
        spacing={3}
        alignItems="flex-start"
        justifyContent="center"
        sx={{ maxWidth: 1200, mx: "auto", width: "100%" }}
      >
        <Box sx={{ flex: 1, minWidth: isSmall ? "100%" : 320 }}>
          <Settings
            boardSize={boardSize}
            setBoardSize={setBoardSize}
            gameMode={gameMode}
            setGameMode={setGameMode}
            aiDifficulty={aiDifficulty}
            setAIDifficulty={setAIDifficulty}
            isTimerEnabled={isTimerEnabled}
            setIsTimerEnabled={setIsTimerEnabled}
            timerDuration={timerDuration}
            setTimerDuration={setTimerDuration}
          />
        </Box>
        <Box
          sx={{
            flex: 1,
            minWidth: isSmall ? "100%" : 360,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Board
            boardSize={boardSize}
            isAI={gameMode === "ai"}
            aiDifficulty={aiDifficulty}
            isTimerEnabled={isTimerEnabled}
            timerDuration={timerDuration}
            gameMode={gameMode}
          />
        </Box>
      </Stack>
    </Box>
  );
};

export default Home;
