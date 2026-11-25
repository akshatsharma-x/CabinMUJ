import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { Redis } from '@upstash/redis';
import type { Faculty, FacultyStatus, FieldChange, HistoryAction, HistoryEntry, UpdateRequest, UpdateRequestStatus } from '@/lib/types';
import { FACULTY_STATUSES } from '@/lib/types';

/**
 * CabinMUJ's database: one JSON document holding all faculty, student update
 * requests and the admin change history. Two interchangeable backends:
 *
 * - **Upstash Redis** — used automatically when UPSTASH_REDIS_REST_URL/_TOKEN
 *   (or Vercel's KV_REST_API_URL/_TOKEN) are set. Required on Vercel, whose
 *   servers have no writable disk. Each server instance keeps the document in
 *   memory and only checks a tiny version key; saves use an atomic
 *   compare-and-set, so concurrent saves on different instances can't overwrite
 *   each other.
 * - **JSON file** (data/cabinmuj-db.json) — the default for local development
 *   and servers with a persistent disk. Atomic writes plus a .bak copy.
 *
 * Either way the data is seeded from src/lib/mock-data.ts on the very first run.
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

const MAX_HISTORY = 1000;
const MAX_REQUESTS = 2000;
/**
 * Redis only: how long a server instance reuses its in-memory copy before checking the
 * version key again. Students may see an edit up to this late; admins always read fresh.
 * Keeps Redis usage to roughly one tiny command per instance per 10 s of traffic.
 */
const DEFAULT_MAX_AGE_MS = 10_000;

export class StorageError extends Error {}

// ─── Validation / normalization ──────────────────────────────────────────

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const asString = (v: unknown) => (typeof v === 'string' ? v : '');
const asOptString = (v: unknown) => (typeof v === 'string' && v ? v : undefined);
const asList = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
const REQUEST_STATUSES: UpdateRequestStatus[] = ['Pending', 'Approved', 'Rejected'];

/** Guards against hand-edited, older or uploaded data: every field gets the right type. */
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

function normalizeRequest(r: Record<string, unknown>): UpdateRequest | null {
  if (typeof r.id !== 'string' || !r.id) return null;
  return {
    id: r.id,
    facultyId: asString(r.facultyId),
    facultyName: asString(r.facultyName),
    submittedBy: asString(r.submittedBy),
    issueType: asString(r.issueType),
    oldInformation: asString(r.oldInformation),
    proposedInformation: asString(r.proposedInformation),
    evidence: asString(r.evidence),
    status: REQUEST_STATUSES.includes(r.status as UpdateRequestStatus) ? (r.status as UpdateRequestStatus) : 'Pending',
    createdAt: asString(r.createdAt),
    resolvedAt: asOptString(r.resolvedAt),
  };
}

