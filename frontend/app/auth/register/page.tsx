'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function RegisterPage() {
    const [form, setForm] = useState({ name: '', email: '', password: '', weight: 70 });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await registerUser(form);
            login(data.token, data.user);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24,
            background: 'radial-gradient(ellipse at center, rgba(0,255,136,0.04) 0%, transparent 60%)',
        }}>
            <div className="glass-card fade-in" style={{ padding: 48, width: '100%', maxWidth: 440 }}>
                <div style={{ textAlign: 'center', marginBottom: 36 }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🏃</div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Create Account</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Join RunnerPro and start tracking</p>
                </div>

                {error && (
                    <div style={{
                        padding: 14, borderRadius: 12, marginBottom: 20,
                        background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.2)',
                        color: 'var(--danger)', fontSize: 14, textAlign: 'center',
                    }}>{error}</div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Full Name</label>
                        <input className="input-field" type="text" placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div>
                        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Email</label>
                        <input className="input-field" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                    </div>
                    <div>
                        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Password</label>
                        <input className="input-field" type="password" placeholder="Min 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
                    </div>
                    <div>
                        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Weight (kg) – for calorie calculation</label>
                        <input className="input-field" type="number" placeholder="70" value={form.weight} onChange={e => setForm({ ...form, weight: Number(e.target.value) })} required min={30} max={200} />
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 8, width: '100%', opacity: loading ? 0.7 : 1 }}>
                        {loading ? 'Creating Account...' : 'Sign Up →'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 28, fontSize: 14, color: 'var(--text-secondary)' }}>
                    Already have an account?{' '}
                    <Link href="/auth/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                        Log In
                    </Link>
                </p>
            </div>
        </div>
    );
}
