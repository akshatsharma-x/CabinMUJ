'use client';

import React, { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { FacultyCard } from '@/components/ui/FacultyCard';
import { Input } from '@/components/ui/Input';
import { mockFaculty, mockDepartments, mockBlocks } from '@/lib/mock-data';

export default function FacultyDirectory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');

  const filteredFaculty = useMemo(() => {
    return mockFaculty.filter(f => {
      const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (f.cabinNumber && f.cabinNumber.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesDept = selectedDept ? f.department === selectedDept : true;
      const matchesBlock = selectedBlock ? f.block === selectedBlock : true;
      return matchesSearch && matchesDept && matchesBlock;
    });
  }, [searchQuery, selectedDept, selectedBlock]);

  return (
    <AppShell>
      <div className="container">
        
        {/* Header & Controls */}
        <div className="flex flex-col gap-6 mb-8">
          <div>
            <h1 className="h2 font-bold">Faculty Directory</h1>
            <p className="text-gray-500">Find {mockFaculty.length}+ faculty members across all departments.</p>
          </div>
          
          <div className="card p-4 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
               <Input 
                 placeholder="Search by name or cabin number..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>
            <div className="flex gap-4">
               <select 
                 className="input" 
                 value={selectedDept} 
                 onChange={(e) => setSelectedDept(e.target.value)}
                 style={{ minWidth: '200px' }}
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
                 style={{ minWidth: '150px' }}
               >
                 <option value="">All Blocks</option>
                 {mockBlocks.map(b => (
                   <option key={b.id} value={b.shortName}>{b.shortName}</option>
                 ))}
               </select>
            </div>
          </div>
        </div>
        
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
          <div className="text-center p-12 text-gray-500">
             <div className="text-4xl mb-4">🔍</div>
             <h3 className="h3 font-bold mb-2">No faculty found</h3>
             <p>Try adjusting your search filters.</p>
          </div>
        )}

      </div>
    </AppShell>
  );
}
