'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Faculty, FacultyFieldErrors, FacultyInput, FieldChange, HistoryEntry, UpdateRequestStatus } from '@/lib/types';
import { formatLocation, plainName } from '@/lib/faculty-utils';
import { checkCredentials, endSession, getAdminSession, isAdminConfigured, safeAdminPath, startSession } from '@/lib/server/session';
import { clearClient, clientIp, hit, limitedFor, type Limit } from '@/lib/server/rate-limit';
import { abort, mutate, newId, nextFacultyId, StorageError, type Database } from '@/lib/server/store';
import { validateFacultyInput } from '@/lib/server/validation';

// Every action below re-checks the admin session itself: server actions are
// public HTTP endpoints, so hiding a button is not a security boundary.

export type ActionResult = { ok: true } | { ok: false; error: string };

const SESSION_EXPIRED = 'Your admin session has expired. Log in again in a new tab (so you keep this page), then retry.';

function storageMessage(e: unknown): string {
  if (e instanceof StorageError) return e.message;
  console.error('[cabinmuj] action failed', e);
  return 'Something went wrong while saving. Please try again.';
}

/** Admin edits change what every page shows, so refresh them all. */
function refreshAll() {
  revalidatePath('/', 'layout');
}

function log(db: Database, entry: Omit<HistoryEntry, 'id' | 'at'>, id = newId('log')) {
  db.history.unshift({ id, at: new Date().toISOString(), ...entry });
  return id;
}

/** Adds query params to an already-validated admin path (see safeAdminPath). */
function withParams(path: string, params: Record<string, string>): string {
  const url = new URL(path, 'http://cabinmuj.invalid');
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const out = url.pathname + url.search;
  return out.startsWith('/') && !out.startsWith('//') ? out : '/admin';
}

// ─── Login / logout ──────────────────────────────────────────────────────

export async function login(input: { username?: unknown; password?: unknown; next?: unknown }): Promise<{ error: string }> {
  if (!isAdminConfigured()) {
    return { error: 'Admin login is not set up on this server: ADMIN_USERNAME and ADMIN_PASSWORD are missing (see README).' };
  }
  const username = typeof input?.username === 'string' ? input.username : '';
  const password = typeof input?.password === 'string' ? input.password : '';
  if (!username.trim() || !password) return { error: 'Enter your username and password.' };

  // Per-address limit, plus a site-wide cap on failures that can't be dodged by faking addresses.
  const clientKey = `login:${await clientIp()}`;
  const limits: Limit[] = [
    { key: clientKey, limit: 5, windowMs: 15 * 60_000 },
    { key: 'login:all', limit: 30, windowMs: 15 * 60_000, global: true },
  ];
  const wait = limitedFor(limits);
  if (wait) return { error: `Too many failed attempts. Try again in ${Math.ceil(wait / 60_000)} minute(s).` };

  const canonical = checkCredentials(username, password);
  if (!canonical) {
    hit(limits);
    return { error: 'Incorrect username or password.' };
  }

  clearClient(clientKey);
  await startSession(canonical);
  redirect(safeAdminPath(input?.next));
}

export async function logout(): Promise<void> {
  await endSession();
  redirect('/admin/login');
}

// ─── Faculty ─────────────────────────────────────────────────────────────

const FIELD_LABELS: Record<keyof FacultyInput, string> = {
  name: 'Name',
  designation: 'Designation',
  department: 'Department',
  facultyCategory: 'Category',
  isHOD: 'HoD',
  status: 'Status',
  block: 'Block',
  floor: 'Floor',
  cabinNumber: 'Cabin',
  locationVerified: 'Location verified',
  email: 'Email',
  phone: 'Phone',
  photo: 'Photo',
  bio: 'Biography',
  qualifications: 'Qualifications',
  researchAreas: 'Research areas',
  subjects: 'Subjects',
  officeHours: 'Office hours',
};

function show(v: unknown): string {
  if (Array.isArray(v)) return v.length ? v.join('; ') : '—';
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  const s = typeof v === 'string' ? v : '';
  if (!s) return '—';
  return s.length > 140 ? `${s.slice(0, 137)}…` : s;
}

function same(a: unknown, b: unknown): boolean {
  if (Array.isArray(a) || Array.isArray(b)) return JSON.stringify(a ?? []) === JSON.stringify(b ?? []);
  if (typeof a === 'boolean' || typeof b === 'boolean') return !!a === !!b;
  return (a ?? '') === (b ?? '');
}

function diffFaculty(before: Faculty, after: FacultyInput): FieldChange[] {
  return (Object.keys(FIELD_LABELS) as (keyof FacultyInput)[])
    .filter(k => !same(before[k], after[k]))
    .map(k => ({ field: FIELD_LABELS[k], from: show(before[k]), to: show(after[k]) }));
}

export interface SaveFacultyOptions {
  /** Present when editing; absent when adding a new faculty member. */
  id?: string;
  /** `lastUpdated` of the record when the form was opened (detects edits made elsewhere meanwhile). */
  expectedUpdatedAt?: string;
  /** Save even if the record changed meanwhile / a similar record exists. */
  force?: boolean;
  /** A student report this edit resolves. */
  requestId?: string;
  /** Admin list URL to go back to (keeps the admin's search and page). */
  returnTo?: string;
}

