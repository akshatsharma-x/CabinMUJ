'use client';

import React from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useFaculty } from '@/lib/FacultyContext';

export default function BlocksExplorer() {
  const { blocksList: mockBlocks, facultyList: mockFaculty } = useFaculty();
  return (
    <AppShell>
      <div className="container" style={{ paddingBottom: '4rem' }}>
        <div className="mb-8">
          <h1 className="h2 font-bold mb-2">Block Explorer</h1>
          <p className="text-gray-500">Navigate the campus and find faculty members by their building block.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {mockBlocks.map(block => {
            const facultyCount = mockFaculty.filter(f => f.block === block.shortName).length;
            
            return (
              <div key={block.id} className="card hover-scale p-6 flex flex-col justify-between" style={{ minHeight: '220px', borderLeft: '4px solid var(--muj-orange)' }}>
                <div>
                  <div className="mb-4">
                    <h3 className="font-bold text-gray-400" style={{ fontSize: '1.25rem', letterSpacing: '0.05em' }}>{block.shortName}</h3>
                    <h4 className="h4 font-bold mt-1" style={{ fontSize: '1.5rem', color: 'var(--muj-orange)' }}>{block.name}</h4>
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-4">{block.description}</p>
                  
                  <div className="flex gap-4 mb-6">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400 uppercase tracking-wider">Floors</span>
                      <span className="font-bold">{block.floors}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400 uppercase tracking-wider">Faculty</span>
                      <span className="font-bold">{facultyCount}</span>
                    </div>
                  </div>
                </div>
                
                <Link 
                  href={`/faculty?block=${encodeURIComponent(block.shortName)}`} 
                  className="btn btn-secondary w-full text-center" 
                  style={{ display: 'block', padding: '0.75rem' }}
                >
                  View Faculty Located Here →
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
