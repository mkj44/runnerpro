'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getOverview, updateProfile } from '@/lib/api';
import { User, Save, MapPin, Flame, Activity, Award } from 'lucide-react';

export default function ProfilePage() {
    const { user, loading: authLoading, login } = useAuth();
    const router = useRouter();
    const [form, setForm] = useState({ name: '', weight: 70, age: 25, bio: '', weeklyGoal: 30 });
    const [allTime, setAllTime] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) { router.push('/auth/login'); return; }
        if (user) {
            setForm({ name: user.name, weight: (user as any).weight || 70, age: (user as any).age || 25, bio: (user as any).bio || '', weeklyGoal: user.weeklyGoal || 30 });
            getOverview().then(res => setAllTime(res.data.allTime)).catch(console.error);
        }
    }, [user, authLoading, router]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data } = await updateProfile(form);
            login(localStorage.getItem('runnerpro_token')!, { ...user!, ...data });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) { console.error(err); }
        setSaving(false);
    };

    if (authLoading) return null;

    const stats = allTime ? [
        { label: 'Total Runs', value: allTime.count, icon: Activity, color: '#00c9ff' },
        { label: 'Total Distance', value: `${allTime.distance} km`, icon: MapPin, color: '#00ff88' },
        { label: 'Total Calories', value: allTime.calories, icon: Flame, color: '#ff6b6b' },
        { label: 'Avg Pace', value: allTime.avgPace ? `${allTime.avgPace.toFixed(1)} min/km` : '-', icon: Award, color: '#ffa502' },
    ] : [];

    return (
        <div className="page-container">
            <div className="fade-in" style={{ marginBottom: 36 }}>
                <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
                    <User size={28} style={{ display: 'inline', verticalAlign: 'middle' }} /> Profile
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>Manage your account and view lifetime stats</p>
            </div>

            {/* Lifetime Stats */}
            {stats.length > 0 && (
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: 16, marginBottom: 32,
                }}>
                    {stats.map((s, i) => (
                        <div key={i} className={`glass-card fade-in-delay-${Math.min(i + 1, 4)}`} style={{
                            padding: 24, textAlign: 'center',
                        }}>
                            <s.icon size={24} color={s.color} style={{ margin: '0 auto 12px' }} />
                            <p style={{ fontSize: 28, fontWeight: 800 }}>{s.value}</p>
                            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{s.label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Profile Form */}
            <form onSubmit={handleSave} className="glass-card fade-in-delay-2" style={{
                padding: 36, maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 20,
            }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Edit Profile</h3>

                <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Name</label>
                    <input className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Weight (kg)</label>
                        <input className="input-field" type="number" value={form.weight} onChange={e => setForm({ ...form, weight: Number(e.target.value) })} min={30} max={200} />
                    </div>
                    <div>
                        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Age</label>
                        <input className="input-field" type="number" value={form.age} onChange={e => setForm({ ...form, age: Number(e.target.value) })} min={10} max={100} />
                    </div>
                </div>

                <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Weekly Goal (km)</label>
                    <input className="input-field" type="number" value={form.weeklyGoal} onChange={e => setForm({ ...form, weeklyGoal: Number(e.target.value) })} min={1} />
                </div>

                <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Bio</label>
                    <textarea className="input-field" placeholder="Tell us about your running journey..." value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} style={{ minHeight: 80, resize: 'vertical' }} />
                </div>

                <button type="submit" className="btn-primary" disabled={saving} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Save size={18} />
                    {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Profile'}
                </button>
            </form>
        </div>
    );
}