function normalizeHistory(h: Record<string, unknown>): HistoryEntry | null {
  if (typeof h.id !== 'string' || !h.id) return null;
  const changes: FieldChange[] | undefined = Array.isArray(h.changes)
    ? h.changes.filter(isObject).map(c => ({ field: asString(c.field), from: asString(c.from), to: asString(c.to) }))
    : undefined;
  return {
    id: h.id,
    at: asString(h.at),
    by: asString(h.by),
    action: asString(h.action) as HistoryAction,
    facultyId: asOptString(h.facultyId),
    facultyName: asOptString(h.facultyName),
    summary: asString(h.summary),
    changes,
    snapshot: isObject(h.snapshot) ? normalizeFaculty(h.snapshot as unknown as Faculty) : undefined,
    restoredAt: asOptString(h.restoredAt),
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

/** Parses stored data or an uploaded backup (the /admin/export format). Throws if it isn't CabinMUJ data. */
export function parseDatabase(raw: string): Database {
  const data: unknown = JSON.parse(raw);
  if (!isObject(data) || !Array.isArray(data.faculty)) throw new Error('missing "faculty" list');
  const seen = new Set<string>();
  const faculty = data.faculty
    .filter(isObject)
    .map(f => normalizeFaculty(f as unknown as Faculty))
    .filter(f => f.id && f.name && !seen.has(f.id) && seen.add(f.id));
  const requests = Array.isArray(data.requests)
    ? data.requests.filter(isObject).map(normalizeRequest).filter((r): r is UpdateRequest => r !== null)
    : [];
  const history = Array.isArray(data.history)
    ? data.history.filter(isObject).map(normalizeHistory).filter((h): h is HistoryEntry => h !== null)
    : [];
  return {
    version: 1,
    faculty,
    requests,
    history,
    seq: Math.max(typeof data.seq === 'number' && Number.isFinite(data.seq) ? data.seq : 0, maxFacultyNumber(faculty)),
    authValidAfter: typeof data.authValidAfter === 'number' && Number.isFinite(data.authValidAfter) ? data.authValidAfter : 0,
  };
}

async function seed(): Promise<Database> {
  // Loaded lazily: the seed file is large and only needed on the very first run.
  const { mockFaculty } = await import('@/lib/mock-data');
  const faculty = mockFaculty.map(normalizeFaculty);
  return { version: 1, faculty, requests: [], history: [], seq: maxFacultyNumber(faculty), authValidAfter: 0 };
}

/** Keeps history and requests bounded (called before every save). */
function trim(db: Database) {
  if (db.history.length > MAX_HISTORY) {
    // Trim old entries, but never the ones that still hold a deleted record (they power "Restore").
    const restorable = db.history.slice(MAX_HISTORY).filter(h => h.action === 'deleted' && h.snapshot && !h.restoredAt);
    db.history = [...db.history.slice(0, MAX_HISTORY), ...restorable];
  }
  if (db.requests.length > MAX_REQUESTS) {
    // Drop the oldest resolved requests first; pending ones are kept.
    const resolved = db.requests.filter(r => r.status !== 'Pending');
    const excess = new Set(resolved.slice(-(db.requests.length - MAX_REQUESTS)).map(r => r.id));
    db.requests = db.requests.filter(r => !excess.has(r.id));
  }
}

// ─── Shared helpers ──────────────────────────────────────────────────────

let queue: Promise<unknown> = Promise.resolve();
/** Serializes work inside this server process. */
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn);
  queue = run.catch(() => undefined);
  return run;
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

// ─── Backend selection ───────────────────────────────────────────────────

export type StorageKind = 'redis' | 'file';

function redisCredentials(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

export function storageKind(): StorageKind {
  return redisCredentials() ? 'redis' : 'file';
}

let redisClient: Redis | null = null;
/** The shared Upstash client, or null when Redis isn't configured. */
export function getRedis(): Redis | null {
  const creds = redisCredentials();
  if (!creds) return null;
  redisClient ??= new Redis({ ...creds, automaticDeserialization: false, enableTelemetry: false });
  return redisClient;
}

// ─── Redis backend ───────────────────────────────────────────────────────

const KEY_VERSION = 'cabinmuj:v';
const KEY_DATA = 'cabinmuj:data';

/** Writes the document only if nobody else saved since we read version ARGV[1]. */
const CAS_SCRIPT = `
local current = redis.call('GET', KEYS[1])
if (current or '0') ~= ARGV[1] then return 0 end
redis.call('SET', KEYS[2], ARGV[2])
redis.call('SET', KEYS[1], ARGV[3])
return 1`;

let redisCache: { db: Database; version: string; checkedAt: number } | null = null;

function redisFailure(e: unknown): StorageError {
  if (e instanceof StorageError) return e;
  console.error('[cabinmuj] Redis error', e);
  return new StorageError(`Couldn't reach the database (Upstash Redis): ${(e as Error)?.message ?? 'unknown error'}`);
}

async function redisCompareAndSet(db: Database, expected: string): Promise<boolean> {
  const next = String(Number(expected) + 1);
  const result = await getRedis()!.eval(CAS_SCRIPT, [KEY_VERSION, KEY_DATA], [expected, JSON.stringify(db), next]);
  if (Number(result) !== 1) return false;
  redisCache = { db, version: next, checkedAt: Date.now() };
  return true;
}

async function redisRead(maxAgeMs: number): Promise<Database> {
  if (redisCache && Date.now() - redisCache.checkedAt < maxAgeMs) return redisCache.db;
  try {
    const redis = getRedis()!;
    const version = await redis.get<string>(KEY_VERSION);
    if (redisCache && version === redisCache.version) {
      redisCache.checkedAt = Date.now();
      return redisCache.db;
    }
    const [v, raw] = await redis.mget<[string | null, string | null]>(KEY_VERSION, KEY_DATA);
    if (v === null || raw === null) {
      // Empty database: seed it (if two servers race, one wins and the other reads its result).
      const db = await seed();
      return (await redisCompareAndSet(db, '0')) ? db : redisRead(0);
    }
    let db: Database;
    try {
      db = parseDatabase(raw);
    } catch (e) {
      throw new StorageError(`The data stored in Redis (${KEY_DATA}) is unreadable: ${(e as Error).message}`);
    }
    redisCache = { db, version: String(v), checkedAt: Date.now() };
    return db;
  } catch (e) {
    throw redisFailure(e);
  }
}

async function redisMutate<T>(fn: (db: Database) => T | Aborted<T>): Promise<T> {
  return withLock(async () => {
    try {
      for (let attempt = 0; attempt < 6; attempt++) {
        const current = await redisRead(0);
        const expected = redisCache!.version;
        const draft = structuredClone(current);
        const result = fn(draft);
        if (isAborted<T>(result)) return result.value;
        trim(draft);
        if (await redisCompareAndSet(draft, expected)) return result;
        // Another server saved in between: reload its version and apply the change again.
        await new Promise(r => setTimeout(r, 25 * (attempt + 1)));
      }
      throw new StorageError('Several saves happened at the same moment. Please try again.');
    } catch (e) {
      throw redisFailure(e);
    }
  });
}

// ─── File backend ────────────────────────────────────────────────────────

const DATA_DIR = process.env.CABINMUJ_DATA_DIR ? path.resolve(process.env.CABINMUJ_DATA_DIR) : path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'cabinmuj-db.json');
const BACKUP_FILE = `${DB_FILE}.bak`;

export function dataDir(): string {
  return DATA_DIR;
}

let fileCache: { db: Database; mtimeMs: number; size: number } | null = null;
/** Set when the seed could not be written (read-only disk): data is served from memory. */
let memoryOnly = false;
/** Set when the main file was unreadable and the .bak was used: don't let the next save overwrite the good backup. */
let mainFileCorrupt = false;

function describeFsError(e: unknown): string {
  const code = (e as NodeJS.ErrnoException)?.code;
  if (code === 'EROFS' || code === 'EACCES' || code === 'EPERM') {
    if (process.env.VERCEL) {
      return "Couldn't save: Vercel has no writable disk. Connect Upstash Redis in your Vercel project's Storage tab, then redeploy (see README).";
    }
    return `Couldn't save: the server can't write to ${DATA_DIR} (${code}). The host needs a writable, persistent disk — see README.`;
  }
  return `Couldn't save changes: ${(e as Error)?.message ?? 'unknown storage error'}`;
}

async function writeFileDb(db: Database): Promise<void> {
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
    fileCache = { db, mtimeMs: stat.mtimeMs, size: stat.size };
  } catch (e) {
    await fs.unlink(tmp).catch(() => undefined);
    throw new StorageError(describeFsError(e));
  }
}

