'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { logRun, predictCalories } from '@/lib/api';
import { Plus, Flame, Timer, MapPin } from 'lucide-react';

export default function LogRunPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [form, setForm] = useState({
        distance: '', duration: '', date: new Date().toISOString().split('T')[0],
        routeType: 'Road', notes: '', elevationGain: '', heartRate: '',
    });
    const [preview, setPreview] = useState({ pace: 0, calories: 0 });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) router.push('/auth/login');
    }, [user, authLoading, router]);

    // Live preview
    useEffect(() => {
        const dist = parseFloat(form.distance);
        const dur = parseFloat(form.duration);
        if (dist > 0 && dur > 0) {
            const pace = dur / dist;
            setPreview({ pace, calories: 0 });
            predictCalories({ distance: dist, pace }).then(res => {
                setPreview({ pace, calories: res.data.calories });
            }).catch(() => { });
        }
    }, [form.distance, form.duration]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await logRun({
                distance: parseFloat(form.distance),
                duration: parseFloat(form.duration),
                date: form.date,
                routeType: form.routeType,
                notes: form.notes,
                elevationGain: form.elevationGain ? parseFloat(form.elevationGain) : 0,
                heartRate: form.heartRate ? parseFloat(form.heartRate) : 0,
            });
            setSuccess(true);
            setTimeout(() => router.push('/dashboard'), 1500);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to log run');
        } finally {
            setSubmitting(false);
        }
    };

    const formatPace = (p: number) => {
        const m = Math.floor(p);
        const s = Math.round((p - m) * 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    if (success) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
                <div className="glass-card glow-accent" style={{ padding: 48, textAlign: 'center' }}>
                    <div style={{ fontSize: 60, marginBottom: 16 }}>✅</div>
                    <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Run Logged!</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
                <h1 className="fade-in" style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
                    <Plus size={28} style={{ display: 'inline', verticalAlign: 'middle' }} /> Log a Run
                </h1>
                <p className="fade-in" style={{ color: 'var(--text-secondary)', marginBottom: 36 }}>
                    Record your run details and get AI-powered insights
                </p>

                {/* Live Preview */}
                {preview.pace > 0 && (
                    <div className="glass-card glow-accent fade-in" style={{
                        padding: 24, marginBottom: 28,
                        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, textAlign: 'center',
                    }}>
                        <div>
                            <MapPin size={20} color="var(--accent)" style={{ margin: '0 auto 8px' }} />
                            <p style={{ fontSize: 22, fontWeight: 800 }}>{form.distance} km</p>
                            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Distance</p>
                        </div>
                        <div>
                            <Timer size={20} color="#ffa502" style={{ margin: '0 auto 8px' }} />
                            <p style={{ fontSize: 22, fontWeight: 800 }}>{formatPace(preview.pace)}</p>
                            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Pace /km</p>
                        </div>
                        <div>
                            <Flame size={20} color="#ff6b6b" style={{ margin: '0 auto 8px' }} />
                            <p style={{ fontSize: 22, fontWeight: 800 }}>{preview.calories}</p>
                            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Calories</p>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="glass-card fade-in-delay-1" style={{
                    padding: 36, display: 'flex', flexDirection: 'column', gap: 20,
                }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Distance (km) *</label>
                            <input className="input-field" type="number" step="0.01" min="0.1" placeholder="5.0" value={form.distance} onChange={e => setForm({ ...form, distance: e.target.value })} required />
                        </div>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Duration (min) *</label>
                            <input className="input-field" type="number" step="0.1" min="1" placeholder="30" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} required />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Date</label>
                            <input className="input-field" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Route Type</label>
                            <select className="input-field" value={form.routeType} onChange={e => setForm({ ...form, routeType: e.target.value })}>
                                <option value="Road">🛣️ Road</option>
                                <option value="Trail">🌲 Trail</option>
                                <option value="Track">🏟️ Track</option>
                                <option value="Treadmill">🏃 Treadmill</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Elevation Gain (m)</label>
                            <input className="input-field" type="number" placeholder="0" value={form.elevationGain} onChange={e => setForm({ ...form, elevationGain: e.target.value })} />
                        </div>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Avg Heart Rate (bpm)</label>
                            <input className="input-field" type="number" placeholder="145" value={form.heartRate} onChange={e => setForm({ ...form, heartRate: e.target.value })} />
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Notes</label>
                        <textarea className="input-field" placeholder="How did the run feel? Any observations..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                            style={{ minHeight: 80, resize: 'vertical' }} />
                    </div>

                    <button type="submit" className="btn-primary" disabled={submitting} style={{ width: '100%', padding: '16px', fontSize: 16, marginTop: 8 }}>
                        {submitting ? 'Logging...' : '🏃 Log This Run'}
                    </button>
                </form>
            </div>
        </div>
    );
}
