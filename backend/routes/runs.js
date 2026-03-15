const express = require('express');
const router = express.Router();
const Run = require('../models/Run');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Calculate calories based on MET formula
function calculateCalories(distance, pace, weight) {
    let met;
    if (pace < 4.5) met = 14;
    else if (pace < 5.0) met = 12;
    else if (pace < 5.5) met = 10;
    else if (pace < 6.5) met = 9;
    else if (pace < 8.0) met = 7;
    else met = 5.5;
    // calories = MET × weight(kg) × duration(hours)
    const durationHours = (pace * distance) / 60;
    return Math.round(met * weight * durationHours);
}

// POST /api/runs - Log a new run
router.post('/', protect, async (req, res) => {
    try {
        const { distance, duration, date, elevationGain, heartRate, routeType, notes } = req.body;
        const user = await User.findById(req.user._id);
        const pace = duration / distance;
        const caloriesBurnt = calculateCalories(distance, pace, user.weight);

        const run = await Run.create({
            userId: req.user._id,
            distance,
            duration,
            date: date || new Date(),
            elevationGain,
            heartRate,
            routeType,
            notes,
            pace,
            caloriesBurnt,
        });
        res.status(201).json(run);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/runs - Get all runs with pagination
router.get('/', protect, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const runs = await Run.find({ userId: req.user._id })
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Run.countDocuments({ userId: req.user._id });
        res.json({ runs, total, page, pages: Math.ceil(total / limit) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/runs/:id
router.get('/:id', protect, async (req, res) => {
    try {
        const run = await Run.findOne({ _id: req.params.id, userId: req.user._id });
        if (!run) return res.status(404).json({ message: 'Run not found' });
        res.json(run);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/runs/:id
router.put('/:id', protect, async (req, res) => {
    try {
        const run = await Run.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            req.body,
            { new: true }
        );
        if (!run) return res.status(404).json({ message: 'Run not found' });
        res.json(run);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/runs/:id
router.delete('/:id', protect, async (req, res) => {
    try {
        const run = await Run.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!run) return res.status(404).json({ message: 'Run not found' });
        res.json({ message: 'Run deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
