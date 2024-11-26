import React from "react";
import { Box } from "@mui/material";

interface CellProps {
    value: string;
    onClick: () => void;
}

const Cell: React.FC<CellProps> = ({ value, onClick }) => {
    return (
        <Box
            onClick={onClick}
            sx={{
                width: "100px",
                height: "100px",
                border: "1px solid #ccc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                cursor: "pointer",
                backgroundColor: value ? "#f5f5f5" : "white",
            }}
        >
            {value}
        </Box>
    );
};

export default Cell;
