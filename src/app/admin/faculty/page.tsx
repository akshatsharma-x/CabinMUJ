'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useFaculty } from '@/lib/FacultyContext';

export default function AdminFacultyList() {
  const { facultyList, deleteFaculty } = useFaculty();
  const [search, setSearch] = useState('');

  const filtered = facultyList.filter(f => f.name.toLowerCase().includes(search.toLowerCase()) || f.department.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete ${name}? This cannot be undone.`)) {
      deleteFaculty(id);
    }
  };

  return (
    <div className="container py-8">
      <div className="flex items-center gap-2 text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
        <Link href="/admin">Admin</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)' }}>Faculty Management</span>
      </div>

      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="h2">Faculty Management</h1>
        <Link href="/admin/faculty/add" className="btn btn-primary" style={{ borderRadius: '8px' }}>
          + Add Faculty
        </Link>
      </div>

      <div className="card animate-fade-in">
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Search by name or department..."
            className="input"
            style={{ maxWidth: '400px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Faculty</th>
                <th>Department</th>
                <th>Location</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(faculty => (
                <tr key={faculty.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden',
                        background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        {faculty.photo ? (
                          <img src={faculty.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                            {faculty.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </span>
                        )}
                      </div>
                      <div>
                        <span className="font-medium">{faculty.name}</span>
                        {faculty.isHOD && <span className="badge badge-orange ml-2">HOD</span>}
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{faculty.department}</td>
                  <td>
                    {faculty.block && faculty.cabinNumber ? (
                      <div className="flex gap-1">
                        <span className="location-badge" style={{ fontSize: '0.625rem' }}>{faculty.block}</span>
                        <span className="location-badge-outline" style={{ fontSize: '0.625rem' }}>{faculty.cabinNumber}</span>
                      </div>
                    ) : (
                      <span className="badge badge-gray">Not set</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/faculty/${faculty.id}`} className="btn btn-sm btn-secondary" style={{ borderRadius: '6px' }}>
                        Edit
                      </Link>
                      <button onClick={() => handleDelete(faculty.id, faculty.name)}
                        className="btn btn-sm" style={{ color: '#DC2626', background: '#FEE2E2', border: 'none', borderRadius: '6px' }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="text-center py-8" style={{ color: 'var(--text-muted)' }}>No faculty found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
