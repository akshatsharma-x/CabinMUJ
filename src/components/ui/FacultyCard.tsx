'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Faculty } from '@/lib/types';

interface FacultyCardProps {
  faculty: Faculty;
}

export function FacultyCard({ faculty }: FacultyCardProps) {
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const initials = faculty.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="card hover-scale flex flex-col animate-fade-in" style={{ height: '100%', position: 'relative', border: faculty.isHOD ? '2px solid var(--muj-orange)' : undefined }}>
      
      {faculty.isHOD && (
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'var(--muj-orange)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em', whiteSpace: 'nowrap', zIndex: 10 }}>
          HEAD OF DEPARTMENT
        </div>
      )}
      
      {/* Bookmark Action */}
      <button 
        title="Bookmark Faculty"
        onClick={() => setBookmarked(!bookmarked)}
        style={{ 
          position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', 
          cursor: 'pointer', fontSize: '1.25rem', color: bookmarked ? 'var(--muj-orange)' : 'var(--text-muted)',
          transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          transform: bookmarked ? 'scale(1.2)' : 'scale(1)'
        }}
        aria-label="Bookmark"
      >
        ★
      </button>

      {/* Main Content */}
      <div className="p-8 flex flex-col items-center text-center flex-1">
        {/* Photo */}
        <div className="overflow-hidden rounded-full mb-5 shadow-sm" style={{ width: '96px', height: '96px', backgroundColor: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid var(--bg-surface)' }}>
          {faculty.photo ? (
             <img src={faculty.photo} alt={faculty.name} className="w-full h-full" style={{ objectFit: 'cover' }} />
          ) : (
             <span className="font-bold text-gray-400 text-2xl">{initials}</span>
          )}
        </div>
        
        {/* Identity */}
        <h3 className="h3 font-bold truncate w-full mb-1" title={faculty.name} style={{ fontSize: '1.25rem' }}>{faculty.name}</h3>
        <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>{faculty.designation}</p>
        <p className="text-sm text-gray-500 truncate w-full mb-6" title={faculty.department}>{faculty.department}</p>
        
        {/* Location Section */}
        {faculty.block && faculty.cabinNumber ? (
          <div className="flex flex-col items-center mt-auto w-full pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <span className="text-sm font-bold tracking-wider mb-1" style={{ color: 'var(--muj-orange)' }}>
              {faculty.block} {faculty.floor ? `· ${faculty.floor}` : ''}
            </span>
            <span className="font-black tracking-tight" style={{ fontSize: '2.5rem', lineHeight: '1', color: 'var(--text-primary)' }}>
              CABIN {faculty.cabinNumber}
            </span>
          </div>
        ) : (
           <div className="flex flex-col items-center mt-auto w-full pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
             <span className="text-sm font-semibold text-gray-400 mt-4">
                Location Unassigned
             </span>
           </div>
        )}
      </div>

      {/* Bottom Section: Actions */}
      <div className="p-4 flex gap-3 border-t" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-subtle)' }}>
        <Link href={`/faculty/${faculty.id}`} className="btn flex-1 text-center font-semibold text-sm transition-colors" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '0.65rem' }}>
           View Profile
        </Link>
        {faculty.block && faculty.cabinNumber ? (
          <button 
            onClick={(e) => {
               e.preventDefault();
               navigator.clipboard.writeText(`${faculty.block} - Cabin ${faculty.cabinNumber}`);
               setCopied(true);
               setTimeout(() => setCopied(false), 2000);
            }}
            className={`btn flex-1 text-center font-semibold text-sm transition-colors ${copied ? 'bg-green-100 text-green-700 border-green-200' : 'bg-muj-orange text-white border-transparent'}`}
            style={{ padding: '0.65rem', border: '1px solid', backgroundColor: copied ? undefined : 'var(--muj-orange)' }}
          >
            {copied ? '✓ Copied' : 'Navigate'}
          </button>
        ) : (
          <button disabled className="btn flex-1 text-center font-semibold text-sm opacity-50 cursor-not-allowed" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '0.65rem' }}>
            Navigate
          </button>
        )}
      </div>
    </div>
  );
}
