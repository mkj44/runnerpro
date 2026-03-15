'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await loginUser({ email, password });
            login(data.token, data.user);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
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
            <div className="glass-card fade-in" style={{
                padding: 48, width: '100%', maxWidth: 440,
            }}>
                <div style={{ textAlign: 'center', marginBottom: 36 }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>🏃</div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Welcome Back</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Log in to your RunnerPro account</p>
                </div>

                {error && (
                    <div style={{
                        padding: 14, borderRadius: 12, marginBottom: 20,
                        background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.2)',
                        color: 'var(--danger)', fontSize: 14, textAlign: 'center',
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Email</label>
                        <input className="input-field" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div>
                        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Password</label>
                        <input className="input-field" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 8, width: '100%', opacity: loading ? 0.7 : 1 }}>
                        {loading ? 'Logging in...' : 'Log In →'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: 28, fontSize: 14, color: 'var(--text-secondary)' }}>
                    Don&apos;t have an account?{' '}
                    <Link href="/auth/register" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
}
