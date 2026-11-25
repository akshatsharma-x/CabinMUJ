'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type Getter = (key: string) => string | null;

/**
 * State mirrored into the URL query (so filtered views are shareable and survive
 * a refresh), updated with history.replaceState — no server round trip per
 * keystroke. Only the listed keys are touched; other params are left alone.
 * When the URL changes from outside (a link, back/forward), the state follows it.
 *
 * `keys`, `parse` and `serialize` must be stable (define them at module level).
 */
export function useUrlState<T>(
  keys: readonly string[],
  parse: (get: Getter) => T,
  serialize: (value: T) => Record<string, string>,
) {
  const searchParams = useSearchParams();

  const fromUrl = (() => {
    const p = new URLSearchParams();
    for (const k of keys) {
      const v = searchParams.get(k);
      if (v) p.set(k, v);
    }
    return p.toString();
  })();
  const fromValue = (v: T) => {
    const s = serialize(v);
    const p = new URLSearchParams();
    for (const k of keys) if (s[k]) p.set(k, s[k]);
    return p.toString();
  };

  const [value, setValue] = useState<T>(() => parse(k => searchParams.get(k)));
  const [syncedUrl, setSyncedUrl] = useState(fromUrl);

  if (fromUrl !== syncedUrl) {
    setSyncedUrl(fromUrl);
    if (fromUrl !== fromValue(value)) setValue(parse(k => searchParams.get(k)));
  }

  useEffect(() => {
    const url = new URL(window.location.href);
    const s = serialize(value);
    let changed = false;
    for (const k of keys) {
      const next = s[k] ?? '';
      if ((url.searchParams.get(k) ?? '') !== next) {
        changed = true;
        if (next) url.searchParams.set(k, next);
        else url.searchParams.delete(k);
      }
    }
    if (changed) window.history.replaceState(null, '', url.pathname + url.search + url.hash);
  }, [value, keys, serialize]);

  return [value, setValue, fromValue(value)] as const;
}
