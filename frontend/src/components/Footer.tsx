import React from "react";
import { Box, Typography } from "@mui/material";

const Footer: React.FC = () => {
    return (
        <Box sx={{ backgroundColor: "#1976d2", color: "#fff", textAlign: "center", p: 2, fontFamily: "Poppins" }}>
            <Typography variant="body2" sx={{ fontFamily: "Poppins", fontSize: "1rem" }}>© 2024 Tic Tac Toe. All rights reserved.</Typography>
        </Box>
    );
};

export default Footer;
