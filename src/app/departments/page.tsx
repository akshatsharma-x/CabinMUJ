'use client';

import React from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useFaculty } from '@/lib/FacultyContext';

export default function DepartmentsExplorer() {
  const { departmentsList: mockDepartments } = useFaculty();
  return (
    <AppShell>
      <div className="container" style={{ paddingBottom: '4rem' }}>
        <div className="mb-8">
          <h1 className="h2 font-bold mb-2">Departments Explorer</h1>
          <p className="text-gray-500">Discover faculty members by their academic departments.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {mockDepartments.map(dept => (
            <div key={dept.id} className="card hover-scale p-6 flex flex-col justify-between" style={{ minHeight: '220px' }}>
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="h3 font-bold" style={{ fontSize: '1.25rem', maxWidth: '80%' }}>{dept.name}</h3>
                  <span className="font-bold text-gray-400" style={{ fontSize: '1.5rem' }}>{dept.shortName}</span>
                </div>
                
                <div className="flex items-center gap-2 mb-2 text-sm">
                  <span className="text-gray-500">HOD:</span>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{dept.hod}</span>
                </div>
                <div className="flex items-center gap-2 text-sm mb-6">
                  <span className="text-gray-500">Faculty Members:</span>
                  <span className="font-bold" style={{ color: 'var(--muj-orange)' }}>{dept.facultyCount}</span>
                </div>
              </div>
              
              <Link 
                href={`/faculty?department=${encodeURIComponent(dept.name)}`} 
                className="btn btn-primary w-full text-center" 
                style={{ display: 'block', padding: '0.75rem' }}
              >
                View Faculty →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
