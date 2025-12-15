const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const swaggerDocs = require("./swagger/config");
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const leaderboardRoutes = require("./routes/leaderboard");
const socialRoutes = require("./routes/social");
const realtimeRoutes = require("./routes/realtime");

const createLoggingMiddleware = () => (req, res, next) => {
  console.log(`\nIncoming Request: ${req.method} ${req.url}`);
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  console.log("Body:", JSON.stringify(req.body, null, 2));

  const originalWrite = res.write;
  const originalEnd = res.end;
  const chunks = [];

  res.write = function (chunk) {
    chunks.push(Buffer.from(chunk));
    originalWrite.apply(res, arguments);
  };

  res.end = function (chunk) {
    if (chunk) chunks.push(Buffer.from(chunk));
    const responseBody = Buffer.concat(chunks).toString("utf8");
    console.log("Response Body:", responseBody);
    originalEnd.apply(res, arguments);
  };

  next();
};

const createApp = () => {
  const app = express();

  app.use(cors({ origin: "*" }));
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    );
    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
    next();
  });
  app.use(bodyParser.json());
  app.use(createLoggingMiddleware());
  app.use(express.static(path.join(__dirname, "public")));

  app.get("/swagger.json", (req, res) => {
    res.json(swaggerDocs);
  });

  // Swagger UI via CDN to stay lightweight on Vercel
  app.get("/api-docs", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>Tic Tac Toe Pro API Docs</title>
          <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css" />
          <link rel="icon" type="image/x-icon" href="/favicon.ico" />
          <style>body { margin: 0; padding: 0; }</style>
        </head>
        <body>
          <div id="swagger-ui"></div>
          <script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-bundle.js"></script>
          <script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-standalone-preset.js"></script>
          <script>
            window.onload = () => {
              window.ui = SwaggerUIBundle({
                url: '/swagger.json',
                dom_id: '#swagger-ui',
                presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
                layout: 'StandaloneLayout'
              });
            };
          </script>
        </body>
      </html>
    `);
  });

  app.get("/", (req, res) => {
    res.redirect("/api-docs");
  });
  app.get("/favicon.ico", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "favicon.ico"));
  });
  app.get("/openapi.json", (req, res) => {
    res.json(swaggerDocs);
  });

  app.use("/auth", authRoutes);
  app.use("/profile", profileRoutes);
  app.use("/leaderboard", leaderboardRoutes);
  app.use("/social", socialRoutes);
  app.use("/realtime", realtimeRoutes);

  return app;
};

module.exports = { createApp };
