import type { Metadata } from 'next';
import { HistoryList } from '@/components/admin/HistoryList';
import { getAdminDb, toHistoryRows } from '@/lib/server/admin-data';

export const metadata: Metadata = { title: 'Change history' };

export default async function AdminHistoryPage() {
  const { db } = await getAdminDb('/admin/history');
  return (
    <div className="container py-8" style={{ maxWidth: '1000px' }}>
      <div className="mb-6">
        <h1 className="h2 mb-1">Change history</h1>
        <p className="text-sm text-muted">Every edit, deletion and report decision (latest {db.history.length.toLocaleString('en-IN')}). Deleted records can be restored here.</p>
      </div>
      <HistoryList entries={toHistoryRows(db.history)} existingIds={db.faculty.map(f => f.id)} />
    </div>
  );
}
