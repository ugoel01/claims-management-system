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
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: "Access Denied. No token provided" });

    try {
        const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);  
        req.user = verified;  // Attach user details to request
        next();
    } catch (err) {
        res.status(400).json({ message: "Invalid Token" });
    }
};

module.exports = { verifyAdmin, verifyUser, verifyToken };
