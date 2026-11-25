'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const LINKS = [
  { href: '/', label: 'Home', mobileOnly: true },
  { href: '/faculty', label: 'Faculty Directory' },
  { href: '/departments', label: 'Departments' },
  { href: '/blocks', label: 'Campus Map' },
  { href: '/report', label: 'Report Update' },
  { href: '/about', label: 'About' },
];

export function Navbar({ isAdmin }: { isAdmin: boolean }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  // Close the mobile menu whenever the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setIsMenuOpen(false);
  }

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    setIsMenuOpen(false);
    router.push(q ? `/faculty?search=${encodeURIComponent(q)}` : '/faculty');
  };

  const adminLabel = isAdmin ? 'Admin Panel' : 'Admin Login';

  const searchBox = (id: string) => (
    <form role="search" onSubmit={submitSearch} className="nav-search-box w-full">
      <label htmlFor={id} className="sr-only">Search faculty</label>
      <span aria-hidden style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>🔍</span>
      <input
        id={id}
        type="search"
        placeholder="Search faculty or cabin…"
        value={query}
        onChange={e => setQuery(e.target.value)}
        enterKeyHint="search"
      />
    </form>
  );

  return (
    <nav className="navbar" style={{ height: '72px' }} aria-label="Main">
      <div className="container flex items-center justify-between h-full" style={{ maxWidth: '1200px' }}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0" onClick={closeMenu} aria-label="CabinMUJ home">
          <div className="logo-container" style={{
            background: '#E8612D',
            width: '40px', height: '40px', borderRadius: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(232, 97, 45, 0.25)'
          }}>
            <svg className="logo-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path className="logo-path" d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <path className="logo-house" d="M9 10.5L12 7.5L15 10.5V13.5H9V10.5Z" />
            </svg>
          </div>
          <span className="font-black tracking-tight" style={{ fontSize: '1.5rem', color: '#1F2937' }}>Cabin<span style={{ color: '#E8612D' }}>MUJ</span></span>
        </Link>

        {/* Desktop nav (≥1024px) */}
        <div className="nav-desktop items-center justify-between flex-1" style={{ marginLeft: '2rem', gap: '1rem' }}>
          <div className="flex items-center gap-1">
            {LINKS.filter(l => !l.mobileOnly).map(link => (
              <Link key={link.href} href={link.href}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={`nav-link ${isActive(link.href) ? 'nav-link-active' : ''}`}
                style={{ fontSize: '0.875rem', fontWeight: 600, padding: '0.5rem 0.75rem', whiteSpace: 'nowrap' }}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="nav-search" style={{ width: '220px' }}>{searchBox('nav-search')}</div>
            <Link href="/admin" className="nav-admin-btn">
              {isAdmin && <span aria-hidden style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ADE80' }} />}
              {adminLabel}
            </Link>
          </div>
        </div>

        {/* Mobile toggle (<1024px) */}
        <button
          type="button"
          className="nav-toggle flex-col items-center justify-center"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          style={{ width: '40px', height: '40px', gap: '4px', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          {[0, 1, 2].map(i => (
            <span key={i} style={{
              display: 'block', width: '22px', height: '2px', borderRadius: '2px', background: 'var(--text-primary)',
              transition: 'all 0.2s ease',
              opacity: isMenuOpen && i === 1 ? 0 : 1,
              transform: isMenuOpen && i !== 1 ? `translateY(${i === 0 ? 6 : -6}px) rotate(${i === 0 ? 45 : -45}deg)` : 'none',
            }} />
          ))}
        </button>
      </div>

      {/* Mobile drawer */}
      {isMenuOpen && (
        <div id="mobile-menu" className="lg:hidden animate-fade-in" style={{
          position: 'absolute', top: '72px', left: 0, right: 0,
          background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)', zIndex: 100
        }}>
          <div className="flex flex-col p-4 gap-2">
            {searchBox('mobile-search')}
            {LINKS.map(link => (
              <Link key={link.href} href={link.href} onClick={closeMenu}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={`nav-link ${isActive(link.href) ? 'nav-link-active' : ''}`}
                style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.9375rem' }}>
                {link.label}
              </Link>
            ))}
            <Link href="/admin" onClick={closeMenu} className="nav-admin-btn justify-center mt-2" style={{ padding: '0.75rem' }}>
              {adminLabel}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
