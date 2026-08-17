'use client';

import React from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useFaculty } from '@/lib/FacultyContext';

export default function DepartmentsExplorer() {
  const { departmentsList, facultyList } = useFaculty();

  return (
    <AppShell>
      <div className="container py-8">
        <div className="mb-6">
          <h1 className="h2 mb-1">Departments Explorer</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Browse faculty by academic departments at MUJ.
          </p>
        </div>

        {/* Department Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 animate-fade-in">
          {departmentsList.map(dept => {
            const deptFaculty = facultyList.filter(f => f.department === dept.name);
            return (
              <Link key={dept.id} href={`/faculty?department=${encodeURIComponent(dept.name)}`}>
                <div className="card p-5 hover-lift" style={{ cursor: 'pointer' }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold mb-1" style={{ fontSize: '0.9375rem' }}>{dept.name}</h3>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>HOD: {dept.hod}</p>
                    </div>
                    <span className="badge badge-orange font-bold">{dept.shortName}</span>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-muj-orange">{deptFaculty.length}</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Faculty Members</span>
                    </div>
                    <span className="text-sm font-medium text-muj-orange">View →</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* All Faculty Grid */}
        <div>
          <h2 className="h3 mb-1">All Faculty Members</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
            Showing all {facultyList.length} faculty across departments
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in delay-100">
            {facultyList.slice(0, 6).map(f => (
              <Link key={f.id} href={`/faculty/${f.id}`}>
                <div className="card p-4 hover-lift flex items-center gap-3">
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden',
                    background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    {f.photo ? (
                      <img src={f.photo} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                        {f.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="font-medium text-sm truncate">{f.name}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{f.department}</p>
                  </div>
                  <div className="flex gap-1">
                    {f.block && <span className="location-badge" style={{ fontSize: '0.5625rem' }}>{f.block}</span>}
                    {f.cabinNumber && <span className="location-badge-outline" style={{ fontSize: '0.5625rem' }}>{f.cabinNumber}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href="/faculty" className="btn btn-secondary">View Full Directory →</Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
