import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'RunnerPro – AI Running Tracker',
  description: 'Track your runs, monitor pace, calories, and get AI coaching insights. The ultimate running companion.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main style={{ paddingTop: '72px', minHeight: '100vh' }}>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
