require('dotenv').config(); // Load .env file
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const verifyAdmin = async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    next();
};

const verifyUser = async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
};

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access denied, token missing!" });
  }

  const token = authHeader.split(" ")[1];

  try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Attach user data to the request
      next();
  } catch (err) {
      res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { verifyAdmin, verifyUser, verifyToken };
