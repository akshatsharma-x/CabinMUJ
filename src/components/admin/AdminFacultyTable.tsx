'use client';

import React, { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import type { Faculty } from '@/lib/types';
import { buildSearchIndex, compareByName, formatDate, hasLocation, searchIndex, type FilterOptions } from '@/lib/faculty-utils';
import { useUrlState } from '@/lib/use-url-state';
import { deleteFaculty, restoreFaculty, setLocationVerified } from '@/lib/actions/admin';
import { Avatar } from '@/components/ui/Avatar';
import { useToast } from './Toast';

const PAGE_SIZE = 50;
const STATUS_FILTERS = [
  ['', 'All'],
  ['unverified', 'Location unverified'],
  ['verified', 'Location verified'],
  ['nolocation', 'No location'],
] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number][0];

interface ListState {
  q: string;
  department: string;
  block: string;
  status: StatusFilter;
  sort: 'name' | 'recent';
  page: number;
}

const KEYS = ['q', 'department', 'block', 'status', 'sort', 'page'] as const;

function parseState(get: (k: string) => string | null): ListState {
  const status = get('status') ?? '';
  return {
    q: get('q') ?? '',
    department: get('department') ?? '',
    block: get('block') ?? '',
    status: (STATUS_FILTERS.map(s => s[0]) as string[]).includes(status) ? (status as StatusFilter) : '',
    sort: get('sort') === 'recent' ? 'recent' : 'name',
    page: Math.max(1, Number.parseInt(get('page') ?? '1', 10) || 1),
  };
}

function serializeState(s: ListState): Record<string, string> {
  return {
    q: s.q,
    department: s.department,
    block: s.block,
    status: s.status,
    sort: s.sort === 'recent' ? 'recent' : '',
    page: s.page > 1 ? String(s.page) : '',
  };
}

const byRecent = (a: Faculty, b: Faculty) =>
  (b.lastUpdated || '').localeCompare(a.lastUpdated || '') || compareByName(a, b);

