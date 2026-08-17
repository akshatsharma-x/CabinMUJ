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
                  <div style={{
                    background: 'linear-gradient(135deg, var(--muj-orange), #F59E0B)',
                    width: '24px', height: '24px', borderRadius: '4px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: '11px'
                  }}>C</div>
                  <span className="font-bold" style={{ color: '#fff', fontSize: '0.9375rem' }}>CabinMUJ</span>
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
