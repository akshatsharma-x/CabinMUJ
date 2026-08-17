import React from 'react';
import Link from 'next/link';
import { Navbar } from './Navbar';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <footer style={{ background: 'var(--muj-dark)', color: '#ADB5BD', paddingTop: '3rem', paddingBottom: '2rem' }}>
        <div className="container">
          <div className="flex flex-col gap-8" style={{ marginBottom: '2rem' }}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Brand */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="logo-container" style={{
                    background: '#E8612D',
                    width: '28px', height: '28px', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(232, 97, 45, 0.25)'
                  }}>
                    <svg className="logo-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle className="logo-dot" cx="8.5" cy="8.5" r="1.5" />
                      <path className="logo-path" d="M 13.5 8.5 A 5 5 0 1 0 6 12.5 C 6 16.5 8 19.5 12 19.5" />
                      <path className="logo-house" d="M 14.5 19.5 L 14.5 14.5 L 17.5 11.5 L 20.5 14.5 L 20.5 19.5 Z" />
                      <path className="logo-door" d="M 16.5 19.5 L 16.5 17 A 1 1 0 0 1 18.5 17 L 18.5 19.5" />
                    </svg>
                  </div>
                  <span className="font-extrabold tracking-tight" style={{ color: '#fff', fontSize: '1.125rem' }}>Cabin<span style={{ color: '#E8612D' }}>MUJ</span></span>
                </div>
                <p style={{ fontSize: '0.8125rem', lineHeight: '1.5', maxWidth: '260px' }}>
                  Navigate campus and find faculty cabins at Manipal University Jaipur instantly.
                </p>
              </div>

              {/* Platform */}
              <div>
                <h4 className="font-semibold mb-3" style={{ color: '#fff', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Platform</h4>
                <div className="flex flex-col gap-2" style={{ fontSize: '0.8125rem' }}>
                  <Link href="/faculty" className="hover-bg-subtle" style={{ padding: '0.125rem 0', borderRadius: '4px' }}>Faculty Directory</Link>
                  <Link href="/departments" style={{ padding: '0.125rem 0' }}>Departments</Link>
                  <Link href="/blocks" style={{ padding: '0.125rem 0' }}>Campus Map</Link>
                </div>
              </div>

              {/* Resources */}
              <div>
                <h4 className="font-semibold mb-3" style={{ color: '#fff', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Resources</h4>
                <div className="flex flex-col gap-2" style={{ fontSize: '0.8125rem' }}>
                  <Link href="/report" style={{ padding: '0.125rem 0' }}>Report Update</Link>
                  <Link href="/admin" style={{ padding: '0.125rem 0' }}>Admin Portal</Link>
                </div>
              </div>

              {/* Contact */}
              <div>
                <h4 className="font-semibold mb-3" style={{ color: '#fff', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Contact</h4>
                <div className="flex flex-col gap-2" style={{ fontSize: '0.8125rem' }}>
                  <span>MUJ Campus, Jaipur</span>
                  <span>Rajasthan, India</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Bar (like screenshot) */}
          <div className="flex flex-wrap justify-around w-full" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem', paddingBottom: '0.5rem' }}>
            <div className="flex items-center gap-2" style={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--muj-orange)' }}></span>
              <span>500+ Faculty</span>
            </div>
            <div className="flex items-center gap-2" style={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--muj-orange)' }}></span>
              <span>14 Departments</span>
            </div>
            <div className="flex items-center gap-2" style={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--muj-orange)' }}></span>
              <span>6 Campus Buildings</span>
            </div>
            <div className="flex items-center gap-2" style={{ color: 'white', fontWeight: 600, fontSize: '0.875rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--muj-orange)' }}></span>
              <span>2,000+ Daily Searches</span>
            </div>
          </div>

          {/* Copyright */}
          <div className="flex flex-wrap justify-between items-center" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', fontSize: '0.75rem' }}>
            <span>© {new Date().getFullYear()} CabinMUJ. Built with ❤️ for MUJians.</span>
            <span>Campus Life · Student Community</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
