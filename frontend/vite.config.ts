import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiBase =
    env.REACT_APP_API_BASE ||
    env.VITE_API_BASE ||
    "https://tic-tac-toe-backend-api.vercel.app";

  return {
    plugins: [react()],
    define: {
      "process.env": {
        REACT_APP_API_BASE: JSON.stringify(apiBase),
        NODE_ENV: JSON.stringify(mode),
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    server: {
      port: 3000,
    },
  };
});
