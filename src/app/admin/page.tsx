'use client';

import React from 'react';
import Link from 'next/link';
import { useFaculty } from '@/lib/FacultyContext';

export default function AdminDashboard() {
  const { facultyList, departmentsList, updateRequests, updateHistory } = useFaculty();
  const pendingUpdates = updateRequests.filter(req => req.status === 'Pending');

  return (
    <div className="container py-8">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="h2">Registrar Dashboard</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Manage faculty data and review student submissions.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in">
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Total Faculty</p>
          <p className="text-3xl font-bold text-muj-orange">{facultyList.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Active Submissions</p>
          <p className="text-3xl font-bold" style={{ color: pendingUpdates.length > 0 ? '#DC2626' : 'var(--text-primary)' }}>
            {pendingUpdates.length}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Departments</p>
          <p className="text-3xl font-bold">{departmentsList.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Recent Changes</p>
          <p className="text-3xl font-bold" style={{ color: '#1B8A3F' }}>{updateHistory.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in delay-100">
        {/* Management Links */}
        <div className="card p-5">
          <h3 className="h4 mb-4">Management Areas</h3>
          <div className="flex flex-col gap-3">
            <Link href="/admin/faculty" className="card p-4 hover-lift flex items-center justify-between">
              <div>
                <p className="font-semibold">👨‍🏫 Faculty Directory</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Add, edit, or remove faculty members.</p>
              </div>
              <span style={{ color: 'var(--text-muted)' }}>→</span>
            </Link>

            <Link href="/admin/updates" className="card p-4 hover-lift flex items-center justify-between relative"
              style={{ borderColor: pendingUpdates.length > 0 ? 'var(--muj-orange)' : undefined }}>
              <div>
                <p className="font-semibold">📋 Update Requests</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Review student-reported changes.</p>
              </div>
              <div className="flex items-center gap-2">
                {pendingUpdates.length > 0 && (
                  <span className="badge badge-red font-bold">{pendingUpdates.length} New</span>
                )}
                <span style={{ color: 'var(--text-muted)' }}>→</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent History */}
        <div className="card p-5">
          <h3 className="h4 mb-4">Recent Update History</h3>
          {updateHistory.length > 0 ? (
            <div className="flex flex-col gap-3" style={{ maxHeight: '280px', overflowY: 'auto' }}>
              {updateHistory.slice(0, 10).map((log, idx) => {
                const fac = facultyList.find(f => f.id === log.facultyId);
                return (
                  <div key={idx} className="p-3 rounded" style={{ background: 'var(--bg-subtle)', borderLeft: '3px solid var(--muj-orange)' }}>
                    <p className="text-sm font-medium">{fac ? fac.name : 'Unknown'}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{log.message}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      {new Date(log.updatedAt).toLocaleDateString()} · {log.verifiedBy}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>No recent updates recorded.</p>
          )}
        </div>
      </div>

      {/* Quick Department Stats */}
      <div className="card p-5 mt-6 animate-fade-in delay-200">
        <h3 className="h4 mb-4">Quick Department Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {departmentsList.map(dept => (
            <Link key={dept.id} href={`/faculty?department=${encodeURIComponent(dept.name)}`}
              className="p-3 rounded text-center hover-lift transition-all" style={{ background: 'var(--bg-subtle)' }}>
              <p className="text-xl font-bold text-muj-orange">{dept.facultyCount}</p>
              <p className="text-xs font-medium truncate" style={{ color: 'var(--text-secondary)' }}>{dept.shortName}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
