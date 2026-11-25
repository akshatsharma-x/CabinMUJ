import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/server/session';
import { readDb } from '@/lib/server/store';

/** Admin-only download of all data (faculty, reports, history) as a JSON backup. */
export async function GET() {
  const session = await getAdminSession();
  if (!session) redirect(`/admin/login?next=${encodeURIComponent('/admin')}`);

  const db = await readDb();
  const date = new Date().toISOString().slice(0, 10);
  const body = JSON.stringify(
    { exportedAt: new Date().toISOString(), exportedBy: session.username, ...db },
    null,
    2,
  );
  return new Response(body, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="cabinmuj-backup-${date}.json"`,
      'Cache-Control': 'no-store',
    },
  });
}
