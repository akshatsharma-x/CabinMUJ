'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { restoreFaculty } from '@/lib/actions/admin';
import { useToast } from './Toast';

/**
 * Shows the result of a save/delete that redirected here (?done=saved&id=…),
 * then removes those parameters from the URL so a refresh doesn't repeat it.
 */
export function AdminNotice({ names }: { names: Record<string, string> }) {
  const params = useSearchParams();
  const toast = useToast();
  const router = useRouter();
  const handled = useRef<string | null>(null);

  const done = params.get('done');
  const id = params.get('id') ?? '';
  const ref = params.get('ref') ?? '';
  const deletedName = params.get('name') ?? 'Faculty member';

  useEffect(() => {
    if (!done) return;
    const key = `${done}:${id}:${ref}`;
    if (handled.current === key) return;
    handled.current = key;

    const name = names[id] ?? 'Faculty member';
    if (done === 'created') {
      toast({ message: `Added ${name}.`, action: { label: 'View page', onClick: () => router.push(`/faculty/${id}`) } });
    } else if (done === 'saved') {
      toast({ message: `Saved changes to ${name}.`, action: { label: 'View page', onClick: () => router.push(`/faculty/${id}`) } });
    } else if (done === 'unchanged') {
      toast({ message: `No changes to save for ${name}.` });
    } else if (done === 'deleted') {
      toast({
        message: `Deleted ${deletedName}.`,
        action: {
          label: 'Undo',
          onClick: async () => {
            const res = await restoreFaculty(ref);
            toast(res.ok ? { message: `Restored ${res.name}.` } : { message: res.error, tone: 'error' });
          },
        },
      });
    }

    const url = new URL(window.location.href);
    ['done', 'id', 'ref', 'name'].forEach(k => url.searchParams.delete(k));
    window.history.replaceState(null, '', url.pathname + url.search);
  }, [done, id, ref, deletedName, names, toast, router]);

  return null;
}
