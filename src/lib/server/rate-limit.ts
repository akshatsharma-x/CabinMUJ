import 'server-only';
import { headers } from 'next/headers';
import { getRedis } from './store';

/**
 * Fixed-window counters for login attempts and public reports.
 *
 * - With Redis (e.g. on Vercel, where many server instances run at once) the
 *   counters live in Redis, so every instance sees the same numbers.
 * - Otherwise they live in this process's memory.
 *
 * Client addresses come from proxy headers, which a client can fake when the app
 * is reached directly. So every limit is paired with a site-wide ("global") limit
 * that no amount of address spoofing can get around.
 */

export interface Limit {
  key: string;
  limit: number;
  windowMs: number;
  global?: boolean;
}

const redisKey = (key: string) => `cabinmuj:rl:${key}`;

/** Returns the longest remaining wait (ms) among the exhausted limits, else 0. */
const LIMITED_SCRIPT = `
local wait = 0
for i, key in ipairs(KEYS) do
  local count = tonumber(redis.call('GET', key) or '0')
  if count >= tonumber(ARGV[i]) then
    local ttl = redis.call('PTTL', key)
    if ttl > wait then wait = ttl end
  end
end
return wait`;

/** Counts one event per key; the first event of a window sets its expiry. */
const HIT_SCRIPT = `
for i, key in ipairs(KEYS) do
  if redis.call('INCR', key) == 1 then redis.call('PEXPIRE', key, ARGV[i]) end
end
return 1`;

// ─── In-memory fallback ──────────────────────────────────────────────────

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

// ─── API ─────────────────────────────────────────────────────────────────

/** Milliseconds until the first exhausted limit resets, or 0 if none is exhausted. Doesn't count anything. */
export async function limitedFor(limits: Limit[]): Promise<number> {
  const redis = getRedis();
  if (redis) {
    const wait = await redis.eval(LIMITED_SCRIPT, limits.map(l => redisKey(l.key)), limits.map(l => String(l.limit)));
    return Math.max(0, Number(wait) || 0);
  }
  const now = Date.now();
  let wait = 0;
  for (const l of limits) {
    const b = (l.global ? globalBuckets : clientBuckets).get(l.key);
    if (b && b.resetAt > now && b.count >= l.limit) wait = Math.max(wait, b.resetAt - now);
  }
  return wait;
}

/** Counts one event against each limit. */
export async function hit(limits: Limit[]): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.eval(HIT_SCRIPT, limits.map(l => redisKey(l.key)), limits.map(l => String(l.windowMs)));
    return;
  }
  const now = Date.now();
  for (const l of limits) bucketFor(l.global ? globalBuckets : clientBuckets, l.key, l.windowMs, now).count++;
  evictIfNeeded(now);
}

export async function clearClient(key: string): Promise<void> {
  const redis = getRedis();
  if (redis) {
    await redis.del(redisKey(key));
    return;
  }
  clientBuckets.delete(key);
}

/** Best-effort client address: X-Real-IP (set by most reverse proxies), else the first X-Forwarded-For entry. */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get('x-real-ip')?.trim() || h.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}
