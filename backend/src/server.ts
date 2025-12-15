import { config } from "dotenv";

config();

const { createApp } = require("../app");
const { connectToDatabase } = require("../db");
const { handleUpgrade } = require("../realtime/websocket");

const app = createApp();

export default async function handler(req: any, res: any) {
  try {
    await connectToDatabase(process.env.MONGO_URI);
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    res.status(500).json({ error: "Failed to connect to database" });
    return;
  }

  if (
    req.headers?.upgrade &&
    typeof req.headers.upgrade === "string" &&
    req.headers.upgrade.toLowerCase() === "websocket"
  ) {
    res.statusCode = 426;
    res.end("WebSocket upgrade not supported on serverless runtime.");
    return;
  }

  return app(req, res);
}
