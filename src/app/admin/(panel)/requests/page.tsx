import type { Metadata } from 'next';
import { AdminNotice } from '@/components/admin/AdminNotice';
import { RequestsBoard } from '@/components/admin/RequestsBoard';
import { getAdminDb } from '@/lib/server/admin-data';
import { CONTACT_EMAIL } from '@/lib/site';

export const metadata: Metadata = { title: 'Update requests' };

export default async function AdminRequestsPage() {
  const { db } = await getAdminDb('/admin/requests');
  const facultyNames = Object.fromEntries(db.faculty.map(f => [f.id, f.name]));

  return (
    <div className="container py-8" style={{ maxWidth: '1000px' }}>
      <AdminNotice names={facultyNames} />
      <div className="mb-6">
        <h1 className="h2 mb-1">Update requests</h1>
        <p className="text-sm text-muted">
          Reports students sent through the update form. Updates sent by email arrive at {CONTACT_EMAIL} instead.
        </p>
      </div>
      <RequestsBoard requests={db.requests} facultyNames={facultyNames} />
    </div>
  );
}
