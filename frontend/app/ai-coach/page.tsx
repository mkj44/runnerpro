'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getAIInsights, getPaceAnalysis, getTrainingPlan } from '@/lib/api';
import { Brain, TrendingUp, Calendar } from 'lucide-react';

export default function AICoachPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [insights, setInsights] = useState<any[]>([]);
    const [paceAnalysis, setPaceAnalysis] = useState<any>(null);
    const [trainingPlan, setTrainingPlan] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('insights');

    useEffect(() => {
        if (!authLoading && !user) { router.push('/auth/login'); return; }
        if (user) {
            Promise.all([getAIInsights(), getPaceAnalysis(), getTrainingPlan()])
                .then(([ins, pace, plan]) => {
                    setInsights(ins.data.insights);
                    setPaceAnalysis(pace.data);
                    setTrainingPlan(plan.data);
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [user, authLoading, router]);

    if (authLoading || loading) {
        return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <div style={{ textAlign: 'center' }}>
                <Brain size={40} color="var(--accent)" style={{ margin: '0 auto 16px' }} />
                <p style={{ color: 'var(--text-secondary)' }}>AI analyzing your runs...</p>
            </div>
        </div>;
    }

    const tabs = [
        { id: 'insights', label: 'AI Insights', icon: Brain },
        { id: 'pace', label: 'Pace Analysis', icon: TrendingUp },
        { id: 'plan', label: 'Training Plan', icon: Calendar },
    ];

    const priorityColors: any = { high: '#ff6b6b', medium: '#ffa502', low: '#00ff88' };

    return (
        <div className="page-container">
            <div className="fade-in" style={{ marginBottom: 36 }}>
                <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
                    <Brain size={28} style={{ display: 'inline', verticalAlign: 'middle' }} /> AI Coach
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>Personalized coaching powered by your run data</p>
            </div>

            {/* Tabs */}
            <div className="fade-in-delay-1" style={{
                display: 'flex', gap: 6, padding: 4, background: 'var(--bg-card)',
                borderRadius: 14, marginBottom: 32, border: '1px solid var(--border)',
                width: 'fit-content',
            }}>
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                        padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
                        background: activeTab === t.id ? 'var(--accent)' : 'transparent',
                        color: activeTab === t.id ? '#0a0a0f' : 'var(--text-secondary)',
                        fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
                        transition: 'all 0.2s ease', fontFamily: 'Inter, sans-serif',
                    }}>
                        <t.icon size={16} /> {t.label}
                    </button>
                ))}
            </div>

            {/* Insights Tab */}
            {activeTab === 'insights' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {insights.map((tip: any, i: number) => (
                        <div key={i} className={`glass-card fade-in-delay-${Math.min(i + 1, 4)}`}
                            style={{ padding: 28, borderLeft: `3px solid ${priorityColors[tip.priority] || '#00ff88'}` }}>
                            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                                <span style={{ fontSize: 36 }}>{tip.icon}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <h3 style={{ fontSize: 18, fontWeight: 700 }}>{tip.title}</h3>
                                        <span style={{
                                            padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                                            background: `${priorityColors[tip.priority]}15`,
                                            color: priorityColors[tip.priority],
                                            textTransform: 'uppercase',
                                        }}>
                                            {tip.priority}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{tip.message}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pace Analysis Tab */}
            {activeTab === 'pace' && paceAnalysis && (
                <div>
                    <div className="glass-card glow-accent fade-in" style={{ padding: 28, marginBottom: 24 }}>
                        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Pace Summary</h3>
                        <p style={{ fontSize: 32, fontWeight: 800, color: 'var(--accent)', marginBottom: 8 }}>
                            {paceAnalysis.avgPace ? `${paceAnalysis.avgPace} min/km` : 'No data'}
                        </p>
                        <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{paceAnalysis.summary}</p>
                    </div>

                    {paceAnalysis.analysis?.length > 0 && (
                        <div className="glass-card fade-in-delay-1" style={{ padding: 28 }}>
                            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Recent Run Paces</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {paceAnalysis.analysis.map((r: any, i: number) => (
                                    <div key={i} style={{
                                        display: 'flex', justifyContent: 'space-between', padding: '14px 16px',
                                        borderRadius: 12, background: 'rgba(255,255,255,0.02)',
                                        alignItems: 'center',
                                    }}>
                                        <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{r.date}</span>
                                        <span style={{ fontSize: 14, fontWeight: 700 }}>{r.distance} km</span>
                                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>{r.pace} min/km</span>
                                        <span style={{
                                            padding: '3px 10px', borderRadius: 16, fontSize: 11, fontWeight: 600,
                                            background: 'rgba(0,255,136,0.1)', color: 'var(--accent)',
                                        }}>
                                            {r.paceZone}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Training Plan Tab */}
            {activeTab === 'plan' && trainingPlan && (
                <div>
                    <div className="glass-card glow-accent fade-in" style={{ padding: 24, marginBottom: 24 }}>
                        <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
                            Weekly target: <strong style={{ color: 'var(--accent)' }}>{trainingPlan.weeklyDistance} km/week</strong> — based on your recent running volume
                        </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {trainingPlan.plan?.map((day: any, i: number) => (
                            <div key={i} className={`glass-card fade-in-delay-${Math.min(i + 1, 4)}`} style={{
                                padding: 24, display: 'grid',
                                gridTemplateColumns: '100px 1fr 80px 100px',
                                gap: 16, alignItems: 'center',
                            }}>
                                <span style={{ fontWeight: 700, fontSize: 15 }}>{day.day}</span>
                                <div>
                                    <p style={{ fontWeight: 600, fontSize: 15 }}>{day.type}</p>
                                    <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{day.description}</p>
                                </div>
                                <span style={{
                                    fontWeight: 700, color: day.distance > 0 ? 'var(--accent)' : 'var(--text-secondary)',
                                    fontSize: 15,
                                }}>
                                    {day.distance > 0 ? `${day.distance} km` : '-'}
                                </span>
                                <span style={{
                                    padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                                    background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)',
                                    textAlign: 'center',
                                }}>
                                    {day.pace}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
