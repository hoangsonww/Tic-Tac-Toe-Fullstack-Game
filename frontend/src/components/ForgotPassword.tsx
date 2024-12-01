import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { api } from "../utils/api";
import { useNavigate } from "react-router-dom";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const navigate = useNavigate();

  const handleVerifyEmail = async () => {
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/forgot-password", { email });
      setIsEmailVerified(true);
    } catch (err) {
      setError("User with this email does not exist.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/reset-password", { email, newPassword });
      alert(
        "Password reset successfully. Please log in with your new password.",
      );
      setIsEmailVerified(false);
      setEmail("");
      setNewPassword("");
      setConfirmPassword("");
      navigate("/login");
    } catch (err) {
      setError("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLDivElement>,
    action: () => void,
  ) => {
    if (e.key === "Enter") {
      action();
    }
  };

  const toggleNewPasswordVisibility = () => {
    setNewPasswordVisible(!newPasswordVisible);
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
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontFamily: "Poppins",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          Forgot Password
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
          {isEmailVerified
            ? "Enter your new password."
            : "Enter your email to verify your account."}
        </Typography>
        {!isEmailVerified ? (
          <>
            <TextField
              label="Email"
              fullWidth
              margin="normal"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, handleVerifyEmail)}
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
              fullWidth
              onClick={handleVerifyEmail}
              sx={{
                mt: 2,
                fontFamily: "Poppins",
                fontWeight: "bold",
                py: 1.5,
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Verify Email"}
            </Button>
          </>
        ) : (
          <>
            <TextField
              label="New Password"
              fullWidth
              margin="normal"
              type={newPasswordVisible ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, handleResetPassword)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={toggleNewPasswordVisibility}>
                      {newPasswordVisible ? <VisibilityOff /> : <Visibility />}
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
              onKeyPress={(e) => handleKeyPress(e, handleResetPassword)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={toggleConfirmPasswordVisibility}>
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
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleResetPassword}
              sx={{
                mt: 2,
                fontFamily: "Poppins",
                fontWeight: "bold",
                py: 1.5,
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Reset Password"}
            </Button>
          </>
        )}
        {error && (
          <Typography
            variant="body2"
            color="error"
            sx={{ mt: 2, fontFamily: "Poppins", textAlign: "center" }}
          >
            {error}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ForgotPassword;
