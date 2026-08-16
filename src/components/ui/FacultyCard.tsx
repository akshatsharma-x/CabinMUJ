import React from 'react';
import Link from 'next/link';
import { Faculty } from '@/lib/types';

interface FacultyCardProps {
  faculty: Faculty;
}

export function FacultyCard({ faculty }: FacultyCardProps) {
  // Initials fallback if no photo
  const initials = faculty.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className="card hover-scale flex flex-col" style={{ height: '100%', position: 'relative' }}>
      
      {/* Bookmark Action */}
      <button 
        title="Bookmark Faculty"
        style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--text-muted)' }}
        aria-label="Bookmark"
      >
        ★
      </button>

      {/* Top Section: Profile Info */}
      <div className="p-6 flex flex-col items-center text-center border-b" style={{ borderColor: 'var(--border-color)', flex: 1 }}>
        <div className="overflow-hidden rounded-full mb-4" style={{ width: '80px', height: '80px', backgroundColor: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          {faculty.photo ? (
             <img src={faculty.photo} alt={faculty.name} className="w-full h-full" style={{ objectFit: 'cover' }} />
          ) : (
             <span className="font-bold text-gray-400 text-xl">{initials}</span>
          )}
        </div>
        <h3 className="h3 font-bold truncate w-full" title={faculty.name} style={{ fontSize: '1.125rem' }}>{faculty.name}</h3>
        <p className="text-sm font-semibold mt-1" style={{ color: 'var(--muj-orange)' }}>{faculty.designation}</p>
        <p className="text-sm text-gray-500 truncate w-full mt-1" title={faculty.department}>{faculty.department}</p>
      </div>
      
      {/* Middle Section: MASSIVE CABIN EMPHASIS */}
      <div className="p-6 flex flex-col items-center justify-center" style={{ backgroundColor: 'var(--muj-orange-light)', minHeight: '140px' }}>
        {faculty.block && faculty.cabinNumber ? (
          <>
            <span className="text-xs font-bold" style={{ color: 'var(--muj-orange)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              BLOCK {faculty.block}
            </span>
            <span className="font-bold mt-1" style={{ fontSize: '3rem', lineHeight: '1', color: 'var(--muj-orange)' }}>
              {faculty.cabinNumber}
            </span>
            {faculty.floor && (
               <span className="text-xs mt-2 font-medium" style={{ color: 'var(--muj-orange)' }}>
                 {faculty.floor}
               </span>
            )}
          </>
        ) : (
           <span className="text-sm font-semibold" style={{ color: 'var(--muj-orange)', opacity: 0.7 }}>
              Location Unassigned
           </span>
        )}
      </div>

      {/* Bottom Section: Actions */}
      <div className="p-4 flex justify-between items-center bg-gray-50" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="flex gap-2">
           {faculty.email ? (
             <button 
               title="Copy Email"
               onClick={() => navigator.clipboard.writeText(faculty.email!)}
               className="btn btn-secondary" 
               style={{ padding: '0.5rem', borderRadius: '50%' }}
             >
               ✉️
             </button>
           ) : (
             <span title="No email available" className="btn btn-secondary" style={{ padding: '0.5rem', borderRadius: '50%', opacity: 0.5, cursor: 'not-allowed' }}>
               ✉️
             </span>
           )}
        </div>
        
        <Link href={`/faculty/${faculty.id}`} className="btn btn-primary text-sm" style={{ padding: '0.5rem 1rem' }}>
           View Profile →
        </Link>
      </div>
    </div>
  );
}
