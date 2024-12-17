import React, { useState, useEffect, useRef } from "react";
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
  CircularProgress,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  ArrowUpward,
  ArrowDownward,
  Remove,
  Search,
} from "@mui/icons-material";

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [filteredLeaderboard, setFilteredLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [search, setSearch] = useState("");

  const debounceTimeout = useRef<number | null>(null);

  // Fetch leaderboard data
  useEffect(() => {
    api
      .get("/leaderboard")
      .then((response) => {
        setLeaderboard(response.data);
        setFilteredLeaderboard(response.data);
      })
      .catch((error) => console.error("Failed to fetch leaderboard:", error))
      .finally(() => setLoading(false));
  }, []);

  // Custom debounce function
  const debounce = (callback: Function, delay: number) => {
    return (...args: any) => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      debounceTimeout.current = window.setTimeout(() => {
        callback(...args);
      }, delay);
    };
  };

  const handleSearch = (value: string) => {
    setSearchLoading(true);
    const filtered = leaderboard.filter((entry: any) =>
      entry.username.toLowerCase().includes(value.toLowerCase()),
    );
    setFilteredLeaderboard(filtered);
    setSearchLoading(false);
  };

  const debouncedSearch = debounce(handleSearch, 300);

  const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearch(value);
    debouncedSearch(value);
  };

  const calculateWinRate = (wins: number, losses: number, draws: number) => {
    const totalMatches = wins + losses + draws;
    return totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(2) : "0.00";
  };

  const getWinRateColor = (winRate: number) => {
    if (winRate > 60) return "green";
    if (winRate >= 40) return "orange";
    return "red";
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

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
      <TextField
        label="Search for Players"
        fullWidth
        margin="normal"
        value={search}
        onChange={onSearchChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
        sx={{
          "& .MuiInputBase-input": {
            fontFamily: "Poppins",
          },
          "& .MuiInputLabel-root": {
            fontFamily: "Poppins",
          },
        }}
      />
      {searchLoading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "20vh",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <List>
          {filteredLeaderboard.map((entry: any, index: number) => {
            const winRate = parseFloat(
              calculateWinRate(
                entry.totalWins,
                entry.totalLosses,
                entry.totalDraws,
              ),
            );
            return (
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
                      secondary={
                        <>
                          <Typography
                            sx={{
                              fontFamily: "Poppins, sans-serif",
                              color: "gray",
                              fontSize: "0.9rem",
                            }}
                          >
                            ELO: {entry.elo}
                          </Typography>
                          <Typography
                            sx={{
                              fontFamily: "Poppins, sans-serif",
                              fontSize: "0.9rem",
                              color: getWinRateColor(winRate),
                            }}
                          >
                            Win Rate: {winRate}%
                          </Typography>
                        </>
                      }
                      primaryTypographyProps={{
                        fontFamily: "Poppins",
                        fontWeight: 600,
                        fontSize: "1.1rem",
                        sx: {
                          overflow: "hidden",
                          wordBreak: "break-word",
                          whiteSpace: "normal",
                        },
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
                      <ArrowDownward sx={{ mr: 0.5 }} /> {entry.totalLosses}{" "}
                      Losses
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
            );
          })}
        </List>
      )}
    </Box>
  );
};

export default Leaderboard;
