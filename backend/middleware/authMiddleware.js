const jwt = require("jsonwebtoken");

/**
 * Middleware to authenticate requests using JWT tokens.
 * @param req The request object
 * @param res The response object
 * @param next The next middleware function in the stack
 * @returns {*} JSON response if the token is invalid or missing
 */
const authenticate = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = authenticate;
