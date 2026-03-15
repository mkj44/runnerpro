'use client';
import Link from 'next/link';
import { Activity, BarChart3, Brain, Flame, MapPin, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.push('/dashboard');
  }, [user, loading, router]);

  if (loading) return null;

  const features = [
    { icon: MapPin, title: 'Track Every Run', desc: 'Log distance, duration, pace, and route type. See your running history at a glance.' },
    { icon: Flame, title: 'Calorie Tracking', desc: 'AI-powered MET-based calorie burn calculation personalized to your weight and pace.' },
    { icon: Zap, title: 'Pace Zones', desc: 'Automatically classify your runs into zones — from easy recovery to race pace.' },
    { icon: BarChart3, title: 'Smart Analytics', desc: 'Weekly and monthly charts showing trends in distance, calories, and pace.' },
    { icon: Brain, title: 'AI Coach', desc: 'Get personalized training tips, recovery advice, and training plans based on your data.' },
    { icon: Activity, title: 'Activity Feed', desc: 'Strava-style feed of all your runs with detailed metrics and insights.' },
  ];

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero */}
      <section style={{
        minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '80px 24px 60px',
        background: 'radial-gradient(ellipse at top, rgba(0,255,136,0.06) 0%, transparent 60%)',
      }}>
        <div className="fade-in" style={{ maxWidth: 800 }}>
          <div style={{
            display: 'inline-block', padding: '8px 20px', borderRadius: 50,
            background: 'var(--accent-glow)', border: '1px solid rgba(0,255,136,0.2)',
            fontSize: 13, fontWeight: 600, color: 'var(--accent)', marginBottom: 32,
            letterSpacing: '0.5px',
          }}>
            AI-Powered Running Tracker ⚡
          </div>
          <h1 style={{
            fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 900, lineHeight: 1.1,
            marginBottom: 24,
          }}>
            Run Smarter.<br />
            <span className="gradient-text">Train Better.</span>
          </h1>
          <p style={{
            fontSize: 'clamp(16px, 2vw, 20px)', color: 'var(--text-secondary)',
            maxWidth: 560, margin: '0 auto 44px', lineHeight: 1.6,
          }}>
            Track every run, analyze your pace zones, burn calories smarter, and get AI-powered coaching — all in one beautiful app.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/register">
              <button className="btn-primary pulse-glow" style={{ padding: '16px 36px', fontSize: 16 }}>
                Get Started Free →
              </button>
            </Link>
            <Link href="/auth/login">
              <button className="btn-secondary" style={{ padding: '16px 36px', fontSize: 16 }}>
                Log In
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{
          textAlign: 'center', fontSize: 36, fontWeight: 800, marginBottom: 16,
        }}>
          Everything You Need to
          <span className="gradient-text"> Level Up</span>
        </h2>
        <p style={{
          textAlign: 'center', fontSize: 17, color: 'var(--text-secondary)',
          maxWidth: 500, margin: '0 auto 56px',
        }}>
          Built for runners who want data-driven training with AI intelligence.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 20,
        }}>
          {features.map((f, i) => (
            <div key={i} className={`glass-card fade-in-delay-${Math.min(i + 1, 4)}`} style={{
              padding: 32, display: 'flex', flexDirection: 'column', gap: 16,
            }}>
              <div style={{
                width: 50, height: 50, borderRadius: 14,
                background: 'var(--accent-glow)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <f.icon size={24} color="var(--accent)" />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700 }}>{f.title}</h3>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '80px 24px', textAlign: 'center',
        background: 'radial-gradient(ellipse at bottom, rgba(0,255,136,0.06) 0%, transparent 60%)',
      }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 20 }}>
          Start Running <span className="gradient-text">Smarter</span> Today
        </h2>
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 36 }}>
          Join RunnerPro and unlock your full potential.
        </p>
        <Link href="/auth/register">
          <button className="btn-primary pulse-glow" style={{ padding: '18px 48px', fontSize: 17 }}>
            Create Free Account 🏃
          </button>
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '32px 24px', textAlign: 'center',
        borderTop: '1px solid var(--border)', fontSize: 14,
        color: 'var(--text-secondary)',
      }}>
        © 2024 RunnerPro — Built with AI ⚡
      </footer>
    </div>
  );
}
