import type { Metadata } from 'next';
import { FacultyForm } from '@/components/admin/FacultyForm';
import { editorOptions, getAdminDb } from '@/lib/server/admin-data';

export const metadata: Metadata = { title: 'Add faculty' };

type Props = { searchParams: Promise<{ request?: string | string[] }> };

export default async function NewFacultyPage({ searchParams }: Props) {
  const query = await searchParams;
  const requestId = Array.isArray(query.request) ? query.request[0] : query.request;
  const { db } = await getAdminDb(requestId ? `/admin/faculty/new?request=${encodeURIComponent(requestId)}` : '/admin/faculty/new');
  const request = requestId ? db.requests.find(r => r.id === requestId) ?? null : null;

  return <FacultyForm initial={null} options={editorOptions(db.faculty)} returnTo="/admin/faculty" request={request} />;
}
