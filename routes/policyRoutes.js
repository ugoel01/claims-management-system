const express = require('express');
const Policy = require('../models/Policy');
const User = require('../models/User');
const {verifyToken, verifyAdmin } = require('../middleware/auth');
const router = express.Router();

// Get all policies
router.get('/', async (req, res) => {
    try {
        const policies = await Policy.find();
        res.json(policies);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get policy by ID
router.get('/:id', async (req, res) => {
    try {
        const policy = await Policy.findById(req.params.id);
        if (!policy) return res.status(404).json({ message: 'Policy not found' });
        res.json(policy);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new policy (Admin only)
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const policy = new Policy(req.body);
        await policy.save();
        res.status(201).json(policy);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a policy (Admin only)
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const policy = await Policy.findById(req.params.id);

        if (!policy) {
            return res.status(404).json({ message: 'Policy not found' });
        }

        // Check if any user has purchased this policy
        if (policy.users && policy.users.length > 0) {
            return res.status(400).json({ message: 'Cannot delete policy. Users have purchased this policy.' });
        }

        // Delete the policy
        await Policy.findByIdAndDelete(req.params.id);

        res.json({ message: 'Policy deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Buy a policy
router.post('/buy/:policyId', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;  // Extract user ID from token
        const { policyId } = req.params;

        // Check if the policy exists
        const policy = await Policy.findById(policyId);
        if (!policy) {
            return res.status(404).json({ message: "Policy not found" });
        }

        // Add policy to user's boughtPolicies list
        const user = await User.findById(userId);
        if (user.purchased_policies.includes(policyId)) {
            return res.status(400).json({ message: "Policy already purchased" });
        }

        user.purchased_policies.push(policyId);
        await user.save();

        // Add user to policy's users array
        policy.users.push(userId);
        await policy.save();

        res.json({ message: "Policy purchased successfully", user });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
