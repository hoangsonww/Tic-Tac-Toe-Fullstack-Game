import React from "react";
import { useForm } from "react-hook-form";
import { TextField, Button, Box, Typography } from "@mui/material";
import { api, setAuthToken } from "../utils/api";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
    const { register, handleSubmit } = useForm();
    const navigate = useNavigate();

    const onSubmit = (data: any) => {
        api.post("/auth/login", data)
            .then((response) => {
                localStorage.setItem("token", response.data.token);
                setAuthToken(response.data.token);
                navigate("/");
            })
            .catch((error) => console.error("Login failed:", error));
    };

    return (
        <Box sx={{ maxWidth: 400, mx: "auto", mt: 5 }}>
            <Typography variant="h4" gutterBottom>
                Login
            </Typography>
            <form onSubmit={handleSubmit(onSubmit)}>
                <TextField
                    {...register("email")}
                    label="Email"
                    fullWidth
                    margin="normal"
                    type="email"
                    required
                />
                <TextField
                    {...register("password")}
                    label="Password"
                    fullWidth
                    margin="normal"
                    type="password"
                    required
                />
                <Button variant="contained" color="primary" type="submit" fullWidth>
                    Login
                </Button>
            </form>
        </Box>
    );
};

export default Login;
