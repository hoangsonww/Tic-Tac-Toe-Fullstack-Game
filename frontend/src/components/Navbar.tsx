import React, { useState } from "react";
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
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const isLoggedIn = !!localStorage.getItem("token");

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
          {/* Logo/Title */}
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

          {/* Mobile Hamburger Menu */}
          <Box sx={{ display: { xs: "block", md: "none" } }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          </Box>

          {/* Desktop Menu */}
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
            {/* Register Button */}
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
            {/* Login/Logout Button */}
            {isLoggedIn ? (
              <Button
                color="inherit"
                onClick={handleLogout}
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
            {/* Dark Mode Toggle Button */}
            <IconButton color="inherit" onClick={toggleTheme} sx={{ ml: 2 }}>
              {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer for Mobile Menu */}
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
          {/* Register Button */}
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
          {/* Login/Logout Button */}
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
          {/* Dark Mode Toggle in Drawer */}
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
              label={isDarkMode ? "Light Mode" : "Dark Mode"}
              sx={{ fontFamily: "Poppins, sans-serif", ml: -1 }}
            />
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default Navbar;
