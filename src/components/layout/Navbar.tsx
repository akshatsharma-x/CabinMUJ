import React from 'react';
import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="glass-header" style={{ position: 'sticky', top: 0, zIndex: 50, padding: '1rem 0' }}>
      <div className="container flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
          <div style={{ backgroundColor: 'var(--muj-orange)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
            C
          </div>
          <span className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>CabinMUJ</span>
        </Link>
        
        <div className="flex gap-6 items-center" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
          <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Home</Link>
          <Link href="/faculty" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Faculty Directory</Link>
          <Link href="/departments" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Departments</Link>
          <Link href="/blocks" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Campus Map</Link>
          <Link href="/report" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Report Update</Link>
        </div>
        
        <div>
          <button className="btn btn-primary" style={{ borderRadius: '9999px', padding: '0.5rem 1.5rem' }}>Sign In</button>
        </div>
      </div>
    </nav>
  );
}
