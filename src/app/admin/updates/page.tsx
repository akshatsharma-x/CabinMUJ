'use client';

import React from 'react';
import Link from 'next/link';
import { useFaculty } from '@/lib/FacultyContext';
import { Faculty } from '@/lib/types';

export default function AdminUpdateRequests() {
  const { updateRequests, facultyList, approveUpdateRequest, rejectUpdateRequest } = useFaculty();

  const sortedRequests = [...updateRequests].sort((a, b) => {
    if (a.status === 'Pending' && b.status !== 'Pending') return -1;
    if (a.status !== 'Pending' && b.status === 'Pending') return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleApprove = (requestId: string, facultyId: string, issueType: string, proposed: string) => {
    if (confirm('Approve this change? It will update the public directory immediately.')) {
      const payload: Partial<Faculty> = {};
      if (issueType === 'Cabin Changed') payload.cabinNumber = proposed;
      else if (issueType === 'Block Changed') payload.block = proposed;
      else if (issueType === 'Department Changed') payload.department = proposed;
      else if (issueType === 'Designation Changed') payload.designation = proposed;
      approveUpdateRequest(requestId, payload);
    }
  };

  const handleReject = (requestId: string) => {
    if (confirm('Reject this request?')) rejectUpdateRequest(requestId);
  };

  return (
    <div className="container py-8">
      <div className="flex items-center gap-2 text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
        <Link href="/admin">Admin</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)' }}>Update Requests</span>
      </div>

      <div className="mb-6">
        <h1 className="h2 mb-1">Update Requests</h1>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Review student-reported information changes.</p>
      </div>

      <div className="flex flex-col gap-4 animate-fade-in">
        {sortedRequests.map(req => {
          const faculty = facultyList.find(f => f.id === req.facultyId);
          const statusBadge = req.status === 'Pending' ? 'badge-yellow' : req.status === 'Approved' ? 'badge-green' : 'badge-red';

          return (
            <div key={req.id} className="card p-5" style={{
              borderLeft: `3px solid ${req.status === 'Pending' ? '#EAB308' : req.status === 'Approved' ? '#22C55E' : '#EF4444'}`
            }}>
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`badge ${statusBadge}`}>{req.status}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(req.createdAt).toLocaleString()}</span>
                  </div>

                  <h3 className="font-semibold mb-1">{faculty ? faculty.name : 'Unknown Faculty'}</h3>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>{req.issueType}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div className="p-3 rounded" style={{ background: 'var(--bg-subtle)' }}>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Current</span>
                      <p className="text-sm font-medium" style={{ textDecoration: 'line-through', color: '#DC2626' }}>
                        {req.oldInformation || 'Not provided'}
                      </p>
                    </div>
                    <div className="p-3 rounded" style={{ background: 'var(--muj-orange-light)' }}>
                      <span className="text-xs text-muj-orange">Suggested</span>
                      <p className="text-sm font-bold" style={{ color: '#1B8A3F' }}>{req.proposedInformation}</p>
                    </div>
                  </div>

                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Submitted by: {req.submittedBy}
                    {req.evidence && (
                      <> · <a href={req.evidence} target="_blank" rel="noreferrer" className="text-muj-orange">Evidence</a></>
                    )}
                  </p>
                </div>

                {req.status === 'Pending' && (
                  <div className="flex flex-col gap-2" style={{ minWidth: '140px' }}>
                    <button onClick={() => handleApprove(req.id, req.facultyId, req.issueType, req.proposedInformation)}
                      className="btn btn-sm" style={{ background: '#22C55E', color: '#fff', borderRadius: '6px' }}>
                      ✓ Approve
                    </button>
                    <button onClick={() => handleReject(req.id)}
                      className="btn btn-sm" style={{ background: '#EF4444', color: '#fff', borderRadius: '6px' }}>
                      ✗ Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {sortedRequests.length === 0 && (
          <div className="text-center py-16">
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.4 }}>✨</div>
            <h3 className="h3 mb-1">All caught up!</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No pending update requests.</p>
          </div>
        )}
      </div>
    </div>
  );
}
