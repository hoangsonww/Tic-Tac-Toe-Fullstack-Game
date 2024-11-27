import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Leaderboard from "./components/Leaderboard";
import Profile from "./components/Profile";
import Login from "./components/Login";
import Register from "./components/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPassword from "./components/ForgotPassword";
import LandingPage from "./pages/LandingPage";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  GlobalStyles,
} from "@mui/material";

const App: React.FC = () => {
  const [isDarkMode, setDarkMode] = useState<boolean>(() => {
    const savedPreference = localStorage.getItem("isDarkMode");
    return savedPreference ? JSON.parse(savedPreference) : false; // Default to light mode
  });

  const toggleTheme = () => {
    setDarkMode((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem("isDarkMode", JSON.stringify(newMode)); // Save to localStorage
      return newMode;
    });
  };

  useEffect(() => {
    const savedPreference = localStorage.getItem("isDarkMode");
    if (savedPreference) {
      setDarkMode(JSON.parse(savedPreference));
    }
  }, []);

  // Create the theme based on dark mode state
  const theme = createTheme({
    palette: {
      mode: isDarkMode ? "dark" : "light",
      primary: {
        main: "#1976d2",
      },
      background: {
        default: isDarkMode ? "#121212" : "#f5f5f5",
        paper: isDarkMode ? "#1e1e1e" : "#ffffff",
      },
      text: {
        primary: isDarkMode ? "#ffffff" : "#000000",
        secondary: isDarkMode ? "#aaaaaa" : "#666666",
      },
    },
    typography: {
      fontFamily: "Poppins, sans-serif",
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Smooth transition effect */}
      <GlobalStyles
        styles={{
          "body, #root": {
            transition: "background-color 0.3s ease",
          },
        }}
      />
      <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      <div style={{ minHeight: "calc(100vh - 64px - 100px)" }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/landing" element={<LandingPage />} />
        </Routes>
      </div>
      <Footer />
    </ThemeProvider>
  );
};

export default App;
