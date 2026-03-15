'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getOverview, getWeeklyStats, getAIInsights, getRuns } from '@/lib/api';
import { Activity, Flame, MapPin, Timer, TrendingUp, Zap, Brain } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function DashboardPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [overview, setOverview] = useState<any>(null);
    const [weekly, setWeekly] = useState<any[]>([]);
    const [insight, setInsight] = useState<any>(null);
    const [recentRuns, setRecentRuns] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) { router.push('/auth/login'); return; }
        if (user) {
            Promise.all([getOverview(), getWeeklyStats(), getAIInsights(), getRuns(1, 4)])
                .then(([ov, wk, ai, runs]) => {
                    setOverview(ov.data);
                    setWeekly(wk.data);
                    setInsight(ai.data.insights?.[0]);
                    setRecentRuns(runs.data.runs);
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [user, authLoading, router]);

    if (authLoading || loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 40, marginBottom: 16, animation: 'pulse-glow 2s infinite' }}>🏃</div>
                    <p style={{ color: 'var(--text-secondary)' }}>Loading your data...</p>
                </div>
            </div>
        );
    }

    const week = overview?.week || { count: 0, distance: 0, duration: 0, calories: 0, avgPace: 0 };
    const pbs = overview?.personalBests || {};
    const goalProgress = user?.weeklyGoal ? Math.min((week.distance / user.weeklyGoal) * 100, 100) : 0;

    const stats = [
        { label: 'Distance', value: `${week.distance} km`, icon: MapPin, color: '#00ff88' },
        { label: 'Runs', value: week.count, icon: Activity, color: '#00c9ff' },
        { label: 'Calories', value: `${week.calories}`, icon: Flame, color: '#ff6b6b' },
        { label: 'Avg Pace', value: week.avgPace ? `${week.avgPace.toFixed(1)} min/km` : '-', icon: Timer, color: '#ffa502' },
    ];

    const formatPace = (pace: number) => {
        const mins = Math.floor(pace);
        const secs = Math.round((pace - mins) * 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="page-container">
            {/* Header */}
            <div className="fade-in" style={{ marginBottom: 36 }}>
                <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
                    Hey, <span className="gradient-text">{user?.name}</span> 👋
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>Here&apos;s your weekly running overview</p>
            </div>

            {/* Weekly Goal Progress */}
            {user?.weeklyGoal && (
                <div className="glass-card fade-in-delay-1" style={{ padding: 24, marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>
                            Weekly Goal: {week.distance.toFixed(1)} / {user.weeklyGoal} km
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>{goalProgress.toFixed(0)}%</span>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 8, height: 10, overflow: 'hidden' }}>
                        <div style={{
                            width: `${goalProgress}%`, height: '100%', borderRadius: 8,
                            background: 'linear-gradient(90deg, #00ff88, #00c9ff)',
                            transition: 'width 1s ease-in-out',
                        }} />
                    </div>
                </div>
            )}

            {/* Stat Cards */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 16, marginBottom: 32,
            }}>
                {stats.map((s, i) => (
                    <div key={i} className={`glass-card fade-in-delay-${Math.min(i + 1, 4)}`} style={{
                        padding: 24, display: 'flex', flexDirection: 'column', gap: 12,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: 12,
                                background: `${s.color}15`, display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                            }}>
                                <s.icon size={20} color={s.color} />
                            </div>
                            <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{s.label}</span>
                        </div>
                        <span style={{ fontSize: 28, fontWeight: 800 }}>{s.value}</span>
                    </div>
                ))}
            </div>

            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
                gap: 20,
            }}>
                {/* Weekly Chart */}
                <div className="glass-card fade-in-delay-2" style={{ padding: 28 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <TrendingUp size={20} color="var(--accent)" /> Weekly Distance
                    </h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={weekly}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="day" stroke="var(--text-secondary)" fontSize={12} />
                            <YAxis stroke="var(--text-secondary)" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    background: 'rgba(17,17,24,0.95)', border: '1px solid var(--border)',
                                    borderRadius: 12, fontSize: 13,
                                }}
                            />
                            <Bar dataKey="distance" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                            <defs>
                                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#00ff88" stopOpacity={0.9} />
                                    <stop offset="100%" stopColor="#00c9ff" stopOpacity={0.6} />
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* AI Insight */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {insight && (
                        <div className="glass-card glow-accent fade-in-delay-3" style={{ padding: 28 }}>
                            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Brain size={20} color="var(--accent)" /> AI Insight
                            </h3>
                            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                                <span style={{ fontSize: 32 }}>{insight.icon}</span>
                                <div>
                                    <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{insight.title}</h4>
                                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{insight.message}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Personal Bests */}
                    <div className="glass-card fade-in-delay-4" style={{ padding: 28 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Zap size={20} color="#ffa502" /> Personal Bests
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Fastest Pace</span>
                                <span style={{ fontWeight: 700, fontSize: 15 }}>{pbs.fastestPace ? formatPace(pbs.fastestPace) + ' /km' : '-'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Longest Run</span>
                                <span style={{ fontWeight: 700, fontSize: 15 }}>{pbs.longestRun ? pbs.longestRun + ' km' : '-'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Most Calories</span>
                                <span style={{ fontWeight: 700, fontSize: 15 }}>{pbs.mostCalories ? pbs.mostCalories + ' kcal' : '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Runs */}
            <div className="fade-in-delay-4" style={{ marginTop: 32 }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>
                    Recent Runs
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {recentRuns.length === 0 ? (
                        <div className="glass-card" style={{ padding: 40, textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
                                No runs yet. <a href="/log-run" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Log your first run →</a>
                            </p>
                        </div>
                    ) : (
                        recentRuns.map((run: any) => (
                            <div key={run._id} className="glass-card" style={{
                                padding: 20, display: 'flex', justifyContent: 'space-between',
                                alignItems: 'center', flexWrap: 'wrap', gap: 12,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <div style={{
                                        width: 44, height: 44, borderRadius: 12,
                                        background: 'var(--accent-glow)', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Activity size={22} color="var(--accent)" />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: 15, fontWeight: 600 }}>
                                            {run.routeType} Run · {run.distance} km
                                        </p>
                                        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                            {new Date(run.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 24 }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: 14, fontWeight: 700 }}>{formatPace(run.pace)} /km</p>
                                        <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Pace</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: 14, fontWeight: 700 }}>{run.caloriesBurnt} kcal</p>
                                        <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Calories</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: 14, fontWeight: 700 }}>{run.duration} min</p>
                                        <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Duration</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
