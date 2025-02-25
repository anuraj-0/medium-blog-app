const jwt = require("jsonwebtoken");
const redis = require("../config/redis");

const authMiddleware = async function (req, res, next) {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const cleanToken = token.replace("Bearer ", "");

  // Check if token is blacklisted in Redis
  const isBlacklisted = await redis.get(cleanToken);
  if (isBlacklisted) {
    return res.status(401).json({ error: "Invalid token" });
  }

  try {
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid token" });
  }
};

module.exports = authMiddleware;
