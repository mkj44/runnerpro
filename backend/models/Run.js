const mongoose = require('mongoose');

const RunSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    distance: { type: Number, required: true }, // km
    duration: { type: Number, required: true }, // minutes
    pace: { type: Number }, // min/km - auto-calculated
    caloriesBurnt: { type: Number }, // auto-calculated
    elevationGain: { type: Number, default: 0 }, // meters
    heartRate: { type: Number, default: 0 }, // avg bpm
    routeType: {
        type: String,
        enum: ['Road', 'Trail', 'Track', 'Treadmill'],
        default: 'Road',
    },
    notes: { type: String, default: '' },
    paceZone: {
        type: String,
        enum: ['Recovery', 'Easy', 'Aerobic', 'Tempo', 'Threshold', 'Race Pace'],
        default: 'Easy',
    },
    aiInsight: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
});

// Auto-calculate pace and calories before saving
RunSchema.pre('save', function(next) {
    if (this.distance && this.duration) {
        this.pace = this.duration / this.distance;
        this.paceZone = getPaceZone(this.pace);
    }
    next();
});

function getPaceZone(pace) {
    if (pace < 4.5) return 'Race Pace';
    if (pace < 5.0) return 'Threshold';
    if (pace < 5.5) return 'Tempo';
    if (pace < 6.5) return 'Aerobic';
    if (pace < 8.0) return 'Easy';
    return 'Recovery';
}

module.exports = mongoose.model('Run', RunSchema);
module.exports.getPaceZone = getPaceZone;
