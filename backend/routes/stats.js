const express = require('express');
const router = express.Router();
const Run = require('../models/Run');
const { protect } = require('../middleware/auth');

// GET /api/stats/overview
router.get('/overview', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const now = new Date();

        // This week (Monday to Sunday)
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + 1);
        startOfWeek.setHours(0, 0, 0, 0);

        // This month
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // All time
        const allRuns = await Run.find({ userId });
        const weekRuns = await Run.find({ userId, date: { $gte: startOfWeek } });
        const monthRuns = await Run.find({ userId, date: { $gte: startOfMonth } });

        const aggregate = (runs) => ({
            count: runs.length,
            distance: parseFloat(runs.reduce((s, r) => s + r.distance, 0).toFixed(2)),
            duration: runs.reduce((s, r) => s + r.duration, 0),
            calories: runs.reduce((s, r) => s + (r.caloriesBurnt || 0), 0),
            avgPace: runs.length
                ? parseFloat((runs.reduce((s, r) => s + r.pace, 0) / runs.length).toFixed(2))
                : 0,
        });

        // Personal bests
        const fastestPaceRun = allRuns.sort((a, b) => a.pace - b.pace)[0];
        const longestRun = [...allRuns].sort((a, b) => b.distance - a.distance)[0];
        const mostCalories = [...allRuns].sort((a, b) => b.caloriesBurnt - a.caloriesBurnt)[0];

        res.json({
            week: aggregate(weekRuns),
            month: aggregate(monthRuns),
            allTime: aggregate(allRuns),
            personalBests: {
                fastestPace: fastestPaceRun ? fastestPaceRun.pace : null,
                longestRun: longestRun ? longestRun.distance : null,
                mostCalories: mostCalories ? mostCalories.caloriesBurnt : null,
            },
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/stats/weekly - 7-day breakdown
router.get('/weekly', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const days = [];
        const now = new Date();

        for (let i = 6; i >= 0; i--) {
            const day = new Date(now);
            day.setDate(now.getDate() - i);
            const start = new Date(day.setHours(0, 0, 0, 0));
            const end = new Date(day.setHours(23, 59, 59, 999));

            const runs = await Run.find({ userId, date: { $gte: start, $lte: end } });
            const dayLabel = start.toLocaleDateString('en-US', { weekday: 'short' });

            days.push({
                day: dayLabel,
                date: start.toISOString().split('T')[0],
                distance: parseFloat(runs.reduce((s, r) => s + r.distance, 0).toFixed(2)),
                calories: runs.reduce((s, r) => s + (r.caloriesBurnt || 0), 0),
                runs: runs.length,
            });
        }
        res.json(days);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/stats/monthly - last 6 months
router.get('/monthly', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const months = [];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const start = new Date(d.getFullYear(), d.getMonth(), 1);
            const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

            const runs = await Run.find({ userId, date: { $gte: start, $lte: end } });
            const label = start.toLocaleDateString('en-US', { month: 'short' });

            months.push({
                month: label,
                distance: parseFloat(runs.reduce((s, r) => s + r.distance, 0).toFixed(2)),
                calories: runs.reduce((s, r) => s + (r.caloriesBurnt || 0), 0),
                runs: runs.length,
            });
        }
        res.json(months);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/stats/pace-zones - distribution
router.get('/pace-zones', protect, async (req, res) => {
    try {
        const runs = await Run.find({ userId: req.user._id });
        const zones = {};
        runs.forEach((r) => {
            const z = r.paceZone || 'Easy';
            zones[z] = (zones[z] || 0) + 1;
        });
        const result = Object.entries(zones).map(([zone, count]) => ({
            zone,
            count,
            percentage: Math.round((count / runs.length) * 100),
        }));
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
