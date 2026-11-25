import 'server-only';
import { cache } from 'react';
import { connection } from 'next/server';
import type { Faculty } from '@/lib/types';
import { readDb } from './store';

/**
 * Public read access. `connection()` makes every page that reads faculty data
 * render per request, so admin edits are visible immediately (never a stale
 * build-time snapshot). React's cache() dedupes reads within one request.
 */
export const getFacultyList = cache(async (): Promise<Faculty[]> => {
  await connection();
  return (await readDb()).faculty;
});

export async function getFacultyById(id: string): Promise<Faculty | null> {
  return (await getFacultyList()).find(f => f.id === id) ?? null;
}
