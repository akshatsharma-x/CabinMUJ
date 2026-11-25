import 'server-only';
import { cache } from 'react';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { dataDir, mutate, readDb, storageKind } from './store';

/**
 * Admin authentication.
 *
 * Credentials come from the environment (ADMIN_USERNAME / ADMIN_PASSWORD in
 * .env.local or the host's settings) so the password never ships in the
 * browser bundle or the git history. A successful login sets a signed,
 * HttpOnly cookie; every admin page and server action verifies it.
 */

export const SESSION_COOKIE = 'cabinmuj_admin';
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

let generatedSecret: string | null = null;

/**
 * Used when ADMIN_SESSION_SECRET isn't set: a random secret kept in the data folder
 * (so sessions survive restarts). Never derived from the password alone — otherwise a
 * leaked cookie would let someone brute-force the password offline.
 */
function storedSecret(): string {
  if (generatedSecret) return generatedSecret;
  const file = path.join(dataDir(), '.session-secret');
  const read = () => {
    try {
      const v = readFileSync(file, 'utf8').trim();
      return v.length >= 32 ? v : null;
    } catch {
      return null;
    }
  };
  const existing = read();
  if (existing) return (generatedSecret = existing);
  const fresh = randomBytes(32).toString('hex');
  try {
    mkdirSync(dataDir(), { recursive: true });
    writeFileSync(file, fresh, { mode: 0o600, flag: 'wx' });
  } catch {
    const raced = read(); // another process created it first
    if (raced) return (generatedSecret = raced);
    // Read-only disk: keep it in memory (admins are signed out on restart).
  }
  return (generatedSecret = fresh);
}

/**
 * On Vercel (or any setup using Redis) there are many short-lived server instances and
 * no shared disk, so a generated secret can't be kept — it must come from the environment.
 */
function secretMustBeConfigured(): boolean {
  return Boolean(process.env.VERCEL) || storageKind() === 'redis';
}

/** What's missing for admin login to work, in plain words — or null if it's all set. */
export function adminSetupProblem(): string | null {
  const missing: string[] = [];
  if (!process.env.ADMIN_USERNAME?.trim()) missing.push('ADMIN_USERNAME');
  if (!process.env.ADMIN_PASSWORD) missing.push('ADMIN_PASSWORD');
  if (!process.env.ADMIN_SESSION_SECRET && secretMustBeConfigured()) missing.push('ADMIN_SESSION_SECRET');
  if (!missing.length) return null;
  const where = process.env.VERCEL ? 'in your Vercel project (Settings → Environment Variables), then redeploy' : 'to .env.local (or the server environment) and restart';
  return `Admin login isn't set up on this server yet: add ${missing.join(', ')} ${where}. See README.`;
}

function config() {
  if (adminSetupProblem()) return null;
  const username = process.env.ADMIN_USERNAME!.trim();
  const password = process.env.ADMIN_PASSWORD!;
  // Mixing the credentials into the key means changing the password signs everyone out.
  const secret = createHmac('sha256', process.env.ADMIN_SESSION_SECRET || storedSecret())
    .update(`${username}\u0000${password}`)
    .digest('hex');
  return { username, password, secret };
}

export function isAdminConfigured(): boolean {
  return adminSetupProblem() === null;
}

const sha256 = (s: string) => createHash('sha256').update(s, 'utf8').digest();

/** Constant-time comparison that does not leak the length of either value. */
function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(sha256(a), sha256(b));
}

/** Returns the canonical username when the credentials are correct. Username is case-insensitive. */
export function checkCredentials(username: string, password: string): string | null {
  const cfg = config();
  if (!cfg) return null;
  const userOk = safeEqual(username.trim().toLowerCase(), cfg.username.toLowerCase());
  const passOk = safeEqual(password, cfg.password);
  return userOk && passOk ? cfg.username : null;
}

const sign = (payload: string, secret: string) => createHmac('sha256', secret).update(payload).digest('base64url');

function verifyToken(token: string | undefined, validAfter: number): { username: string } | null {
  const cfg = config();
  if (!cfg || !token) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = Buffer.from(sign(payload, cfg.secret));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { u?: unknown; exp?: unknown; iat?: unknown };
    if (typeof data.exp !== 'number' || data.exp * 1000 <= Date.now()) return null;
    // Logout revokes every session issued up to that moment (milliseconds, so a quick re-login still works).
    if (typeof data.iat !== 'number' || data.iat <= validAfter) return null;
    if (data.u !== cfg.username) return null;
    return { username: cfg.username };
  } catch {
    return null;
  }
}

/** The signed-in admin for this request, or null. Memoized per request. */
export const getAdminSession = cache(async (): Promise<{ username: string } | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  let validAfter = 0;
  try {
    // Always fresh, so a logout on one server instance signs this session out everywhere at once.
    validAfter = (await readDb({ maxAgeMs: 0 })).authValidAfter;
  } catch {
    // Unreadable data file: still allow signing in, so the admin can see what's wrong.
  }
  return verifyToken(token, validAfter);
});

/** For admin pages: sends visitors who aren't signed in to the login page. */
export async function requireAdminPage(nextPath: string): Promise<{ username: string }> {
  const session = await getAdminSession();
  if (!session) redirect(`/admin/login?next=${encodeURIComponent(nextPath)}`);
  return session;
}

/**
 * Only same-site admin paths are allowed as redirect targets (no open redirects).
 * The path is normalized *before* checking, so tricks like "/admin/..//evil.com" or
 * "%2e%2e" can't turn into a "//evil.com" (other-site) URL afterwards.
 */
export function safeAdminPath(next: unknown, fallback = '/admin'): string {
  if (typeof next !== 'string' || !next.startsWith('/') || next.startsWith('//') || /[\\\u0000-\u001f]/.test(next)) return fallback;
  let url: URL;
  try {
    url = new URL(next, 'http://cabinmuj.invalid');
  } catch {
    return fallback;
  }
  if (url.origin !== 'http://cabinmuj.invalid') return fallback;
  if (!/^\/admin(?:\/|$)/.test(url.pathname) || url.pathname.startsWith('/admin/login')) return fallback;
  return url.pathname + url.search + url.hash;
}

async function requestIsHttps(): Promise<boolean> {
  const h = await headers();
  const proto = h.get('x-forwarded-proto')?.split(',')[0]?.trim();
  if (proto) return proto === 'https';
  return (h.get('origin') ?? h.get('referer') ?? '').startsWith('https://');
}

export async function startSession(username: string): Promise<void> {
  const cfg = config();
  if (!cfg) throw new Error('Admin login is not configured');
  const iat = Date.now(); // milliseconds
  const exp = Math.floor(iat / 1000) + SESSION_TTL_SECONDS;
  const payload = Buffer.from(JSON.stringify({ u: username, iat, exp })).toString('base64url');
  (await cookies()).set(SESSION_COOKIE, `${payload}.${sign(payload, cfg.secret)}`, {
    httpOnly: true,
    sameSite: 'lax',
    // Secure only over HTTPS, so logging in still works on plain-HTTP setups (e.g. a LAN demo).
    secure: await requestIsHttps(),
    path: '/',
    expires: new Date(exp * 1000),
  });
}

/** Signs out: deletes the cookie and revokes every session issued until now (also on other devices). */
export async function endSession(): Promise<void> {
  const now = Date.now();
  try {
    await mutate(db => {
      db.authValidAfter = now;
    });
  } catch {
    // Storage unavailable: the cookie is still removed below.
  }
  (await cookies()).delete(SESSION_COOKIE);
}
