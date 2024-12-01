import React from "react";
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import { keyframes } from "@emotion/react";

const slideUp = keyframes`
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const LandingPage: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const themeColor = "#1976d2";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: isDarkMode ? "#1e1e1e" : "#f5f5f5",
        padding: "2rem 0",
        transition: "background-color 0.3s ease",
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          textAlign: "center",
          padding: "2rem",
          backgroundColor: themeColor,
          color: "white",
          borderRadius: 2,
          boxShadow: 3,
          animation: `${slideUp} 0.5s ease-out`,
        }}
      >
        <Typography
          variant="h3"
          sx={{
            marginBottom: "1rem",
            fontFamily: "Poppins",
            fontWeight: 600,
            fontSize: isSmallScreen ? "2rem" : "2.5rem",
          }}
        >
          Welcome to Tic Tac Toe Pro
        </Typography>
        <Typography
          variant="h6"
          sx={{
            marginBottom: "2rem",
            fontFamily: "Poppins",
            fontSize: isSmallScreen ? "1rem" : "1.2rem",
          }}
        >
          Experience the classic game with AI opponents, global leaderboards,
          and customizable gameplay!
        </Typography>
        <Button
          component={Link}
          to="/home"
          variant="contained"
          sx={{
            backgroundColor: "white",
            color: themeColor,
            padding: "0.75rem 1.5rem",
            fontFamily: "Poppins",
            fontWeight: 600,
            "&:hover": {
              backgroundColor: "#e3f2fd",
            },
          }}
        >
          Get Started
        </Button>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={4}>
          {[
            {
              title: "Play Against AI",
              description:
                "Challenge our advanced AI with difficulty levels ranging from Easy to Impossible.",
              buttonText: "Play AI",
              link: "/game",
            },
            {
              title: "Multiplayer Mode",
              description:
                "Play Tic Tac Toe with your friends in the local multiplayer mode, or online with players worldwide.",
              buttonText: "Multiplayer",
              link: "/home",
            },
            {
              title: "Global Leaderboard",
              description:
                "Compete globally and see your ranking among the best Tic Tac Toe players.",
              buttonText: "Leaderboard",
              link: "/leaderboard",
            },
            {
              title: "Custom Board Sizes",
              description:
                "Switch things up with customizable board sizes from 3x3 to 8x8 (only available for Local and AI matches.)",
              buttonText: "Customize",
              link: "/home",
            },
            {
              title: "Timer Mode",
              description:
                "You have 30 seconds to make your move, so you must think quickly and make decisive moves under time pressure!",
              buttonText: "Try Timer Mode",
              link: "/home",
            },
            {
              title: "User Profiles",
              description:
                "Create your own profiles and join the global community of players! You can also search for any player's profile, too.",
              buttonText: "View Profile",
              link: "/profile",
            },
          ].map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={feature.title}>
              <Card
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  boxShadow: 3,
                  borderRadius: 2,
                  backgroundColor: isDarkMode ? "#333" : "#fff",
                  transition: "box-shadow 0.3s ease",
                  "&:hover": {
                    boxShadow: 6,
                  },
                  animation: `${slideUp} 0.6s ease-out`,
                  animationDelay: `${index * 0.2}s`,
                  animationFillMode: "both",
                }}
              >
                <CardContent>
                  <Typography
                    variant="h5"
                    sx={{
                      marginBottom: "1rem",
                      fontFamily: "Poppins",
                      fontWeight: 600,
                      color: themeColor,
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      fontFamily: "Poppins",
                      color: isDarkMode ? "white" : "black",
                    }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ mt: "auto" }}>
                  <Button
                    component={Link}
                    to={feature.link}
                    variant="contained"
                    sx={{
                      backgroundColor: themeColor,
                      color: "white",
                      fontFamily: "Poppins",
                      "&:hover": {
                        backgroundColor: "#005bb5",
                      },
                    }}
                  >
                    {feature.buttonText}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Additional Information Section */}
      <Box
        sx={{
          mt: 6,
          py: 4,
          textAlign: "center",
          backgroundColor: themeColor,
          color: "white",
          borderRadius: 2,
          boxShadow: 3,
          animation: `${slideUp} 0.8s ease-out`,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            mb: 2,
            fontFamily: "Poppins",
            fontWeight: 600,
          }}
        >
          Why Play Tic Tac Toe Pro?
        </Typography>
        <Typography
          variant="body1"
          sx={{
            maxWidth: 800,
            mx: "auto",
            fontFamily: "Poppins",
          }}
        >
          Our platform offers an exciting twist to the classic game, featuring
          AI-powered opponents, global rankings, and customizable game settings
          to suit your style. Play, compete, and become a Tic Tac Toe Pro!
        </Typography>
      </Box>

      {/* Additional Information Section */}
      <Box
        sx={{
          mt: 6,
          py: 4,
          textAlign: "center",
          backgroundColor: isDarkMode ? "#333" : "#f5f5f5",
          color: isDarkMode ? "white" : "black",
          borderRadius: 2,
          boxShadow: 3,
          animation: `${slideUp} 1s ease-out`,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            mb: 2,
            fontFamily: "Poppins",
            fontWeight: 600,
          }}
        >
          Ready to Get Started?
        </Typography>
        <Typography
          variant="body1"
          sx={{
            maxWidth: 800,
            mx: "auto",
            fontFamily: "Poppins",
          }}
        >
          Join Tic Tac Toe Pro today and experience the ultimate gaming
          platform. Play against AI, challenge your friends, and climb the
          global leaderboard!
        </Typography>
        <Button
          component={Link}
          to="/register"
          variant="contained"
          sx={{
            mt: 3,
            backgroundColor: themeColor,
            color: "white",
            padding: "0.75rem 1.5rem",
            fontFamily: "Poppins",
            fontWeight: 600,
            "&:hover": {
              backgroundColor: "#005bb5",
            },
          }}
        >
          Get Started
        </Button>
        <Typography variant="body1" sx={{ mt: 2, fontFamily: "Poppins" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: themeColor }}>
            Login
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default LandingPage;
