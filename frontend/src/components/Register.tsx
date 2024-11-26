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
import { api } from "../utils/api";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

const Register: React.FC = () => {
    const { register, handleSubmit } = useForm();
    const navigate = useNavigate();
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

    const onSubmit = (data: any) => {
        api
          .post("/auth/register", data)
          .then(() => navigate("/login"))
          .catch((error) => console.error("Registration failed:", error));
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
                {...register("password")}
                label="Password"
                fullWidth
                margin="normal"
                type="password"
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
                sx={{
                    mt: 2,
                    fontFamily: "Poppins",
                    fontWeight: "bold",
                    py: 1.5,
                }}
              >
                  Register
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
    );
};

export default Register;
