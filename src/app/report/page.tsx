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
        <div className="container py-20 text-center" style={{ maxWidth: '480px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <h1 className="h2 mb-2">Report Submitted</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            Thank you for helping keep CabinMUJ accurate. Our team will verify this shortly.
          </p>
          <button onClick={() => router.push('/')} className="btn btn-primary">Return to Home</button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="container py-8" style={{ maxWidth: '720px' }}>
        <div className="mb-6">
          <h1 className="h2 mb-1">Contribute to CabinMUJ</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Help us keep faculty information accurate and up to date.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="card p-6 flex flex-col gap-5">
              <h3 className="h4 mb-1">Faculty Information Form</h3>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Faculty Member *</label>
                <select required className="input" value={formData.facultyId} onChange={e => setFormData({...formData, facultyId: e.target.value})}>
                  <option value="">Select Faculty...</option>
                  {facultyList.map(f => <option key={f.id} value={f.id}>{f.name} — {f.department}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Issue Type *</label>
                <select required className="input" value={formData.issueType} onChange={e => setFormData({...formData, issueType: e.target.value})}>
                  <option value="Cabin Changed">Cabin Changed</option>
                  <option value="Block Changed">Block Changed</option>
                  <option value="Department Changed">Department Changed</option>
                  <option value="Designation Changed">Designation Changed</option>
                  <option value="Email Incorrect">Email Incorrect</option>
                  <option value="Faculty No Longer at MUJ">Faculty No Longer at MUJ</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Current Information</label>
                  <input type="text" className="input" placeholder="e.g. AB1 205" value={formData.oldInformation} onChange={e => setFormData({...formData, oldInformation: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Suggested Information *</label>
                  <input type="text" required className="input" placeholder="e.g. AB2 305" value={formData.proposedInformation} onChange={e => setFormData({...formData, proposedInformation: e.target.value})} />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Supporting Evidence (Optional)</label>
                <input type="text" className="input" placeholder="Link to timetable, screenshot, etc." value={formData.evidence} onChange={e => setFormData({...formData, evidence: e.target.value})} />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Your Email *</label>
                <input type="email" required className="input" placeholder="student@muj.manipal.edu" value={formData.submittedBy} onChange={e => setFormData({...formData, submittedBy: e.target.value})} />
              </div>

              <button type="submit" className="btn btn-primary w-full" style={{ padding: '0.75rem', borderRadius: '8px', marginTop: '0.5rem' }}>
                Submit Update Report
              </button>
            </form>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            <div className="card p-5">
              <h4 className="h4 mb-3">Submission Guidelines</h4>
              <div className="flex flex-col gap-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <div className="flex gap-2">
                  <span className="badge badge-green" style={{ flexShrink: 0 }}>✓</span>
                  <span>Verify information before submitting</span>
                </div>
                <div className="flex gap-2">
                  <span className="badge badge-green" style={{ flexShrink: 0 }}>✓</span>
                  <span>Provide evidence if possible</span>
                </div>
                <div className="flex gap-2">
                  <span className="badge badge-green" style={{ flexShrink: 0 }}>✓</span>
                  <span>Use your MUJ email for faster review</span>
                </div>
                <div className="flex gap-2">
                  <span className="badge badge-red" style={{ flexShrink: 0 }}>✕</span>
                  <span>Don&apos;t submit unverified rumors</span>
                </div>
              </div>
            </div>
          </div>
        </div>
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
