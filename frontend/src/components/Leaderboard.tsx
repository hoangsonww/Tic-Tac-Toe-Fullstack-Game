import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import { Typography, Box, List, ListItem, ListItemText } from "@mui/material";

const Leaderboard: React.FC = () => {
    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
        api.get("/leaderboard").then((response) => setLeaderboard(response.data));
    }, []);

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Leaderboard
            </Typography>
            <List>
                {leaderboard.map((entry: any, index: number) => (
                    <ListItem key={index}>
                        <ListItemText
                            primary={`${entry.player} (${entry.result})`}
                            secondary={new Date(entry.date).toLocaleString()}
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default Leaderboard;
