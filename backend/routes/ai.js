const express = require('express');
const router = express.Router();
const Run = require('../models/Run');
const { protect } = require('../middleware/auth');

// AI Coaching Tips Engine
function generateInsights(runs, user) {
    const tips = [];
    if (!runs || runs.length === 0) {
        return [{
            type: 'welcome',
            icon: '🎯',
            title: 'Start Your Journey',
            message: 'Log your first run to unlock personalized AI coaching insights tailored to your performance!',
            priority: 'high',
        }];
    }

    const recent = runs.slice(0, 7); // Last 7 runs
    const avgPace = recent.reduce((s, r) => s + r.pace, 0) / recent.length;
    const totalDistance = recent.reduce((s, r) => s + r.distance, 0);
    const avgDistance = totalDistance / recent.length;

    // Check for consecutive hard runs (pace < 5.5 min/km)
    const hardRuns = recent.filter((r) => r.pace < 5.5).length;
    if (hardRuns >= 3) {
        tips.push({
            type: 'recovery',
            icon: '😴',
            title: 'Recovery Day Needed',
            message: `You've had ${hardRuns} intense runs recently. Schedule an easy recovery run (>7 min/km) or rest day to prevent overtraining and reduce injury risk.`,
            priority: 'high',
        });
    }

    // Check weekly distance
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    const weekRuns = runs.filter((r) => new Date(r.date) >= weekStart);
    const weekDistance = weekRuns.reduce((s, r) => s + r.distance, 0);

    if (user && user.weeklyGoal && weekDistance >= user.weeklyGoal * 0.9) {
        tips.push({
            type: 'achievement',
            icon: '🏆',
            title: 'Goal Almost Crushed!',
            message: `You're at ${weekDistance.toFixed(1)}km this week – nearly hitting your ${user.weeklyGoal}km goal. One more run will do it!`,
            priority: 'medium',
        });
    } else if (weekDistance < 10 && weekRuns.length > 0) {
        tips.push({
            type: 'motivation',
            icon: '🚀',
            title: 'Ramp Up Gradually',
            message: `You've covered ${weekDistance.toFixed(1)}km this week. Aim to increase your weekly distance by no more than 10% each week to build safely.`,
            priority: 'medium',
        });
    }

    // Pace trending
    if (runs.length >= 5) {
        const olderPace = runs.slice(3, 6).reduce((s, r) => s + r.pace, 0) / 3;
        const recentPace = runs.slice(0, 3).reduce((s, r) => s + r.pace, 0) / 3;
        if (recentPace < olderPace - 0.2) {
            tips.push({
                type: 'progress',
                icon: '⚡',
                title: 'You\'re Getting Faster!',
                message: `Your pace improved by ${((olderPace - recentPace) * 60).toFixed(0)} seconds/km in recent runs. Keep up the tempo training to build on this momentum!`,
                priority: 'high',
            });
        } else if (recentPace > olderPace + 0.3) {
            tips.push({
                type: 'warning',
                icon: '⚠️',
                title: 'Pace Slowing Down',
                message: 'Your pace has slowed recently. This may indicate fatigue, improper nutrition, or a need for rest. Consider a lighter week.',
                priority: 'high',
            });
        }
    }

    // Consistency tip
    if (runs.length >= 2) {
        const runDates = runs.map((r) => new Date(r.date).toDateString());
        const uniqueDays = new Set(runDates).size;
        if (uniqueDays >= 5 && runs.length <= 7) {
            tips.push({
                type: 'consistency',
                icon: '🔥',
                title: 'Excellent Consistency!',
                message: 'Running 5+ days a week shows great dedication. Make sure to include at least one full rest day to allow muscle repair and growth.',
                priority: 'low',
            });
        }
    }

    // Average distance tip
    if (avgDistance < 3) {
        tips.push({
            type: 'distance',
            icon: '📏',
            title: 'Build Your Base',
            message: `Your average run is ${avgDistance.toFixed(1)}km. Try extending one weekly run by 1-2km each week to build your aerobic base for longevity.`,
            priority: 'medium',
        });
    } else if (avgDistance > 15) {
        tips.push({
            type: 'hydration',
            icon: '💧',
            title: 'Hydration is Critical',
            message: `You're running ${avgDistance.toFixed(1)}km on average. For runs over 10km, hydrate with 400-600ml per hour and consider electrolytes.`,
            priority: 'medium',
        });
    }

    // Elevation tip
    const avgElevation = recent.reduce((s, r) => s + (r.elevationGain || 0), 0) / recent.length;
    if (avgElevation < 10) {
        tips.push({
            type: 'training',
            icon: '⛰️',
            title: 'Add Hill Training',
            message: 'Your routes are mostly flat. Add one hill session per week – it builds leg strength, improves VO2 max, and makes flat running feel easier.',
            priority: 'low',
        });
    }

    // Default positivity
    if (tips.length === 0) {
        tips.push({
            type: 'great',
            icon: '💪',
            title: 'You\'re On Track!',
            message: `Averaging ${avgPace.toFixed(1)} min/km across your recent runs. Maintain this balance of easy and hard efforts for long-term improvement.`,
            priority: 'low',
        });
    }

    return tips.slice(0, 5);
}

