const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, weight, age } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const user = await User.create({ name, email, password, weight, age });
        const token = generateToken(user._id);
        res.status(201).json({
            token,
            user: { _id: user._id, name: user.name, email: user.email, weight: user.weight, weeklyGoal: user.weeklyGoal },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        const token = generateToken(user._id);
        res.json({
            token,
            user: { _id: user._id, name: user.name, email: user.email, weight: user.weight, weeklyGoal: user.weeklyGoal },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
    res.json(req.user);
});

// PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
    try {
        const { name, weight, age, bio, weeklyGoal } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name, weight, age, bio, weeklyGoal },
            { new: true, select: '-password' }
        );
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
