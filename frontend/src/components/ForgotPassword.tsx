import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import { api } from "../utils/api";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/reset-password", { email, newPassword });
      alert("Password reset successfully. Please log in with your new password.");
      setIsEmailVerified(false);
      setEmail("");
      setNewPassword("");
    } catch (err) {
      setError("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 400,
        mx: "auto",
        mt: 5,
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
        sx={{ fontFamily: "Poppins", fontWeight: "bold", textAlign: "center" }}
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
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
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
  );
};

export default ForgotPassword;
