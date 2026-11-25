import 'server-only';
import { headers } from 'next/headers';

/**
 * In-memory fixed-window counters (per server process).
 *
 * Client addresses come from proxy headers, which a client can fake when the app
 * is reached directly. So every limit is paired with a site-wide ("global") limit
 * that no amount of address spoofing can get around.
 */
interface Bucket {
  count: number;
  resetAt: number;
}

const MAX_CLIENT_BUCKETS = 5000;
const clientBuckets = new Map<string, Bucket>();
const globalBuckets = new Map<string, Bucket>(); // a handful of fixed keys; never evicted

function bucketFor(map: Map<string, Bucket>, key: string, windowMs: number, now: number): Bucket {
  let b = map.get(key);
  if (!b || b.resetAt <= now) {
    b = { count: 0, resetAt: now + windowMs };
    map.set(key, b);
  }
  return b;
}

function evictIfNeeded(now: number) {
  if (clientBuckets.size <= MAX_CLIENT_BUCKETS) return;
  for (const [k, b] of clientBuckets) if (b.resetAt <= now) clientBuckets.delete(k);
  // Still too many (e.g. a flood of fake addresses): drop the oldest. Global limits still apply.
  for (const k of clientBuckets.keys()) {
    if (clientBuckets.size <= MAX_CLIENT_BUCKETS * 0.8) break;
    clientBuckets.delete(k);
  }
}

export interface Limit {
  key: string;
  limit: number;
  windowMs: number;
  global?: boolean;
}

/** Milliseconds until the first exhausted limit resets, or 0 if none is exhausted. Doesn't count anything. */
export function limitedFor(limits: Limit[]): number {
  const now = Date.now();
  let wait = 0;
  for (const l of limits) {
    const b = (l.global ? globalBuckets : clientBuckets).get(l.key);
    if (b && b.resetAt > now && b.count >= l.limit) wait = Math.max(wait, b.resetAt - now);
  }
  return wait;
}

/** Counts one event against each limit. */
export function hit(limits: Limit[]): void {
  const now = Date.now();
  for (const l of limits) bucketFor(l.global ? globalBuckets : clientBuckets, l.key, l.windowMs, now).count++;
  evictIfNeeded(now);
}

export function clearClient(key: string): void {
  clientBuckets.delete(key);
}

/** Best-effort client address: X-Real-IP (set by most reverse proxies), else the first X-Forwarded-For entry. */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get('x-real-ip')?.trim() || h.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}
