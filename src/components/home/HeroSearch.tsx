'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { mockFaculty } from '@/lib/mock-data';
import styles from './HeroSearch.module.css';

export const HeroSearch = () => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Filter states
  const [department, setDepartment] = useState<string | null>(null);
  const [block, setBlock] = useState<string | null>(null);
  const [floor, setFloor] = useState<string | null>(null);
  const [facultyType, setFacultyType] = useState<string | null>(null);
  const [hodOnly, setHodOnly] = useState<boolean>(false);

  // Filter Data Extraction
  const departments = Array.from(new Set(mockFaculty.map(f => f.department).filter((f): f is string => Boolean(f)))).sort();
  const blocks = Array.from(new Set(mockFaculty.map(f => f.block).filter((f): f is string => Boolean(f)))).sort();
  const floors = Array.from(new Set(mockFaculty.map(f => f.floor).filter((f): f is string => Boolean(f)))).sort();
  const facultyTypes = Array.from(new Set(mockFaculty.map(f => f.facultyCategory).filter((f): f is string => Boolean(f)))).sort();

  // Keyboard shortcut for Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close dropdowns
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

  // Autocomplete Filtering
  const autocompleteResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const lowerQuery = searchQuery.toLowerCase();
    
    return mockFaculty.filter(fac => {
      const matchName = fac.name.toLowerCase().includes(lowerQuery);
      const matchDept = fac.department.toLowerCase().includes(lowerQuery);
      const matchBlock = (fac.block || '').toLowerCase().includes(lowerQuery);
      const matchCabin = (fac.cabinNumber || '').toLowerCase().includes(lowerQuery);
      return matchName || matchDept || matchBlock || matchCabin;
    }).slice(0, 5); // Limit to 5 results
  }, [searchQuery]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('search', searchQuery.trim());
    if (department) params.append('department', department);
    if (block) params.append('block', block);
    if (floor) params.append('floor', floor);
    if (facultyType) params.append('type', facultyType);
    if (hodOnly) params.append('hod', 'true');

    router.push(`/faculty?${params.toString()}`);
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

  const handlePopularClick = (query: string) => {
    setSearchQuery(query);
    setTimeout(() => {
      router.push(`/faculty?search=${encodeURIComponent(query)}`);
    }, 50);
  };

  return (
    <div ref={containerRef} className={styles.searchPanel}>
      
      {/* 1. TOP ROW: SEARCH INPUT */}
      <form onSubmit={handleSearch} style={{ position: 'relative' }}>
        <div className={styles.searchInputWrapper}>
          
          <div className={styles.searchIconContainer}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          
          <input
            ref={inputRef}
            type="text"
            placeholder="Search faculty by name, department, block or cabin..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
          />
          
          <div className={styles.shortcutBadge}>
            ⌘ K
          </div>
          
          <button type="submit" className={styles.searchButton}>
            <span>Search</span>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </button>
        </div>

        {/* Autocomplete Dropdown */}
        {isFocused && autocompleteResults.length > 0 && (
          <div className={styles.autocompleteDropdown}>
            {autocompleteResults.map(fac => (
              <div key={fac.id} onClick={() => { setSearchQuery(fac.name); setIsFocused(false); handleSearch(); }} className={styles.autocompleteItem}>
                <div>
                  <div className={styles.autocompleteName}>{fac.name}</div>
                  <div className={styles.autocompleteDept}>{fac.department}</div>
                </div>
                {(fac.block || fac.cabinNumber) && (
                  <div className={styles.autocompleteBadge}>
                    {fac.block || 'Unknown'} · Cabin {fac.cabinNumber || 'Unknown'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </form>

      {/* 2. MIDDLE ROW: FILTERS */}
      <div className={styles.filterRow}>
        
        {/* Department Filter */}
        <div style={{ position: 'relative' }}>
          <button type="button" onClick={() => setActiveDropdown(activeDropdown === 'department' ? null : 'department')} className={`${styles.filterPill} ${activeDropdown === 'department' || department ? styles.filterPillActive : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EA4D1B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"></path><path d="M3 7v1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1h-18l2-4h14l2 4"></path><line x1="5" y1="21" x2="5" y2="10"></line><line x1="19" y1="21" x2="19" y2="10"></line><path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"></path></svg>
            <span className={styles.filterPillText} style={{ width: '110px', textAlign: 'left' }}>{department || 'Department'}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EA4D1B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: activeDropdown === 'department' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><path d="m6 9 6 6 6-6"></path></svg>
          </button>
          {activeDropdown === 'department' && (
            <div className={styles.dropdownMenu}>
              <div onClick={() => { setDepartment(null); setActiveDropdown(null); }} className={styles.dropdownItem}>All Departments</div>
              {departments.map(dept => (
                <div key={dept} onClick={() => { setDepartment(dept); setActiveDropdown(null); }} className={`${styles.dropdownItem} ${department === dept ? styles.dropdownItemActive : ''}`}>
                  {dept}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Block Filter */}
        <div style={{ position: 'relative' }}>
          <button type="button" onClick={() => setActiveDropdown(activeDropdown === 'block' ? null : 'block')} className={`${styles.filterPill} ${activeDropdown === 'block' || block ? styles.filterPillActive : ''}`} style={{ width: '165px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EA4D1B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>
            <span className={styles.filterPillText} style={{ flex: 1, textAlign: 'left' }}>{block || 'Block'}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EA4D1B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: activeDropdown === 'block' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><path d="m6 9 6 6 6-6"></path></svg>
          </button>
          {activeDropdown === 'block' && (
            <div className={styles.dropdownMenu}>
              <div onClick={() => { setBlock(null); setActiveDropdown(null); }} className={styles.dropdownItem}>All Blocks</div>
              {blocks.map(b => (
                <div key={b} onClick={() => { setBlock(b); setActiveDropdown(null); }} className={`${styles.dropdownItem} ${block === b ? styles.dropdownItemActive : ''}`}>
                  {b}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Floor Filter */}
        <div style={{ position: 'relative' }}>
          <button type="button" onClick={() => setActiveDropdown(activeDropdown === 'floor' ? null : 'floor')} className={`${styles.filterPill} ${activeDropdown === 'floor' || floor ? styles.filterPillActive : ''}`} style={{ width: '165px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EA4D1B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 12 12 17 22 12"></polyline><polyline points="2 17 12 22 22 17"></polyline></svg>
            <span className={styles.filterPillText} style={{ flex: 1, textAlign: 'left' }}>{floor || 'Floor'}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EA4D1B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: activeDropdown === 'floor' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><path d="m6 9 6 6 6-6"></path></svg>
          </button>
          {activeDropdown === 'floor' && (
            <div className={styles.dropdownMenu}>
              <div onClick={() => { setFloor(null); setActiveDropdown(null); }} className={styles.dropdownItem}>All Floors</div>
              {floors.map(f => (
                <div key={f} onClick={() => { setFloor(f); setActiveDropdown(null); }} className={`${styles.dropdownItem} ${floor === f ? styles.dropdownItemActive : ''}`}>
                  {f}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Faculty Type Filter */}
        <div style={{ position: 'relative' }}>
          <button type="button" onClick={() => setActiveDropdown(activeDropdown === 'type' ? null : 'type')} className={`${styles.filterPill} ${activeDropdown === 'type' || facultyType ? styles.filterPillActive : ''}`} style={{ width: '205px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EA4D1B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span className={styles.filterPillText} style={{ flex: 1, textAlign: 'left' }}>{facultyType || 'Faculty Type'}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EA4D1B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: activeDropdown === 'type' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><path d="m6 9 6 6 6-6"></path></svg>
          </button>
          {activeDropdown === 'type' && (
            <div className={styles.dropdownMenu}>
              <div onClick={() => { setFacultyType(null); setActiveDropdown(null); }} className={styles.dropdownItem}>All Types</div>
              {facultyTypes.map(ft => (
                <div key={ft} onClick={() => { setFacultyType(ft); setActiveDropdown(null); }} className={`${styles.dropdownItem} ${facultyType === ft ? styles.dropdownItemActive : ''}`}>
                  {ft}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* HoD Only Toggle */}
        <div className={styles.hodControl}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EA4D1B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          <span>HoD Only</span>
          <button type="button" onClick={() => setHodOnly(!hodOnly)} className={`${styles.toggleSwitch} ${hodOnly ? styles.toggleSwitchOn : ''}`}>
            <div className={styles.toggleKnob}></div>
          </button>
        </div>

        {/* Filters Button */}
        <button type="button" className={styles.filtersButton}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
          Filters
        </button>
      </div>

      <div className={styles.divider}></div>

      {/* 3. BOTTOM ROW: POPULAR SEARCHES */}
      <div className={styles.popularRow}>
        <span className={styles.popularLabel}>Popular Searches:</span>
        <button type="button" onClick={() => handlePopularClick("Computer Science HoD")} className={styles.popularChip}>Computer Science HoD</button>
        <button type="button" onClick={() => handlePopularClick("AB2 Faculty")} className={styles.popularChip}>AB2 Faculty</button>
        <button type="button" onClick={() => handlePopularClick("Dr. Arjun Singh")} className={styles.popularChip}>Dr. Arjun Singh</button>
        <button type="button" onClick={() => handlePopularClick("Data Science")} className={styles.popularChip}>Data Science</button>
        <button type="button" onClick={() => handlePopularClick("AB3 Block")} className={styles.popularChip}>AB3 Block</button>
        
        <button type="button" onClick={handleClearAll} className={styles.clearAllBtn}>
          Clear all
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path></svg>
        </button>
      </div>

    </div>
  );
};
