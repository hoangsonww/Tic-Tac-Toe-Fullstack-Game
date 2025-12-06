import React from "react";
import { Box } from "@mui/material";

interface CellProps {
  value: string;
  onClick: () => void;
  size?: number;
}

const Cell: React.FC<CellProps> = ({ value, onClick, size = 100 }) => {
  const fontSize = Math.max(16, Math.min(32, size * 0.24));
  return (
    <Box
      onClick={onClick}
      sx={{
        width: `${size}px`,
        height: `${size}px`,
        border: "1px solid #ccc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: `${fontSize}px`,
        fontWeight: "bold",
        cursor: "pointer",
        backgroundColor: value ? "#f5f5f5" : "white",
        borderRadius: "8px",
        color: value === "X" ? "#1976d2" : value === "O" ? "red" : "black",
        "&:hover": {
          backgroundColor: value ? "#f5f5f5" : "#f5f5f5",
        },
      }}
    >
      {value}
    </Box>
  );
};

export default Cell;
