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
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material";

interface SettingsProps {
  boardSize: number;
  setBoardSize: (size: number) => void;
  isAI: boolean;
  setIsAI: (isAI: boolean) => void;
  aiDifficulty: "easy" | "medium" | "hard";
  setAIDifficulty: (difficulty: "easy" | "medium" | "hard") => void;
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
  // Temporary state to hold user input before confirming
  const [inputTimer, setInputTimer] = useState(timerDuration);

  const handleBoardSizeChange = (event: SelectChangeEvent<number>) => {
    const newSize = parseInt(event.target.value as unknown as string, 10);
    if (newSize >= 3 && newSize <= 8) {
      setBoardSize(newSize);
    }
  };

  const boardSizeOptions = [
    { value: 3, label: "Board Size 1: 3 x 3" },
    { value: 4, label: "Board Size 2: 4 x 4 (Recommended)" },
    { value: 5, label: "Board Size 3: 5 x 5" },
    { value: 6, label: "Board Size 4: 6 x 6" },
    { value: 7, label: "Board Size 5: 7 x 7" },
    { value: 8, label: "Board Size 6: 8 x 8" },
  ];

  const handleSetTimer = () => {
    if (inputTimer >= 10 && inputTimer <= 300) {
      setTimerDuration(inputTimer); // Update the timer only on confirmation
    }
  };

  return (
    <Box sx={{ textAlign: "center", mb: 3 }}>
      {/* Board Size Settings */}
      <Box
        sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 2 }}
      >
        <FormControl sx={{ minWidth: 200, mr: 2 }}>
          <InputLabel
            id="board-size-label"
            sx={{
              fontFamily: "Poppins",
            }}
          >
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

        {/* Play Against AI Switch */}
        <Typography
          variant="body1"
          sx={{
            mr: 1,
            fontFamily: "Poppins",
          }}
        >
          Play Against AI
        </Typography>
        <Switch checked={isAI} onChange={(e) => setIsAI(e.target.checked)} />
      </Box>

      {/* AI Difficulty Settings */}
      {isAI && (
        <FormControl sx={{ minWidth: 200, mb: 2 }}>
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
          </Select>
        </FormControl>
      )}

      {/* Timer Settings */}
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 2 }}>
        <Typography
          variant="body1"
          sx={{
            mr: 1,
            fontFamily: "Poppins",
          }}
        >
          Enable Timer
        </Typography>
        <Switch
          checked={isTimerEnabled}
          onChange={(e) => setIsTimerEnabled(e.target.checked)}
        />
      </Box>
      {isTimerEnabled && (
        <Box
          sx={{
            mt: 2,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
          }}
        >
          <TextField
            label="Timer Duration (seconds)"
            type="number"
            value={inputTimer}
            onChange={(e) => setInputTimer(Number(e.target.value))}
            inputProps={{ min: 10, max: 300 }}
            sx={{
              fontFamily: "Poppins",
              width: 200,
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
  );
};

export default Settings;
