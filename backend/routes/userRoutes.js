const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');
const router = express.Router();
require("dotenv").config();
const jwt = require('jsonwebtoken');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API endpoints for managing users
 */

/**
 * @swagger
 * /policies:
 *   get:
 *     summary: Get policies purchased by the authenticated user
 *     tags: [Policies]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user's purchased policies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   premium_amount:
 *                     type: number
 *                   policy_end_date:
 *                     type: string
 *                     format: date
 *       401:
 *         description: Unauthorized - Token required
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/policies', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
    
        // Find the user and populate purchased policies
        const user = await User.findById(userId).populate('purchased_policies');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
    
        res.json(user.purchased_policies); // Send purchased policies back
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


/**
 * @swagger
 * /users:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [policyholder, agent, admin]
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 */
router.post('/', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            email,
            username,
            role,
            password_hash: hashedPassword
        });
        await user.save();

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(201).json({ 
            token, 
            user: { id: user._id, username: user.username, email: user.email, role: user.role } 
        });

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: User login
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid email or password
 *       500:
 *         description: Server error
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

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
