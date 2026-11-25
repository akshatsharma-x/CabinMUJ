'use client';

import React, { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import type { FacultySummary } from '@/lib/types';
import { NOT_LISTED_ISSUE, REPORT_ISSUE_TYPES } from '@/lib/types';
import { buildSearchIndex, formatLocation, searchIndex } from '@/lib/faculty-utils';
import { updateRequestMailto } from '@/lib/site';
import { submitUpdateReport, type ReportResult } from '@/lib/actions/report';

type Errors = Extract<ReportResult, { ok: false }>['errors'];

/** What the "current information" box is pre-filled with for each kind of report. */
function currentInfoFor(issueType: string, f?: FacultySummary): string {
  if (!f) return '';
  switch (issueType) {
    case 'Cabin Changed':
    case 'Block Changed':
    case 'Floor Changed':
      return formatLocation(f);
    case 'Department Changed':
      return f.department;
    case 'Designation Changed':
      return f.designation;
    default:
      return '';
  }
}

const labelClass = 'text-xs font-semibold uppercase tracking-wider';

export function ReportForm({
  faculty,
  initialFacultyId,
  initialIssue,
}: {
  faculty: FacultySummary[];
  initialFacultyId: string;
  initialIssue: string;
}) {
  const byId = useMemo(() => new Map(faculty.map(f => [f.id, f])), [faculty]);
  const index = useMemo(() => buildSearchIndex(faculty), [faculty]);

  const startIssue = (REPORT_ISSUE_TYPES as readonly string[]).includes(initialIssue) ? initialIssue : 'Cabin Changed';
  const startFaculty = byId.has(initialFacultyId) ? initialFacultyId : '';

  const [facultyId, setFacultyId] = useState(startFaculty);
  const [issueType, setIssueType] = useState(startIssue);
  const [oldInformation, setOldInformation] = useState(() => currentInfoFor(startIssue, byId.get(startFaculty)));
  const [autoFilled, setAutoFilled] = useState(oldInformation);
  const [proposedInformation, setProposedInformation] = useState('');
  const [evidence, setEvidence] = useState('');
  const [submittedBy, setSubmittedBy] = useState('');
  const [trap, setTrap] = useState(''); // honeypot for bots
  const [pickerQuery, setPickerQuery] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();

  const selected = facultyId ? byId.get(facultyId) : undefined;
  const notListed = issueType === NOT_LISTED_ISSUE;
  const matches = useMemo(() => (pickerQuery.trim() ? searchIndex(index, pickerQuery).slice(0, 8) : []), [index, pickerQuery]);

  /** Refreshes the pre-filled "current information" unless the student already edited it. */
  const refill = (nextIssue: string, nextFaculty?: FacultySummary) => {
    const value = currentInfoFor(nextIssue, nextFaculty);
    if (oldInformation === autoFilled) {
      setOldInformation(value);
    }
    setAutoFilled(value);
  };

  const chooseFaculty = (f: FacultySummary | undefined) => {
    setFacultyId(f?.id ?? '');
    setPickerQuery('');
    setErrors(e => ({ ...e, facultyId: undefined }));
    refill(issueType, f);
  };

  const reset = () => {
    setSubmitted(false);
    setFacultyId('');
    setIssueType('Cabin Changed');
    setOldInformation('');
    setAutoFilled('');
    setProposedInformation('');
    setEvidence('');
    setErrors({});
    setFormError('');
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    startTransition(async () => {
      try {
        const res = await submitUpdateReport({
          facultyId: notListed ? '' : facultyId,
          issueType,
          oldInformation,
          proposedInformation,
          evidence,
          submittedBy,
          trap,
        });
        if (res.ok) {
          setSubmitted(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          setErrors(res.errors ?? {});
          setFormError(res.formError ?? 'Please check the highlighted fields.');
        }
      } catch {
        setFormError('Could not send your report — check your connection and try again, or email us instead.');
      }
    });
  };

  if (submitted) {
    return (
      <div className="container py-20 text-center" style={{ maxWidth: '520px' }}>
        <div aria-hidden style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
        <h1 className="h2 mb-2">Report submitted</h1>
        <p className="text-sm mb-6 text-muted">
          Thank you for helping keep CabinMUJ accurate. The admin team will verify this and update the listing.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {selected && <Link href={`/faculty/${selected.id}`} className="btn btn-secondary">Back to {selected.name}</Link>}
          <button type="button" onClick={reset} className="btn btn-secondary">Report something else</button>
          <Link href="/faculty" className="btn btn-primary">Back to the directory</Link>
        </div>
      </div>
    );
  }

  const err = (key: keyof NonNullable<Errors>) =>
    errors?.[key] ? <p id={`err-${key}`} className="field-error">{errors[key]}</p> : null;
  const invalid = (key: keyof NonNullable<Errors>) =>
    errors?.[key] ? { 'aria-invalid': true as const, 'aria-describedby': `err-${key}` } : {};

  return (
    <div className="container py-8" style={{ maxWidth: '980px' }}>
      <div className="mb-6">
        <h1 className="h2 mb-1">Contribute to CabinMUJ</h1>
        <p className="text-sm text-muted">Cabin moved or details out of date? Tell us and we&apos;ll fix it for everyone.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={onSubmit} noValidate className="card p-6 flex flex-col gap-5">
            <h2 className="h4">Update request</h2>

            {formError && <div className="alert alert-error" role="alert">{formError}</div>}

            <div className="field">
              <label htmlFor="issueType" className={`${labelClass} text-muted`}>What needs updating? *</label>
              <select id="issueType" className="input" value={issueType}
                onChange={e => { setIssueType(e.target.value); refill(e.target.value, selected); setErrors({}); }} {...invalid('issueType')}>
                {REPORT_ISSUE_TYPES.map(t => <option key={t} value={t}>{t === NOT_LISTED_ISSUE ? 'Faculty member is missing from CabinMUJ' : t}</option>)}
              </select>
              {err('issueType')}
            </div>

            {!notListed && (
              <div className="field">
                <label htmlFor="faculty-picker" className={`${labelClass} text-muted`}>Faculty member *</label>
                {selected ? (
                  <div className="flex items-center justify-between gap-3 p-3 rounded" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-color)' }}>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{selected.name}</p>
                      <p className="text-xs text-muted truncate">{selected.department}{formatLocation(selected) ? ` · ${formatLocation(selected)}` : ''}</p>
                    </div>
                    <button type="button" className="btn btn-sm btn-secondary" onClick={() => chooseFaculty(undefined)}>Change</button>
                  </div>
                ) : (
                  <div style={{ position: 'relative' }}>
                    <input
                      id="faculty-picker"
                      type="text"
                      className="input"
                      placeholder="Start typing a name, department or cabin…"
                      value={pickerQuery}
                      onChange={e => setPickerQuery(e.target.value)}
                      autoComplete="off"
                      {...invalid('facultyId')}
                    />
                    {matches.length > 0 && (
                      <div className="card" role="listbox" aria-label="Matching faculty"
                        style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                        {matches.map(f => (
                          <button key={f.id} type="button" role="option" aria-selected={false} onClick={() => chooseFaculty(f)}
                            className="hover-bg-subtle w-full text-left" style={{ display: 'block', padding: '0.625rem 0.875rem', border: 'none', background: 'none', cursor: 'pointer', borderBottom: '1px solid var(--border-light)' }}>
                            <span className="text-sm font-semibold" style={{ display: 'block' }}>{f.name}</span>
                            <span className="text-xs text-muted">{f.department}{formatLocation(f) ? ` · ${formatLocation(f)}` : ''}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {pickerQuery.trim() && matches.length === 0 && (
                      <p className="field-hint mt-1">
                        No match. Not listed at all? <button type="button" className="btn-link" onClick={() => { setIssueType(NOT_LISTED_ISSUE); setErrors({}); }}>Report a missing faculty member</button>
                      </p>
                    )}
                  </div>
                )}
                {err('facultyId')}
              </div>
            )}

            {!notListed && (
              <div className="field">
                <label htmlFor="oldInformation" className={`${labelClass} text-muted`}>Currently shown</label>
                <input id="oldInformation" type="text" className="input" placeholder="e.g. AB1 · Cabin 205" maxLength={300}
                  value={oldInformation} onChange={e => setOldInformation(e.target.value)} {...invalid('oldInformation')} />
                {err('oldInformation')}
              </div>
            )}

            <div className="field">
              <label htmlFor="proposedInformation" className={`${labelClass} text-muted`}>
                {notListed ? 'Who is missing? *' : 'Correct information *'}
              </label>
              <textarea id="proposedInformation" className="input" maxLength={1000} rows={3}
                placeholder={notListed ? 'Name, department, designation, and block / floor / cabin if you know it' : 'e.g. AB2 · 3rd Floor · Cabin 305'}
                value={proposedInformation} onChange={e => setProposedInformation(e.target.value)} {...invalid('proposedInformation')} />
              {err('proposedInformation')}
            </div>

            <div className="field">
              <label htmlFor="evidence" className={`${labelClass} text-muted`}>How do you know? (optional)</label>
              <input id="evidence" type="text" className="input" maxLength={500}
                placeholder="e.g. visited the cabin today, or a link to the timetable / photo"
                value={evidence} onChange={e => setEvidence(e.target.value)} {...invalid('evidence')} />
              {err('evidence')}
            </div>

            <div className="field">
              <label htmlFor="submittedBy" className={`${labelClass} text-muted`}>Your email *</label>
              <input id="submittedBy" type="email" className="input" placeholder="you@muj.manipal.edu" autoComplete="email" maxLength={254}
                value={submittedBy} onChange={e => setSubmittedBy(e.target.value)} {...invalid('submittedBy')} />
              <p className="field-hint">Only used to follow up on this report.</p>
              {err('submittedBy')}
            </div>

            {/* Honeypot for bots — hidden from people and screen readers; named so browsers won't autofill it */}
            <div aria-hidden className="sr-only">
              <label htmlFor="cm-leave-empty">Leave this empty</label>
              <input id="cm-leave-empty" tabIndex={-1} autoComplete="off" value={trap} onChange={e => setTrap(e.target.value)} />
            </div>

            <button type="submit" disabled={pending} className="btn btn-primary w-full" style={{ padding: '0.75rem', borderRadius: '8px' }}>
              {pending ? 'Sending…' : 'Submit update report'}
            </button>
          </form>
        </div>

        <div className="flex flex-col gap-4">
          <div className="card p-5" style={{ borderTop: '3px solid var(--muj-orange)' }}>
            <h2 className="h4 mb-1">Prefer email?</h2>
            <p className="text-sm text-muted mb-4">
              Send the update straight to the CabinMUJ team{selected ? ` — we’ll pre-fill ${selected.name}’s details` : ''}.
            </p>
            <a href={updateRequestMailto(selected)} className="btn btn-secondary w-full">✉️ Email an update</a>
          </div>

          <div className="card p-5">
            <h2 className="h4 mb-3">Submission guidelines</h2>
            <div className="flex flex-col gap-3 text-sm text-secondary">
              <div className="flex gap-2"><span className="badge badge-green shrink-0">✓</span><span>Double-check the cabin number on the door</span></div>
              <div className="flex gap-2"><span className="badge badge-green shrink-0">✓</span><span>Mention how you know, if you can</span></div>
              <div className="flex gap-2"><span className="badge badge-green shrink-0">✓</span><span>Use your MUJ email for faster review</span></div>
              <div className="flex gap-2"><span className="badge badge-red shrink-0">✕</span><span>Don&apos;t submit unverified rumors</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
