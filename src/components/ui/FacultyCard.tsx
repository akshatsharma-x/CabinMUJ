'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Faculty } from '@/lib/types';

interface FacultyCardProps {
  faculty: Faculty;
}

export function FacultyCard({ faculty }: FacultyCardProps) {
  const [copied, setCopied] = useState(false);
  const initials = faculty.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const handleCopy = () => {
    if (faculty.block && faculty.cabinNumber) {
      navigator.clipboard.writeText(`${faculty.block} - Cabin ${faculty.cabinNumber}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="card hover-lift animate-fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Top Content */}
      <div className="p-5 flex gap-4 items-start flex-1">
        {/* Avatar */}
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
          background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {faculty.photo ? (
            <img src={faculty.photo} alt={faculty.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.875rem' }}>{initials}</span>
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold truncate" style={{ fontSize: '0.9375rem' }}>{faculty.name}</h3>
            {faculty.isHOD && (
              <span className="badge badge-orange" style={{ flexShrink: 0 }}>HOD</span>
            )}
          </div>
          <p className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>{faculty.designation}</p>
          <p className="text-sm truncate" style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>{faculty.department}</p>
        </div>
      </div>

      {/* Location + Actions */}
      <div style={{ borderTop: '1px solid var(--border-light)', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-subtle)' }}>
        {/* Location badges */}
        <div className="flex items-center gap-2">
          {faculty.block && faculty.cabinNumber ? (
            <>
              <span className="location-badge">{faculty.block}</span>
              <span className="location-badge-outline">Cabin {faculty.cabinNumber}</span>
              {faculty.floor && (
                <span className="badge badge-gray" style={{ fontSize: '0.625rem' }}>{faculty.floor}</span>
              )}
            </>
          ) : (
            <span className="badge badge-gray">Location TBD</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {faculty.block && faculty.cabinNumber && (
            <button
              onClick={handleCopy}
              className="btn btn-sm"
              title="Copy location"
              style={{
                padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderRadius: '4px',
                background: copied ? '#E6F9ED' : 'transparent',
                color: copied ? '#1B8A3F' : 'var(--text-muted)',
                border: 'none'
              }}
            >
              {copied ? '✓' : '📋'}
            </button>
          )}
          <Link href={`/faculty/${faculty.id}`} className="text-sm font-medium text-muj-orange" style={{ fontSize: '0.8125rem' }}>
            View →
          </Link>
        </div>
      </div>
    </div>
  );
}
