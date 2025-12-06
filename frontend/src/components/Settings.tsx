import React, { useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  useMediaQuery,
  Tooltip,
  Paper,
  Stack,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  Collapse,
  Button,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material";
import { useTheme } from "@mui/system";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import EmojiPeopleIcon from "@mui/icons-material/EmojiPeople";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

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
  const [showSettings, setShowSettings] = useState(true);

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

  const handleToggleGameMode = (
    _event: React.MouseEvent<HTMLElement>,
    value: "ai" | "local" | "online" | null,
  ) => {
    if (value) {
      setGameMode(value);
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

  const isOnlineMode = gameMode === "online";

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        maxWidth: 720,
        mx: "auto",
        borderRadius: 3,
        marginBottom: 4,
        p: isSmallScreen ? 2 : 3,
        background:
          theme.palette.mode === "dark"
            ? "linear-gradient(135deg, #1f2937 0%, #111827 100%)"
            : "linear-gradient(135deg, #ffffff 0%, #f7f9fc 100%)",
        border: `1px solid ${
          theme.palette.mode === "dark" ? "#2d3748" : "#e0e7ff"
        }`,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontFamily: "Poppins", fontWeight: "bold" }}
        >
          Settings
        </Typography>
        <Button
          size="small"
          startIcon={showSettings ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          onClick={() => setShowSettings((prev) => !prev)}
          sx={{ fontFamily: "Poppins" }}
        >
          {showSettings ? "Hide" : "Show"}
        </Button>
      </Box>
      <Collapse in={showSettings} timeout="auto" unmountOnExit>
        <Stack spacing={3}>
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ fontFamily: "Poppins", textTransform: "uppercase", mb: 1 }}
              color="text.secondary"
            >
              Game Mode
            </Typography>
            <ToggleButtonGroup
              color="primary"
              exclusive
              value={gameMode}
              onChange={handleToggleGameMode}
              fullWidth
            >
              <ToggleButton value="ai" sx={{ fontFamily: "Poppins" }}>
                <SmartToyIcon fontSize="small" sx={{ mr: 1 }} />
                AI
              </ToggleButton>
              <ToggleButton value="local" sx={{ fontFamily: "Poppins" }}>
                <EmojiPeopleIcon fontSize="small" sx={{ mr: 1 }} />
                Local
              </ToggleButton>
              <ToggleButton value="online" sx={{ fontFamily: "Poppins" }}>
                <PeopleAltIcon fontSize="small" sx={{ mr: 1 }} />
                Online
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Divider flexItem>
            <Chip
              label="Board"
              size="small"
              sx={{ fontFamily: "Poppins", letterSpacing: 0.5 }}
            />
          </Divider>

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
                  backgroundColor:
                    theme.palette.mode === "dark" ? "#0f172a" : "#fff",
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
                    color:
                      theme.palette.mode === "dark" ? "#ffffff" : "#000000",
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
        </Stack>
      </Collapse>
    </Paper>
  );
};

export default Settings;
