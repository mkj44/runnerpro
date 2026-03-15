'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getRuns, deleteRun } from '@/lib/api';
import { Activity, Trash2, MapPin, Timer, Flame, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ActivityPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [runs, setRuns] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) { router.push('/auth/login'); return; }
        if (user) fetchRuns();
    }, [user, authLoading, page, router]);

    const fetchRuns = async () => {
        setLoading(true);
        try {
            const { data } = await getRuns(page, 8);
            setRuns(data.runs);
            setTotal(data.total);
            setPages(data.pages);
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this run?')) return;
        try {
            await deleteRun(id);
            fetchRuns();
        } catch (e) { console.error(e); }
    };

    const formatPace = (p: number) => {
        const m = Math.floor(p);
        const s = Math.round((p - m) * 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const zoneColors: any = {
        'Recovery': '#8b8b9e', 'Easy': '#00c9ff', 'Aerobic': '#00ff88',
        'Tempo': '#ffa502', 'Threshold': '#ff6b6b', 'Race Pace': '#a855f7',
    };

    return (
        <div className="page-container">
            <div className="fade-in" style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
                    <Activity size={28} style={{ display: 'inline', verticalAlign: 'middle' }} /> Activity Feed
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>{total} total runs logged</p>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: 60 }}>
                    <p style={{ color: 'var(--text-secondary)' }}>Loading runs...</p>
                </div>
            ) : runs.length === 0 ? (
                <div className="glass-card" style={{ padding: 60, textAlign: 'center' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🏃</div>
                    <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No Runs Yet</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Start your running journey today!</p>
                    <a href="/log-run"><button className="btn-primary">Log Your First Run →</button></a>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {runs.map((run: any, i: number) => (
                        <div key={run._id} className={`glass-card fade-in-delay-${Math.min(i + 1, 4)}`} style={{ padding: 24 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                    <div style={{
                                        width: 48, height: 48, borderRadius: 14,
                                        background: 'var(--accent-glow)', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Activity size={24} color="var(--accent)" />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: 17, fontWeight: 700 }}>{run.routeType} Run</h3>
                                        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                            {new Date(run.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <span style={{
                                        padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                                        background: `${zoneColors[run.paceZone] || '#00ff88'}15`,
                                        color: zoneColors[run.paceZone] || '#00ff88',
                                        border: `1px solid ${zoneColors[run.paceZone] || '#00ff88'}30`,
                                    }}>
                                        {run.paceZone}
                                    </span>
                                    <button onClick={() => handleDelete(run._id)} style={{
                                        background: 'none', border: 'none', padding: 6, cursor: 'pointer',
                                        color: 'var(--text-secondary)', borderRadius: 8, transition: 'color 0.2s',
                                    }}
                                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
                                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div style={{
                                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                                gap: 16, padding: 16, borderRadius: 12,
                                background: 'rgba(255,255,255,0.02)',
                            }}>
                                <div style={{ textAlign: 'center' }}>
                                    <MapPin size={16} color="var(--accent)" style={{ margin: '0 auto 6px' }} />
                                    <p style={{ fontSize: 18, fontWeight: 800 }}>{run.distance} km</p>
                                    <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Distance</p>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <Timer size={16} color="#ffa502" style={{ margin: '0 auto 6px' }} />
                                    <p style={{ fontSize: 18, fontWeight: 800 }}>{formatPace(run.pace)} /km</p>
                                    <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Pace</p>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <Flame size={16} color="#ff6b6b" style={{ margin: '0 auto 6px' }} />
                                    <p style={{ fontSize: 18, fontWeight: 800 }}>{run.caloriesBurnt}</p>
                                    <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Calories</p>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <Activity size={16} color="#00c9ff" style={{ margin: '0 auto 6px' }} />
                                    <p style={{ fontSize: 18, fontWeight: 800 }}>{run.duration} min</p>
                                    <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Duration</p>
                                </div>
                            </div>

                            {run.notes && (
                                <p style={{ marginTop: 14, fontSize: 14, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                    &ldquo;{run.notes}&rdquo;
                                </p>
                            )}
                        </div>
                    ))}

                    {/* Pagination */}
                    {pages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 24 }}>
                            <button className="btn-secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                                style={{ padding: '10px 20px', opacity: page <= 1 ? 0.4 : 1 }}>
                                <ChevronLeft size={18} />
                            </button>
                            <span style={{ padding: '10px 20px', color: 'var(--text-secondary)', fontSize: 14, display: 'flex', alignItems: 'center' }}>
                                Page {page} of {pages}
                            </span>
                            <button className="btn-secondary" disabled={page >= pages} onClick={() => setPage(p => p + 1)}
                                style={{ padding: '10px 20px', opacity: page >= pages ? 0.4 : 1 }}>
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
