import React from 'react';
import { Navbar } from './Navbar';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1, padding: '2rem 0' }}>
        {children}
      </main>
      <footer style={{ backgroundColor: 'var(--muj-dark)', color: 'var(--text-muted)', padding: '4rem 0' }}>
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-2">
             <div style={{ backgroundColor: 'var(--muj-orange)', width: '24px', height: '24px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '12px' }}>
              C
            </div>
            <span className="font-bold" style={{ color: 'white' }}>CabinMUJ</span>
          </div>
          <p className="text-sm">© {new Date().getFullYear()} CabinMUJ. Built with love for MUJians.</p>
        </div>
      </footer>
    </div>
  );
}
