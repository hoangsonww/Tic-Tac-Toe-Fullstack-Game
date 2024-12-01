import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Avatar,
  useMediaQuery,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  LockOutlined as LockIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { api } from "../utils/api";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { useForm } from "react-hook-form";

const Register: React.FC = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const onSubmit = async (data: any) => {
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/register", { ...data, password });
      navigate("/login");
    } catch (err: any) {
      console.error("Registration failed:", err);
      setError(
        err?.response?.data?.error || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
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
          Register
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
          Create a new account to get started
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
            label="Password"
            fullWidth
            margin="normal"
            type={passwordVisible ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          <TextField
            label="Confirm Password"
            fullWidth
            margin="normal"
            type={confirmPasswordVisible ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={toggleConfirmPasswordVisibility}
                    sx={{
                      color:
                        theme.palette.mode === "dark"
                          ? "rgba(255, 255, 255, 0.7)"
                          : "rgba(0, 0, 0, 0.7)",
                    }}
                  >
                    {confirmPasswordVisible ? (
                      <VisibilityOff />
                    ) : (
                      <Visibility />
                    )}
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
          <TextField
            {...register("username")}
            label="Username"
            fullWidth
            margin="normal"
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
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              "Register"
            )}
          </Button>
        </form>
        {error && (
          <Typography
            variant="body2"
            color="error"
            sx={{
              mt: 3,
              fontFamily: "Poppins",
              textAlign: "center",
            }}
          >
            {error}
          </Typography>
        )}
        <Typography
          variant="body2"
          sx={{
            mt: 3,
            fontFamily: "Poppins",
            textAlign: "center",
            color: "text.secondary",
          }}
        >
          Already have an account?{" "}
          <Button
            variant="text"
            color="primary"
            onClick={() => navigate("/login")}
            sx={{ fontFamily: "Poppins", fontWeight: "bold" }}
          >
            Log in
          </Button>
        </Typography>
      </Box>
    </Box>
  );
};

export default Register;
