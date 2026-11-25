import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { connection } from 'next/server';
import type { Faculty } from '@/lib/types';
import { SESSION_COOKIE } from './session';
import { readDb } from './store';

/**
 * Public read access. `connection()` makes every page that reads faculty data
 * render per request, so admin edits are visible immediately (never a stale
 * build-time snapshot). React's cache() dedupes reads within one request.
 */
export const getFacultyList = cache(async (): Promise<Faculty[]> => {
  await connection();
  // Admins always see their own edits immediately; students may get data up to ~10 s old (Redis only).
  const admin = (await cookies()).has(SESSION_COOKIE);
  return (await readDb({ maxAgeMs: admin ? 0 : undefined })).faculty;
});

export async function getFacultyById(id: string): Promise<Faculty | null> {
  return (await getFacultyList()).find(f => f.id === id) ?? null;
}
