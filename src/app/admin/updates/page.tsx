'use client';

import React from 'react';
import Link from 'next/link';
import { useFaculty } from '@/lib/FacultyContext';
import { Faculty } from '@/lib/types';

export default function AdminUpdateRequests() {
  const { updateRequests, facultyList, approveUpdateRequest, rejectUpdateRequest } = useFaculty();

  // Sort: Pending first, then by date descending
  const sortedRequests = [...updateRequests].sort((a, b) => {
    if (a.status === 'Pending' && b.status !== 'Pending') return -1;
    if (a.status !== 'Pending' && b.status === 'Pending') return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleApprove = (requestId: string, facultyId: string, issueType: string, proposed: string) => {
    if (confirm('Are you sure you want to approve this change? This will immediately update the public faculty directory.')) {
      
      const payload: Partial<Faculty> = {};
      
      // Simple parser for mockup to apply changes based on issue type
      if (issueType === 'Cabin Changed') payload.cabinNumber = proposed;
      else if (issueType === 'Block Changed') payload.block = proposed;
      else if (issueType === 'Department Changed') payload.department = proposed;
      else if (issueType === 'Designation Changed') payload.designation = proposed;
      
      approveUpdateRequest(requestId, payload);
    }
  };

  const handleReject = (requestId: string) => {
    if (confirm('Are you sure you want to reject this request?')) {
      rejectUpdateRequest(requestId);
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-4 text-sm font-semibold text-gray-500 flex items-center gap-2">
         <Link href="/admin" className="hover:text-muj-orange">Admin Dashboard</Link>
         <span>/</span>
         <span>Update Requests</span>
      </div>
      
      <div className="mb-8">
        <h1 className="h2 font-bold mb-2">Update Requests</h1>
        <p className="text-gray-500">Review student-reported information changes.</p>
      </div>

      <div className="flex flex-col gap-6">
        {sortedRequests.map(req => {
          const faculty = facultyList.find(f => f.id === req.facultyId);
          
          return (
            <div key={req.id} className={`card p-6 shadow-sm border-l-4 ${req.status === 'Pending' ? 'border-l-yellow-500' : req.status === 'Approved' ? 'border-l-green-500' : 'border-l-red-500'}`}>
              <div className="flex flex-col md:flex-row justify-between gap-4">
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 text-xs font-bold uppercase rounded ${req.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : req.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {req.status}
                    </span>
                    <span className="text-sm text-gray-500">{new Date(req.createdAt).toLocaleString()}</span>
                  </div>
                  
                  <h3 className="h3 font-bold mb-1">Target: {faculty ? faculty.name : 'Unknown Faculty'}</h3>
                  <p className="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wider">{req.issueType}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded border">
                      <span className="text-xs text-gray-500 uppercase block mb-1">Reported Current Value</span>
                      <span className="font-semibold text-red-700 line-through">{req.oldInformation || 'None provided'}</span>
                    </div>
                    <div className="bg-orange-50 p-3 rounded border border-orange-100">
                      <span className="text-xs text-orange-600 uppercase block mb-1">Suggested New Value</span>
                      <span className="font-bold text-green-700">{req.proposedInformation}</span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-500 mt-4">
                    <p><strong>Submitted by:</strong> {req.submittedBy}</p>
                    {req.evidence && <p><strong>Evidence:</strong> <a href={req.evidence} target="_blank" rel="noreferrer" className="text-blue-500 underline">{req.evidence}</a></p>}
                  </div>
                </div>

                {/* Actions */}
                {req.status === 'Pending' && (
                  <div className="flex flex-col gap-3 md:w-48">
                    <button 
                      onClick={() => handleApprove(req.id, req.facultyId, req.issueType, req.proposedInformation)}
                      className="btn bg-green-500 hover:bg-green-600 text-white shadow-sm"
                    >
                      ✓ Approve
                    </button>
                    <button 
                      onClick={() => handleReject(req.id)}
                      className="btn bg-red-500 hover:bg-red-600 text-white shadow-sm"
                    >
                      ✗ Reject
                    </button>
                    <div className="text-xs text-gray-400 mt-2 text-center">
                      Approving will apply the suggested value.
                    </div>
                  </div>
                )}
                
              </div>
            </div>
          );
        })}

        {sortedRequests.length === 0 && (
          <div className="card p-12 text-center flex flex-col items-center">
             <div className="text-5xl mb-4 opacity-50">✨</div>
             <h3 className="h3 font-bold">All caught up!</h3>
             <p className="text-gray-500">There are no pending update requests.</p>
          </div>
        )}
      </div>
    </div>
  );
}
