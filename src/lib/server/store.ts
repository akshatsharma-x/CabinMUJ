import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { Faculty, FacultyStatus, HistoryEntry, UpdateRequest } from '@/lib/types';
import { FACULTY_STATUSES } from '@/lib/types';

/**
 * A tiny JSON-file database. All faculty data, student update requests and the
 * admin change history live in one file (data/cabinmuj-db.json by default).
 *
 * - Reads are cached in memory and re-read when the file changes on disk.
 * - Writes are serialized through a queue and written atomically (temp file +
 *   rename), with the previous version kept as a .bak file.
 * - On first run the file is seeded from src/lib/mock-data.ts.
 *
 * The host must have a persistent, writable disk (any VPS / `next start`).
 * Serverless hosts with read-only or ephemeral filesystems need a database instead;
 * only this file has to change for that.
 */

export interface Database {
  version: 1;
  faculty: Faculty[];
  requests: UpdateRequest[];
  history: HistoryEntry[];
  /** Highest faculty number ever handed out, so IDs of deleted records are never reused. */
  seq: number;
  /** Admin sessions issued at or before this time (ms since epoch) are invalid — set on logout. */
  authValidAfter: number;
}

const DATA_DIR = process.env.CABINMUJ_DATA_DIR
  ? path.resolve(process.env.CABINMUJ_DATA_DIR)
  : path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'cabinmuj-db.json');

export function dataDir(): string {
  return DATA_DIR;
}
const BACKUP_FILE = `${DB_FILE}.bak`;

const MAX_HISTORY = 1000;
const MAX_REQUESTS = 2000;

export class StorageError extends Error {}

let cache: { db: Database; mtimeMs: number; size: number } | null = null;
/** Set when the seed could not be written (read-only disk): data is served from memory. */
let memoryOnly = false;
/** Set when the main file was unreadable and the .bak was used: don't let the next save overwrite the good backup. */
let mainFileCorrupt = false;
let queue: Promise<unknown> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn);
  queue = run.catch(() => undefined);
  return run;
}

const asString = (v: unknown) => (typeof v === 'string' ? v : '');
const asList = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);

/** Guards against hand-edited or older files: every field gets the right type. */
export function normalizeFaculty(raw: Faculty): Faculty {
  return {
    id: asString(raw.id),
    name: asString(raw.name),
    photo: asString(raw.photo),
    designation: asString(raw.designation),
    department: asString(raw.department),
    facultyCategory: asString(raw.facultyCategory) || 'Regular',
    block: asString(raw.block),
    cabinNumber: asString(raw.cabinNumber),
    floor: asString(raw.floor),
    email: asString(raw.email),
    phone: asString(raw.phone),
    officeHours: asList(raw.officeHours),
    subjects: asList(raw.subjects),
    researchAreas: asList(raw.researchAreas),
    qualifications: asList(raw.qualifications),
    bio: asString(raw.bio),
    status: FACULTY_STATUSES.includes(raw.status as FacultyStatus) ? raw.status : 'Available',
    lastUpdated: asString(raw.lastUpdated),
    isHOD: raw.isHOD === true,
    locationVerified: raw.locationVerified === true,
  };
}

function parse(raw: string): Database {
  const data = JSON.parse(raw) as Partial<Database>;
  if (!data || !Array.isArray(data.faculty)) throw new Error('missing "faculty" array');
  const faculty = data.faculty.map(normalizeFaculty);
  return {
    version: 1,
    faculty,
    requests: Array.isArray(data.requests) ? data.requests : [],
    history: Array.isArray(data.history) ? data.history : [],
    seq: Math.max(typeof data.seq === 'number' ? data.seq : 0, maxFacultyNumber(faculty)),
    authValidAfter: typeof data.authValidAfter === 'number' ? data.authValidAfter : 0,
  };
}

function maxFacultyNumber(faculty: Faculty[]): number {
  let max = 0;
  for (const f of faculty) {
    const m = /^fac-(\d+)$/.exec(f.id);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return max;
}

async function seed(): Promise<Database> {
  // Loaded lazily: the seed file is large and only needed on the very first run.
  const { mockFaculty } = await import('@/lib/mock-data');
  const faculty = mockFaculty.map(normalizeFaculty);
  return { version: 1, faculty, requests: [], history: [], seq: maxFacultyNumber(faculty), authValidAfter: 0 };
}

function describeFsError(e: unknown): string {
  const code = (e as NodeJS.ErrnoException)?.code;
  if (code === 'EROFS' || code === 'EACCES' || code === 'EPERM') {
    return `Couldn't save: the server can't write to ${DATA_DIR} (${code}). The host needs a writable, persistent disk — see README.`;
  }
  return `Couldn't save changes: ${(e as Error)?.message ?? 'unknown storage error'}`;
}

async function writeDb(db: Database): Promise<void> {
  if (memoryOnly) throw new StorageError(describeFsError({ code: 'EROFS' }));
  const tmp = `${DB_FILE}.${process.pid}.${randomUUID().slice(0, 8)}.tmp`;
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(tmp, JSON.stringify(db, null, 2), 'utf8');
    if (mainFileCorrupt) {
      // Keep the unreadable file for inspection instead of copying it over the good backup.
      await fs.rename(DB_FILE, `${DB_FILE}.corrupt-${Date.now()}`).catch(() => undefined);
    } else {
      await fs.copyFile(DB_FILE, BACKUP_FILE).catch(() => undefined);
    }
    await fs.rename(tmp, DB_FILE);
    mainFileCorrupt = false;
    const stat = await fs.stat(DB_FILE);
    cache = { db, mtimeMs: stat.mtimeMs, size: stat.size };
  } catch (e) {
    await fs.unlink(tmp).catch(() => undefined);
    throw new StorageError(describeFsError(e));
  }
}

