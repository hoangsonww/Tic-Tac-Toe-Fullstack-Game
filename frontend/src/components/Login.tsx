import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  TextField,
  Button,
  Box,
  Typography,
  Avatar,
  CircularProgress,
  IconButton,
  InputAdornment,
  useMediaQuery,
} from "@mui/material";
import {
  LockOutlined as LockIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { api, setAuthToken } from "../utils/api";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

const Login: React.FC = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/login", data);
      console.log("Login successful:", response.data);

      // Store the token in local storage
      sessionStorage.setItem("token", response.data.token);

      // Store the username in local storage under TicTacToeUsername
      sessionStorage.setItem("TicTacToeUsername", response.data.username);

      // Set the token for future API requests
      setAuthToken(response.data.token);

      // Navigate to the homepage
      navigate("/home");
    } catch (error) {
      console.error("Login failed:", error);
      alert("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        minHeight: "calc(100vh - 64px - 100px)",
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          maxWidth: 400,
          p: 3,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
        }}
      >
        <Avatar
          sx={{
            bgcolor: "primary.main",
            mx: "auto",
            mb: 2,
            width: isSmallScreen ? 56 : 64,
            height: isSmallScreen ? 56 : 64,
          }}
        >
          <LockIcon fontSize="large" />
        </Avatar>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontFamily: "Poppins",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          Login
        </Typography>
        <Typography
          variant="body1"
          sx={{
            fontFamily: "Poppins",
            color: "text.secondary",
            mb: 3,
            textAlign: "center",
          }}
        >
          Access your account
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            {...register("email")}
            label="Email"
            fullWidth
            margin="normal"
            type="email"
            required
            sx={{
              "& .MuiInputBase-input": {
                fontFamily: "Poppins",
              },
              "& .MuiInputLabel-root": {
                fontFamily: "Poppins",
              },
            }}
          />
          <TextField
            {...register("password")}
            label="Password"
            fullWidth
            margin="normal"
            type={passwordVisible ? "text" : "password"}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={togglePasswordVisibility}
                    sx={{
                      color:
                        theme.palette.mode === "dark"
                          ? "rgba(255, 255, 255, 0.7)"
                          : "rgba(0, 0, 0, 0.7)",
                    }}
                  >
                    {passwordVisible ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
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
          <Button
            variant="contained"
            color="primary"
            type="submit"
            fullWidth
            disabled={loading}
            sx={{
              mt: 2,
              fontFamily: "Poppins",
              fontWeight: "bold",
              py: 1.5,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              "Login"
            )}
          </Button>
        </form>
        <Typography
          variant="body2"
          sx={{
            mt: 3,
            fontFamily: "Poppins",
            textAlign: "center",
            color: "text.secondary",
          }}
        >
          Don’t have an account?{" "}
          <Button
            variant="text"
            color="primary"
            onClick={() => navigate("/register")}
            sx={{ fontFamily: "Poppins", fontWeight: "bold" }}
          >
            Register
          </Button>
        </Typography>

        <Typography
          variant="body2"
          sx={{
            mt: 1,
            fontFamily: "Poppins",
            textAlign: "center",
            color: "text.secondary",
          }}
        >
          Forgot your password?{" "}
          <Button
            variant="text"
            color="primary"
            onClick={() => navigate("/forgot-password")}
            sx={{ fontFamily: "Poppins", fontWeight: "bold" }}
          >
            Reset it here
          </Button>
        </Typography>
      </Box>
    </Box>
  );
};

export default Login;
