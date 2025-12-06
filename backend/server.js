require("dotenv").config();
const http = require("http");
const { createApp } = require("./app");
const { connectToDatabase } = require("./db");
const { attachWebsocketServer } = require("./realtime/websocket");

const app = createApp();
const server = http.createServer(app);
attachWebsocketServer(server);

const PORT = process.env.PORT || 4000;

connectToDatabase(process.env.MONGO_URI)
  .then(() => {
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });
