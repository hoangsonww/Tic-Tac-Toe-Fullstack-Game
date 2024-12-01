require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerDocs = require("./swagger/config");

// Import routes
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const leaderboardRoutes = require("./routes/leaderboard");

// Initialize app
const app = express();

// Middleware
app.use(cors({ origin: "*" })); // Allow requests from any origin
app.use(bodyParser.json());

// Custom logging middleware
app.use((req, res, next) => {
  // Log the request method, URL, headers, and body
  console.log(`\nIncoming Request: ${req.method} ${req.url}`);
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  console.log("Body:", JSON.stringify(req.body, null, 2));

  // Capture the original write and end methods
  const originalWrite = res.write;
  const originalEnd = res.end;
  const chunks = [];

  // Override res.write to capture chunks of the response body
  res.write = function (chunk) {
    chunks.push(Buffer.from(chunk));
    originalWrite.apply(res, arguments);
  };

  // Override res.end to capture the final chunk and log the complete response
  res.end = function (chunk) {
    if (chunk) chunks.push(Buffer.from(chunk));
    const responseBody = Buffer.concat(chunks).toString("utf8");
    console.log("Response Body:", responseBody);
    originalEnd.apply(res, arguments);
  };

  // Proceed to the next middleware/route handler
  next();
});

// Swagger documentation route
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocs, {
    customCss: "",
    customSiteTitle: "Tic Tac Toe Pro API Docs",
  }),
);

// Root route redirecting to Swagger UI
app.get("/", (req, res) => {
  res.redirect("/api-docs");
});

// Routes
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/leaderboard", leaderboardRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB:", err));

// Start the server
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
