const express = require('express');
const Claim = require('../models/Claim');
const Policy = require('../models/Policy');
const User = require('../models/User');
const { verifyAdmin, verifyUser, verifyToken } = require('../middleware/auth');
const router = express.Router();
const nodemailer = require('nodemailer');

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * @swagger
 * tags:
 *   name: Claims
 *   description: Claim management
 */

/**
 * @swagger
 * /api/claims:
 *   get:
 *     summary: Get all claims (Admin only)
 *     tags: [Claims]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved claims
 *       500:
 *         description: Server error
 */
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const claims = await Claim.find().populate('user_id policy_id');
        res.json(claims);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/claims/{id}:
 *   get:
 *     summary: Get a claim by ID
 *     tags: [Claims]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the claim
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved claim
 *       404:
 *         description: Claim not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res) => {
    try {
        const claim = await Claim.findById(req.params.id).populate('user_id policy_id');
        if (!claim) return res.status(404).json({ message: 'Claim not found' });
        res.json(claim);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/claims:
 *   post:
 *     summary: Create a new claim
 *     tags: [Claims]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *               policy_id:
 *                 type: string
 *               claim_date:
 *                 type: string
 *                 format: date
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               support_document:
 *                 type: string
 *     responses:
 *       201:
 *         description: Claim created successfully
 *       400:
 *         description: Invalid request
 */
router.post('/', verifyToken, verifyUser, async (req, res) => {
    try {
        const { user_id, policy_id, claim_date, amount, description, support_document } = req.body;

        const policy = await Policy.findById(policy_id);
        if (!policy) return res.status(400).json({ message: 'Invalid policy ID' });

        if (amount <= 0 || amount > policy.premium_amount) {
            return res.status(400).json({ message: 'Claim amount exceeds policy premium or is invalid' });
        }

        if (new Date(claim_date) >= new Date(policy.policy_end_date)) {
            return res.status(400).json({ message: 'Claim date must be before policy end date' });
        }

        if (!support_document.endsWith('.pdf')) {
            return res.status(400).json({ message: 'Only PDF format is allowed' });
        }

        const claim = new Claim(req.body);
        await claim.save();
        res.status(201).json(claim);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/claims/{id}/status:
 *   put:
 *     summary: Update claim status (Admin only)
 *     tags: [Claims]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the claim
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *     responses:
 *       200:
 *         description: Claim status updated successfully
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Claim or user not found
 */
router.put('/:id/status', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const updatedClaim = await Claim.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!updatedClaim) return res.status(404).json({ message: 'Claim not found' });

        const user = await User.findById(updatedClaim.user_id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Claim Status Update',
            text: `Dear ${user.username},\n\nYour claim for policy ${updatedClaim.policy_id} has been updated to: ${status}.\n\nBest regards,\nClaims Management Team`,
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log('Error sending email:', err);
            } else {
                console.log('Email sent:', info.response);
            }
        });

        res.json(updatedClaim);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/claims/{id}:
 *   delete:
 *     summary: Delete a claim (Admin only)
 *     tags: [Claims]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the claim to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Claim deleted successfully
 *       404:
 *         description: Claim not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const deletedClaim = await Claim.findByIdAndDelete(req.params.id);
        if (!deletedClaim) return res.status(404).json({ message: 'Claim not found' });
        res.json({ message: 'Claim deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
