'use client';

import React, { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { unstable_rethrow } from 'next/navigation';
import type { HistoryAction, HistoryRow } from '@/lib/types';
import { formatDateTime } from '@/lib/faculty-utils';
import { restoreFaculty } from '@/lib/actions/admin';
import { useToast } from './Toast';

const ACTION_STYLE: Record<HistoryAction, { label: string; color: string }> = {
  created: { label: 'Added', color: '#16A34A' },
  updated: { label: 'Edited', color: '#2563EB' },
  deleted: { label: 'Deleted', color: '#DC2626' },
  restored: { label: 'Restored', color: '#16A34A' },
  verified: { label: 'Verified', color: '#16A34A' },
  unverified: { label: 'Unverified', color: '#B45309' },
  'request-approved': { label: 'Report resolved', color: '#16A34A' },
  'request-rejected': { label: 'Report rejected', color: '#B45309' },
  'request-reopened': { label: 'Report reopened', color: '#6B7280' },
};

export function HistoryList({ entries, existingIds, compact = false }: { entries: HistoryRow[]; existingIds: string[]; compact?: boolean }) {
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const toast = useToast();
  const exists = useMemo(() => new Set(existingIds), [existingIds]);

  const q = query.trim().toLowerCase();
  const shown = q
    ? entries.filter(e => `${e.facultyName ?? ''} ${e.summary} ${e.changes?.map(c => `${c.field} ${c.from} ${c.to}`).join(' ') ?? ''}`.toLowerCase().includes(q))
    : entries;

  const restore = (entry: HistoryRow) => {
    setBusyId(entry.id);
    startTransition(async () => {
      try {
        const res = await restoreFaculty(entry.id);
        toast(res.ok ? { message: `Restored ${res.name}.` } : { message: res.error, tone: 'error' });
      } catch (err) {
        unstable_rethrow(err);
        toast({ message: 'Could not reach the server. Please try again.', tone: 'error' });
      } finally {
        setBusyId(null);
      }
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {!compact && (
        <input type="search" className="input mb-2" style={{ maxWidth: 420 }} placeholder="Filter by name or change…" aria-label="Filter history"
          value={query} onChange={e => setQuery(e.target.value)} />
      )}
      {shown.map(entry => {
        const style = ACTION_STYLE[entry.action] ?? { label: entry.action, color: '#6B7280' };
        const linkable = entry.facultyId && exists.has(entry.facultyId);
        return (
          <div key={entry.id} className="p-3 rounded" style={{ background: 'var(--bg-subtle)', borderLeft: `3px solid ${style.color}` }}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm">
                  <span className="font-semibold" style={{ color: style.color }}>{style.label}</span>{' '}
                  {linkable ? (
                    <Link href={`/admin/faculty/${entry.facultyId}`} className="font-medium" style={{ textDecoration: 'underline', textUnderlineOffset: 2 }}>{entry.facultyName}</Link>
                  ) : (
                    <span className="font-medium">{entry.facultyName ?? ''}</span>
                  )}
                </p>
                <p className="text-xs text-muted mt-1">{entry.summary}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-muted nowrap">{formatDateTime(entry.at)} · {entry.by}</span>
                {entry.action === 'deleted' && entry.restorable && (
                  <button type="button" className="btn btn-sm btn-secondary" disabled={busyId === entry.id} onClick={() => restore(entry)}>
                    {busyId === entry.id ? 'Restoring…' : 'Restore'}
                  </button>
                )}
                {entry.action === 'deleted' && entry.restoredAt && <span className="badge badge-green">restored</span>}
              </div>
            </div>
            {!compact && entry.changes && entry.changes.length > 0 && (
              <table style={{ marginTop: '0.5rem', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
                <tbody>
                  {entry.changes.map(c => (
                    <tr key={c.field}>
                      <td className="text-xs font-semibold" style={{ width: '22%', padding: '0.375rem 0.625rem' }}>{c.field}</td>
                      <td className="text-xs diff-from" style={{ padding: '0.375rem 0.625rem' }}>{c.from}</td>
                      <td className="text-xs diff-to" style={{ padding: '0.375rem 0.625rem' }}>{c.to}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
      })}
      {shown.length === 0 && <p className="text-sm text-center py-8 text-muted">{q ? 'No matching changes.' : 'No changes recorded yet.'}</p>}
    </div>
  );
}