export interface SaveFacultyError {
  errors?: FacultyFieldErrors;
  formError?: string;
  sessionExpired?: boolean;
  conflict?: { at: string };
  duplicate?: { id: string; name: string; department: string };
}

type SaveOutcome = { kind: 'error'; error: SaveFacultyError } | { kind: 'saved'; id: string; status: 'created' | 'saved' | 'unchanged' };

/** Creates or updates a faculty record. On success it redirects back to the admin list. */
export async function saveFaculty(input: unknown, options?: SaveFacultyOptions): Promise<SaveFacultyError> {
  const session = await getAdminSession();
  if (!session) return { formError: SESSION_EXPIRED, sessionExpired: true };

  const opts: SaveFacultyOptions = options && typeof options === 'object' ? options : {};
  const id = typeof opts.id === 'string' && opts.id ? opts.id : undefined;
  const requestId = typeof opts.requestId === 'string' && opts.requestId ? opts.requestId : undefined;
  const force = opts.force === true;

  const parsed = validateFacultyInput(input);
  if (!parsed.ok) return { errors: parsed.errors, formError: 'Please fix the highlighted fields.' };
  const value = parsed.value;
  const now = new Date().toISOString();

  let outcome: SaveOutcome;
  try {
    outcome = await mutate<SaveOutcome>(db => {
      let savedId: string;
      let status: 'created' | 'saved' | 'unchanged';

      if (id) {
        const index = db.faculty.findIndex(f => f.id === id);
        if (index === -1) {
          return abort({ kind: 'error', error: { formError: 'This faculty member no longer exists — it may have been deleted in another tab.' } });
        }
        const before = db.faculty[index];
        if (!force && (before.lastUpdated || '') !== (typeof opts.expectedUpdatedAt === 'string' ? opts.expectedUpdatedAt : '')) {
          return abort({ kind: 'error', error: { conflict: { at: before.lastUpdated } } });
        }
        const changes = diffFaculty(before, value);
        if (changes.length === 0 && !requestId) return abort({ kind: 'saved', id, status: 'unchanged' });
        if (changes.length) {
          db.faculty[index] = { ...before, ...value, id, lastUpdated: now };
          log(db, {
            by: session.username,
            action: 'updated',
            facultyId: id,
            facultyName: value.name,
            summary: `Updated ${changes.map(c => c.field.toLowerCase()).join(', ')}`,
            changes,
          });
        }
        savedId = id;
        status = changes.length ? 'saved' : 'unchanged';
      } else {
        const dup = db.faculty.find(
          f =>
            plainName(f.name).toLowerCase() === plainName(value.name).toLowerCase() &&
            f.department.toLowerCase() === value.department.toLowerCase(),
        );
        if (dup && !force) {
          return abort({ kind: 'error', error: { duplicate: { id: dup.id, name: dup.name, department: dup.department } } });
        }
        savedId = nextFacultyId(db);
        status = 'created';
        db.faculty.unshift({ ...value, id: savedId, lastUpdated: now });
        log(db, {
          by: session.username,
          action: 'created',
          facultyId: savedId,
          facultyName: value.name,
          summary: `Added to ${value.department} (${formatLocation(value) || 'no location yet'})`,
        });
      }

      if (requestId) {
        const req = db.requests.find(r => r.id === requestId);
        if (req && req.status === 'Pending') {
          req.status = 'Approved';
          req.resolvedAt = now;
          if (!req.facultyId) req.facultyId = savedId; // a "not listed" report now points at the new record
          log(db, {
            by: session.username,
            action: 'request-approved',
            facultyId: savedId,
            facultyName: value.name,
            summary: `Resolved report "${req.issueType}" from ${req.submittedBy}`,
          });
        }
      }
      return { kind: 'saved', id: savedId, status };
    });
  } catch (e) {
    return { formError: storageMessage(e) };
  }

  if (outcome.kind === 'error') return outcome.error;
  refreshAll();
  redirect(withParams(safeAdminPath(opts.returnTo, '/admin/faculty'), { done: outcome.status, id: outcome.id }));
}

export type DeleteResult = { ok: true; historyId: string; name: string } | { ok: false; error: string };

/**
 * Deletes a faculty record. The full record is kept in the history so it can
 * be restored. With `redirectTo`, navigates there afterwards (used by the editor,
 * whose own page would no longer exist).
 */
