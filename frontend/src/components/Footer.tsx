import React from "react";
import { Box, Typography } from "@mui/material";

const Footer: React.FC = () => {
    return (
        <Box sx={{ backgroundColor: "#3f51b5", color: "#fff", textAlign: "center", p: 2 }}>
            <Typography variant="body2">© 2024 Tic Tac Toe. All rights reserved.</Typography>
        </Box>
    );
};

export default Footer;
