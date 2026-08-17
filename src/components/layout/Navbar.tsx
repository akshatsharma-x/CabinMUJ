'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const closeMenu = () => setIsMenuOpen(false);

  const links = [
    { href: '/', label: 'Home' },
    { href: '/faculty', label: 'Faculty Directory' },
    { href: '/departments', label: 'Departments' },
    { href: '/blocks', label: 'Campus Map' },
    { href: '/report', label: 'Report Update' },
    { href: '/about', label: 'About' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <nav className="navbar" style={{ height: '72px' }}>
      <div className="container flex items-center justify-between h-full max-w-[1200px] mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3" onClick={closeMenu}>
          <div className="logo-container" style={{
            background: '#E8612D',
            width: '40px', height: '40px', borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(232, 97, 45, 0.25)'
          }}>
            <svg className="logo-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle className="logo-dot" cx="8.5" cy="8.5" r="1.5" />
              <path className="logo-path" d="M 13.5 8.5 A 5 5 0 1 0 6 12.5 C 6 16.5 8 19.5 12 19.5" />
              <path className="logo-house" d="M 14.5 19.5 L 14.5 14.5 L 17.5 11.5 L 20.5 14.5 L 20.5 19.5 Z" />
              <path className="logo-door" d="M 16.5 19.5 L 16.5 17 A 1 1 0 0 1 18.5 17 L 18.5 19.5" />
            </svg>
          </div>
          <span className="font-extrabold tracking-tight" style={{ fontSize: '1.5rem', color: '#1F2937' }}>Cabin<span style={{ color: '#E8612D' }}>MUJ</span></span>
        </Link>

        {/* Desktop Nav & Actions */}
        <div className="hidden lg:flex items-center justify-between flex-1 ml-12">
          {/* Links */}
          <div className="flex items-center gap-1">
            {links.map(link => (
              <Link key={link.href} href={link.href}
                className={`nav-link ${isActive(link.href) ? 'nav-link-active text-muj-orange' : 'text-gray-600 hover:text-gray-900'}`}
                style={{ fontSize: '0.875rem', fontWeight: 600, padding: '0.5rem 0.75rem' }}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-full" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', width: '220px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>🔍</span>
              <input type="text" placeholder="Search faculty..." className="bg-transparent border-none outline-none text-sm w-full" style={{ color: 'var(--text-primary)' }} />
            </div>
            <Link href="/admin" className="font-medium text-white transition-opacity hover:opacity-90" style={{ background: '#1F2937', padding: '0.5rem 1.25rem', borderRadius: '24px', fontSize: '0.875rem' }}>
              Sign In
            </Link>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden flex flex-col gap-1.5 items-center justify-center"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menu"
          style={{ width: '32px', height: '32px', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <span style={{
            display: 'block', width: '20px', height: '2px', background: 'var(--text-primary)',
            transition: 'all 0.2s ease',
            transform: isMenuOpen ? 'rotate(45deg) translateY(5px)' : 'none'
          }} />
          <span style={{
            display: 'block', width: '20px', height: '2px', background: 'var(--text-primary)',
            transition: 'all 0.2s ease', opacity: isMenuOpen ? 0 : 1
          }} />
          <span style={{
            display: 'block', width: '20px', height: '2px', background: 'var(--text-primary)',
            transition: 'all 0.2s ease',
            transform: isMenuOpen ? 'rotate(-45deg) translateY(-5px)' : 'none'
          }} />
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="lg:hidden animate-fade-in" style={{
          position: 'absolute', top: '72px', left: 0, right: 0,
          background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)', zIndex: 100
        }}>
          <div className="flex flex-col p-4 gap-2">
            {links.map(link => (
              <Link key={link.href} href={link.href} onClick={closeMenu}
                className={`nav-link ${isActive(link.href) ? 'nav-link-active text-muj-orange' : 'text-gray-600'}`}
                style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>
                {link.label}
              </Link>
            ))}
            <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '0.5rem', paddingTop: '1rem', display: 'flex', flexDirection: 'col', gap: '1rem' }}>
              <div className="flex items-center gap-2 px-3 py-2 rounded-full w-full" style={{ background: 'var(--bg-muted)', border: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)' }}>🔍</span>
                <input type="text" placeholder="Search faculty..." className="bg-transparent border-none outline-none text-sm w-full" />
              </div>
              <Link href="/admin" onClick={closeMenu} className="btn w-full text-center mt-2" style={{ background: '#1F2937', color: 'white', padding: '0.75rem', borderRadius: '24px' }}>
                Sign In
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
