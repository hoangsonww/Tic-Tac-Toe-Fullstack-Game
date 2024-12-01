const swaggerJsDoc = require("swagger-jsdoc");

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Tic Tac Toe Pro API",
      version: "1.0.0",
      description: "API documentation for Tic Tac Toe Pro Game",
      contact: {
        name: "Son Nguyen",
        url: "https://github.com/hoangsonww",
        email: "hoangson091104@gmail.com",
      },
      termsOfService: "https://tictactoe-ai-app.vercel.app",
    },
    servers: [
      {
        url: "https://tic-tac-toe-fullstack-game.onrender.com", // Production Server URL
      },
      {
        url: "http://localhost:4000", // Development Server URL
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js", "./models/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;