export async function deleteFaculty(id: unknown, options?: { redirectTo?: unknown }): Promise<DeleteResult> {
  const session = await getAdminSession();
  if (!session) return { ok: false, error: SESSION_EXPIRED };
  if (typeof id !== 'string' || !id) return { ok: false, error: 'Invalid faculty id.' };

  let result: { historyId: string; name: string } | null;
  try {
    result = await mutate(db => {
      const index = db.faculty.findIndex(f => f.id === id);
      if (index === -1) return abort(null);
      const [removed] = db.faculty.splice(index, 1);
      const historyId = log(db, {
        by: session.username,
        action: 'deleted',
        facultyId: removed.id,
        facultyName: removed.name,
        summary: `Deleted from ${removed.department || 'the directory'}`,
        snapshot: removed,
      });
      return { historyId, name: removed.name };
    });
  } catch (e) {
    return { ok: false, error: storageMessage(e) };
  }
  if (!result) return { ok: false, error: 'This faculty member was already deleted.' };

  refreshAll();
  if (options?.redirectTo !== undefined) {
    redirect(withParams(safeAdminPath(options.redirectTo, '/admin/faculty'), { done: 'deleted', ref: result.historyId, name: result.name }));
  }
  return { ok: true, ...result };
}

export async function restoreFaculty(historyId: unknown): Promise<{ ok: true; id: string; name: string } | { ok: false; error: string }> {
  const session = await getAdminSession();
  if (!session) return { ok: false, error: SESSION_EXPIRED };
  if (typeof historyId !== 'string') return { ok: false, error: 'Invalid history entry.' };

  type R = { ok: true; id: string; name: string } | { ok: false; error: string };
  let result: R;
  try {
    result = await mutate<R>(db => {
      const entry = db.history.find(h => h.id === historyId && h.action === 'deleted');
      if (!entry?.snapshot) return abort({ ok: false, error: 'Nothing to restore — this history entry no longer has the record.' });
      if (entry.restoredAt) return abort({ ok: false, error: `${entry.facultyName ?? 'This record'} was already restored.` });
      const snap = entry.snapshot;
      const idTaken = db.faculty.some(f => f.id === snap.id);
      const restored: Faculty = { ...snap, id: idTaken ? nextFacultyId(db) : snap.id, lastUpdated: new Date().toISOString() };
      db.faculty.unshift(restored);
      entry.restoredAt = restored.lastUpdated;
      log(db, { by: session.username, action: 'restored', facultyId: restored.id, facultyName: restored.name, summary: 'Restored after deletion' });
      return { ok: true, id: restored.id, name: restored.name };
    });
  } catch (e) {
    return { ok: false, error: storageMessage(e) };
  }
  if (result.ok) refreshAll();
  return result;
}

/** Quick toggle from the admin list: "I've checked this cabin, it's correct". */
export async function setLocationVerified(id: unknown, verified: unknown): Promise<ActionResult> {
  const session = await getAdminSession();
  if (!session) return { ok: false, error: SESSION_EXPIRED };
  if (typeof id !== 'string' || typeof verified !== 'boolean') return { ok: false, error: 'Invalid request.' };

  let result: ActionResult;
  try {
    result = await mutate<ActionResult>(db => {
      const f = db.faculty.find(x => x.id === id);
      if (!f) return abort({ ok: false, error: 'This faculty member no longer exists.' });
      if (verified && !(f.block && f.cabinNumber)) return abort({ ok: false, error: 'Add a block and cabin number before marking the location as verified.' });
      if (!!f.locationVerified === verified) return abort({ ok: true });
      f.locationVerified = verified;
      f.lastUpdated = new Date().toISOString();
      log(db, {
        by: session.username,
        action: verified ? 'verified' : 'unverified',
        facultyId: f.id,
        facultyName: f.name,
        summary: verified ? `Location verified (${formatLocation(f)})` : 'Location marked as unverified',
      });
      return { ok: true };
    });
  } catch (e) {
    return { ok: false, error: storageMessage(e) };
  }
  if (result.ok) refreshAll();
  return result;
}

// ─── Student update requests ─────────────────────────────────────────────

export async function setRequestStatus(requestId: unknown, status: unknown): Promise<ActionResult> {
  const session = await getAdminSession();
  if (!session) return { ok: false, error: SESSION_EXPIRED };
  const valid: UpdateRequestStatus[] = ['Pending', 'Approved', 'Rejected'];
  if (typeof requestId !== 'string' || !valid.includes(status as UpdateRequestStatus)) return { ok: false, error: 'Invalid request.' };
  const next = status as UpdateRequestStatus;

  let result: ActionResult;
  try {
    result = await mutate<ActionResult>(db => {
      const req = db.requests.find(r => r.id === requestId);
      if (!req) return abort({ ok: false, error: 'This report no longer exists.' });
      if (req.status === next) return abort({ ok: true });
      req.status = next;
      req.resolvedAt = next === 'Pending' ? undefined : new Date().toISOString();
      const verb = next === 'Approved' ? 'Resolved' : next === 'Rejected' ? 'Rejected' : 'Reopened';
      log(db, {
        by: session.username,
        action: next === 'Approved' ? 'request-approved' : next === 'Rejected' ? 'request-rejected' : 'request-reopened',
        facultyId: req.facultyId || undefined,
        facultyName: req.facultyName || undefined,
        summary: `${verb} report "${req.issueType}" from ${req.submittedBy}`,
      });
      return { ok: true };
    });
  } catch (e) {
    return { ok: false, error: storageMessage(e) };
  }
  if (result.ok) refreshAll();
  return result;
}
