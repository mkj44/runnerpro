'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Activity, BarChart3, Brain, Home, LogOut, Plus, User, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const { user, logout, loading } = useAuth();
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    if (loading) return null;

    const isAuthPage = pathname?.startsWith('/auth');
    if (isAuthPage) return null;

    const navLinks = [
        { href: '/dashboard', label: 'Dashboard', icon: Home },
        { href: '/log-run', label: 'Log Run', icon: Plus },
        { href: '/activity', label: 'Activity', icon: Activity },
        { href: '/stats', label: 'Stats', icon: BarChart3 },
        { href: '/ai-coach', label: 'AI Coach', icon: Brain },
        { href: '/profile', label: 'Profile', icon: User },
    ];

    if (!user) {
        return (
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, height: 72, zIndex: 100,
                background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 32px',
            }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: 'linear-gradient(135deg, #00ff88, #00c9ff)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20, fontWeight: 900,
                    }}>🏃</div>
                    <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
                        Runner<span style={{ color: 'var(--accent)' }}>Pro</span>
                    </span>
                </Link>
                <div style={{ display: 'flex', gap: 12 }}>
                    <Link href="/auth/login">
                        <button className="btn-secondary" style={{ padding: '10px 20px', fontSize: 14 }}>Log In</button>
                    </Link>
                    <Link href="/auth/register">
                        <button className="btn-primary" style={{ padding: '10px 20px', fontSize: 14 }}>Sign Up</button>
                    </Link>
                </div>
            </nav>
        );
    }

    return (
        <>
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, height: 72, zIndex: 100,
                background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 24px',
            }}>
                <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                    <div style={{
                        width: 38, height: 38, borderRadius: 10,
                        background: 'linear-gradient(135deg, #00ff88, #00c9ff)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18,
                    }}>🏃</div>
                    <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
                        Runner<span style={{ color: 'var(--accent)' }}>Pro</span>
                    </span>
                </Link>

                {/* Desktop nav */}
                <div className="desktop-nav" style={{
                    display: 'flex', gap: 4, alignItems: 'center',
                }}>
                    {navLinks.map(({ href, label, icon: Icon }) => (
                        <Link key={href} href={href} style={{
                            padding: '8px 16px', borderRadius: 10, textDecoration: 'none',
                            display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 500,
                            color: pathname === href ? 'var(--accent)' : 'var(--text-secondary)',
                            background: pathname === href ? 'var(--accent-glow)' : 'transparent',
                            transition: 'all 0.2s ease',
                        }}>
                            <Icon size={18} />
                            <span className="nav-label">{label}</span>
                        </Link>
                    ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }} className="nav-label">
                        {user.name}
                    </span>
                    <button onClick={logout} style={{
                        background: 'none', border: 'none', color: 'var(--text-secondary)',
                        cursor: 'pointer', padding: 8, borderRadius: 8, display: 'flex',
                        transition: 'color 0.2s',
                    }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                    >
                        <LogOut size={20} />
                    </button>
                    {/* Mobile menu button */}
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        style={{
                            background: 'none', border: 'none', color: 'var(--text-secondary)',
                            cursor: 'pointer', padding: 4, display: 'none',
                        }}
                    >
                        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* Mobile nav overlay */}
            {mobileOpen && (
                <div style={{
                    position: 'fixed', top: 72, left: 0, right: 0, bottom: 0, zIndex: 99,
                    background: 'rgba(10,10,15,0.95)', backdropFilter: 'blur(20px)',
                    padding: 24, display: 'flex', flexDirection: 'column', gap: 8,
                }}>
                    {navLinks.map(({ href, label, icon: Icon }) => (
                        <Link key={href} href={href} onClick={() => setMobileOpen(false)} style={{
                            padding: '16px 20px', borderRadius: 12, textDecoration: 'none',
                            display: 'flex', alignItems: 'center', gap: 12, fontSize: 16, fontWeight: 500,
                            color: pathname === href ? 'var(--accent)' : 'var(--text-secondary)',
                            background: pathname === href ? 'var(--accent-glow)' : 'var(--bg-card)',
                        }}>
                            <Icon size={22} /> {label}
                        </Link>
                    ))}
                </div>
            )}

            <style jsx global>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .nav-label { display: none; }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
        </>
    );
}
