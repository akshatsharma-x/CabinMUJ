'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { FacultyCard } from '@/components/ui/FacultyCard';
import { useFaculty } from '@/lib/FacultyContext';

function FacultyDirectoryInner() {
  const { facultyList: mockFaculty, departmentsList: mockDepartments, blocksList: mockBlocks } = useFaculty();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State initialized from URL params if present
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedDept, setSelectedDept] = useState(searchParams.get('department') || '');
  const [selectedBlock, setSelectedBlock] = useState(searchParams.get('block') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');

  // Categories list
  const categories = ['All', 'HODs', 'Professors', 'Associate Professors', 'Assistant Professors', 'Other'];

  // Sync state changes back to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedDept) params.set('department', selectedDept);
    if (selectedBlock) params.set('block', selectedBlock);
    if (selectedCategory !== 'All') params.set('category', selectedCategory);
    
    // Replace state to avoid blowing up browser history, unless we want to allow going 'back' through filters
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchQuery, selectedDept, selectedBlock, selectedCategory, pathname, router]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedDept('');
    setSelectedBlock('');
    setSelectedCategory('All');
  };

  const hasActiveFilters = searchQuery || selectedDept || selectedBlock || selectedCategory !== 'All';

  const filteredFaculty = useMemo(() => {
    const filtered = mockFaculty.filter(f => {
      // Global Search
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
                            f.name.toLowerCase().includes(searchLower) || 
                            (f.cabinNumber && f.cabinNumber.toLowerCase().includes(searchLower)) ||
                            (f.block && f.block.toLowerCase().includes(searchLower)) ||
                            f.department.toLowerCase().includes(searchLower) ||
                            f.designation.toLowerCase().includes(searchLower) ||
                            (f.isHOD && 'hod'.includes(searchLower));
      
      const matchesDept = selectedDept ? f.department === selectedDept : true;
      const matchesBlock = selectedBlock ? f.block === selectedBlock : true;
      
      let matchesCategory = true;
      if (selectedCategory === 'HODs') matchesCategory = !!f.isHOD;
      else if (selectedCategory === 'Professors') matchesCategory = f.designation.includes('Professor') && !f.designation.includes('Associate') && !f.designation.includes('Assistant');
      else if (selectedCategory === 'Associate Professors') matchesCategory = f.designation.includes('Associate');
      else if (selectedCategory === 'Assistant Professors') matchesCategory = f.designation.includes('Assistant');
      else if (selectedCategory === 'Other') matchesCategory = !f.designation.includes('Professor') && !f.isHOD;

      return matchesSearch && matchesDept && matchesBlock && matchesCategory;
    });

    // Sort HODs to top
    return filtered.sort((a, b) => {
      if (a.isHOD && !b.isHOD) return -1;
      if (!a.isHOD && b.isHOD) return 1;
      return 0;
    });
  }, [searchQuery, selectedDept, selectedBlock, selectedCategory, mockFaculty]);

  return (
    <AppShell>
      <div className="container" style={{ paddingBottom: '4rem' }}>
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="h2 font-bold mb-2">Faculty Directory</h1>
          
          {/* Category Chips */}
          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="btn"
                style={{ 
                  padding: '0.25rem 0.75rem', 
                  fontSize: '0.875rem',
                  borderRadius: '9999px',
                  backgroundColor: selectedCategory === cat ? 'var(--muj-orange)' : 'var(--bg-surface)',
                  color: selectedCategory === cat ? 'white' : 'var(--text-secondary)',
                  border: selectedCategory === cat ? '1px solid var(--muj-orange)' : '1px solid var(--border-color)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        {/* Search & Filters */}
        <div className="card p-4 flex flex-col lg:flex-row gap-4 mb-6 shadow-sm">
          <div className="flex-1">
             <div className="flex items-center rounded px-3" style={{ border: '1px solid var(--border-color)', height: '42px', backgroundColor: 'var(--bg-surface)' }}>
                <span className="mr-2 text-gray-400">🔍</span>
                <input 
                  type="text"
                  className="bg-transparent border-none outline-none w-full"
                  placeholder="Search faculty, department, block or cabin..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
          </div>
          <div className="flex flex-wrap gap-4">
             <select 
               className="input" 
               value={selectedDept} 
               onChange={(e) => setSelectedDept(e.target.value)}
               style={{ minWidth: '200px', height: '42px' }}
             >
               <option value="">All Departments</option>
               {mockDepartments.map(d => (
                 <option key={d.id} value={d.name}>{d.name}</option>
               ))}
             </select>
             <select 
               className="input" 
               value={selectedBlock} 
               onChange={(e) => setSelectedBlock(e.target.value)}
               style={{ minWidth: '150px', height: '42px' }}
             >
               <option value="">All Blocks</option>
               {mockBlocks.map(b => (
                 <option key={b.id} value={b.shortName}>{b.shortName}</option>
               ))}
             </select>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6 text-sm">
            <span className="text-gray-500 mr-2">Active Filters:</span>
            {searchQuery && (
              <span className="px-3 py-1 rounded-full flex items-center gap-2 border" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                &quot;{searchQuery}&quot; <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-muj-orange">×</button>
              </span>
            )}
            {selectedDept && (
              <span className="px-3 py-1 rounded-full flex items-center gap-2 border" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                {selectedDept} <button onClick={() => setSelectedDept('')} className="text-gray-400 hover:text-muj-orange">×</button>
              </span>
            )}
            {selectedBlock && (
              <span className="px-3 py-1 rounded-full flex items-center gap-2 border" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                Block {selectedBlock} <button onClick={() => setSelectedBlock('')} className="text-gray-400 hover:text-muj-orange">×</button>
              </span>
            )}
            {selectedCategory !== 'All' && (
              <span className="px-3 py-1 rounded-full flex items-center gap-2 border" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                {selectedCategory} <button onClick={() => setSelectedCategory('All')} className="text-gray-400 hover:text-muj-orange">×</button>
              </span>
            )}
            <button onClick={clearAllFilters} className="text-muj-orange ml-2 hover:underline font-medium">Clear All</button>
          </div>
        )}
        
        {/* Results Info */}
        <div className="mb-6 flex justify-between items-center border-b pb-2" style={{ borderColor: 'var(--border-color)' }}>
          <span className="font-semibold text-gray-500">
            Showing {filteredFaculty.length} results
          </span>
        </div>

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFaculty.map(faculty => (
            <FacultyCard key={faculty.id} faculty={faculty} />
          ))}
        </div>

        {filteredFaculty.length === 0 && (
          <div className="card p-12 flex flex-col items-center justify-center text-center">
             <div className="text-5xl mb-4 opacity-50">🕵️</div>
             <h3 className="h3 font-bold mb-2">No faculty found</h3>
             <p className="text-gray-500 mb-6 max-w-md">
               We couldn&apos;t find any faculty members matching your current filters.
             </p>
             <div className="flex gap-4">
               <button onClick={clearAllFilters} className="btn btn-primary">Clear Filters</button>
               <button onClick={() => setSelectedDept('')} className="btn btn-secondary">Try Any Department</button>
             </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}

export default function FacultyDirectory() {
  return (
    <Suspense fallback={<div>Loading directory...</div>}>
      <FacultyDirectoryInner />
    </Suspense>
  );
}
