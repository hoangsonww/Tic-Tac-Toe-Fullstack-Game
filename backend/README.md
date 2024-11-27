# Tic Tac Toe Pro Backend

This is the backend service for the **Tic Tac Toe Pro Game**, built using **Node.js**, **Express**, and **MongoDB**. The backend manages user authentication, leaderboards, game results, and profiles. It also provides a Swagger UI for API documentation.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Available Endpoints](#available-endpoints)
- [Swagger Documentation](#swagger-documentation)
- [ELO System](#elo-system)
- [File Structure](#file-structure)
- [Contributing](#contributing)
- [License](#license)

## Features

- **User Authentication:**
  - Register, login, and password reset functionalities.
- **Profile Management:**
  - Update user profiles, including social media links, bio, and date of birth.
- **Leaderboard:**
  - View and update global leaderboard rankings.
- **Game Stats:**
  - Record game results, update ELO ratings, and track wins, losses, and draws.
- **Swagger API Documentation:**
  - Interactive API documentation for testing and exploring available endpoints.

## Technologies Used

- **Node.js** - JavaScript runtime.
- **Express** - Web framework for building RESTful APIs.
- **MongoDB** - NoSQL database for data persistence.
- **Mongoose** - Object Data Modeling (ODM) for MongoDB.
- **Swagger** - API documentation and testing.
- **JWT** - JSON Web Tokens for secure user authentication.
- **dotenv** - Environment variable management.
- **CORS** - Middleware to handle cross-origin resource sharing.
- **body-parser** - Middleware to parse incoming request bodies.

## Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/your-repository/tic-tac-toe-pro-backend.git
   cd tic-tac-toe-pro-backend
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:

- Create a `.env` file in the root directory with the following:
  ```plaintext
  MONGO_URI=mongodb+srv://your-mongodb-uri
  JWT_SECRET=your-secret-key
  ```

4. **Run the Server**:

   ```bash
   npm start
   ```

5. **Swagger UI**:

- Visit `http://localhost:4000` to access the Swagger documentation.

## Environment Variables

| Variable     | Description                       | Example                                                  |
| ------------ | --------------------------------- | -------------------------------------------------------- |
| `MONGO_URI`  | MongoDB connection URI            | `mongodb+srv://username:password@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret key for JWT authentication | `my-secret-key`                                          |

## Available Endpoints

### Table of Endpoints

| Endpoint                | Method | Description                                                                           |
| ----------------------- | ------ | ------------------------------------------------------------------------------------- |
| `/auth/register`        | POST   | Register a new user with email, password, and username.                               |
| `/auth/login`           | POST   | Login a user and generate a JWT token.                                                |
| `/auth/forgot-password` | POST   | Verify if a user with the given email exists.                                         |
| `/auth/reset-password`  | POST   | Reset the password for a user.                                                        |
| `/profile`              | GET    | Fetch the authenticated user's profile.                                               |
| `/profile`              | PUT    | Update the authenticated user's profile (bio, date of birth, and social media links). |
| `/profile/games`        | PUT    | Increment the number of games played by the user.                                     |
| `/leaderboard`          | GET    | Fetch the global leaderboard, sorted by ELO.                                          |
| `/leaderboard/match`    | POST   | Report a match result between two players and update their ELO ratings.               |
| `/leaderboard/ai-match` | POST   | Report a match result against AI and update the player's ELO rating.                  |

## Swagger Documentation

The backend uses **Swagger UI** to provide detailed, interactive API documentation.

### Access the Swagger UI

- Visit `http://localhost:4000` in your browser.

### Adding New Routes

To document new routes in Swagger:

1. Add JSDoc comments above the route in your code.
2. Use the `@swagger` tag to define the schema, parameters, and responses.
3. Regenerate the Swagger docs if necessary.

## ELO System

The backend uses the **ELO rating system** to calculate player rankings. The rating changes are determined by:

- Match result (`win`, `loss`, `draw`).
- Difficulty level (`easy`, `medium`, `hard`, `impossible`).
- Opponent's ELO rating.

### K-Factors for Difficulty Levels

| Difficulty | K-Factor |
||-|
| Easy | 16 |
| Medium | 24 |
| Hard | 32 |
| Impossible | 40 |

## File Structure

```
tic-tac-toe-pro-backend/
├── models/
│   ├── User.js              # Schema for user profiles and authentication
│   ├── LeaderboardEntry.js  # Schema for leaderboard entries
├── routes/
│   ├── auth.js              # Routes for authentication
│   ├── profile.js           # Routes for profile management
│   ├── leaderboard.js       # Routes for leaderboard and match results
├── middleware/
│   ├── authMiddleware.js    # Middleware for authenticating requests
├── swagger/
│   ├── config.js            # Swagger configuration file
├── .env                     # Environment variables
├── server.js                # Main entry point of the application
```

## Contributing

1. Fork the repository.
2. Create a new branch for your feature.
3. Commit and push your changes.
4. Create a pull request.

## License

This project is licensed under the [MIT License](LICENSE).

### Enjoy building and scaling **Tic Tac Toe Pro**! 🎮🚀
