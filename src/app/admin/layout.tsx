'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setIsClient(true);
    const auth = sessionStorage.getItem('adminAuth');
    if (auth === 'true') setIsAuthenticated(true);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === 'admin123') {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuth', 'true');
      setError('');
    } else {
      setError('Invalid PIN. Hint: try admin123');
    }
  };

  if (!isClient) return null;

  if (!isAuthenticated) {
    return (
      <AppShell>
        <div className="container py-20" style={{ maxWidth: '400px' }}>
          <div className="card p-8 text-center animate-fade-in">
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔒</div>
            <h1 className="h3 mb-1">Admin Access</h1>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Enter registrar PIN to continue.</p>
            <form onSubmit={handleLogin} className="flex flex-col gap-3">
              <input
                type="password"
                placeholder="Enter PIN"
                className="input text-center text-xl"
                style={{ letterSpacing: '0.2em', padding: '0.75rem' }}
                value={pin}
                onChange={e => setPin(e.target.value)}
                autoFocus
              />
              {error && <p className="text-sm" style={{ color: '#DC2626' }}>{error}</p>}
              <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem', borderRadius: '8px' }}>Unlock</button>
            </form>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      {/* Admin Bar */}
      <div style={{
        background: 'var(--muj-orange)', color: '#fff', padding: '0.5rem 0',
        fontSize: '0.75rem', fontWeight: 600
      }}>
        <div className="container flex justify-between items-center">
          <span>⚙️ CABINMUJ ADMIN PORTAL</span>
          <button
            onClick={() => { sessionStorage.removeItem('adminAuth'); setIsAuthenticated(false); }}
            style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500 }}
          >
            Logout
          </button>
        </div>
      </div>
      {children}
    </AppShell>
  );
}
