import React from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Box, Typography, Button, Container } from "@mui/material";
import { Link } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HomeIcon from "@mui/icons-material/Home";
import ReplayIcon from "@mui/icons-material/Replay";
import { keyframes } from "@emotion/react";

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
`;

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

const NotFoundPage: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const themeColor = "#1976d2";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: isDarkMode ? "#1e1e1e" : "#f5f5f5",
        textAlign: "center",
        p: 4,
        mb: 0,
      }}
    >
      {/* Animated Error Icon */}
      <ErrorOutlineIcon
        sx={{
          fontSize: isSmallScreen ? "6rem" : "8rem",
          color: themeColor,
          animation: `${bounce} 2s infinite`,
        }}
      />
      {/* Error Title */}
      <Typography
        variant="h3"
        sx={{
          fontFamily: "Poppins",
          fontWeight: 600,
          color: isDarkMode ? "white" : "black",
          mt: 2,
          animation: `${slideUp} 0.6s ease-out`,
          fontSize: isSmallScreen ? "2rem" : "3rem",
        }}
      >
        Oops! Page Not Found
      </Typography>
      {/* Error Description */}
      <Typography
        variant="body1"
        sx={{
          fontFamily: "Poppins",
          color: isDarkMode ? "gray" : "black",
          mt: 1,
          animation: `${slideUp} 0.8s ease-out`,
          fontSize: isSmallScreen ? "1rem" : "1.2rem",
        }}
      >
        The page you are looking for does not exist or has been moved.
      </Typography>
      {/* Action Buttons */}
      <Box
        sx={{
          mt: 4,
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Button
          component={Link}
          to="/"
          variant="contained"
          startIcon={<HomeIcon />}
          sx={{
            backgroundColor: themeColor,
            color: "white",
            fontFamily: "Poppins",
            fontWeight: 600,
            px: 3,
            py: 1.5,
            "&:hover": {
              backgroundColor: "#005bb5",
            },
          }}
        >
          Go to Homepage
        </Button>
        <Button
          component={Link}
          to="/home"
          variant="outlined"
          startIcon={<ReplayIcon />}
          sx={{
            borderColor: themeColor,
            color: themeColor,
            fontFamily: "Poppins",
            fontWeight: 600,
            px: 3,
            py: 1.5,
            "&:hover": {
              borderColor: "#005bb5",
              backgroundColor: "#e3f2fd",
            },
          }}
        >
          Try Again
        </Button>
      </Box>
      {/* Decorative Background */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          height: "150px",
          background: `linear-gradient(to top, ${themeColor}, transparent)`,
        }}
      ></Box>
    </Box>
  );
};

export default NotFoundPage;
