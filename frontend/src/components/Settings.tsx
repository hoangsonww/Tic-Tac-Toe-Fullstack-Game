import React, { useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  TextField,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Typography,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Button,
  useMediaQuery,
  Tooltip,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Switch,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material";
import { useTheme } from "@mui/system";

interface SettingsProps {
  boardSize: number;
  setBoardSize: (size: number) => void;
  gameMode: "ai" | "local" | "online";
  setGameMode: (mode: "ai" | "local" | "online") => void;
  aiDifficulty: "easy" | "medium" | "hard" | "impossible";
  setAIDifficulty: (
    difficulty: "easy" | "medium" | "hard" | "impossible",
  ) => void;
  isTimerEnabled: boolean;
  setIsTimerEnabled: (enabled: boolean) => void;
  timerDuration: number;
  setTimerDuration: (duration: number) => void;
}

const Settings: React.FC<SettingsProps> = ({
  boardSize,
  setBoardSize,
  gameMode,
  setGameMode,
  aiDifficulty,
  setAIDifficulty,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isTimerEnabled,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setIsTimerEnabled,
  timerDuration,
  setTimerDuration,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [inputTimer, setInputTimer] = useState(timerDuration);

  const handleBoardSizeChange = (event: SelectChangeEvent<number>) => {
    const newSize = parseInt(event.target.value as unknown as string, 10);
    if (newSize >= 3 && newSize <= 8) {
      setBoardSize(newSize);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSetTimer = () => {
    if (inputTimer >= 10 && inputTimer <= 300) {
      setTimerDuration(inputTimer);
    }
  };

  const handleGameModeChange = (
    event: SelectChangeEvent<"ai" | "local" | "online">,
  ) => {
    setGameMode(event.target.value as "ai" | "local" | "online");
  };

  const boardSizeOptions = [
    { value: 3, label: "3 x 3" },
    { value: 4, label: "4 x 4 (Recommended)" },
    { value: 5, label: "5 x 5" },
    { value: 6, label: "6 x 6" },
    { value: 7, label: "7 x 7" },
    { value: 8, label: "8 x 8" },
  ];

  const isOnlineMode = gameMode === "online";

  return (
    <Box
      sx={{
        textAlign: "center",
        mb: 0,
        p: isSmallScreen ? 2 : 4,
        display: "flex",
        flexDirection: "column",
        gap: 3,
        alignItems: "center",
      }}
    >
      {/* Game Mode Settings */}
      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel id="game-mode-label" sx={{ fontFamily: "Poppins" }}>
          Game Mode
        </InputLabel>
        <Select
          labelId="game-mode-label"
          value={gameMode}
          onChange={handleGameModeChange}
          label="Game Mode"
          variant="outlined"
          sx={{
            fontFamily: "Poppins",
            ".MuiOutlinedInput-notchedOutline": {
              borderColor:
                theme.palette.mode === "dark" ? "#ffffff" : "#000000",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor:
                theme.palette.mode === "dark" ? "#ffffff" : "#000000",
            },
            ".MuiSvgIcon-root": {
              color: theme.palette.mode === "dark" ? "#ffffff" : "#000000",
            },
          }}
        >
          <MenuItem value="ai" sx={{ fontFamily: "Poppins" }}>
            Play Against AI
          </MenuItem>
          <MenuItem value="local" sx={{ fontFamily: "Poppins" }}>
            Play Locally
          </MenuItem>
          <MenuItem value="online" sx={{ fontFamily: "Poppins" }}>
            Play Online
          </MenuItem>
        </Select>
      </FormControl>

      {/* Board Size Settings */}
      <Tooltip
        title={
          isOnlineMode
            ? "Board size is fixed at 4x4 in online mode."
            : "Choose a board size for the game."
        }
      >
        <FormControl sx={{ minWidth: 200 }} disabled={isOnlineMode}>
          <InputLabel id="board-size-label" sx={{ fontFamily: "Poppins" }}>
            Board Size
          </InputLabel>
          <Select
            labelId="board-size-label"
            value={boardSize}
            onChange={handleBoardSizeChange}
            label="Board Size"
            variant="outlined"
            sx={{
              fontFamily: "Poppins",
              ".MuiOutlinedInput-notchedOutline": {
                borderColor:
                  theme.palette.mode === "dark" ? "#ffffff" : "#000000",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor:
                  theme.palette.mode === "dark" ? "#ffffff" : "#000000",
              },
              ".MuiSvgIcon-root": {
                color: theme.palette.mode === "dark" ? "#ffffff" : "#000000",
              },
            }}
          >
            {boardSizeOptions.map((option) => (
              <MenuItem
                key={option.value}
                value={option.value}
                sx={{ fontFamily: "Poppins" }}
              >
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Tooltip>

      {/* AI Difficulty Settings */}
      {gameMode === "ai" && (
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel
            id="ai-difficulty-label"
            sx={{
              fontFamily: "Poppins",
            }}
          >
            AI Difficulty
          </InputLabel>
          <Select
            labelId="ai-difficulty-label"
            value={aiDifficulty}
            onChange={(e) => setAIDifficulty(e.target.value as any)}
            label="AI Difficulty"
            variant="outlined"
            sx={{
              fontFamily: "Poppins",
              ".MuiOutlinedInput-notchedOutline": {
                borderColor:
                  theme.palette.mode === "dark" ? "#ffffff" : "#000000",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor:
                  theme.palette.mode === "dark" ? "#ffffff" : "#000000",
              },
              ".MuiSvgIcon-root": {
                color: theme.palette.mode === "dark" ? "#ffffff" : "#000000",
              },
            }}
          >
            <MenuItem value="easy" sx={{ fontFamily: "Poppins" }}>
              Easy
            </MenuItem>
            <MenuItem value="medium" sx={{ fontFamily: "Poppins" }}>
              Medium
            </MenuItem>
            <MenuItem value="hard" sx={{ fontFamily: "Poppins" }}>
              Hard
            </MenuItem>
            <MenuItem value="impossible" sx={{ fontFamily: "Poppins" }}>
              Impossible
            </MenuItem>
          </Select>
        </FormControl>
      )}

      {/* Timer Settings */}
      <Box
        sx={{
          display: "flex",
          flexDirection: isSmallScreen ? "column" : "row",
          alignItems: "center",
          gap: 2,
        }}
      >
        {/*<Tooltip*/}
        {/*  title={*/}
        {/*    isOnlineMode*/}
        {/*      ? "Timer is disabled in online mode."*/}
        {/*      : "Enable or disable the timer for the game."*/}
        {/*  }*/}
        {/*>*/}
        {/*  <Box*/}
        {/*    sx={{*/}
        {/*      display: "flex",*/}
        {/*      alignItems: "center",*/}
        {/*      gap: 1,*/}
        {/*      opacity: isOnlineMode ? 0.5 : 1,*/}
        {/*    }}*/}
        {/*  >*/}
        {/*    <Typography variant="body1" sx={{ fontFamily: "Poppins" }}>*/}
        {/*      Enable Timer*/}
        {/*    </Typography>*/}
        {/*    <Switch*/}
        {/*      checked={isTimerEnabled}*/}
        {/*      onChange={(e) => setIsTimerEnabled(e.target.checked)}*/}
        {/*      disabled={isOnlineMode}*/}
        {/*    />*/}
        {/*  </Box>*/}
        {/*</Tooltip>*/}
        {/*{isTimerEnabled && !isOnlineMode && (*/}
        {/*  <Box*/}
        {/*    sx={{*/}
        {/*      display: "flex",*/}
        {/*      flexDirection: isSmallScreen ? "column" : "row",*/}
        {/*      gap: 2,*/}
        {/*      alignItems: "center",*/}
        {/*    }}*/}
        {/*  >*/}
        {/*    <TextField*/}
        {/*      label="Timer (seconds)"*/}
        {/*      type="number"*/}
        {/*      value={inputTimer}*/}
        {/*      onChange={(e) => setInputTimer(Number(e.target.value))}*/}
        {/*      inputProps={{*/}
        {/*        min: 10,*/}
        {/*        max: 300,*/}
        {/*        style: {*/}
        {/*          fontFamily: "Poppins, sans-serif",*/}
        {/*        },*/}
        {/*      }}*/}
        {/*      InputLabelProps={{*/}
        {/*        style: {*/}
        {/*          fontFamily: "Poppins, sans-serif",*/}
        {/*        },*/}
        {/*      }}*/}
        {/*      sx={{*/}
        {/*        fontFamily: "Poppins",*/}
        {/*        width: isSmallScreen ? "100%" : 200,*/}
        {/*      }}*/}
        {/*    />*/}
        {/*    <Button*/}
        {/*      variant="contained"*/}
        {/*      color="primary"*/}
        {/*      onClick={handleSetTimer}*/}
        {/*      sx={{ fontFamily: "Poppins" }}*/}
        {/*    >*/}
        {/*      Set Timer*/}
        {/*    </Button>*/}
        {/*  </Box>*/}
        {/*)}*/}
      </Box>
    </Box>
  );
};

export default Settings;
