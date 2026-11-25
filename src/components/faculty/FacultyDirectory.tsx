'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import type { FacultySummary } from '@/lib/types';
import { NOT_LISTED_ISSUE } from '@/lib/types';
import {
  buildSearchIndex,
  DESIGNATION_CATEGORIES,
  designationCategory,
  searchIndex,
  type DesignationCategory,
  type FilterOptions,
} from '@/lib/faculty-utils';
import { FacultyCard } from '@/components/ui/FacultyCard';
import { useUrlState } from '@/lib/use-url-state';

const PAGE_SIZE = 48;

interface Filters {
  search: string;
  department: string;
  block: string;
  floor: string;
  category: DesignationCategory | '';
  hod: boolean;
}

const KEYS = ['search', 'department', 'block', 'floor', 'category', 'hod'] as const;

function parseFilters(get: (key: string) => string | null): Filters {
  const category = get('category') ?? '';
  return {
    search: get('search') ?? '',
    department: get('department') ?? '',
    block: get('block') ?? '',
    floor: get('floor') ?? '',
    category: (DESIGNATION_CATEGORIES as readonly string[]).includes(category) ? (category as DesignationCategory) : '',
    // "category=HODs" / "hod=true" are older URL formats; keep those links working.
    hod: get('hod') === '1' || get('hod') === 'true' || category === 'HODs',
  };
}

function serializeFilters(f: Filters): Record<string, string> {
  return {
    search: f.search,
    department: f.department,
    block: f.block,
    floor: f.floor,
    category: f.category,
    hod: f.hod ? '1' : '',
  };
}

const EMPTY: Filters = { search: '', department: '', block: '', floor: '', category: '', hod: false };

export function FacultyDirectory({ faculty, options }: { faculty: FacultySummary[]; options: FilterOptions }) {
  const [filters, setFilters, filterKey] = useUrlState(KEYS, parseFilters, serializeFilters);
  // How many cards are shown; resets automatically whenever the filters change.
  const [page, setPage] = useState({ key: filterKey, visible: PAGE_SIZE });
  const visible = page.key === filterKey ? page.visible : PAGE_SIZE;

  const update = (patch: Partial<Filters>) => setFilters(f => ({ ...f, ...patch }));

  const index = useMemo(() => buildSearchIndex(faculty), [faculty]);
  const results = useMemo(
    () =>
      searchIndex(index, filters.search, f =>
        (!filters.department || f.department === filters.department) &&
        (!filters.block || f.block === filters.block) &&
        (!filters.floor || f.floor === filters.floor) &&
        (!filters.category || designationCategory(f.designation) === filters.category) &&
        (!filters.hod || Boolean(f.isHOD)),
      ),
    [index, filters],
  );

  const hasFilters = filterKey !== '';
  const shown = results.slice(0, visible);

  const pill = (label: string, onClear: () => void) => (
    <span className="badge badge-orange flex items-center gap-1" style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}>
      {label}
      <button type="button" onClick={onClear} aria-label={`Remove filter ${label}`}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muj-orange)', marginLeft: '2px', fontSize: '0.9rem', lineHeight: 1 }}>×</button>
    </span>
  );

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="h2 mb-1">Faculty Directory</h1>
        <p className="text-sm text-muted" aria-live="polite">
          {hasFilters
            ? `${results.length.toLocaleString('en-IN')} of ${faculty.length.toLocaleString('en-IN')} faculty members match`
            : `${faculty.length.toLocaleString('en-IN')} faculty members — search by name, department, block or cabin`}
        </p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap gap-3 mb-3">
        <div className="flex items-center gap-2" style={{
          flex: '1 1 280px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
          padding: '0 0.75rem', background: 'var(--bg-surface)', height: '42px',
        }}>
          <span aria-hidden style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>🔍</span>
          <label htmlFor="directory-search" className="sr-only">Search faculty</label>
          <input
            id="directory-search"
            type="search"
            placeholder="Try “CSE HoD”, “AB2 305” or a name…"
            value={filters.search}
            onChange={e => update({ search: e.target.value })}
            autoComplete="off"
            style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontSize: '0.875rem', color: 'var(--text-primary)' }}
          />
          {filters.search && (
            <button type="button" onClick={() => update({ search: '' })} aria-label="Clear search"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.1rem' }}>×</button>
          )}
        </div>

        {([
          ['department', 'All departments', options.departments, '1 1 220px'],
          ['block', 'All blocks', options.blocks, '1 1 140px'],
          ['floor', 'All floors', options.floors, '1 1 140px'],
        ] as const).map(([key, all, values, flex]) => (
          <select
            key={key}
            className="input"
            aria-label={all.replace('All ', 'Filter by ')}
            value={filters[key]}
            onChange={e => update({ [key]: e.target.value })}
            style={{ flex, height: '42px', fontSize: '0.8125rem', minWidth: 0 }}
          >
            <option value="">{all}</option>
            {values.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        ))}
      </div>

      <div className="chip-scroll mb-4" role="group" aria-label="Filter by designation">
        <button type="button" className={`chip ${!filters.category ? 'chip-active' : ''}`} onClick={() => update({ category: '' })} aria-pressed={!filters.category}>
          All
        </button>
        {DESIGNATION_CATEGORIES.map(cat => (
          <button key={cat} type="button" className={`chip ${filters.category === cat ? 'chip-active' : ''}`}
            onClick={() => update({ category: filters.category === cat ? '' : cat })} aria-pressed={filters.category === cat}>
            {cat}
          </button>
        ))}
        <span aria-hidden style={{ width: 1, background: 'var(--border-color)', margin: '0 0.25rem', flexShrink: 0 }} />
        <button type="button" className={`chip ${filters.hod ? 'chip-active' : ''}`} onClick={() => update({ hod: !filters.hod })} aria-pressed={filters.hod}>
          ★ HoDs only
        </button>
      </div>

      {/* Active Filters */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
          {filters.search && pill(`“${filters.search}”`, () => update({ search: '' }))}
          {filters.department && pill(filters.department, () => update({ department: '' }))}
          {filters.block && pill(`Block ${filters.block}`, () => update({ block: '' }))}
          {filters.floor && pill(filters.floor, () => update({ floor: '' }))}
          {filters.category && pill(filters.category, () => update({ category: '' }))}
          {filters.hod && pill('HoDs only', () => update({ hod: false }))}
          <button type="button" onClick={() => update(EMPTY)} className="btn-link text-sm ml-2">Clear all</button>
        </div>
      )}

      {/* Faculty Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shown.map(f => <FacultyCard key={f.id} faculty={f} />)}
      </div>

      {results.length > visible && (
        <div className="text-center mt-8">
          <button type="button" className="btn btn-secondary" onClick={() => setPage({ key: filterKey, visible: visible + PAGE_SIZE })}>
            Show more ({(results.length - visible).toLocaleString('en-IN')} remaining)
          </button>
        </div>
      )}

      {/* Empty State */}
      {results.length === 0 && (
        <div className="text-center py-16">
          <div aria-hidden style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.4 }}>🕵️</div>
          <h2 className="h3 mb-2">No faculty found</h2>
          <p className="text-sm text-muted" style={{ maxWidth: '360px', margin: '0 auto 1.5rem' }}>
            Check the spelling, or try fewer words — a surname or department usually works best.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => update(EMPTY)} className="btn btn-primary">Clear filters</button>
            <Link href={`/report?issue=${encodeURIComponent(NOT_LISTED_ISSUE)}`} className="btn btn-secondary">Someone missing? Tell us</Link>
          </div>
        </div>
      )}
    </div>
  );
}
