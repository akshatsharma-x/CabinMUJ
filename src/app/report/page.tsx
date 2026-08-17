'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useFaculty } from '@/lib/FacultyContext';

function ReportUpdateInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialFacultyId = searchParams.get('facultyId') || '';
  
  const { facultyList, submitUpdateRequest } = useFaculty();
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    facultyId: initialFacultyId,
    submittedBy: '',
    issueType: 'Cabin Changed',
    oldInformation: '',
    proposedInformation: '',
    evidence: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.facultyId || !formData.submittedBy || !formData.proposedInformation) return;
    
    submitUpdateRequest({
      facultyId: formData.facultyId,
      submittedBy: formData.submittedBy,
      issueType: formData.issueType,
      oldInformation: formData.oldInformation,
      proposedInformation: formData.proposedInformation,
      evidence: formData.evidence
    });
    
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <AppShell>
        <div className="container max-w-2xl text-center py-20">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="h2 font-bold mb-4">Report Submitted</h1>
          <p className="text-gray-500 mb-8">Thank you for helping keep CabinMUJ accurate! Our team will verify this update shortly.</p>
          <button onClick={() => router.push('/')} className="btn btn-primary">Return to Home</button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="container max-w-2xl py-8">
        <div className="mb-8 text-center">
          <h1 className="h2 font-bold mb-2">Report an Update</h1>
          <p className="text-gray-500">Notice incorrect information? Let us know so we can fix it.</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 md:p-8 flex flex-col gap-6">
          
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm">Faculty Member <span className="text-red-500">*</span></label>
            <select 
              required
              className="input bg-transparent border p-3 rounded"
              value={formData.facultyId}
              onChange={e => setFormData({...formData, facultyId: e.target.value})}
            >
              <option value="">Select Faculty...</option>
              {facultyList.map(f => (
                <option key={f.id} value={f.id}>{f.name} - {f.department}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm">Issue Type <span className="text-red-500">*</span></label>
            <select 
              required
              className="input bg-transparent border p-3 rounded"
              value={formData.issueType}
              onChange={e => setFormData({...formData, issueType: e.target.value})}
            >
              <option value="Cabin Changed">Cabin Changed</option>
              <option value="Block Changed">Block Changed</option>
              <option value="Department Changed">Department Changed</option>
              <option value="Designation Changed">Designation Changed</option>
              <option value="Email Incorrect">Email Incorrect</option>
              <option value="Faculty No Longer at MUJ">Faculty No Longer at MUJ</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm text-gray-500">Current Information</label>
              <input 
                type="text"
                className="input bg-transparent border p-3 rounded"
                placeholder="e.g. AB1 205"
                value={formData.oldInformation}
                onChange={e => setFormData({...formData, oldInformation: e.target.value})}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-sm">Suggested Information <span className="text-red-500">*</span></label>
              <input 
                type="text"
                required
                className="input bg-transparent border p-3 rounded"
                placeholder="e.g. AB2 305"
                value={formData.proposedInformation}
                onChange={e => setFormData({...formData, proposedInformation: e.target.value})}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm">Supporting Evidence (Optional)</label>
            <input 
              type="text"
              className="input bg-transparent border p-3 rounded"
              placeholder="Link to timetable, screenshot, or official document"
              value={formData.evidence}
              onChange={e => setFormData({...formData, evidence: e.target.value})}
            />
            <span className="text-xs text-gray-400">Helps us verify the change faster.</span>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-sm">Your Email <span className="text-red-500">*</span></label>
            <input 
              type="email"
              required
              className="input bg-transparent border p-3 rounded"
              placeholder="student@muj.manipal.edu"
              value={formData.submittedBy}
              onChange={e => setFormData({...formData, submittedBy: e.target.value})}
            />
          </div>

          <div className="pt-4 border-t mt-2 flex justify-end">
             <button type="submit" className="btn btn-primary px-8 py-3">Submit Report</button>
          </div>

        </form>
      </div>
    </AppShell>
  );
}

export default function ReportUpdate() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <ReportUpdateInner />
    </Suspense>
  );
}
