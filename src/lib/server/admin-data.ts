import 'server-only';
import { connection } from 'next/server';
import type { Faculty, HistoryEntry, HistoryRow } from '@/lib/types';
import { CAMPUS_BLOCKS, sortBlocks, sortFloors, STANDARD_FLOORS } from '@/lib/campus';
import { requireAdminPage } from './session';
import { readDb, type Database } from './store';

/** Admin pages: verifies the session (redirecting to login otherwise), then reads the data. */
export async function getAdminDb(nextPath: string): Promise<{ username: string; db: Database }> {
  const { username } = await requireAdminPage(nextPath);
  await connection();
  return { username, db: await readDb({ maxAgeMs: 0 }) };
}

export interface EditorOptions {
  departments: string[];
  blocks: string[];
  floors: string[];
  categories: string[];
  designations: string[];
}

/** Choices offered by the faculty editor, taken from the existing data so names stay consistent. */
export function editorOptions(faculty: Faculty[]): EditorOptions {
  const byFrequency = (values: string[]) => {
    const counts = new Map<string, number>();
    for (const v of values) if (v) counts.set(v, (counts.get(v) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([v]) => v);
  };
  return {
    departments: [...new Set(faculty.map(f => f.department).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    blocks: sortBlocks([...CAMPUS_BLOCKS.map(b => b.shortName), ...faculty.map(f => f.block ?? '')]),
    floors: sortFloors([...STANDARD_FLOORS, ...faculty.map(f => f.floor ?? '')]),
    categories: byFrequency([...faculty.map(f => f.facultyCategory), 'Regular', 'Visiting', 'Adjunct', 'Guest']),
    designations: byFrequency(faculty.map(f => f.designation)).slice(0, 60),
  };
}

export function toHistoryRows(entries: HistoryEntry[]): HistoryRow[] {
  return entries.map(({ snapshot, ...rest }) => ({ ...rest, restorable: Boolean(snapshot) && !rest.restoredAt }));
}
