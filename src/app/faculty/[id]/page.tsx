'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useFaculty } from '@/lib/FacultyContext';

export default function FacultyProfile({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { facultyList } = useFaculty();
  const faculty = facultyList.find(f => f.id === resolvedParams.id);

  const [copiedCabin, setCopiedCabin] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!faculty) {
    return (
      <AppShell>
        <div className="container py-20 text-center">
          <h1 className="h2 mb-4">Faculty Not Found</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>The requested faculty member could not be found.</p>
          <Link href="/faculty" className="btn btn-primary">Return to Directory</Link>
        </div>
      </AppShell>
    );
  }

  const initials = faculty.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const copyLocation = () => {
    if (faculty.block && faculty.cabinNumber) {
      navigator.clipboard.writeText(`${faculty.block} - Cabin ${faculty.cabinNumber}`);
      setCopiedCabin(true);
      setTimeout(() => setCopiedCabin(false), 2000);
    }
  };

  const copyEmail = () => {
    if (faculty.email) {
      navigator.clipboard.writeText(faculty.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  return (
    <AppShell>
      <div className="container py-8" style={{ maxWidth: '960px' }}>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          <Link href="/" className="transition-colors" style={{ color: 'var(--text-muted)' }}>Home</Link>
          <span>/</span>
          <Link href="/faculty" className="transition-colors" style={{ color: 'var(--text-muted)' }}>Faculty</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)' }}>{faculty.name}</span>
        </div>

        {/* Profile Header Card */}
        <div className="card p-6 mb-6 animate-fade-in">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="relative">
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden',
                background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                {faculty.photo ? (
                  <img src={faculty.photo} alt={faculty.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '1.5rem' }}>{initials}</span>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="h2">{faculty.name}</h1>
                {faculty.isHOD && <span className="badge badge-orange">HOD</span>}
                <span className="badge badge-blue">{faculty.facultyCategory}</span>
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{faculty.designation}</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{faculty.department}</p>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 mt-4">
                {faculty.block && faculty.cabinNumber && (
                  <button onClick={copyLocation}
                    className={`btn btn-sm ${copiedCabin ? 'badge-green' : 'btn-primary'}`}
                    style={{ borderRadius: '6px' }}>
                    {copiedCabin ? '✓ Copied Location' : '📍 Find Their Cabin'}
                  </button>
                )}
                {faculty.email && (
                  <button onClick={copyEmail}
                    className={`btn btn-sm ${copiedEmail ? 'badge-green' : 'btn-secondary'}`}
                    style={{ borderRadius: '6px' }}>
                    {copiedEmail ? '✓ Email Copied' : '✉️ Copy Email'}
                  </button>
                )}
                <Link href={`/report?facultyId=${faculty.id}`} className="btn btn-sm btn-ghost" style={{ borderRadius: '6px', color: '#DC2626' }}>
                  Report Update
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Details */}
          <div className="lg:col-span-2 flex flex-col gap-6 animate-fade-in delay-100">
            {/* Qualifications & Research */}
            {(faculty.qualifications.length > 0 || faculty.researchAreas.length > 0) && (
              <div className="card p-6">
                <h2 className="h4 mb-4">Qualifications & Research</h2>
                {faculty.qualifications.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Education</p>
                    <div className="flex flex-wrap gap-2">
                      {faculty.qualifications.map((q, i) => (
                        <span key={i} className="badge badge-gray">{q}</span>
                      ))}
                    </div>
                  </div>
                )}
                {faculty.researchAreas.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Research Areas</p>
                    <div className="flex flex-wrap gap-2">
                      {faculty.researchAreas.map((r, i) => (
                        <span key={i} className="badge badge-blue">{r}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Subjects */}
            {faculty.subjects.length > 0 && (
              <div className="card p-6">
                <h2 className="h4 mb-4">Subjects Taught</h2>
                <div className="flex flex-wrap gap-2">
                  {faculty.subjects.map((s, i) => (
                    <span key={i} className="badge badge-orange">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Office Hours */}
            {faculty.officeHours.length > 0 && (
              <div className="card p-6">
                <h2 className="h4 mb-4">Office Hours & Availability</h2>
                <div className="flex flex-col gap-2">
                  {faculty.officeHours.map((h, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded" style={{ background: 'var(--bg-subtle)' }}>
                      <span className="badge badge-green">Available</span>
                      <span className="text-sm">{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact */}
            <div className="card p-6">
              <h2 className="h4 mb-4">Contact Channels</h2>
              <div className="flex flex-col gap-3">
                {faculty.email && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Email</p>
                      <p className="text-sm">{faculty.email}</p>
                    </div>
                    <button onClick={copyEmail} className="btn btn-sm btn-secondary" style={{ borderRadius: '6px' }}>
                      {copiedEmail ? '✓' : 'Copy'}
                    </button>
                  </div>
                )}
                {faculty.phone && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Phone</p>
                    <p className="text-sm">{faculty.phone}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Location */}
          <div className="flex flex-col gap-6 animate-fade-in delay-200">
            {/* Cabin Location Card */}
            <div className="card" style={{ borderTop: '3px solid var(--muj-orange)' }}>
              <div className="p-4 border-b">
                <h3 className="h4 flex items-center gap-2">
                  <span className="text-muj-orange">📍</span> Cabin Location
                </h3>
              </div>
              <div className="p-6 text-center" style={{ background: 'var(--bg-subtle)' }}>
                {faculty.block && faculty.cabinNumber ? (
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="card p-4" style={{ background: 'var(--bg-surface)' }}>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Block</p>
                        <p className="text-xl font-bold text-muj-orange">{faculty.block}</p>
                      </div>
                      <div className="card p-4" style={{ background: 'var(--bg-surface)' }}>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Cabin</p>
                        <p className="text-xl font-bold">{faculty.cabinNumber}</p>
                      </div>
                    </div>
                    {faculty.floor && (
                      <div className="card p-3" style={{ background: 'var(--bg-surface)' }}>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Floor</p>
                        <p className="text-sm font-medium">{faculty.floor}</p>
                      </div>
                    )}
                    <button onClick={copyLocation}
                      className={`btn w-full ${copiedCabin ? 'badge-green' : 'btn-primary'}`}
                      style={{ borderRadius: '8px', padding: '0.625rem' }}>
                      {copiedCabin ? '✓ Copied to Clipboard' : 'Navigate to Cabin'}
                    </button>
                  </div>
                ) : (
                  <p className="text-sm py-4" style={{ color: 'var(--text-muted)' }}>Location not assigned yet</p>
                )}
              </div>
            </div>

            {/* Status Card */}
            <div className="card p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Status</h3>
              <div className="flex items-center gap-2">
                <span className={`badge ${faculty.status === 'Available' ? 'badge-green' : faculty.status === 'Busy' ? 'badge-red' : 'badge-yellow'}`}>
                  {faculty.status}
                </span>
              </div>
            </div>

            {/* Meta */}
            <div className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
              <p>Faculty ID: {faculty.id}</p>
              {faculty.lastUpdated && <p>Last Updated: {faculty.lastUpdated}</p>}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