/** Reads the database. Must only be called while holding the lock, or by readDb(). */
async function load(): Promise<Database> {
  if (memoryOnly && cache) return cache.db;
  let stat;
  try {
    stat = await fs.stat(DB_FILE);
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
    return createFromSeed();
  }
  if (cache && cache.mtimeMs === stat.mtimeMs && cache.size === stat.size) return cache.db;
  const raw = await fs.readFile(DB_FILE, 'utf8');
  let db: Database;
  try {
    db = parse(raw);
  } catch (e) {
    // Never silently re-seed over real data: fall back to the previous good version.
    try {
      db = parse(await fs.readFile(BACKUP_FILE, 'utf8'));
      mainFileCorrupt = true;
      console.error(`[cabinmuj] ${DB_FILE} is unreadable (${(e as Error).message}); using ${BACKUP_FILE}.`);
    } catch {
      throw new StorageError(`The data file ${DB_FILE} is corrupted and no usable backup exists: ${(e as Error).message}`);
    }
  }
  cache = { db, mtimeMs: stat.mtimeMs, size: stat.size };
  return db;
}

async function createFromSeed(): Promise<Database> {
  const db = await seed();
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    // 'wx' fails if another process created the file meanwhile — then just read theirs.
    await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), { encoding: 'utf8', flag: 'wx' });
  } catch (e) {
    const code = (e as NodeJS.ErrnoException).code;
    if (code === 'EEXIST') return load();
    console.error(`[cabinmuj] Could not create ${DB_FILE} (${code}). Serving seed data read-only; admin edits will fail.`);
    memoryOnly = true;
    cache = { db, mtimeMs: -1, size: -1 };
    return db;
  }
  const stat = await fs.stat(DB_FILE);
  cache = { db, mtimeMs: stat.mtimeMs, size: stat.size };
  return db;
}

/** Current data. Treat the result as read-only (it is the shared cache). */
export async function readDb(): Promise<Database> {
  if (cache || memoryOnly) {
    // Fast path; load() still checks the file's mtime so external edits are picked up.
    return load();
  }
  // First load goes through the lock so seeding can't race a concurrent write.
  return withLock(load);
}

const ABORT = Symbol('abort');
export interface Aborted<T> {
  [ABORT]: true;
  value: T;
}
/** Return this from a mutate() callback to bail out without writing anything. */
export function abort<T>(value: T): Aborted<T> {
  return { [ABORT]: true, value };
}
function isAborted<T>(v: unknown): v is Aborted<T> {
  return typeof v === 'object' && v !== null && ABORT in v;
}

/**
 * Applies `fn` to a copy of the latest data and saves it. Calls are serialized,
 * so concurrent saves never overwrite each other.
 */
export function mutate<T>(fn: (db: Database) => T | Aborted<T>): Promise<T> {
  return withLock(async () => {
    const draft = structuredClone(await load());
    const result = fn(draft);
    if (isAborted<T>(result)) return result.value;
    if (draft.history.length > MAX_HISTORY) {
      // Trim old entries, but never the ones that still hold a deleted record (they power "Restore").
      const restorable = draft.history.slice(MAX_HISTORY).filter(h => h.action === 'deleted' && h.snapshot && !h.restoredAt);
      draft.history = [...draft.history.slice(0, MAX_HISTORY), ...restorable];
    }
    if (draft.requests.length > MAX_REQUESTS) {
      // Drop the oldest resolved requests first; pending ones are kept.
      const resolved = draft.requests.filter(r => r.status !== 'Pending');
      const excess = new Set(resolved.slice(-(draft.requests.length - MAX_REQUESTS)).map(r => r.id));
      draft.requests = draft.requests.filter(r => !excess.has(r.id));
    }
    await writeDb(draft);
    return result;
  });
}

export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${randomUUID().slice(0, 6)}`;
}

/** fac-0001 … fac-0806 → fac-0807. Numbers are never reused, even after deletions. */
export function nextFacultyId(db: Database): string {
  db.seq = Math.max(db.seq || 0, maxFacultyNumber(db.faculty)) + 1;
  return `fac-${String(db.seq).padStart(4, '0')}`;
}
