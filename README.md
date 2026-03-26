🏃 RunnerPro – AI-Powered Running Tracker

A fullstack Strava-like web app for runners to track daily runs, monitor pace, calories burnt, and get AI-powered coaching insights.

## ⚡ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, Tailwind CSS, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (Bearer token) |
| AI Engine | In-app rule-based coaching system |

## 🚀 Features

- **Run Tracking** – Log distance, duration, route type, elevation, heart rate
- **Auto Calculations** – Pace & calories automatically calculated using MET formula
- **Pace Zones** – Runs classified into 6 zones (Recovery → Race Pace)
- **Dashboard** – Weekly goal progress, stat cards, charts, AI tip of the day
- **Activity Feed** – Strava-like paginated run list with detailed metrics
- **Stats & Charts** – Weekly/monthly bar charts, calorie trends, pace zone donut chart
- **AI Coach** – Personalized insights, pace analysis, auto-generated training plan
- **Profile** – Lifetime stats, editable profile with goals

## 🛠️ Setup

### 1. Backend
```bash
cd backend
npm install
# Create .env with: MONGODB_URI, JWT_SECRET, PORT
npm run dev
```

### 2. Frontend
```bash
cd frontend
npm install
# Create .env.local with: NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm run dev
```

### 3. MongoDB
Make sure MongoDB is running locally on port 27017 (or update MONGODB_URI).

## 📱 Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/auth/login` | Login |
| `/auth/register` | Register |
| `/dashboard` | Stats overview |
| `/log-run` | Log a run |
| `/activity` | Activity feed |
| `/stats` | Charts & analytics |
| `/ai-coach` | AI coaching |
| `/profile` | Profile & settings |

