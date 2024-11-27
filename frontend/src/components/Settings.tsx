import React, { useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
  Button,
  useMediaQuery,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material";
import { useTheme } from "@mui/system";

interface SettingsProps {
  boardSize: number;
  setBoardSize: (size: number) => void;
  isAI: boolean;
  setIsAI: (isAI: boolean) => void;
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
  isAI,
  setIsAI,
  aiDifficulty,
  setAIDifficulty,
  isTimerEnabled,
  setIsTimerEnabled,
  timerDuration,
  setTimerDuration,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [inputTimer, setInputTimer] = useState(timerDuration);

  const handleBoardSizeChange = (event: SelectChangeEvent<number>) => {
    const newSize = parseInt(event.target.value as unknown as string, 10);
    if (newSize >= 3 && newSize <= 8) {
      setBoardSize(newSize);
    }
  };

  const handleSetTimer = () => {
    if (inputTimer >= 10 && inputTimer <= 300) {
      setTimerDuration(inputTimer);
    }
  };

  const boardSizeOptions = [
    { value: 3, label: "3 x 3" },
    { value: 4, label: "4 x 4 (Recommended)" },
    { value: 5, label: "5 x 5" },
    { value: 6, label: "6 x 6" },
    { value: 7, label: "7 x 7" },
    { value: 8, label: "8 x 8" },
  ];

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
      {/* Board Size Settings */}
      <Box
        sx={{
          display: "flex",
          flexDirection: isSmallScreen ? "column" : "row",
          alignItems: "center",
          gap: 2,
          mt: 0,
        }}
      >
        <FormControl sx={{ minWidth: 200 }}>
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
                borderColor: "#000000",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#000000",
              },
              ".MuiSvgIcon-root": {
                color: "#000000",
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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Typography variant="body1" sx={{ fontFamily: "Poppins" }}>
            Play Against AI
          </Typography>
          <Switch checked={isAI} onChange={(e) => setIsAI(e.target.checked)} />
        </Box>
      </Box>

      {/* AI Difficulty Settings */}
      {isAI && (
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
                borderColor: "#000000",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#000000",
              },
              ".MuiSvgIcon-root": {
                color: "#000000",
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
        <Typography
          variant="body1"
          sx={{
            fontFamily: "Poppins",
          }}
        >
          Enable Timer
        </Typography>
        <Switch
          checked={isTimerEnabled}
          onChange={(e) => setIsTimerEnabled(e.target.checked)}
        />
        {isTimerEnabled && (
          <Box
            sx={{
              display: "flex",
              flexDirection: isSmallScreen ? "column" : "row",
              gap: 2,
              alignItems: "center",
            }}
          >
            <TextField
              label="Timer (seconds)"
              type="number"
              value={inputTimer}
              onChange={(e) => setInputTimer(Number(e.target.value))}
              inputProps={{
                min: 10,
                max: 300,
                style: {
                  fontFamily: "Poppins, sans-serif",
                },
              }}
              InputLabelProps={{
                style: {
                  fontFamily: "Poppins, sans-serif",
                },
              }}
              sx={{
                fontFamily: "Poppins",
                width: isSmallScreen ? "100%" : 200,
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSetTimer}
              sx={{ fontFamily: "Poppins" }}
            >
              Set Timer
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Settings;
