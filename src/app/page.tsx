'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { Input } from '@/components/ui/Input';
import { useFaculty } from '@/lib/FacultyContext';

export default function Home() {
  const { facultyList: mockFaculty } = useFaculty();
  const [searchQuery, setSearchQuery] = useState('');
  
  const quickResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return mockFaculty.filter(f => 
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (f.cabinNumber && f.cabinNumber.toLowerCase().includes(searchQuery.toLowerCase()))
    ).slice(0, 3); // limit to 3 for quick search
  }, [searchQuery, mockFaculty]);

  return (
    <AppShell>
      <div className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div className="text-center" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 className="h1 mb-4" style={{ color: 'var(--text-primary)' }}>
            Find Any Faculty at MUJ <span className="text-gradient">in Seconds</span>
          </h1>
          <p className="text-lg text-gray-500 mb-8">
            Search faculty members, locate cabins, discover departments, and stay updated — all in one place. No more lost corridors or guessing cabin blocks.
          </p>
          
          <div className="flex justify-center gap-4 mb-8">
            <Link href="/faculty" className="btn btn-primary" style={{ textDecoration: 'none' }}>Browse Directory</Link>
            <Link href="/departments" className="btn btn-secondary" style={{ textDecoration: 'none' }}>Explore Departments</Link>
          </div>
          
          {/* QUICK SEARCH EXPERIENCE */}
          <div style={{ maxWidth: '600px', margin: '3rem auto', position: 'relative' }}>
            <div className="flex items-center p-2 rounded-full" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ padding: '0 1rem', color: 'var(--text-muted)' }}>
                🔍
              </div>
              <Input 
                placeholder="Where is your faculty? Type a name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: 'none', boxShadow: 'none', backgroundColor: 'transparent', flex: 1, fontSize: '1rem' }}
              />
            </div>
            
            {/* Quick Search Dropdown */}
            {searchQuery.trim().length > 0 && (
              <div className="card mt-2 absolute w-full" style={{ zIndex: 10, textAlign: 'left', overflow: 'hidden' }}>
                {quickResults.length > 0 ? (
                  <div className="flex flex-col">
                    {quickResults.map(faculty => (
                      <div key={faculty.id} className="flex justify-between items-center p-4 border-b hover-bg-subtle" style={{ borderColor: 'var(--border-color)', transition: 'background 0.2s' }}>
                        <div className="flex items-center gap-3">
                          <div className="overflow-hidden rounded-full" style={{ width: '40px', height: '40px', backgroundColor: 'var(--bg-subtle)', flexShrink: 0 }}>
                            {faculty.photo ? <img src={faculty.photo} alt={faculty.name} className="w-full h-full object-cover" /> : null}
                          </div>
                          <div>
                            <p className="font-bold">{faculty.name}</p>
                            <p className="text-xs text-gray-500">{faculty.department}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                           {faculty.cabinNumber ? (
                             <div className="flex flex-col items-end">
                               <span className="text-xs text-gray-500">{faculty.block} {faculty.floor ? `· ${faculty.floor}` : ''}</span>
                               <span className="font-bold" style={{ color: 'var(--muj-orange)' }}>Cabin {faculty.cabinNumber}</span>
                             </div>
                           ) : (
                             <span className="text-sm text-gray-400">Location Unknown</span>
                           )}
                           <Link href={`/faculty/${faculty.id}`} className="btn btn-secondary text-sm" style={{ padding: '0.25rem 0.75rem' }}>
                             View Profile
                           </Link>
                        </div>
                      </div>
                    ))}
                    <Link href={`/faculty?search=${searchQuery}`} className="p-3 text-center text-sm font-semibold" style={{ color: 'var(--muj-orange)', display: 'block', textDecoration: 'none' }}>
                      See all results
                    </Link>
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No faculty found matching &quot;{searchQuery}&quot;
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-4 text-sm text-gray-500 flex justify-center gap-2">
              <span>Popular searches:</span>
              <a href="#" style={{ color: 'var(--muj-orange)', textDecoration: 'none' }}>Arjun Singh</a>
              <a href="#" style={{ color: 'var(--muj-orange)', textDecoration: 'none' }}>Computer Science HOD</a>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
