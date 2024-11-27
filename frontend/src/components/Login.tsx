import React from "react";
import { useForm } from "react-hook-form";
import {
  TextField,
  Button,
  Box,
  Typography,
  Avatar,
  useMediaQuery,
} from "@mui/material";
import { LockOutlined as LockIcon } from "@mui/icons-material";
import { api, setAuthToken } from "../utils/api";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

const Login: React.FC = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const onSubmit = (data: any) => {
    api
      .post("/auth/login", data)
      .then((response) => {
        console.log("Login successful:", response.data);

        // Store the token in local storage
        localStorage.setItem("token", response.data.token);

        // Store the username in local storage under TicTacToeUsername
        localStorage.setItem("TicTacToeUsername", response.data.username);

        // Set the token for future API requests
        setAuthToken(response.data.token);

        // Navigate to the homepage
        navigate("/");
      })
      .catch((error) => {
        console.error("Login failed:", error);
        alert("Invalid email or password. Please try again.");
      });
  };

  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLDivElement>,
    action: () => void,
  ) => {
    if (e.key === "Enter") {
      action();
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
        sx={{ fontFamily: "Poppins", fontWeight: "bold", textAlign: "center" }}
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
          onKeyPress={(e) => handleKeyPress(e, handleSubmit(onSubmit))}
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
          type="password"
          required
          onKeyPress={(e) => handleKeyPress(e, handleSubmit(onSubmit))}
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
          sx={{
            mt: 2,
            fontFamily: "Poppins",
            fontWeight: "bold",
            py: 1.5,
          }}
        >
          Login
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
  );
};

export default Login;
