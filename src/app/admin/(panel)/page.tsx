import type { Metadata } from 'next';
import Link from 'next/link';
import Form from 'next/form';
import { HistoryList } from '@/components/admin/HistoryList';
import { RestoreBackup } from '@/components/admin/RestoreBackup';
import { formatDateTime, hasLocation } from '@/lib/faculty-utils';
import { getAdminDb, toHistoryRows } from '@/lib/server/admin-data';
import { storageInfo } from '@/lib/server/store';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function AdminDashboard() {
  const { username, db } = await getAdminDb('/admin');
  const total = db.faculty.length;
  const verified = db.faculty.filter(f => f.locationVerified).length;
  const unverified = db.faculty.filter(f => hasLocation(f) && !f.locationVerified).length;
  const noLocation = db.faculty.filter(f => !hasLocation(f)).length;
  const pending = db.requests.filter(r => r.status === 'Pending');
  const departments = new Set(db.faculty.map(f => f.department).filter(Boolean)).size;
  const verifiedPct = total ? Math.round((verified / total) * 100) : 0;
  const names = new Map(db.faculty.map(f => [f.id, f.name]));
  const storage = storageInfo();

  return (
    <div className="container py-8">
      <div className="flex flex-wrap justify-between items-end mb-6 gap-4">
        <div>
          <h1 className="h2">Dashboard</h1>
          <p className="text-sm text-muted">Welcome back, {username}. Everything you change here is live for students right away.</p>
        </div>
        <Form action="/admin/faculty" className="flex gap-2" style={{ flex: '0 1 420px' }}>
          <input name="q" type="search" className="input" placeholder="Find a faculty member to edit…" aria-label="Find a faculty member to edit" />
          <button type="submit" className="btn btn-primary">Find</button>
        </Form>
      </div>

      {!storage.writable && (
        <div className="alert alert-error mb-6" role="alert">
          <strong>Saving is turned off on this server:</strong> it has no writable storage ({storage.label}), so edits and
          student reports can&apos;t be saved. On Vercel, connect <strong>Upstash Redis</strong> in your project&apos;s Storage tab and
          redeploy — see README.
        </div>
      )}

      {verified === 0 && total > 0 && (
        <div className="alert alert-warning mb-6">
          <strong>No cabin locations are verified yet.</strong> The imported block/floor/cabin values were generated as placeholders
          (see <code>scrape_faculties.py</code>), so students are told they&apos;re unverified. Work through them with the{' '}
          <Link href="/admin/faculty?status=unverified" className="font-semibold" style={{ textDecoration: 'underline' }}>Location unverified</Link>{' '}
          filter — one click marks a confirmed cabin as verified.
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in">
        <div className="card p-5">
          <p className="kpi-label">Faculty listed</p>
          <p className="kpi-value text-muj-orange">{total.toLocaleString('en-IN')}</p>
          <p className="text-xs text-muted mt-1">{departments} departments</p>
        </div>
        <Link href="/admin/faculty?status=unverified" className="card p-5 hover-lift">
          <p className="kpi-label">Locations verified</p>
          <p className="kpi-value" style={{ color: '#16A34A' }}>{verified}<span className="text-sm text-muted font-medium"> / {total}</span></p>
          <div className="progress mt-2" aria-label={`${verifiedPct}% verified`}><span style={{ width: `${verifiedPct}%` }} /></div>
          <p className="text-xs text-muted mt-2">{unverified} to check{noLocation ? ` · ${noLocation} without a location` : ''} →</p>
        </Link>
        <Link href="/admin/requests" className="card p-5 hover-lift" style={{ borderColor: pending.length ? 'var(--muj-orange)' : undefined }}>
          <p className="kpi-label">Pending reports</p>
          <p className="kpi-value" style={{ color: pending.length ? '#DC2626' : 'var(--text-primary)' }}>{pending.length}</p>
          <p className="text-xs text-muted mt-1">{pending.length ? 'Review now →' : 'All caught up'}</p>
        </Link>
        <Link href="/admin/history" className="card p-5 hover-lift">
          <p className="kpi-label">Changes logged</p>
          <p className="kpi-value">{db.history.length}</p>
          <p className="text-xs text-muted mt-1">{db.history[0] ? `Last: ${formatDateTime(db.history[0].at)}` : 'No edits yet'}</p>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in delay-100">
        {/* Quick actions */}
        <div className="card p-5">
          <h2 className="h4 mb-4">Quick actions</h2>
          <div className="flex flex-col gap-3">
            {[
              { href: '/admin/faculty/new', title: '➕ Add a faculty member', text: 'New joiner or someone missing from the list.' },
              { href: '/admin/faculty', title: '👨‍🏫 Edit or delete faculty', text: 'Search, update cabins, verify locations.' },
              { href: '/admin/requests', title: '📋 Review student reports', text: pending.length ? `${pending.length} waiting for you.` : 'Nothing waiting right now.' },
              { href: '/admin/history', title: '🕒 Change history & restore', text: 'See every edit; undo deletions.' },
            ].map(a => (
              <Link key={a.href} href={a.href} className="card p-4 hover-lift flex items-center justify-between">
                <div>
                  <p className="font-semibold">{a.title}</p>
                  <p className="text-xs text-muted">{a.text}</p>
                </div>
                <span aria-hidden className="text-muted">→</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Pending reports */}
        <div className="card p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="h4">Pending reports</h2>
            <Link href="/admin/requests" className="text-sm text-muj-orange font-semibold">View all →</Link>
          </div>
          {pending.length === 0 ? (
            <p className="text-sm text-center py-8 text-muted">No reports waiting. ✨</p>
          ) : (
            <div className="flex flex-col gap-3">
              {pending.slice(0, 5).map(r => (
                <div key={r.id} className="p-3 rounded flex items-center justify-between gap-3" style={{ background: 'var(--bg-subtle)', borderLeft: '3px solid #EAB308' }}>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{(r.facultyId && names.get(r.facultyId)) || r.facultyName || 'New faculty suggestion'}</p>
                    <p className="text-xs text-muted truncate">{r.issueType} → {r.proposedInformation}</p>
                  </div>
                  <Link
                    href={r.facultyId ? `/admin/faculty/${r.facultyId}?request=${r.id}&returnTo=${encodeURIComponent('/admin/requests')}` : `/admin/faculty/new?request=${r.id}`}
                    className="btn btn-sm btn-secondary shrink-0">
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Data & backups */}
      <div className="card p-5 mt-6 animate-fade-in delay-200">
        <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
          <div>
            <h2 className="h4">Data &amp; backups</h2>
            <p className="text-xs text-muted mt-1">
              Stored in: <strong>{storage.label}</strong>
            </p>
          </div>
          <a href="/admin/export" className="btn btn-secondary">⬇ Download backup (JSON)</a>
        </div>
        <RestoreBackup currentFaculty={total} />
      </div>

      {/* Recent changes */}
      <div className="card p-5 mt-6 animate-fade-in delay-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="h4">Recent changes</h2>
          <Link href="/admin/history" className="text-sm text-muj-orange font-semibold">Full history →</Link>
        </div>
        <HistoryList entries={toHistoryRows(db.history.slice(0, 8))} existingIds={db.faculty.map(f => f.id)} compact />
      </div>
    </div>
  );
}