export function AdminFacultyTable({ faculty, options }: { faculty: Faculty[]; options: FilterOptions }) {
  const [state, setState, stateKey] = useUrlState(KEYS, parseState, serializeState);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const toast = useToast();

  const update = (patch: Partial<ListState>) => setState(s => ({ ...s, page: 1, ...patch }));

  const index = useMemo(() => buildSearchIndex(faculty), [faculty]);
  const filtered = useMemo(() => {
    const list = searchIndex(index, state.q, f =>
      (!state.department || f.department === state.department) &&
      (!state.block || f.block === state.block) &&
      (state.status === '' ||
        (state.status === 'verified' && Boolean(f.locationVerified)) ||
        (state.status === 'unverified' && hasLocation(f) && !f.locationVerified) ||
        (state.status === 'nolocation' && !hasLocation(f))),
    );
    // With a search query keep relevance order; otherwise sort as chosen.
    if (state.q.trim()) return list;
    return [...list].sort(state.sort === 'recent' ? byRecent : compareByName);
  }, [index, state]);

  const verifiedCount = useMemo(() => faculty.filter(f => f.locationVerified).length, [faculty]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(state.page, totalPages);
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const listUrl = `/admin/faculty${stateKey ? `?${stateKey}` : ''}`;
  const editHref = (id: string) => `/admin/faculty/${id}?returnTo=${encodeURIComponent(listUrl)}`;

  const run = (id: string, task: () => Promise<void>) => {
    setBusyId(id);
    startTransition(async () => {
      try {
        await task();
      } catch {
        toast({ message: 'Could not reach the server. Please try again.', tone: 'error' });
      } finally {
        setBusyId(null);
      }
    });
  };

  const toggleVerified = (f: Faculty) =>
    run(f.id, async () => {
      const res = await setLocationVerified(f.id, !f.locationVerified);
      toast(res.ok
        ? { message: f.locationVerified ? `Marked ${f.name}'s location as unverified.` : `Verified ${f.name}'s location.` }
        : { message: res.error, tone: 'error' });
    });

  const remove = (f: Faculty) => {
    if (!window.confirm(`Delete ${f.name}?\n\nThey will disappear from the public directory. You can undo this right after, or later from the History page.`)) return;
    run(f.id, async () => {
      const res = await deleteFaculty(f.id);
      if (!res.ok) {
        toast({ message: res.error, tone: 'error' });
        return;
      }
      toast({
        message: `Deleted ${res.name}.`,
        action: {
          label: 'Undo',
          onClick: async () => {
            const r = await restoreFaculty(res.historyId);
            toast(r.ok ? { message: `Restored ${r.name}.` } : { message: r.error, tone: 'error' });
          },
        },
      });
    });
  };

  return (
    <div className="card animate-fade-in">
      {/* Filters */}
      <div className="p-4 border-b flex flex-col gap-3">
        <div className="flex flex-wrap gap-3">
          <input
            type="search"
            aria-label="Search faculty"
            placeholder="Search name, department, email, block or cabin…"
            className="input"
            style={{ flex: '1 1 280px' }}
            value={state.q}
            onChange={e => update({ q: e.target.value })}
          />
          <select className="input" aria-label="Filter by department" style={{ flex: '1 1 200px' }} value={state.department} onChange={e => update({ department: e.target.value })}>
            <option value="">All departments</option>
            {options.departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="input" aria-label="Filter by block" style={{ flex: '0 1 140px' }} value={state.block} onChange={e => update({ block: e.target.value })}>
            <option value="">All blocks</option>
            {options.blocks.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <select className="input" aria-label="Sort" style={{ flex: '0 1 170px' }} value={state.sort} onChange={e => update({ sort: e.target.value === 'recent' ? 'recent' : 'name' })} disabled={Boolean(state.q.trim())}
            title={state.q.trim() ? 'Search results are sorted by relevance' : undefined}>
            <option value="name">Sort: Name A–Z</option>
            <option value="recent">Sort: Recently updated</option>
          </select>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="chip-scroll" role="group" aria-label="Filter by location status">
            {STATUS_FILTERS.map(([value, label]) => (
              <button key={value} type="button" className={`chip ${state.status === value ? 'chip-active' : ''}`} aria-pressed={state.status === value}
                onClick={() => update({ status: value })}>
                {label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted" aria-live="polite">
            {filtered.length.toLocaleString('en-IN')} shown · {verifiedCount} of {faculty.length} locations verified
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Faculty</th>
              <th>Department</th>
              <th>Location</th>
              <th>Updated</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(f => {
              const busy = busyId === f.id;
              const located = hasLocation(f);
              return (
                <tr key={f.id} style={{ opacity: busy ? 0.55 : 1 }}>
                  <td style={{ minWidth: 240 }}>
                    <div className="flex items-center gap-3">
                      <Avatar name={f.name} photo={f.photo} size={32} />
                      <div className="min-w-0">
                        <Link href={editHref(f.id)} className="font-medium" style={{ color: 'var(--text-primary)' }}>{f.name}</Link>
                        {f.isHOD && <span className="badge badge-orange ml-2">HOD</span>}
                        <p className="text-xs text-muted truncate" style={{ maxWidth: 260 }}>{f.designation}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-secondary" style={{ minWidth: 160 }}>{f.department}</td>
                  <td style={{ minWidth: 200 }}>
                    {located ? (
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="location-badge" style={{ fontSize: '0.625rem' }}>{f.block}</span>
                        <span className="location-badge-outline" style={{ fontSize: '0.625rem' }}>{f.cabinNumber}</span>
                        {f.floor && <span className="text-xs text-muted nowrap">{f.floor}</span>}
                      </div>
                    ) : (
                      <span className="badge badge-gray">Not set</span>
                    )}
                    {located && (
                      <button type="button" disabled={busy} onClick={() => toggleVerified(f)}
                        className={`badge ${f.locationVerified ? 'badge-green' : 'badge-yellow'} mt-1`}
                        style={{ border: 'none', cursor: 'pointer' }}
                        title={f.locationVerified ? 'Click to mark as unverified' : 'Click after confirming the cabin is correct'}>
                        {f.locationVerified ? '✓ Verified' : 'Unverified · mark verified'}
                      </button>
                    )}
                  </td>
                  <td className="text-xs text-muted nowrap">{f.lastUpdated ? formatDate(f.lastUpdated) : '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="flex justify-end gap-2">
                      <Link href={editHref(f.id)} className="btn btn-sm btn-secondary" style={{ borderRadius: '6px' }}>Edit</Link>
                      <Link href={`/faculty/${f.id}`} className="btn btn-sm btn-ghost" style={{ borderRadius: '6px' }} target="_blank" title="Open the public page in a new tab">View ↗</Link>
                      <button type="button" disabled={busy} onClick={() => remove(f)} className="btn btn-sm btn-danger" style={{ borderRadius: '6px' }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-muted">
                  No faculty match these filters.{' '}
                  <button type="button" className="btn-link" onClick={() => update({ q: '', department: '', block: '', status: '' })}>Clear filters</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t flex items-center justify-between gap-3 text-sm">
          <button type="button" className="btn btn-sm btn-secondary" disabled={page <= 1} onClick={() => setState(s => ({ ...s, page: page - 1 }))}>← Previous</button>
          <span className="text-muted">Page {page} of {totalPages}</span>
          <button type="button" className="btn btn-sm btn-secondary" disabled={page >= totalPages} onClick={() => setState(s => ({ ...s, page: page + 1 }))}>Next →</button>
        </div>
      )}
    </div>
  );
}
