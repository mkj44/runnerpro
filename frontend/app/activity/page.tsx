'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getRuns, deleteRun } from '@/lib/api';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import {
    Activity, Trash2, MapPin, Timer, Flame, ChevronLeft, ChevronRight,
    Navigation, Zap, TrendingUp, Calendar
} from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamic import of RunTracker (no SSR, since it uses Leaflet + geolocation)
const RunTracker = dynamic(() => import('@/components/RunTracker'), { ssr: false });

// ─── Util ────────────────────────────────────────────────────────────────────
const formatPace = (p: number) => {
    const m = Math.floor(p);
    const s = Math.round((p - m) * 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
};

const zoneColors: Record<string, string> = {
    Recovery: '#8b8b9e', Easy: '#00c9ff', Aerobic: '#00ff88',
    Tempo: '#ffa502', Threshold: '#ff6b6b', 'Race Pace': '#a855f7',
};

// ─── 3D Card wrapper ─────────────────────────────────────────────────────────
function Card3D({ children, style = {}, className = '' }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-60, 60], [6, -6]);
    const rotateY = useTransform(x, [-60, 60], [-6, 6]);

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        x.set(e.clientX - rect.left - rect.width / 2);
        y.set(e.clientY - rect.top - rect.height / 2);
    };

    return (
        <motion.div
            ref={ref}
            className={`glass-card ${className}`}
            style={{ ...style, transformStyle: 'preserve-3d', perspective: 800, rotateX, rotateY, willChange: 'transform' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { x.set(0); y.set(0); }}
            whileHover={{ scale: 1.012, boxShadow: '0 24px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(0,255,136,0.12)' }}
            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        >
            {children}
        </motion.div>
    );
}

