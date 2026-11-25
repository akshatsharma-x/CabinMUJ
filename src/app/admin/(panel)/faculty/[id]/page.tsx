import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FacultyForm } from '@/components/admin/FacultyForm';
import { editorOptions, getAdminDb } from '@/lib/server/admin-data';
import { safeAdminPath } from '@/lib/server/session';

export const metadata: Metadata = { title: 'Edit faculty' };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string | string[]; request?: string | string[] }>;
};

const first = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v);

export default async function EditFacultyPage({ params, searchParams }: Props) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const requestId = first(query.request);
  const returnTo = safeAdminPath(first(query.returnTo), '/admin/faculty');
  // Keep the report and the way back if the admin has to sign in first.
  const keep = new URLSearchParams({ ...(requestId ? { request: requestId } : {}), returnTo }).toString();
  const { db } = await getAdminDb(`/admin/faculty/${encodeURIComponent(id)}?${keep}`);

  const faculty = db.faculty.find(f => f.id === id);
  if (!faculty) notFound();

  const request = requestId ? db.requests.find(r => r.id === requestId) ?? null : null;

  return (
    <FacultyForm
      // Remount with fresh state whenever the record changes on the server.
      key={`${faculty.id}:${faculty.lastUpdated}`}
      initial={faculty}
      options={editorOptions(db.faculty)}
      returnTo={returnTo}
      request={request}
    />
  );
}
