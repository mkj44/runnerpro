const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    /\.vercel\.app$/,
];
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (curl, Postman, server-side)
        if (!origin) return callback(null, true);
        const allowed = allowedOrigins.some(o =>
            typeof o === 'string' ? o === origin : o.test(origin)
        );
        callback(allowed ? null : new Error('CORS: origin not allowed'), allowed);
    },
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/runs', require('./routes/runs'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/ai', require('./routes/ai'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'RunnerPro API is running 🏃' });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/runnerpro';

mongoose
    .connect(MONGODB_URI)
    .then(() => {
        console.log('✅ MongoDB Connected');
        app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
    })
    .catch((err) => {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    });

module.exports = app;
