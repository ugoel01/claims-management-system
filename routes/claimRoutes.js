const express = require('express');
const Claim = require('../models/Claim');
const Policy = require('../models/Policy');
const User = require('../models/User');
const { verifyAdmin, verifyUser, verifyToken } = require('../middleware/auth');
const router = express.Router();
const nodemailer = require('nodemailer'); // to send status updates to user via emails

// Configure Nodemailer transporter 
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS,  
    },
});

// Get all claims
router.get('/', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const claims = await Claim.find().populate('user_id policy_id');
        res.json(claims);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get claim by ID
router.get('/:id', async (req, res) => {
    try {
        const claim = await Claim.findById(req.params.id).populate('user_id policy_id');
        if (!claim) return res.status(404).json({ message: 'Claim not found' });
        res.json(claim);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new claim
router.post('/', verifyToken, verifyUser, async (req, res) => {
    try {
        const { user_id, policy_id, claim_date, amount, description, support_document } = req.body;

        // Check if the policy exists
        const policy = await Policy.findById(policy_id);
        if (!policy) return res.status(400).json({ message: 'Invalid policy ID' });

        // Validate claim amount
        if (amount <= 0 || amount > policy.premium_amount) {
            return res.status(400).json({ message: 'Claim amount exceeds policy premium or is invalid' });
        }

        // Validate claim date
        if (new Date(claim_date) >= new Date(policy.policy_end_date)) {
            return res.status(400).json({ message: 'Claim date must be before policy end date' });
        }

        // Validate file type (only PDF allowed)
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

// Update claim status (Admin only)
router.put('/:id/status', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const updatedClaim = await Claim.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!updatedClaim) return res.status(404).json({ message: 'Claim not found' });

        // Get the policyholder's user ID and find the user to send an email
        const user = await User.findById(updatedClaim.user_id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compose the email
        const mailOptions = {
            from: process.env.EMAIL_USER,  // Sender address
            to: user.email,  // Recipient email
            subject: 'Claim Status Update',  // Subject line
            text: `Dear ${user.username},\n\nYour claim for policy ${updatedClaim.policy_id} ${updatedClaim.name} has been updated to: ${status}.\n\nBest regards,\nClaims Management Team`,  // Email body
        };

        // Send email notification
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

// Delete a claim (Admin only)
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        const deletedClaim = await Claim.findByIdAndDelete(req.params.id);
        if (!deletedClaim) return res.status(404).json({ message: 'Claim not found' });
        res.json({ message: 'Claim deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
