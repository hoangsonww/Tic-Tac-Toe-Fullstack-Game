import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import {
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Paper,
} from "@mui/material";
import { ArrowUpward, ArrowDownward, Remove } from "@mui/icons-material";

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    api.get("/leaderboard").then((response) => setLeaderboard(response.data));
  }, []);

  return (
    <Box
      sx={{
        p: 4,
        maxWidth: 700,
        mx: "auto",
        textAlign: "center",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontFamily: "Poppins, sans-serif", mb: 3, fontWeight: "bold" }}
      >
        Global Leaderboard
      </Typography>
      <List>
        {leaderboard.map((entry: any, index: number) => (
          <Paper
            elevation={3}
            key={index}
            sx={{
              mb: 3,
              borderRadius: "8px",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              transition: "transform 0.3s, box-shadow 0.3s",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.2)",
              },
            }}
          >
            <ListItem
              sx={{
                p: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor:
                        index === 0
                          ? "gold"
                          : index === 1
                            ? "silver"
                            : index === 2
                              ? "#cd7f32"
                              : "grey",
                      color: "white",
                      fontFamily: "Poppins, sans-serif",
                    }}
                  >
                    {index + 1}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={entry.username}
                  secondary={`ELO: ${entry.elo}`}
                  primaryTypographyProps={{
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 600,
                    fontSize: "1.1rem",
                  }}
                  secondaryTypographyProps={{
                    fontFamily: "Poppins, sans-serif",
                    color: "gray",
                  }}
                />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontFamily: "Poppins, sans-serif",
                    color: "green",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <ArrowUpward sx={{ mr: 0.5 }} /> {entry.totalWins} Wins
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Poppins, sans-serif",
                    color: "red",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <ArrowDownward sx={{ mr: 0.5 }} /> {entry.totalLosses} Losses
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Poppins, sans-serif",
                    color: "gray",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Remove sx={{ mr: 0.5 }} /> {entry.totalDraws} Draws
                </Typography>
              </Box>
            </ListItem>
          </Paper>
        ))}
      </List>
    </Box>
  );
};

export default Leaderboard;
