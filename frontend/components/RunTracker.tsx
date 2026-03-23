'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Play, Square, Navigation, Timer, Flame, Zap } from 'lucide-react';

const RunTrackerMap = dynamic(() => import('./RunTrackerMap'), { ssr: false });

// Haversine formula to calculate distance between two lat/lng points (km)
function haversineDistance(a: [number, number], b: [number, number]): number {
    const R = 6371;
    const dLat = (b[0] - a[0]) * (Math.PI / 180);
    const dLon = (b[1] - a[1]) * (Math.PI / 180);
    const lat1 = a[0] * (Math.PI / 180);
    const lat2 = b[0] * (Math.PI / 180);
    const aV = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(aV), Math.sqrt(1 - aV));
}

function formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

interface RunTrackerProps {
    onRunComplete?: (data: { distance: number; duration: number; path: [number, number][] }) => void;
}

export default function RunTracker({ onRunComplete }: RunTrackerProps) {
    const [isTracking, setIsTracking] = useState(false);
    const [path, setPath] = useState<[number, number][]>([]);
    const [distance, setDistance] = useState(0);
    const [elapsed, setElapsed] = useState(0);
    const [geoError, setGeoError] = useState<string | null>(null);
    const [accuracy, setAccuracy] = useState<number | null>(null);
    const [speed, setSpeed] = useState<number | null>(null);

    const watchIdRef = useRef<number | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const lastPointRef = useRef<[number, number] | null>(null);

    const pace = elapsed > 0 && distance > 0 ? elapsed / 60 / distance : null;

    const startTracking = useCallback(() => {
        if (!navigator.geolocation) {
            setGeoError('Geolocation is not supported by this browser.');
            return;
        }
        setGeoError(null);
        setIsTracking(true);
        setPath([]);
        setDistance(0);
        setElapsed(0);
        lastPointRef.current = null;

        // Start timer
        timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);

        // Watch position
        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                const coord: [number, number] = [pos.coords.latitude, pos.coords.longitude];
                setAccuracy(pos.coords.accuracy);
                setSpeed(pos.coords.speed);

                setPath(prev => {
                    if (lastPointRef.current) {
                        const d = haversineDistance(lastPointRef.current, coord);
                        if (d < 0.005) return prev; // skip if < 5m to reduce noise
                        setDistance(dist => dist + d);
                    }
                    lastPointRef.current = coord;
                    return [...prev, coord];
                });
            },
            (err) => setGeoError(`Location error: ${err.message}`),
            { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
        );
    }, []);

    const stopTracking = useCallback(() => {
        setIsTracking(false);
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        if (onRunComplete && path.length > 0) {
            onRunComplete({ distance, duration: Math.round(elapsed / 60), path });
        }
    }, [distance, elapsed, path, onRunComplete]);

    useEffect(() => () => {
        if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current!);
        if (timerRef.current) clearInterval(timerRef.current!);
    }, []);

    const statVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: (i: number) => ({
            opacity: 1, y: 0, scale: 1,
            transition: { delay: i * 0.08, type: 'spring' as const, stiffness: 200, damping: 18 },
        }),
    };

    const stats = [
        { label: 'Distance', value: `${distance.toFixed(2)} km`, icon: MapPin, color: '#00ff88', glow: 'rgba(0,255,136,0.25)' },
        { label: 'Duration', value: formatTime(elapsed), icon: Timer, color: '#00c9ff', glow: 'rgba(0,201,255,0.25)' },
        { label: 'Pace', value: pace ? `${Math.floor(pace)}:${String(Math.round((pace % 1) * 60)).padStart(2, '0')} /km` : '--:--', icon: Zap, color: '#ffa502', glow: 'rgba(255,165,2,0.25)' },
        { label: 'Speed', value: speed != null ? `${(speed * 3.6).toFixed(1)} km/h` : '0.0 km/h', icon: Flame, color: '#ff6b6b', glow: 'rgba(255,107,107,0.25)' },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: isTracking ? 'rgba(0,255,136,0.2)' : 'rgba(255,255,255,0.06)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: isTracking ? '0 0 20px rgba(0,255,136,0.3)' : 'none',
                        transition: 'all 0.4s ease',
                    }}>
                        <Navigation size={20} color={isTracking ? '#00ff88' : '#8b8b9e'} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Live Run Tracker</h2>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                            {isTracking ? `GPS Active · ${accuracy ? `±${Math.round(accuracy)}m accuracy` : 'Acquiring...'}` : 'Start to track your route'}
                        </p>
                    </div>
                </div>

                <motion.button
                    onClick={isTracking ? stopTracking : startTracking}
                    whileTap={{ scale: 0.94 }}
                    whileHover={{ scale: 1.04 }}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '11px 22px', borderRadius: 12, border: 'none',
                        cursor: 'pointer', fontWeight: 700, fontSize: 15,
                        background: isTracking
                            ? 'linear-gradient(135deg, #ff4757 0%, #c0392b 100%)'
                            : 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
                        color: isTracking ? '#fff' : '#0a0a0f',
                        boxShadow: isTracking ? '0 4px 20px rgba(255,71,87,0.4)' : '0 4px 20px rgba(0,255,136,0.4)',
                        transition: 'background 0.3s ease, box-shadow 0.3s ease',
                    }}
                >
                    {isTracking ? <><Square size={16} fill="currentColor" /> Stop</> : <><Play size={16} fill="currentColor" /> Start Run</>}
                </motion.button>
            </motion.div>

            {/* Error Banner */}
            <AnimatePresence>
                {geoError && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(255,71,87,0.12)', border: '1px solid rgba(255,71,87,0.3)', color: '#ff4757', fontSize: 14 }}
                    >
                        ⚠️ {geoError}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Live Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                {stats.map((s, i) => (
                    <motion.div
                        key={s.label}
                        custom={i}
                        variants={statVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover={{ scale: 1.03, rotateX: -3, rotateY: 3 }}
                        style={{
                            padding: '18px 20px',
                            borderRadius: 14,
                            background: 'rgba(255,255,255,0.04)',
                            border: `1px solid rgba(255,255,255,0.07)`,
                            backdropFilter: 'blur(20px)',
                            cursor: 'default',
                            transformStyle: 'preserve-3d',
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                        {/* glow blob */}
                        <div style={{
                            position: 'absolute', top: -20, right: -20, width: 80, height: 80,
                            borderRadius: '50%', background: s.glow, filter: 'blur(20px)', pointerEvents: 'none',
                        }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <s.icon size={15} color={s.color} />
                            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</span>
                        </div>
                        <motion.p
                            key={s.value}
                            initial={{ opacity: 0.5, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{ fontSize: 22, fontWeight: 800, color: s.color, lineHeight: 1 }}
                        >
                            {s.value}
                        </motion.p>
                    </motion.div>
                ))}
            </div>

            {/* Map */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{
                    height: 380,
                    borderRadius: 16,
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: isTracking ? '0 0 0 2px rgba(0,255,136,0.3), 0 20px 60px rgba(0,0,0,0.4)' : '0 20px 60px rgba(0,0,0,0.3)',
                    position: 'relative',
                    transition: 'box-shadow 0.4s ease',
                }}
            >
                {/* Tracking badge overlay */}
                <AnimatePresence>
                    {isTracking && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            style={{
                                position: 'absolute', top: 12, left: 12, zIndex: 1000,
                                background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)',
                                padding: '6px 12px', borderRadius: 8,
                                display: 'flex', alignItems: 'center', gap: 7,
                                border: '1px solid rgba(0,255,136,0.3)',
                            }}
                        >
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00ff88', display: 'inline-block', animation: 'mapPulse 2s infinite' }} />
                            <span style={{ color: '#00ff88', fontSize: 12, fontWeight: 700 }}>LIVE TRACKING</span>
                        </motion.div>
                    )}
                </AnimatePresence>
                <RunTrackerMap path={path} isTracking={isTracking} />
            </motion.div>
        </div>
    );
}
