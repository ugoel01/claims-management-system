const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();
require("dotenv").config()
const jwt = require('jsonwebtoken');

// Get all users
router.get('/', verifyToken, async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get user by ID
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/// Create a new user (Registration)
router.post('/', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Validate request body
        if (!username || !email || !password || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if the email is already taken
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        // Hash the password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        // Create a new user
        const user = new User({
            email,
            username,
            role,
            password_hash: hashedPassword
        });
        await user.save();
        // Generate JWT Token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );
        // Respond with token and user details
        res.status(201).json({ 
            token, 
            user: { id: user._id, username: user.username, email: user.email, role: user.role } 
        });

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// Update user details
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedUser) return res.status(404).json({ message: 'User not found' });
        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a user
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// User Login Route
router.post('/login', verifyToken, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,  
            { expiresIn: "1d" }
        );

        res.json({ token, user: { id: user._id, name: user.username, role: user.role } });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
