'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AdminTabs({ pending }: { pending: number }) {
  const pathname = usePathname();
  const tabs = [
    { href: '/admin', label: 'Dashboard', exact: true },
    { href: '/admin/faculty', label: 'Faculty' },
    { href: '/admin/requests', label: 'Requests', count: pending },
    { href: '/admin/history', label: 'History' },
  ];
  return (
    <nav className="admin-tabs" aria-label="Admin">
      {tabs.map(t => {
        const active = t.exact ? pathname === t.href : pathname === t.href || pathname.startsWith(`${t.href}/`);
        return (
          <Link key={t.href} href={t.href} className={`admin-tab ${active ? 'admin-tab-active' : ''}`} aria-current={active ? 'page' : undefined}>
            {t.label}
            {t.count ? <span className="admin-count" aria-label={`${t.count} pending`}>{t.count}</span> : null}
          </Link>
        );
      })}
      <Link href="/" className="admin-tab">View site ↗</Link>
    </nav>
  );
}
