import type { Metadata } from 'next';
import Link from 'next/link';
import { AdminFacultyTable } from '@/components/admin/AdminFacultyTable';
import { AdminNotice } from '@/components/admin/AdminNotice';
import { filterOptions } from '@/lib/faculty-utils';
import { getAdminDb } from '@/lib/server/admin-data';

export const metadata: Metadata = { title: 'Faculty' };

export default async function AdminFacultyPage() {
  const { db } = await getAdminDb('/admin/faculty');
  const names = Object.fromEntries(db.faculty.map(f => [f.id, f.name]));

  return (
    <div className="container py-8">
      <AdminNotice names={names} />

      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="h2">Faculty Management</h1>
          <p className="text-sm text-muted">Search, edit, verify or remove faculty. Changes go live for students immediately.</p>
        </div>
        <div className="flex gap-2">
          <a href="/admin/export" className="btn btn-secondary" style={{ borderRadius: '8px' }}>Download backup</a>
          <Link href="/admin/faculty/new" className="btn btn-primary" style={{ borderRadius: '8px' }}>+ Add faculty</Link>
        </div>
      </div>

      <AdminFacultyTable faculty={db.faculty} options={filterOptions(db.faculty)} />
    </div>
  );
}