// GET /api/ai/insights
router.get('/insights', protect, async (req, res) => {
    try {
        const runs = await Run.find({ userId: req.user._id }).sort({ date: -1 }).limit(20);
        const insights = generateInsights(runs, req.user);
        res.json({ insights, totalRuns: runs.length });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/ai/pace-analysis
router.get('/pace-analysis', protect, async (req, res) => {
    try {
        const runs = await Run.find({ userId: req.user._id }).sort({ date: -1 }).limit(10);
        if (!runs.length) return res.json({ analysis: [], summary: 'No runs yet.' });

        const paceData = runs.map((r) => ({
            date: new Date(r.date).toLocaleDateString(),
            pace: parseFloat(r.pace.toFixed(2)),
            paceZone: r.paceZone,
            distance: r.distance,
        }));

        const avgPace = runs.reduce((s, r) => s + r.pace, 0) / runs.length;
        let summary = '';
        if (avgPace < 5) summary = '🔥 Elite pace! You\'re running at competitive race speeds.';
        else if (avgPace < 6) summary = '⚡ Strong performance! Great tempo runner.';
        else if (avgPace < 7) summary = '👟 Solid aerobic pace. Good base building.';
        else summary = '🌱 Easy pace runner. Perfect for building endurance sustainably.';

        res.json({ analysis: paceData, summary, avgPace: parseFloat(avgPace.toFixed(2)) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/ai/predict-calories
router.post('/predict-calories', protect, async (req, res) => {
    try {
        const { distance, pace, weight } = req.body;
        const userWeight = weight || req.user.weight || 70;
        let met;
        if (pace < 4.5) met = 14;
        else if (pace < 5.0) met = 12;
        else if (pace < 5.5) met = 10;
        else if (pace < 6.5) met = 9;
        else if (pace < 8.0) met = 7;
        else met = 5.5;
        const durationHours = (pace * distance) / 60;
        const calories = Math.round(met * userWeight * durationHours);
        res.json({ calories, met, durationHours: parseFloat(durationHours.toFixed(2)) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/ai/training-plan
router.get('/training-plan', protect, async (req, res) => {
    try {
        const runs = await Run.find({ userId: req.user._id }).sort({ date: -1 }).limit(14);
        const recentDist = runs.length
            ? runs.reduce((s, r) => s + r.distance, 0) / Math.max(runs.length / 7, 1)
            : 20;

        const plan = [
            { day: 'Monday', type: 'Easy Run', distance: parseFloat((recentDist * 0.2).toFixed(1)), pace: 'Comfortable', description: 'Conversational pace, HR zone 2' },
            { day: 'Tuesday', type: 'Tempo Run', distance: parseFloat((recentDist * 0.15).toFixed(1)), pace: 'Comfortably Hard', description: '20-30 min at threshold pace' },
            { day: 'Wednesday', type: 'Rest / Cross Training', distance: 0, pace: '-', description: 'Stretch, yoga, or cycling' },
            { day: 'Thursday', type: 'Interval Training', distance: parseFloat((recentDist * 0.12).toFixed(1)), pace: 'Fast', description: '5×800m repeats with recovery jogs' },
            { day: 'Friday', type: 'Easy Recovery', distance: parseFloat((recentDist * 0.15).toFixed(1)), pace: 'Easy', description: 'Very easy effort, flush the legs' },
            { day: 'Saturday', type: 'Long Run', distance: parseFloat((recentDist * 0.35).toFixed(1)), pace: 'Slow & Steady', description: 'Build aerobic base at easy effort' },
            { day: 'Sunday', type: 'Rest', distance: 0, pace: '-', description: 'Fully rest and recover' },
        ];
        res.json({ plan, weeklyDistance: parseFloat(recentDist.toFixed(1)) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
