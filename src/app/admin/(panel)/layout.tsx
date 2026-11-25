import type { Metadata } from 'next';
import { AdminTabs } from '@/components/admin/AdminTabs';
import { ToastProvider } from '@/components/admin/Toast';
import { logout } from '@/lib/actions/admin';
import { getAdminSession } from '@/lib/server/session';
import { readDb } from '@/lib/server/store';

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · Admin | CabinMUJ' },
  robots: { index: false, follow: false },
};

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  // Each admin page checks the session itself (and redirects to login with the right
  // "next" path); the layout only decides whether to show the admin bar.
  const session = await getAdminSession();
  if (!session) return <>{children}</>;

  const pending = (await readDb({ maxAgeMs: 0 })).requests.filter(r => r.status === 'Pending').length;

  return (
    <ToastProvider>
      <div className="admin-bar">
        <div className="container admin-bar-inner">
          <AdminTabs pending={pending} />
          <div className="flex items-center gap-3 text-xs" style={{ padding: '0.5rem 0' }}>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}>
              Signed in as <strong style={{ color: '#fff' }}>{session.username}</strong>
            </span>
            <form action={logout}>
              <button type="submit" className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>
                Log out
              </button>
            </form>
          </div>
        </div>
      </div>
      {children}
    </ToastProvider>
  );
}