// ─── Stat Pill ────────────────────────────────────────────────────────────────
function StatPill({ icon: Icon, value, label, color }: { icon: any; value: string; label: string; color: string }) {
    return (
        <div style={{ textAlign: 'center', position: 'relative' }}>
            <Icon size={15} color={color} style={{ margin: '0 auto 6px', display: 'block' }} />
            <p style={{ fontSize: 17, fontWeight: 800, color }}>{value}</p>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{label}</p>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ActivityPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [runs, setRuns] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'tracker' | 'history'>('tracker');

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
        try { await deleteRun(id); fetchRuns(); } catch (e) { console.error(e); }
    };

    const tabs: { id: 'tracker' | 'history'; label: string; icon: any }[] = [
        { id: 'tracker', label: 'Live Tracker', icon: Navigation },
        { id: 'history', label: 'Run History', icon: Activity },
    ];

    return (
        <div className="page-container">

            {/* ── Hero header ── */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
                style={{ marginBottom: 32 }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 6 }}>
                    {/* Animated icon */}
                    <motion.div
                        animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.1, 1] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        style={{
                            width: 52, height: 52, borderRadius: 16,
                            background: 'linear-gradient(135deg, rgba(0,255,136,0.2) 0%, rgba(0,201,255,0.1) 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 0 30px rgba(0,255,136,0.2)',
                            border: '1px solid rgba(0,255,136,0.2)',
                        }}
                    >
                        <Activity size={26} color="#00ff88" />
                    </motion.div>
                    <div>
                        <h1 style={{ fontSize: 30, fontWeight: 900, lineHeight: 1.1 }}
                            className="gradient-text">Activity</h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{total} total runs logged</p>
                    </div>
                </div>
            </motion.div>

            {/* ── Tab Switcher ── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                style={{
                    display: 'flex', padding: 5, borderRadius: 14,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    marginBottom: 28, width: 'fit-content',
                }}
            >
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '9px 20px', borderRadius: 10, border: 'none', cursor: 'pointer',
                            fontWeight: 600, fontSize: 14, transition: 'all 0.25s ease',
                            fontFamily: 'Inter, sans-serif',
                            background: activeTab === tab.id
                                ? 'linear-gradient(135deg, rgba(0,255,136,0.15) 0%, rgba(0,201,255,0.08) 100%)'
                                : 'transparent',
                            color: activeTab === tab.id ? '#00ff88' : 'var(--text-secondary)',
                            boxShadow: activeTab === tab.id ? '0 0 0 1px rgba(0,255,136,0.2)' : 'none',
                        }}
                    >
                        <tab.icon size={15} />
                        {tab.label}
                    </button>
                ))}
            </motion.div>

            {/* ── Content ── */}
            <AnimatePresence mode="wait">
                {activeTab === 'tracker' ? (
                    <motion.div
                        key="tracker"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card3D style={{ padding: 28 }}>
                            <RunTracker />
                        </Card3D>
                    </motion.div>
                ) : (
                    <motion.div
                        key="history"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: 60 }}>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                    style={{ width: 36, height: 36, border: '3px solid rgba(0,255,136,0.3)', borderTopColor: '#00ff88', borderRadius: '50%', margin: '0 auto 16px' }}
                                />
                                <p style={{ color: 'var(--text-secondary)' }}>Loading runs...</p>
                            </div>
                        ) : runs.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass-card"
                                style={{ padding: 60, textAlign: 'center' }}
                            >
                                <div style={{ fontSize: 52, marginBottom: 16 }}>🏃</div>
                                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No Runs Yet</h3>
                                <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Start your first run with the Live Tracker above!</p>
                                <button className="btn-primary" onClick={() => setActiveTab('tracker')}>Open Live Tracker →</button>
                            </motion.div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {runs.map((run: any, i: number) => (
                                    <motion.div
                                        key={run._id}
                                        initial={{ opacity: 0, y: 24 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.06, type: 'spring', stiffness: 160, damping: 20 }}
                                    >
                                        <Card3D style={{ padding: 24 }}>
                                            {/* Run card top row */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                                    <div style={{
                                                        width: 48, height: 48, borderRadius: 14,
                                                        background: 'linear-gradient(135deg, rgba(0,255,136,0.15) 0%, rgba(0,201,255,0.08) 100%)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        border: '1px solid rgba(0,255,136,0.2)',
                                                        boxShadow: '0 4px 16px rgba(0,255,136,0.1)',
                                                    }}>
                                                        <Activity size={22} color="#00ff88" />
                                                    </div>
                                                    <div>
                                                        <h3 style={{ fontSize: 16, fontWeight: 700 }}>{run.routeType} Run</h3>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                                                            <Calendar size={12} color="var(--text-secondary)" />
                                                            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                                                {new Date(run.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <span style={{
                                                        padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                                                        background: `${zoneColors[run.paceZone] || '#00ff88'}18`,
                                                        color: zoneColors[run.paceZone] || '#00ff88',
                                                        border: `1px solid ${zoneColors[run.paceZone] || '#00ff88'}35`,
                                                    }}>
                                                        {run.paceZone}
                                                    </span>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleDelete(run._id)}
                                                        style={{
                                                            background: 'rgba(255,71,87,0.08)', border: '1px solid rgba(255,71,87,0.15)',
                                                            padding: 8, cursor: 'pointer', color: '#ff4757', borderRadius: 8, transition: 'all 0.2s',
                                                        }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </motion.button>
                                                </div>
                                            </div>

                                            {/* Stats */}
                                            <div style={{
                                                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                                                gap: 0, padding: '16px 8px', borderRadius: 12,
                                                background: 'rgba(255,255,255,0.025)',
                                                border: '1px solid rgba(255,255,255,0.05)',
                                                position: 'relative',
                                            }}>
                                                {/* Dividers */}
                                                <div style={{ position: 'absolute', left: '25%', top: '20%', bottom: '20%', width: 1, background: 'rgba(255,255,255,0.06)' }} />
                                                <div style={{ position: 'absolute', left: '50%', top: '20%', bottom: '20%', width: 1, background: 'rgba(255,255,255,0.06)' }} />
                                                <div style={{ position: 'absolute', left: '75%', top: '20%', bottom: '20%', width: 1, background: 'rgba(255,255,255,0.06)' }} />

                                                <StatPill icon={MapPin} value={`${run.distance} km`} label="Distance" color="#00ff88" />
                                                <StatPill icon={Timer} value={`${formatPace(run.pace)} /km`} label="Pace" color="#ffa502" />
                                                <StatPill icon={Flame} value={`${run.caloriesBurnt}`} label="Calories" color="#ff6b6b" />
                                                <StatPill icon={Activity} value={`${run.duration} min`} label="Duration" color="#00c9ff" />
                                            </div>

                                            {run.notes && (
                                                <motion.p
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    style={{
                                                        marginTop: 16, fontSize: 13, color: 'var(--text-secondary)',
                                                        fontStyle: 'italic', padding: '10px 14px',
                                                        background: 'rgba(255,255,255,0.02)', borderRadius: 8,
                                                        borderLeft: '3px solid rgba(0,255,136,0.3)',
                                                    }}
                                                >
                                                    &ldquo;{run.notes}&rdquo;
                                                </motion.p>
                                            )}
                                        </Card3D>
                                    </motion.div>
                                ))}

                                {/* Pagination */}
                                {pages > 1 && (
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 24 }}>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                            className="btn-secondary" disabled={page <= 1}
                                            onClick={() => setPage(p => p - 1)}
                                            style={{ padding: '10px 18px', opacity: page <= 1 ? 0.4 : 1 }}
                                        >
                                            <ChevronLeft size={18} />
                                        </motion.button>
                                        <span style={{ padding: '10px 20px', color: 'var(--text-secondary)', fontSize: 14 }}>
                                            Page {page} of {pages}
                                        </span>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                            className="btn-secondary" disabled={page >= pages}
                                            onClick={() => setPage(p => p + 1)}
                                            style={{ padding: '10px 18px', opacity: page >= pages ? 0.4 : 1 }}
                                        >
                                            <ChevronRight size={18} />
                                        </motion.button>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
