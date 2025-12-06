import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Button,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Home,
  Leaderboard,
  AccountCircle,
  ExitToApp,
  Login,
  AppRegistration,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
} from "@mui/icons-material";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Navbar: React.FC<{ isDarkMode: boolean; toggleTheme: () => void }> = ({
  isDarkMode,
  toggleTheme,
}) => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const getStoredToken = () =>
    sessionStorage.getItem("token") || localStorage.getItem("token");

  // Token validation logic
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const validateToken = async () => {
      const token = getStoredToken();

      if (!token) {
        return;
      }

      try {
        const apiBase =
          process.env.REACT_APP_API_BASE ||
          (typeof import.meta !== "undefined"
            ? // @ts-ignore - Vite injects import.meta.env
              import.meta.env?.VITE_API_BASE
            : undefined) ||
          "https://tic-tac-toe-backend-api.vercel.app";
        const response = await fetch(`${apiBase}/auth/validate-token`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          throw new Error(`API responded with status: ${response.status}`);
        }

        const data = await response.json();
        if (!data.valid) {
          handleLogout(
            "Your session has expired, or you are currently logged in on another browser. Please check your connectivity and log in again to continue.",
          );
        }
      } catch (error) {
        // Fail silently on transient errors; only act on explicit invalid tokens.
        console.warn("Token validation skipped due to error:", error);
      }
    };

    validateToken();
    intervalId = setInterval(validateToken, 60_000); // validate every 60s

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = (message?: string) => {
    sessionStorage.removeItem("token");
    if (message) {
      setLogoutMessage(message);
    } else {
      navigate("/login");
    }
  };

  const handleLogoutAlt = () => {
    sessionStorage.removeItem("token");
    navigate("/login");
  };

  const isLoggedIn = !!getStoredToken();

  const menuItems = [
    { label: "Home", icon: <Home />, path: "/home" },
    { label: "Leaderboard", icon: <Leaderboard />, path: "/leaderboard" },
    ...(isLoggedIn
      ? [{ label: "Profile", icon: <AccountCircle />, path: "/profile" }]
      : []),
  ];

  return (
    <>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              fontFamily: "Poppins, sans-serif",
              fontSize: "1.5rem",
              fontWeight: "bold",
            }}
          >
            <Link
              to={"/landing"}
              style={{ textDecoration: "none", color: "white" }}
            >
              Tic Tac Toe Pro
            </Link>
          </Typography>

          <Box sx={{ display: { xs: "block", md: "none" } }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          </Box>

          <Box
            sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}
          >
            {menuItems.map((item, index) => (
              <Button
                key={index}
                color="inherit"
                component={Link}
                to={item.path}
                startIcon={item.icon}
                sx={{
                  fontFamily: "Poppins, sans-serif",
                  borderBottom:
                    location.pathname === item.path
                      ? "3px solid white"
                      : "none",
                  borderRadius: 0,
                  paddingBottom: "8px",
                  marginRight: "8px",
                }}
              >
                {item.label}
              </Button>
            ))}
            <Button
              color="inherit"
              component={Link}
              to="/register"
              startIcon={<AppRegistration />}
              sx={{
                fontFamily: "Poppins, sans-serif",
                borderBottom:
                  location.pathname === "/register"
                    ? "3px solid white"
                    : "none",
                borderRadius: 0,
                paddingBottom: "8px",
                marginRight: "8px",
              }}
            >
              Register
            </Button>
            {isLoggedIn ? (
              <Button
                color="inherit"
                onClick={handleLogoutAlt}
                startIcon={<ExitToApp />}
                sx={{
                  fontFamily: "Poppins, sans-serif",
                  paddingBottom: "8px",
                  color: "red",
                }}
              >
                Logout
              </Button>
            ) : (
              <Button
                color="inherit"
                component={Link}
                to="/login"
                startIcon={<Login />}
                sx={{
                  fontFamily: "Poppins, sans-serif",
                  borderBottom:
                    location.pathname === "/login" ? "3px solid white" : "none",
                  borderRadius: 0,
                  paddingBottom: "8px",
                }}
              >
                Login
              </Button>
            )}
            <IconButton color="inherit" onClick={toggleTheme} sx={{ ml: 2 }}>
              {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={isDrawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <List sx={{ width: 250 }}>
          {menuItems.map((item, index) => (
            <ListItem
              key={index}
              component={Link}
              to={item.path}
              onClick={() => setDrawerOpen(false)}
              sx={{
                textDecoration: "none",
                padding: "10px 16px",
              }}
            >
              <ListItemIcon sx={{ color: isDarkMode ? "white" : "#333" }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontFamily: "Poppins, sans-serif",
                  color: isDarkMode ? "white" : "#333",
                }}
              />
            </ListItem>
          ))}
          <ListItem
            component={Link}
            to="/register"
            onClick={() => setDrawerOpen(false)}
            sx={{
              textDecoration: "none",
              padding: "10px 16px",
            }}
          >
            <ListItemIcon sx={{ color: isDarkMode ? "white" : "#333" }}>
              <AppRegistration />
            </ListItemIcon>
            <ListItemText
              primary="Register"
              primaryTypographyProps={{
                fontFamily: "Poppins, sans-serif",
                color: isDarkMode ? "white" : "#333",
              }}
            />
          </ListItem>
          {isLoggedIn ? (
            <ListItem
              onClick={() => {
                handleLogout();
                setDrawerOpen(false);
              }}
              sx={{
                cursor: "pointer",
                padding: "10px 16px",
              }}
            >
              <ListItemIcon sx={{ color: isDarkMode ? "white" : "#333" }}>
                <ExitToApp />
              </ListItemIcon>
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{
                  fontFamily: "Poppins, sans-serif",
                  color: isDarkMode ? "white" : "#333",
                }}
              />
            </ListItem>
          ) : (
            <ListItem
              component={Link}
              to="/login"
              onClick={() => setDrawerOpen(false)}
              sx={{
                textDecoration: "none",
                padding: "10px 16px",
              }}
            >
              <ListItemIcon sx={{ color: isDarkMode ? "white" : "#333" }}>
                <Login />
              </ListItemIcon>
              <ListItemText
                primary="Login"
                primaryTypographyProps={{
                  fontFamily: "Poppins, sans-serif",
                  color: isDarkMode ? "white" : "#333",
                }}
              />
            </ListItem>
          )}
          <ListItem>
            <ListItemIcon sx={{ color: isDarkMode ? "white" : "#333" }}>
              {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </ListItemIcon>
            <FormControlLabel
              control={
                <Switch
                  checked={isDarkMode}
                  onChange={toggleTheme}
                  color="primary"
                />
              }
              label={isDarkMode ? "Dark Mode" : "Light Mode"}
              sx={{ fontFamily: "Poppins, sans-serif", ml: -1 }}
            />
          </ListItem>
        </List>
      </Drawer>
      <Dialog open={!!logoutMessage} onClose={() => setLogoutMessage(null)}>
        <DialogTitle sx={{ fontFamily: "Poppins", fontWeight: "bold" }}>
          Session Notice
        </DialogTitle>
        <DialogContent sx={{ fontFamily: "Poppins" }}>
          {logoutMessage}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setLogoutMessage(null);
              navigate("/login");
            }}
          >
            Go to Login
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Navbar;