/** Reads the file database. Must only be called while holding the lock, or by fileRead(). */
async function loadFile(): Promise<Database> {
  if (memoryOnly && fileCache) return fileCache.db;
  let stat;
  try {
    stat = await fs.stat(DB_FILE);
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
    return createFileFromSeed();
  }
  if (fileCache && fileCache.mtimeMs === stat.mtimeMs && fileCache.size === stat.size) return fileCache.db;
  const raw = await fs.readFile(DB_FILE, 'utf8');
  let db: Database;
  try {
    db = parseDatabase(raw);
  } catch (e) {
    // Never silently re-seed over real data: fall back to the previous good version.
    try {
      db = parseDatabase(await fs.readFile(BACKUP_FILE, 'utf8'));
      mainFileCorrupt = true;
      console.error(`[cabinmuj] ${DB_FILE} is unreadable (${(e as Error).message}); using ${BACKUP_FILE}.`);
    } catch {
      throw new StorageError(`The data file ${DB_FILE} is corrupted and no usable backup exists: ${(e as Error).message}`);
    }
  }
  fileCache = { db, mtimeMs: stat.mtimeMs, size: stat.size };
  return db;
}

async function createFileFromSeed(): Promise<Database> {
  const db = await seed();
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    // 'wx' fails if another process created the file meanwhile — then just read theirs.
    await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), { encoding: 'utf8', flag: 'wx' });
  } catch (e) {
    const code = (e as NodeJS.ErrnoException).code;
    if (code === 'EEXIST') return loadFile();
    console.error(`[cabinmuj] Could not create ${DB_FILE} (${code}). Serving seed data read-only; admin edits will fail.`);
    memoryOnly = true;
    fileCache = { db, mtimeMs: -1, size: -1 };
    return db;
  }
  const stat = await fs.stat(DB_FILE);
  fileCache = { db, mtimeMs: stat.mtimeMs, size: stat.size };
  return db;
}

