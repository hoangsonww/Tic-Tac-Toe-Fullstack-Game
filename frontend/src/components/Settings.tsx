import React from "react";
import { Box, FormControl, InputLabel, MenuItem, Select, Switch, Typography } from "@mui/material";

interface SettingsProps {
    boardSize: number;
    setBoardSize: (size: number) => void;
    isAI: boolean;
    setIsAI: (isAI: boolean) => void;
    aiDifficulty: "easy" | "medium" | "hard";
    setAIDifficulty: (difficulty: "easy" | "medium" | "hard") => void;
}

const Settings: React.FC<SettingsProps> = ({
                                               boardSize,
                                               setBoardSize,
                                               isAI,
                                               setIsAI,
                                               aiDifficulty,
                                               setAIDifficulty,
                                           }) => {
    const handleBoardSizeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        const newSize = parseInt(event.target.value as string, 10);
        if (newSize >= 3 && newSize <= 10) {
            setBoardSize(newSize);
        }
    };

    // @ts-ignore
    return (
        <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography variant="h6" gutterBottom>
                Game Settings
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 2 }}>
                <FormControl sx={{ minWidth: 120, mr: 2 }}>
                    <InputLabel>Board Size</InputLabel>
                    {/* @ts-ignore */}
                    <Select value={boardSize} onChange={handleBoardSizeChange}>
                        {[3, 4, 5, 6, 7, 8, 9, 10].map((size) => (
                            <MenuItem key={size} value={size}>
                                {size} x {size}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Typography variant="body1" sx={{ mr: 1 }}>
                    Play Against AI
                </Typography>
                <Switch checked={isAI} onChange={(e) => setIsAI(e.target.checked)} />
            </Box>
            {isAI && (
                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel>AI Difficulty</InputLabel>
                    <Select value={aiDifficulty} onChange={(e) => setAIDifficulty(e.target.value as any)}>
                        <MenuItem value="easy">Easy</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="hard">Hard</MenuItem>
                    </Select>
                </FormControl>
            )}
        </Box>
    );
};

export default Settings;
