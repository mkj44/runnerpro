'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getWeeklyStats, getMonthlyStats, getPaceZones } from '@/lib/api';
import { BarChart3, TrendingUp } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';

export default function StatsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [weekly, setWeekly] = useState<any[]>([]);
    const [monthly, setMonthly] = useState<any[]>([]);
    const [paceZones, setPaceZones] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) { router.push('/auth/login'); return; }
        if (user) {
            Promise.all([getWeeklyStats(), getMonthlyStats(), getPaceZones()])
                .then(([w, m, p]) => { setWeekly(w.data); setMonthly(m.data); setPaceZones(p.data); })
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [user, authLoading, router]);

    if (authLoading || loading) {
        return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Loading stats...</p>
        </div>;
    }

    const ZONE_COLORS: any = {
        'Recovery': '#8b8b9e', 'Easy': '#00c9ff', 'Aerobic': '#00ff88',
        'Tempo': '#ffa502', 'Threshold': '#ff6b6b', 'Race Pace': '#a855f7',
    };

    return (
        <div className="page-container">
            <div className="fade-in" style={{ marginBottom: 36 }}>
                <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
                    <BarChart3 size={28} style={{ display: 'inline', verticalAlign: 'middle' }} /> Stats & Analytics
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>Deep dive into your running performance</p>
            </div>

            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: 20,
            }}>
                {/* Weekly Distance */}
                <div className="glass-card fade-in-delay-1" style={{ padding: 28 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <TrendingUp size={20} color="var(--accent)" /> Weekly Distance (km)
                    </h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={weekly}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="day" stroke="var(--text-secondary)" fontSize={12} />
                            <YAxis stroke="var(--text-secondary)" fontSize={12} />
                            <Tooltip contentStyle={{ background: 'rgba(17,17,24,0.95)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13 }} />
                            <Bar dataKey="distance" fill="url(#distGrad)" radius={[6, 6, 0, 0]} />
                            <defs>
                                <linearGradient id="distGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#00ff88" stopOpacity={0.9} />
                                    <stop offset="100%" stopColor="#00c9ff" stopOpacity={0.6} />
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Weekly Calories */}
                <div className="glass-card fade-in-delay-2" style={{ padding: 28 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                        🔥 Weekly Calories Burned
                    </h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={weekly}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="day" stroke="var(--text-secondary)" fontSize={12} />
                            <YAxis stroke="var(--text-secondary)" fontSize={12} />
                            <Tooltip contentStyle={{ background: 'rgba(17,17,24,0.95)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13 }} />
                            <Bar dataKey="calories" fill="url(#calGrad)" radius={[6, 6, 0, 0]} />
                            <defs>
                                <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ff6b6b" stopOpacity={0.9} />
                                    <stop offset="100%" stopColor="#ffa502" stopOpacity={0.6} />
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Monthly Trends */}
                <div className="glass-card fade-in-delay-3" style={{ padding: 28 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                        📈 Monthly Distance Trend
                    </h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={monthly}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={12} />
                            <YAxis stroke="var(--text-secondary)" fontSize={12} />
                            <Tooltip contentStyle={{ background: 'rgba(17,17,24,0.95)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13 }} />
                            <Line type="monotone" dataKey="distance" stroke="#00ff88" strokeWidth={3} dot={{ fill: '#00ff88', r: 5 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Pace Zones */}
                <div className="glass-card fade-in-delay-4" style={{ padding: 28 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                        ⚡ Pace Zone Distribution
                    </h3>
                    {paceZones.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 40 }}>No data yet</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie data={paceZones} dataKey="count" nameKey="zone" cx="50%" cy="50%"
                                    innerRadius={60} outerRadius={100} paddingAngle={4} strokeWidth={0}>
                                    {paceZones.map((entry: any, index: number) => (
                                        <Cell key={index} fill={ZONE_COLORS[entry.zone] || '#00ff88'} />
                                    ))}
                                </Pie>
                                <Legend formatter={(value: string) => <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{value}</span>} />
                                <Tooltip contentStyle={{ background: 'rgba(17,17,24,0.95)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 13 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
}
