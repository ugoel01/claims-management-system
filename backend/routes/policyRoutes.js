const express = require('express');
const Policy = require('../models/Policy');
const User = require('../models/User');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Policies
 *   description: Policy management
 */

/**
 * @swagger
 * /policies:
 *   get:
 *     summary: Get all policies
 *     tags: [Policies]
 *     responses:
 *       200:
 *         description: Successfully retrieved policies
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
    try {
        const policies = await Policy.find();
        res.json(policies);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /policies/{id}:
 *   get:
 *     summary: Get a policy by ID
 *     tags: [Policies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the policy
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved policy
 *       404:
 *         description: Policy not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res) => {
    try {
        const policy = await Policy.findById(req.params.id);
        if (!policy) return res.status(404).json({ message: 'Policy not found' });
        res.json(policy);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /policies:
 *   post:
 *     summary: Create a new policy (Admin only)
 *     tags: [Policies]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               premium_amount:
 *                 type: number
 *               policy_end_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Policy created successfully
 *       400:
 *         description: Bad request
 *       403:
 *         description: Unauthorized access
 */
router.post('/', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const policy = new Policy(req.body);
        await policy.save();
        res.status(201).json(policy);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/**
 * @swagger
 * /policies/{id}:
 *   delete:
 *     summary: Delete a policy (Admin only)
 *     tags: [Policies]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the policy to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Policy deleted successfully
 *       400:
 *         description: Cannot delete policy (users have purchased it)
 *       404:
 *         description: Policy not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const policy = await Policy.findById(req.params.id);

        if (!policy) {
            return res.status(404).json({ message: 'Policy not found' });
        }

        if (policy.users && policy.users.length > 0) {
            return res.status(400).json({ message: 'Cannot delete policy. Users have purchased this policy.' });
        }

        await Policy.findByIdAndDelete(req.params.id);

        res.json({ message: 'Policy deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /policies/buy/{policyId}:
 *   post:
 *     summary: Buy a policy
 *     tags: [Policies]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: policyId
 *         required: true
 *         description: ID of the policy to purchase
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Policy purchased successfully
 *       400:
 *         description: Policy already purchased
 *       404:
 *         description: Policy not found
 *       500:
 *         description: Server error
 */
router.post('/buy/:policyId', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { policyId } = req.params;

        const policy = await Policy.findById(policyId);
        if (!policy) {
            return res.status(404).json({ message: "Policy not found" });
        }

        const user = await User.findById(userId);
        if (user.purchased_policies.includes(policyId)) {
            return res.status(400).json({ message: "Policy already purchased" });
        }

        user.purchased_policies.push(policyId);
        await user.save();

        policy.users.push(userId);
        await policy.save();

        res.json({ message: "Policy purchased successfully", user });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
