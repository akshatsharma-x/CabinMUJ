'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="glass-header relative" style={{ position: 'sticky', top: 0, zIndex: 50, padding: '1rem 0' }}>
      <div className="container flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }} onClick={closeMenu}>
          <div style={{ backgroundColor: 'var(--muj-orange)', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
            C
          </div>
          <span className="font-bold text-xl" style={{ color: 'var(--text-primary)' }}>CabinMUJ</span>
        </Link>
        
        {/* Desktop Links */}
        <div className="hidden md:flex gap-6 items-center" style={{ fontSize: '0.875rem', fontWeight: 500 }}>
          <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }} className="hover:text-muj-orange transition-colors">Home</Link>
          <Link href="/faculty" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }} className="hover:text-muj-orange transition-colors">Faculty Directory</Link>
          <Link href="/departments" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }} className="hover:text-muj-orange transition-colors">Departments</Link>
          <Link href="/blocks" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }} className="hover:text-muj-orange transition-colors">Campus Map</Link>
          <Link href="/report" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }} className="hover:text-muj-orange transition-colors">Report Update</Link>
          <Link href="/admin" className="btn btn-primary" style={{ borderRadius: '9999px', padding: '0.5rem 1.5rem' }}>Admin</Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button 
          className="md:hidden flex flex-col gap-1 justify-center items-center w-8 h-8"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle Menu"
        >
          <span className={`block w-6 h-0.5 bg-current transition-transform ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} style={{ backgroundColor: 'var(--text-primary)' }}></span>
          <span className={`block w-6 h-0.5 bg-current transition-opacity ${isMenuOpen ? 'opacity-0' : ''}`} style={{ backgroundColor: 'var(--text-primary)' }}></span>
          <span className={`block w-6 h-0.5 bg-current transition-transform ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} style={{ backgroundColor: 'var(--text-primary)' }}></span>
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 glass-header border-b shadow-lg animate-fade-in" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
          <div className="flex flex-col p-4 gap-4 text-center font-medium">
            <Link href="/" onClick={closeMenu} className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" style={{ color: 'var(--text-primary)' }}>Home</Link>
            <Link href="/faculty" onClick={closeMenu} className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" style={{ color: 'var(--text-primary)' }}>Faculty Directory</Link>
            <Link href="/departments" onClick={closeMenu} className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" style={{ color: 'var(--text-primary)' }}>Departments</Link>
            <Link href="/blocks" onClick={closeMenu} className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" style={{ color: 'var(--text-primary)' }}>Campus Map</Link>
            <Link href="/report" onClick={closeMenu} className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" style={{ color: 'var(--text-primary)' }}>Report Update</Link>
            <div className="border-t pt-4 mt-2" style={{ borderColor: 'var(--border-color)' }}>
               <Link href="/admin" onClick={closeMenu} className="btn btn-primary w-full">Admin Portal</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
