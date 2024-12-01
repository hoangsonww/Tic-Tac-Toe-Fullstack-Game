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
