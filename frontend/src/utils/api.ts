import axios from "axios";

const API_URL =
  process.env.REACT_APP_API_BASE ||
  (typeof import.meta !== "undefined"
    ? // @ts-ignore - Vite injects import.meta.env
      import.meta.env?.VITE_API_BASE
    : undefined) ||
  "https://tic-tac-toe-backend-api.vercel.app";

export const api = axios.create({
  baseURL: API_URL,
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};
