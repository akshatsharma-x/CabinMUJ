import React from 'react';
import Link from 'next/link';
import type { FacultySummary } from '@/lib/types';
import { formatLocation, hasLocation } from '@/lib/faculty-utils';
import { Avatar } from './Avatar';
import { CopyButton } from './CopyButton';

interface FacultyCardProps {
  faculty: FacultySummary;
}

export function FacultyCard({ faculty }: FacultyCardProps) {
  const located = hasLocation(faculty);

  return (
    <div className="card card-clickable hover-lift animate-fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Top Content */}
      <div className="p-5 flex gap-4 items-start flex-1">
        <Avatar name={faculty.name} photo={faculty.photo} size={48} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold truncate" style={{ fontSize: '0.9375rem' }} title={faculty.name}>
              {/* The link stretches over the whole card, so anywhere on it opens the profile. */}
              <Link href={`/faculty/${faculty.id}`} className="stretched-link">{faculty.name}</Link>
            </h3>
            {faculty.isHOD && <span className="badge badge-orange shrink-0">HOD</span>}
          </div>
          <p className="text-sm truncate text-muted" title={faculty.designation}>{faculty.designation}</p>
          <p className="text-sm truncate text-secondary" style={{ marginTop: '2px' }} title={faculty.department}>{faculty.department}</p>
        </div>
      </div>

      {/* Location + Actions */}
      <div style={{
        borderTop: '1px solid var(--border-light)', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: '0.5rem', background: 'var(--bg-subtle)', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
      }}>
        <div className="flex items-center gap-2 min-w-0">
          {located ? (
            <>
              <span className="location-badge nowrap">{faculty.block}</span>
              <span className="location-badge-outline nowrap">Cabin {faculty.cabinNumber}</span>
              {faculty.floor && <span className="text-xs text-muted truncate">{faculty.floor}</span>}
            </>
          ) : (
            <span className="badge badge-gray">Location TBD</span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {located && (
            <CopyButton
              text={`${faculty.name} — ${formatLocation(faculty)}`}
              label="📋"
              copiedLabel="✓"
              title="Copy location"
              className="btn btn-sm above-stretched"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderRadius: '4px', background: 'transparent', color: 'var(--text-muted)', border: 'none' }}
              copiedStyle={{ background: '#E6F9ED', color: '#1B8A3F' }}
            />
          )}
          <span aria-hidden className="text-sm font-medium text-muj-orange nowrap" style={{ fontSize: '0.8125rem' }}>View →</span>
        </div>
      </div>
    </div>
  );
}
