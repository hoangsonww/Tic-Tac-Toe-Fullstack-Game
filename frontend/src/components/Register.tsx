import React from "react";
import { useForm } from "react-hook-form";
import { TextField, Button, Box, Typography } from "@mui/material";
import { api } from "../utils/api";
import { useNavigate } from "react-router-dom";

const Register: React.FC = () => {
    const { register, handleSubmit } = useForm();
    const navigate = useNavigate();

    const onSubmit = (data: any) => {
        api.post("/auth/register", data)
            .then(() => navigate("/login"))
            .catch((error) => console.error("Registration failed:", error));
    };

    return (
        <Box sx={{ maxWidth: 400, mx: "auto", mt: 5 }}>
            <Typography variant="h4" gutterBottom>
                Register
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
                <TextField
                    {...register("username")}
                    label="Username"
                    fullWidth
                    margin="normal"
                    required
                />
                <Button variant="contained" color="primary" type="submit" fullWidth>
                    Register
                </Button>
            </form>
        </Box>
    );
};

export default Register;
