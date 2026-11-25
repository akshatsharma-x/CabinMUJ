import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/admin/LoginForm';
import { adminSetupProblem, getAdminSession, safeAdminPath } from '@/lib/server/session';

export const metadata: Metadata = {
  title: 'Admin Login',
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ next?: string | string[] }> };

export default async function AdminLoginPage({ searchParams }: Props) {
  const { next } = await searchParams;
  const destination = safeAdminPath(Array.isArray(next) ? next[0] : next);
  if (await getAdminSession()) redirect(destination);

  return (
    <div className="container py-16" style={{ maxWidth: '420px' }}>
      <div className="card p-8 animate-fade-in">
        <div className="text-center mb-6">
          <div aria-hidden style={{ fontSize: '2.25rem', marginBottom: '0.75rem' }}>🔒</div>
          <h1 className="h3 mb-1">Admin sign in</h1>
          <p className="text-sm text-muted">Manage faculty information and student update requests.</p>
        </div>
        <LoginForm next={destination} setupProblem={adminSetupProblem()} />
      </div>
    </div>
  );
}
