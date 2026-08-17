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
        <div className="container py-20 text-center animate-fade-in">
          <h1 className="h2 font-bold mb-4">Faculty Not Found</h1>
          <p className="text-gray-500 mb-8">The faculty member you are looking for does not exist or has been removed.</p>
          <Link href="/faculty" className="btn btn-primary">Return to Directory</Link>
        </div>
      </AppShell>
    );
  }

  const initials = faculty.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  const handleCopyCabin = () => {
    if (faculty.block && faculty.cabinNumber) {
      navigator.clipboard.writeText(`${faculty.block} - ${faculty.cabinNumber}`);
      setCopiedCabin(true);
      setTimeout(() => setCopiedCabin(false), 2000);
    }
  };

  const handleCopyEmail = () => {
    if (faculty.email) {
      navigator.clipboard.writeText(faculty.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  return (
    <AppShell>
      <div className="container py-8 max-w-5xl">
        
        <div className="mb-6 text-sm font-semibold text-gray-500 flex items-center gap-2 animate-fade-in">
           <Link href="/" className="hover:text-muj-orange transition-colors">Home</Link>
           <span>/</span>
           <Link href="/faculty" className="hover:text-muj-orange transition-colors">Faculty Directory</Link>
           <span>/</span>
           <span style={{ color: 'var(--text-primary)' }}>{faculty.name}</span>
        </div>

        {/* Profile Header */}
        <div className="card p-8 mb-8 flex flex-col md:flex-row gap-8 items-center md:items-start animate-fade-in delay-100">
          <div className="flex-shrink-0 relative">
            <div className="overflow-hidden rounded-full shadow-lg" style={{ width: '150px', height: '150px', backgroundColor: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid var(--bg-surface)' }}>
              {faculty.photo ? (
                 <img src={faculty.photo} alt={faculty.name} className="w-full h-full" style={{ objectFit: 'cover' }} />
              ) : (
                 <span className="font-bold text-gray-400 text-4xl">{initials}</span>
              )}
            </div>
            {faculty.isHOD && (
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-muj-orange text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md border-2 border-white whitespace-nowrap">
                HOD
              </div>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
             <div className="flex flex-col md:flex-row gap-2 md:items-center justify-between mb-2">
               <h1 className="h1 font-bold">{faculty.name}</h1>
               <span className="badge badge-orange self-center md:self-auto text-sm py-1.5 px-4 shadow-sm">{faculty.facultyCategory}</span>
             </div>
             <p className="text-xl font-semibold mb-2" style={{ color: 'var(--muj-orange)' }}>{faculty.designation}</p>
             <p className="text-lg text-gray-500 mb-6">{faculty.department}</p>
             
             <div className="flex flex-wrap gap-3 justify-center md:justify-start">
               {faculty.email && (
                 <button onClick={handleCopyEmail} className={`btn ${copiedEmail ? 'bg-green-100 text-green-700 border-green-200' : 'btn-secondary'} transition-all flex gap-2 items-center shadow-sm`}>
                   <span>{copiedEmail ? '✓ Copied' : '✉️ Copy Email'}</span>
                 </button>
               )}
               <button className="btn btn-secondary shadow-sm">➕ Add to Favorites</button>
               <Link href={`/report?facultyId=${faculty.id}`} className="btn text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 shadow-sm transition-colors">
                 Report Update
               </Link>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 flex flex-col gap-8 animate-fade-in delay-200">
            {faculty.bio && (
              <section className="card p-8">
                <h2 className="h3 font-bold mb-4 flex items-center gap-2">
                  <span className="text-xl">👤</span> About
                </h2>
                <p className="text-gray-600 leading-relaxed text-lg">{faculty.bio}</p>
              </section>
            )}

            {faculty.subjects && faculty.subjects.length > 0 && (
              <section className="card p-8">
                <h2 className="h3 font-bold mb-4 flex items-center gap-2">
                  <span className="text-xl">📚</span> Subjects Taught
                </h2>
                <div className="flex flex-wrap gap-2">
                  {faculty.subjects.map((sub, idx) => (
                    <span key={idx} className="badge" style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-primary)', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>{sub}</span>
                  ))}
                </div>
              </section>
            )}

            {faculty.researchAreas && faculty.researchAreas.length > 0 && (
              <section className="card p-8">
                <h2 className="h3 font-bold mb-4 flex items-center gap-2">
                  <span className="text-xl">🔬</span> Research Areas
                </h2>
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                  {faculty.researchAreas.map((area, idx) => (
                    <li key={idx} className="text-lg">{area}</li>
                  ))}
                </ul>
              </section>
            )}
            
            {faculty.qualifications && faculty.qualifications.length > 0 && (
              <section className="card p-8">
                <h2 className="h3 font-bold mb-4 flex items-center gap-2">
                  <span className="text-xl">🎓</span> Qualifications
                </h2>
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                  {faculty.qualifications.map((qual, idx) => (
                    <li key={idx} className="text-lg">{qual}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Sidebar Area */}
          <div className="flex flex-col gap-6 animate-fade-in delay-300">
            
            {/* The Highly Visible Location Card */}
            <div className="card shadow-lg relative overflow-hidden" style={{ borderTop: '6px solid var(--muj-orange)' }}>
               {/* Decorative background element */}
               <div className="absolute top-0 right-0 opacity-5 w-32 h-32 -mr-8 -mt-8 rounded-full" style={{ backgroundColor: 'var(--muj-orange)' }}></div>
               
               <div className="p-6 border-b" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
                 <h2 className="h3 font-bold flex items-center gap-2">
                   <span className="text-muj-orange text-2xl">📍</span> Location
                 </h2>
               </div>
               
               <div className="p-8 flex flex-col items-center justify-center text-center relative" style={{ backgroundColor: 'var(--muj-orange-light)', minHeight: '200px' }}>
                 {faculty.block && faculty.cabinNumber ? (
                   <>
                     <span className="text-sm font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--muj-orange)' }}>
                       BLOCK {faculty.block}
                     </span>
                     <span className="font-black tracking-tighter" style={{ fontSize: '4.5rem', lineHeight: '1', color: 'var(--muj-orange)' }}>
                       {faculty.cabinNumber}
                     </span>
                     {faculty.floor && (
                        <span className="mt-4 font-semibold text-lg" style={{ color: 'var(--muj-orange)', opacity: 0.9 }}>
                          {faculty.floor}
                        </span>
                     )}
                   </>
                 ) : (
                    <span className="text-lg font-semibold" style={{ color: 'var(--muj-orange)', opacity: 0.7 }}>
                       Location Unassigned
                    </span>
                 )}
               </div>
               
               {faculty.block && faculty.cabinNumber && (
                 <div className="p-4" style={{ backgroundColor: 'var(--bg-surface)' }}>
                   <button 
                     onClick={handleCopyCabin}
                     className={`w-full py-3 rounded-md font-bold transition-all flex justify-center items-center gap-2 ${copiedCabin ? 'bg-green-500 text-white shadow-md' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
                   >
                     {copiedCabin ? '✓ Copied to Clipboard' : 'Copy Location'}
                   </button>
                 </div>
               )}
            </div>

            {faculty.officeHours && faculty.officeHours.length > 0 && (
              <div className="card p-6">
                <h3 className="font-bold mb-4 uppercase tracking-wider text-sm text-gray-500 flex items-center gap-2">
                  <span className="text-lg">🕒</span> Office Hours
                </h3>
                <div className="flex flex-col gap-3">
                  {faculty.officeHours.map((hours, idx) => (
                    <div key={idx} className="p-3 rounded border font-medium text-center" style={{ backgroundColor: 'var(--bg-subtle)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                      {hours}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Meta Info */}
            <div className="text-xs text-center text-gray-400 mt-4">
              <p>Faculty ID: {faculty.id}</p>
              <p>Last Updated: {faculty.lastUpdated || 'Recently'}</p>
            </div>

          </div>

        </div>
      </div>
    </AppShell>
  );
}
