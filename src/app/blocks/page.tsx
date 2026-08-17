'use client';

import React from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useFaculty } from '@/lib/FacultyContext';

export default function BlocksExplorer() {
  const { blocksList, facultyList } = useFaculty();

  return (
    <AppShell>
      <div className="container py-8">
        <div className="mb-6">
          <h1 className="h2 mb-1">Campus Directory</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Navigate campus buildings and locate faculty cabins.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          {/* Blocks List */}
          <div className="flex flex-col gap-4">
            {blocksList.map(block => {
              const blockFaculty = facultyList.filter(f => f.block === block.shortName);
              return (
                <div key={block.id} className="card hover-lift" style={{ borderLeft: '3px solid var(--muj-orange)' }}>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="badge badge-orange font-bold mb-2" style={{ display: 'inline-block' }}>{block.shortName}</span>
                        <h3 className="font-semibold" style={{ fontSize: '1rem' }}>{block.name}</h3>
                      </div>
                    </div>
                    <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{block.description}</p>
                    <div className="flex gap-4 mb-4">
                      <div>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Floors</span>
                        <p className="font-bold text-sm">{block.floors}</p>
                      </div>
                      <div>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Faculty</span>
                        <p className="font-bold text-sm text-muj-orange">{blockFaculty.length}</p>
                      </div>
                    </div>
                    <Link href={`/faculty?block=${encodeURIComponent(block.shortName)}`}
                      className="btn btn-secondary btn-sm w-full" style={{ borderRadius: '6px' }}>
                      View Faculty →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Block Map Visualization */}
          <div className="lg:col-span-2">
            <div className="card p-6" style={{ minHeight: '400px' }}>
              <h3 className="h4 mb-4">Campus Block Map</h3>
              <div className="grid grid-cols-2 gap-4" style={{ marginTop: '1rem' }}>
                {blocksList.map(block => {
                  const blockFaculty = facultyList.filter(f => f.block === block.shortName);
                  return (
                    <Link key={block.id} href={`/faculty?block=${encodeURIComponent(block.shortName)}`}>
                      <div className="card p-4 hover-lift text-center" style={{
                        background: 'var(--muj-orange-light)', cursor: 'pointer',
                        border: '2px solid var(--muj-orange)', borderRadius: 'var(--radius-lg)'
                      }}>
                        <p className="text-2xl font-black text-muj-orange mb-1">{block.shortName}</p>
                        <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{block.name}</p>
                        <div className="flex justify-center gap-4 mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                          <span>{block.floors} floors</span>
                          <span>{blockFaculty.length} faculty</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Faculty in blocks quick list */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>Faculty by Block</h4>
                {blocksList.map(block => {
                  const blockFaculty = facultyList.filter(f => f.block === block.shortName).slice(0, 3);
                  if (blockFaculty.length === 0) return null;
                  return (
                    <div key={block.id} className="mb-3">
                      <p className="text-xs font-semibold mb-1 text-muj-orange">{block.shortName}</p>
                      {blockFaculty.map(f => (
                        <Link key={f.id} href={`/faculty/${f.id}`}
                          className="flex items-center justify-between py-2 px-2 rounded hover-bg-subtle transition-colors"
                          style={{ fontSize: '0.8125rem' }}>
                          <span>{f.name}</span>
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {f.cabinNumber ? `Cabin ${f.cabinNumber}` : 'N/A'}
                          </span>
                        </Link>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
