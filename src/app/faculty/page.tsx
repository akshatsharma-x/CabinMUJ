'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { FacultyCard } from '@/components/ui/FacultyCard';
import { useFaculty } from '@/lib/FacultyContext';

function FacultyDirectoryInner() {
  const { facultyList, departmentsList, blocksList } = useFaculty();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedDept, setSelectedDept] = useState(searchParams.get('department') || '');
  const [selectedBlock, setSelectedBlock] = useState(searchParams.get('block') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');

  const categories = ['All', 'HODs', 'Professors', 'Associate Professors', 'Assistant Professors'];

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedDept) params.set('department', selectedDept);
    if (selectedBlock) params.set('block', selectedBlock);
    if (selectedCategory !== 'All') params.set('category', selectedCategory);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchQuery, selectedDept, selectedBlock, selectedCategory, pathname, router]);

  const clearAll = () => { setSearchQuery(''); setSelectedDept(''); setSelectedBlock(''); setSelectedCategory('All'); };
  const hasFilters = searchQuery || selectedDept || selectedBlock || selectedCategory !== 'All';

  const filtered = useMemo(() => {
    return facultyList.filter(f => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !searchQuery ||
        f.name.toLowerCase().includes(q) ||
        (f.cabinNumber && f.cabinNumber.toLowerCase().includes(q)) ||
        (f.block && f.block.toLowerCase().includes(q)) ||
        f.department.toLowerCase().includes(q) ||
        f.designation.toLowerCase().includes(q) ||
        (f.isHOD && 'hod'.includes(q));
      const matchDept = !selectedDept || f.department === selectedDept;
      const matchBlock = !selectedBlock || f.block === selectedBlock;
      let matchCat = true;
      if (selectedCategory === 'HODs') matchCat = !!f.isHOD;
      else if (selectedCategory === 'Professors') matchCat = f.designation.includes('Professor') && !f.designation.includes('Associate') && !f.designation.includes('Assistant');
      else if (selectedCategory === 'Associate Professors') matchCat = f.designation.includes('Associate');
      else if (selectedCategory === 'Assistant Professors') matchCat = f.designation.includes('Assistant');
      return matchSearch && matchDept && matchBlock && matchCat;
    }).sort((a, b) => (a.isHOD && !b.isHOD ? -1 : (!a.isHOD && b.isHOD ? 1 : 0)));
  }, [searchQuery, selectedDept, selectedBlock, selectedCategory, facultyList]);

  return (
    <AppShell>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="h2 mb-1">Faculty Directory</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Showing {filtered.length} of {facultyList.length} faculty members
          </p>
        </div>

        {/* Department Chips */}
        <div className="flex flex-wrap gap-2 mb-4" style={{ overflowX: 'auto' }}>
          {departmentsList.map(dept => (
            <button
              key={dept.id}
              onClick={() => setSelectedDept(selectedDept === dept.name ? '' : dept.name)}
              className={`dept-chip ${selectedDept === dept.name ? 'dept-chip-active' : ''}`}
            >
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: selectedDept === dept.name ? '#fff' : 'var(--muj-orange)',
                flexShrink: 0
              }} />
              {dept.shortName}
              <span style={{ fontSize: '0.6875rem', opacity: 0.7 }}>{dept.facultyCount}</span>
            </button>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="flex items-center gap-2 flex-1" style={{
            border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)',
            padding: '0 0.75rem', background: 'var(--bg-surface)', height: '40px'
          }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>🔍</span>
            <input
              type="text"
              placeholder="Search faculty, department, block or cabin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '0.8125rem', color: 'var(--text-primary)' }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem' }}>×</button>
            )}
          </div>
          <select
            className="input"
            value={selectedBlock}
            onChange={(e) => setSelectedBlock(e.target.value)}
            style={{ minWidth: '140px', height: '40px', fontSize: '0.8125rem' }}
          >
            <option value="">All Blocks</option>
            {blocksList.map(b => <option key={b.id} value={b.shortName}>{b.shortName}</option>)}
          </select>
          <div className="flex gap-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-ghost'}`}
                style={{ borderRadius: '6px', fontSize: '0.75rem' }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Active Filters */}
        {hasFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
            {searchQuery && (
              <span className="badge badge-gray flex items-center gap-1">
                &quot;{searchQuery}&quot;
                <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', marginLeft: '2px' }}>×</button>
              </span>
            )}
            {selectedDept && (
              <span className="badge badge-orange flex items-center gap-1">
                {selectedDept}
                <button onClick={() => setSelectedDept('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muj-orange)', marginLeft: '2px' }}>×</button>
              </span>
            )}
            {selectedBlock && (
              <span className="badge badge-orange flex items-center gap-1">
                Block {selectedBlock}
                <button onClick={() => setSelectedBlock('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muj-orange)', marginLeft: '2px' }}>×</button>
              </span>
            )}
            <button onClick={clearAll} className="text-sm font-medium text-muj-orange ml-2" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              Clear All
            </button>
          </div>
        )}

        {/* Faculty Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(f => <FacultyCard key={f.id} faculty={f} />)}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.4 }}>🕵️</div>
            <h3 className="h3 mb-2">No faculty found</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)', maxWidth: '320px', margin: '0 auto 1.5rem' }}>
              We couldn&apos;t find any faculty matching your filters.
            </p>
            <button onClick={clearAll} className="btn btn-primary">Clear Filters</button>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function FacultyDirectory() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading directory...</div>}>
      <FacultyDirectoryInner />
    </Suspense>
  );
}
