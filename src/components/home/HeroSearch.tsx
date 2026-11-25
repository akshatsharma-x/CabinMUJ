'use client';

import React, { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import type { FacultySummary } from '@/lib/types';
import { buildSearchIndex, DESIGNATION_CATEGORIES, formatLocation, searchIndex, type FilterOptions } from '@/lib/faculty-utils';
import styles from './HeroSearch.module.css';

type DropdownKey = 'department' | 'block' | 'floor' | 'type';

const POPULAR_SEARCHES = ['Computer Science HoD', 'AB2 Faculty', 'Dr. Arjun Singh', 'Data Science', 'AB3 Block'];

const subscribeNoop = () => () => {};
const isMacPlatform = () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EA4D1B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden
    style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><path d="m6 9 6 6 6-6"></path></svg>
);

export const HeroSearch = ({ faculty, options }: { faculty: FacultySummary[]; options: FilterOptions }) => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [activeDropdown, setActiveDropdown] = useState<DropdownKey | null>(null);

  const [department, setDepartment] = useState<string | null>(null);
  const [block, setBlock] = useState<string | null>(null);
  const [floor, setFloor] = useState<string | null>(null);
  const [facultyType, setFacultyType] = useState<string | null>(null);
  const [hodOnly, setHodOnly] = useState(false);

  // null during SSR, so the badge never mismatches on hydration.
  const isMac = useSyncExternalStore(subscribeNoop, isMacPlatform, () => null);

  // Keyboard shortcut: Cmd/Ctrl + K focuses the search box.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside closes dropdowns and suggestions.
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const index = useMemo(() => buildSearchIndex(faculty), [faculty]);
  const suggestions = useMemo(
    () => (searchQuery.trim() ? searchIndex(index, searchQuery).slice(0, 6) : []),
    [index, searchQuery],
  );
  const showSuggestions = isFocused && suggestions.length > 0;

  const buildDirectoryUrl = (query: string) => {
    const params = new URLSearchParams();
    if (query.trim()) params.set('search', query.trim());
    if (department) params.set('department', department);
    if (block) params.set('block', block);
    if (floor) params.set('floor', floor);
    if (facultyType) params.set('category', facultyType);
    if (hodOnly) params.set('hod', '1');
    const qs = params.toString();
    return qs ? `/faculty?${qs}` : '/faculty';
  };

  const openProfile = (f: FacultySummary) => {
    setIsFocused(false);
    router.push(`/faculty/${f.id}`);
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (showSuggestions && activeIndex >= 0 && suggestions[activeIndex]) {
      openProfile(suggestions[activeIndex]);
      return;
    }
    router.push(buildDirectoryUrl(searchQuery));
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, -1));
    } else if (e.key === 'Escape') {
      setIsFocused(false);
    }
  };

  const handleClearAll = () => {
    setSearchQuery('');
    setDepartment(null);
    setBlock(null);
    setFloor(null);
    setFacultyType(null);
    setHodOnly(false);
    setActiveDropdown(null);
  };

  const toggle = (key: DropdownKey) => setActiveDropdown(activeDropdown === key ? null : key);

  const dropdown = (
    key: DropdownKey,
    allLabel: string,
    values: readonly string[],
    current: string | null,
    set: (v: string | null) => void,
  ) =>
    activeDropdown === key && (
      <div className={styles.dropdownMenu} role="listbox" aria-label={allLabel}>
        <button type="button" role="option" aria-selected={current === null} onClick={() => { set(null); setActiveDropdown(null); }} className={styles.dropdownItem}>
          {allLabel}
        </button>
        {values.map(v => (
          <button key={v} type="button" role="option" aria-selected={current === v}
            onClick={() => { set(v); setActiveDropdown(null); }}
            className={`${styles.dropdownItem} ${current === v ? styles.dropdownItemActive : ''}`}>
            {v}
          </button>
        ))}
      </div>
    );

  return (
    <div ref={containerRef} className={styles.searchPanel}>

      {/* 1. TOP ROW: SEARCH INPUT */}
      <form onSubmit={handleSearch} role="search" style={{ position: 'relative' }}>
        <div className={styles.searchInputWrapper}>
          <div className={styles.searchIconContainer} aria-hidden>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>

          <label htmlFor="hero-search" className="sr-only">Search faculty</label>
          <input
            id="hero-search"
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={showSuggestions}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={showSuggestions && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
            autoComplete="off"
            enterKeyHint="search"
            placeholder="Search faculty by name, department, block or cabin..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setActiveIndex(-1); setIsFocused(true); }}
            onFocus={() => setIsFocused(true)}
            onKeyDown={onInputKeyDown}
          />

          {isMac !== null && <div className={styles.shortcutBadge} aria-hidden>{isMac ? '⌘ K' : 'Ctrl K'}</div>}

          <button type="submit" className={styles.searchButton} aria-label="Search">
            <span>Search</span>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </button>
        </div>

        {/* Autocomplete: picking a result opens that faculty's profile directly */}
        {showSuggestions && (
          <div className={styles.autocompleteDropdown} id={listId} role="listbox" aria-label="Matching faculty">
            {suggestions.map((fac, i) => (
              <div
                key={fac.id}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === activeIndex}
                onMouseDown={e => e.preventDefault()}
                onClick={() => openProfile(fac)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`${styles.autocompleteItem} ${i === activeIndex ? styles.autocompleteItemActive : ''}`}
              >
                <div style={{ minWidth: 0 }}>
                  <div className={styles.autocompleteName}>{fac.name}{fac.isHOD ? ' · HoD' : ''}</div>
                  <div className={styles.autocompleteDept}>{fac.department}</div>
                </div>
                <div className={styles.autocompleteBadge}>{formatLocation(fac) || 'Location TBD'}</div>
              </div>
            ))}
            <button type="submit" className={styles.autocompleteAll}>
              See all results for “{searchQuery.trim()}” →
            </button>
          </div>
        )}
      </form>

      {/* 2. MIDDLE ROW: FILTERS */}
      <div className={styles.filterRow}>
        <div style={{ position: 'relative' }}>
          <button type="button" onClick={() => toggle('department')} aria-expanded={activeDropdown === 'department'}
            className={`${styles.filterPill} ${activeDropdown === 'department' || department ? styles.filterPillActive : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EA4D1B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M3 21h18"></path><path d="M3 7v1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1h-18l2-4h14l2 4"></path><line x1="5" y1="21" x2="5" y2="10"></line><line x1="19" y1="21" x2="19" y2="10"></line><path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"></path></svg>
            <span className={styles.filterPillText} style={{ width: '110px', textAlign: 'left' }}>{department || 'Department'}</span>
            <ChevronIcon open={activeDropdown === 'department'} />
          </button>
          {dropdown('department', 'All Departments', options.departments, department, setDepartment)}
        </div>

        <div style={{ position: 'relative' }}>
          <button type="button" onClick={() => toggle('block')} aria-expanded={activeDropdown === 'block'}
            className={`${styles.filterPill} ${activeDropdown === 'block' || block ? styles.filterPillActive : ''}`} style={{ width: '165px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EA4D1B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>
            <span className={styles.filterPillText} style={{ flex: 1, textAlign: 'left' }}>{block || 'Block'}</span>
            <ChevronIcon open={activeDropdown === 'block'} />
          </button>
          {dropdown('block', 'All Blocks', options.blocks, block, setBlock)}
        </div>

        <div style={{ position: 'relative' }}>
          <button type="button" onClick={() => toggle('floor')} aria-expanded={activeDropdown === 'floor'}
            className={`${styles.filterPill} ${activeDropdown === 'floor' || floor ? styles.filterPillActive : ''}`} style={{ width: '165px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EA4D1B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 12 12 17 22 12"></polyline><polyline points="2 17 12 22 22 17"></polyline></svg>
            <span className={styles.filterPillText} style={{ flex: 1, textAlign: 'left' }}>{floor || 'Floor'}</span>
            <ChevronIcon open={activeDropdown === 'floor'} />
          </button>
          {dropdown('floor', 'All Floors', options.floors, floor, setFloor)}
        </div>

        <div style={{ position: 'relative' }}>
          <button type="button" onClick={() => toggle('type')} aria-expanded={activeDropdown === 'type'}
            className={`${styles.filterPill} ${activeDropdown === 'type' || facultyType ? styles.filterPillActive : ''}`} style={{ width: '235px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EA4D1B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span className={styles.filterPillText} style={{ flex: 1, textAlign: 'left' }}>{facultyType || 'Designation'}</span>
            <ChevronIcon open={activeDropdown === 'type'} />
          </button>
          {dropdown('type', 'All Designations', DESIGNATION_CATEGORIES, facultyType, setFacultyType)}
        </div>

        <div className={styles.hodControl}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EA4D1B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          <span id="hod-only-label">HoD Only</span>
          <button type="button" role="switch" aria-checked={hodOnly} aria-labelledby="hod-only-label"
            onClick={() => setHodOnly(!hodOnly)} className={`${styles.toggleSwitch} ${hodOnly ? styles.toggleSwitchOn : ''}`}>
            <div className={styles.toggleKnob}></div>
          </button>
        </div>
      </div>

      <div className={styles.divider}></div>

      {/* 3. BOTTOM ROW: POPULAR SEARCHES */}
      <div className={styles.popularRow}>
        <span className={styles.popularLabel}>Popular Searches:</span>
        {POPULAR_SEARCHES.map(q => (
          <button key={q} type="button" onClick={() => router.push(`/faculty?search=${encodeURIComponent(q)}`)} className={styles.popularChip}>{q}</button>
        ))}

        <button type="button" onClick={handleClearAll} className={styles.clearAllBtn}>
          Clear all
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path></svg>
        </button>
      </div>
    </div>
  );
};