function fileRead(): Promise<Database> {
  // load() checks the file's mtime on every call, so external edits are picked up.
  // The very first load goes through the lock so seeding can't race a concurrent write.
  return fileCache || memoryOnly ? loadFile() : withLock(loadFile);
}

function fileMutate<T>(fn: (db: Database) => T | Aborted<T>): Promise<T> {
  return withLock(async () => {
    const draft = structuredClone(await loadFile());
    const result = fn(draft);
    if (isAborted<T>(result)) return result.value;
    trim(draft);
    await writeFileDb(draft);
    return result;
  });
}

// ─── Public API ──────────────────────────────────────────────────────────

/**
 * Current data. Treat the result as read-only (it is the shared cache).
 * `maxAgeMs: 0` forces a freshness check (used for admin pages).
 */
export function readDb(options: { maxAgeMs?: number } = {}): Promise<Database> {
  return storageKind() === 'redis' ? redisRead(options.maxAgeMs ?? DEFAULT_MAX_AGE_MS) : fileRead();
}

/**
 * Applies `fn` to a copy of the latest data and saves it. Saves never overwrite
 * each other: they are serialized (file) or retried on conflict (Redis), so
 * `fn` may run more than once and must only change the draft it is given.
 */
export function mutate<T>(fn: (db: Database) => T | Aborted<T>): Promise<T> {
  return storageKind() === 'redis' ? redisMutate(fn) : fileMutate(fn);
}

/** Where the data lives and whether saving works — shown on the admin dashboard. */
export function storageInfo(): { kind: StorageKind; writable: boolean; label: string } {
  if (storageKind() === 'redis') return { kind: 'redis', writable: true, label: 'Upstash Redis' };
  return {
    kind: 'file',
    writable: !memoryOnly,
    label: memoryOnly ? `read-only — ${DATA_DIR} isn't writable` : path.relative(process.cwd(), DB_FILE) || DB_FILE,
  };
}

export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${randomUUID().slice(0, 6)}`;
}

/** fac-0001 … fac-0806 → fac-0807. Numbers are never reused, even after deletions. */
export function nextFacultyId(db: Database): string {
  db.seq = Math.max(db.seq || 0, maxFacultyNumber(db.faculty)) + 1;
  return `fac-${String(db.seq).padStart(4, '0')}`;
}
