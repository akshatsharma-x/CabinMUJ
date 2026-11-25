'use client';

import React, { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, unstable_rethrow } from 'next/navigation';
import type { Faculty, FacultyFieldErrors, FacultyInput, FacultyStatus, UpdateRequest } from '@/lib/types';
import { FACULTY_LIMITS as L, FACULTY_STATUSES } from '@/lib/types';
import { formatDateTime, formatLocation } from '@/lib/faculty-utils';
import { replyToReporterMailto, verifyWithFacultyMailto } from '@/lib/site';
import type { EditorOptions } from '@/lib/server/admin-data';
import { deleteFaculty, saveFaculty, setRequestStatus, type SaveFacultyError } from '@/lib/actions/admin';
import { Avatar } from '@/components/ui/Avatar';
import { SelectOrCustom } from './SelectOrCustom';

/** Form values: list fields are edited as one-item-per-line text. */
interface FormState {
  name: string;
  designation: string;
  department: string;
  facultyCategory: string;
  isHOD: boolean;
  status: FacultyStatus;
  block: string;
  floor: string;
  cabinNumber: string;
  locationVerified: boolean;
  email: string;
  phone: string;
  photo: string;
  bio: string;
  qualifications: string;
  researchAreas: string;
  subjects: string;
  officeHours: string;
}

function toFormState(f: Faculty | null): FormState {
  return {
    name: f?.name ?? '',
    designation: f?.designation ?? '',
    department: f?.department ?? '',
    facultyCategory: f?.facultyCategory || 'Regular',
    isHOD: Boolean(f?.isHOD),
    status: f?.status ?? 'Available',
    block: f?.block ?? '',
    floor: f?.floor ?? '',
    cabinNumber: f?.cabinNumber ?? '',
    locationVerified: Boolean(f?.locationVerified),
    email: f?.email ?? '',
    phone: f?.phone ?? '',
    photo: f?.photo ?? '',
    bio: f?.bio ?? '',
    qualifications: (f?.qualifications ?? []).join('\n'),
    researchAreas: (f?.researchAreas ?? []).join('\n'),
    subjects: (f?.subjects ?? []).join('\n'),
    officeHours: (f?.officeHours ?? []).join('\n'),
  };
}

const lines = (s: string) => s.split('\n').map(x => x.trim()).filter(Boolean);

function toInput(s: FormState): FacultyInput {
  return {
    ...s,
    qualifications: lines(s.qualifications),
    researchAreas: lines(s.researchAreas),
    subjects: lines(s.subjects),
    officeHours: lines(s.officeHours),
  };
}

const FIELD_ORDER: (keyof FacultyFieldErrors)[] = [
  'name', 'designation', 'department', 'facultyCategory', 'status', 'block', 'floor', 'cabinNumber',
  'email', 'phone', 'photo', 'bio', 'qualifications', 'researchAreas', 'subjects', 'officeHours',
];

function FieldShell({ id, label, required, hint, error, children }: {
  id: string; label: string; required?: boolean; hint?: React.ReactNode; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="field">
      <label htmlFor={id} className="field-label">
        {label}
        {required && <span className="req" aria-hidden>*</span>}
      </label>
      {children}
      {error ? <p id={`${id}-error`} className="field-error">{error}</p> : hint ? <p className="field-hint">{hint}</p> : null}
    </div>
  );
}

interface FacultyFormProps {
  /** null when adding a new faculty member. */
  initial: Faculty | null;
  options: EditorOptions;
  returnTo: string;
  /** A student report being resolved with this edit. */
  request?: UpdateRequest | null;
}

export function FacultyForm({ initial, options, returnTo, request }: FacultyFormProps) {
  const router = useRouter();
  const isNew = initial === null;
  const formRef = useRef<HTMLFormElement>(null);
  const leavingRef = useRef(false);
  const skipUnloadUntil = useRef(0);

  const [initialJson] = useState(() => JSON.stringify(toFormState(initial)));
  const [form, setForm] = useState<FormState>(() => toFormState(initial));
  const [errors, setErrors] = useState<FacultyFieldErrors>({});
  const [formError, setFormError] = useState('');
  const [conflict, setConflict] = useState<SaveFacultyError['conflict'] | null>(null);
  const [duplicate, setDuplicate] = useState<SaveFacultyError['duplicate'] | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  /** Set after a failed save: which field to focus ('' = scroll to the messages). */
  const [focusRequest, setFocusRequest] = useState<{ key: string; n: number } | null>(null);
  const [pending, startTransition] = useTransition();
  /** Once the admin sets "Location verified" by hand, stop changing it automatically. */
  const [verifiedTouched, setVerifiedTouched] = useState(false);

  const dirty = useMemo(() => JSON.stringify(form) !== initialJson, [form, initialJson]);

  // Focus the first invalid field (or show the messages) after a failed save — once the
  // save has fully finished, because inputs are disabled while it's in flight.
  const handledFocus = useRef(0);
  useEffect(() => {
    if (!focusRequest || pending || handledFocus.current === focusRequest.n) return;
    handledFocus.current = focusRequest.n;
    if (focusRequest.key) document.getElementById(`f-${focusRequest.key}`)?.focus();
    else document.getElementById('form-alerts')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [focusRequest, pending]);
  const requestFocus = (key: string) => setFocusRequest(r => ({ key, n: (r?.n ?? 0) + 1 }));

  // Warn before leaving with unsaved changes (closing the tab, or clicking any link).
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (leavingRef.current || Date.now() < skipUnloadUntil.current) return;
      e.preventDefault();
      e.returnValue = '';
    };
    const onClick = (e: MouseEvent) => {
      if (leavingRef.current || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const href = a.getAttribute('href') ?? '';
      if (/^(mailto|tel):/i.test(href)) {
        skipUnloadUntil.current = Date.now() + 2000; // opening the mail app isn't leaving the page
        return;
      }
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return; // the beforeunload prompt covers external links
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      if (!window.confirm('You have unsaved changes. Leave this page and discard them?')) {
        e.preventDefault();
        e.stopPropagation();
      } else {
        leavingRef.current = true;
      }
    };
    // Other forms on the page (navbar search, "Log out") would also leave this page.
    const onSubmitElsewhere = (e: SubmitEvent) => {
      if (leavingRef.current || e.target === formRef.current) return;
      if (!window.confirm('You have unsaved changes. Continue and discard them?')) {
        e.preventDefault();
        e.stopPropagation();
      } else {
        leavingRef.current = true;
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    document.addEventListener('click', onClick, true);
    document.addEventListener('submit', onSubmitElsewhere, true);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('submit', onSubmitElsewhere, true);
    };
  }, [dirty]);

  // Ctrl/Cmd + S saves.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(f => {
      const next = { ...f, [key]: value };
      if (key === 'block' || key === 'floor' || key === 'cabinNumber') {
        // An empty location can't be verified. Otherwise, entering a location counts as verifying
        // it — unless the admin has already set the checkbox themselves.
        if (!(next.block && next.cabinNumber)) next.locationVerified = false;
        else if (!verifiedTouched) next.locationVerified = true;
      }
      return next;
    });
    setErrors(e => {
      const k = key as keyof FacultyFieldErrors;
      if (!e[k] && !(key === 'block' || key === 'cabinNumber')) return e;
      const next = { ...e, [k]: undefined };
      if (key === 'block' || key === 'cabinNumber') {
        next.block = undefined;
        next.cabinNumber = undefined;
      }
      return next;
    });
  };

  const text = (key: keyof FormState & keyof FacultyFieldErrors) => ({
    id: `f-${key}`,
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(key, e.target.value as never),
    'aria-invalid': errors[key] ? true : undefined,
    'aria-describedby': errors[key] ? `f-${key}-error` : undefined,
  });

  const save = (force: boolean) => {
    setFormError('');
    setConflict(null);
    setDuplicate(null);
    setSessionExpired(false);
    leavingRef.current = true; // a successful save navigates away
    startTransition(async () => {
      let res: SaveFacultyError | undefined;
      try {
        res = await saveFaculty(toInput(form), {
          id: initial?.id,
          expectedUpdatedAt: initial?.lastUpdated ?? '',
          force,
          requestId: request?.status === 'Pending' ? request.id : undefined,
          returnTo,
        });
      } catch (err) {
        unstable_rethrow(err); // the redirect after a successful save
        leavingRef.current = false;
        setFormError('Could not reach the server. Your changes are still here — please try again.');
        requestFocus('');
        return;
      }
      leavingRef.current = false;
      if (!res) return;
      setErrors(res.errors ?? {});
      setFormError(res.formError ?? '');
      setConflict(res.conflict ?? null);
      setDuplicate(res.duplicate ?? null);
      setSessionExpired(Boolean(res.sessionExpired));
      requestFocus(FIELD_ORDER.find(k => res.errors?.[k]) ?? '');
    });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pending) return;
    save(false);
  };

  const onDelete = () => {
    if (!initial) return;
    if (!window.confirm(`Delete ${initial.name}?\n\nThey will disappear from the public directory. You can undo this right after, or later from the History page.`)) return;
    leavingRef.current = true;
    startTransition(async () => {
      try {
        const res = await deleteFaculty(initial.id, { redirectTo: returnTo });
        leavingRef.current = false;
        if (res && !res.ok) setFormError(res.error);
      } catch (err) {
        unstable_rethrow(err);
        leavingRef.current = false;
        setFormError('Could not reach the server. Please try again.');
      }
    });
  };

  const onRejectRequest = () => {
    if (!request) return;
    if (dirty && !window.confirm('Reject this report and discard your unsaved edits?')) return;
    startTransition(async () => {
      try {
        const res = await setRequestStatus(request.id, 'Rejected');
        if (!res.ok) {
          setFormError(res.error);
          return;
        }
        leavingRef.current = true;
        router.push('/admin/requests');
      } catch (err) {
        unstable_rethrow(err);
        setFormError('Could not reach the server. Please try again.');
      }
    });
  };

  const locationPreview = formatLocation(form);
  const pendingRequest = request?.status === 'Pending' ? request : null;
  const evidenceIsLink = Boolean(request?.evidence && /^https?:\/\//i.test(request.evidence));

  return (
    <div className="container py-8" style={{ maxWidth: '960px' }}>
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm mb-4 text-muted">
        <Link href="/admin">Admin</Link>
        <span aria-hidden>/</span>
        <Link href={returnTo}>Faculty</Link>
        <span aria-hidden>/</span>
        <span style={{ color: 'var(--text-primary)' }}>{isNew ? 'Add new' : 'Edit'}</span>
      </nav>

      <div className="flex flex-wrap justify-between items-end gap-3 mb-6">
        <div>
          <h1 className="h2">{isNew ? 'Add a faculty member' : `Edit: ${initial.name}`}</h1>
          {!isNew && (
            <p className="text-xs text-muted mt-1">
              {initial.lastUpdated ? `Last updated ${formatDateTime(initial.lastUpdated)}` : 'Never edited since import'} · Ref {initial.id}
            </p>
          )}
        </div>
        {!isNew && (
          <Link href={`/faculty/${initial.id}`} target="_blank" className="btn btn-sm btn-secondary">View public page ↗</Link>
        )}
      </div>

      {/* Student report this edit resolves */}
      {request && (
        <div className="card p-5 mb-6" style={{ borderLeft: '3px solid #EAB308' }}>
          <div className="flex flex-wrap justify-between items-start gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                Student report · {request.issueType} · {formatDateTime(request.createdAt)} · <span className={`badge ${request.status === 'Pending' ? 'badge-yellow' : request.status === 'Approved' ? 'badge-green' : 'badge-red'}`}>{request.status}</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                <div className="p-3 rounded" style={{ background: 'var(--bg-subtle)' }}>
                  <span className="text-xs text-muted">They saw</span>
                  <p className="text-sm diff-from">{request.oldInformation || 'Not provided'}</p>
                </div>
                <div className="p-3 rounded" style={{ background: 'var(--muj-orange-light)' }}>
                  <span className="text-xs text-muj-orange">Suggested</span>
                  <p className="text-sm diff-to" style={{ whiteSpace: 'pre-line' }}>{request.proposedInformation}</p>
                </div>
              </div>
              {request.evidence && (
                <p className="text-xs text-muted mt-2">
                  Evidence: {evidenceIsLink ? <a href={request.evidence} target="_blank" rel="noreferrer noopener" className="text-muj-orange">{request.evidence}</a> : request.evidence}
                </p>
              )}
              <p className="text-xs text-muted mt-1">
                From <a className="text-muj-orange" href={replyToReporterMailto(request.submittedBy, request.facultyName, request.issueType, 'Pending')}>{request.submittedBy}</a>
              </p>
            </div>
            {pendingRequest && (
              <button type="button" onClick={onRejectRequest} disabled={pending} className="btn btn-sm btn-danger">Reject report instead</button>
            )}
          </div>
          {pendingRequest && <p className="text-xs mt-3" style={{ color: '#92400E' }}>Make the change below and save — the report is then marked as resolved automatically.</p>}
        </div>
      )}

      <div id="form-alerts" className="flex flex-col gap-3 mb-6" aria-live="polite">
        {sessionExpired && (
          <div className="alert alert-error" role="alert">
            Your admin session has expired. <a href="/admin/login" target="_blank" rel="noopener" className="font-semibold" style={{ textDecoration: 'underline' }}>Log in again in a new tab</a>, then come back and press Save — your edits are still here.
          </div>
        )}
        {conflict && (
          <div className="alert alert-warning" role="alert">
            <strong>This record was changed after you opened it</strong>{conflict.at ? ` (at ${formatDateTime(conflict.at)})` : ''} — probably in another tab.
            <div className="flex flex-wrap gap-2 mt-2">
              <button type="button" className="btn btn-sm btn-secondary" onClick={() => { leavingRef.current = true; window.location.reload(); }}>Load the latest version (discard my edits)</button>
              <button type="button" className="btn btn-sm btn-primary" onClick={() => save(true)} disabled={pending}>Save my version anyway</button>
            </div>
          </div>
        )}
        {duplicate && (
          <div className="alert alert-warning" role="alert">
            <strong>{duplicate.name}</strong> is already listed in {duplicate.department}.
            <div className="flex flex-wrap gap-2 mt-2">
              <Link href={`/admin/faculty/${duplicate.id}`} className="btn btn-sm btn-secondary">Open the existing record</Link>
              <button type="button" className="btn btn-sm btn-primary" onClick={() => save(true)} disabled={pending}>It&apos;s a different person — add anyway</button>
            </div>
          </div>
        )}
        {formError && !sessionExpired && <div className="alert alert-error" role="alert">{formError}</div>}
      </div>

      <form ref={formRef} onSubmit={onSubmit} noValidate>
        {/* Disabled while saving, so nothing typed during the save gets lost when the page changes. */}
        <fieldset disabled={pending} className="flex flex-col gap-6" style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
        {/* Basic details */}
        <section className="card form-section" style={{ borderTop: '3px solid #3B82F6' }}>
          <h2 className="form-section-title">Basic details</h2>
          <p className="form-section-desc">How the faculty member appears in search results.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FieldShell id="f-name" label="Full name" required error={errors.name} hint="Include the title, e.g. “Dr. Kanika Data”.">
              <input type="text" className="input" maxLength={L.name} autoComplete="off" {...text('name')} />
            </FieldShell>
            <FieldShell id="f-designation" label="Designation" required error={errors.designation}>
              <input type="text" className="input" maxLength={L.designation} list="designation-options" autoComplete="off" {...text('designation')} />
              <datalist id="designation-options">
                {options.designations.map(d => <option key={d} value={d} />)}
              </datalist>
            </FieldShell>
            <FieldShell id="f-department" label="Department" required error={errors.department}>
              <SelectOrCustom
                id="f-department" value={form.department} onChange={v => set('department', v)} options={options.departments}
                placeholder="Select a department…" customLabel="+ Add a new department…" customPlaceholder="Full department name"
                maxLength={L.department} invalid={Boolean(errors.department)} describedBy={errors.department ? 'f-department-error' : undefined}
              />
            </FieldShell>
            <FieldShell id="f-facultyCategory" label="Category" error={errors.facultyCategory}>
              <SelectOrCustom
                id="f-facultyCategory" value={form.facultyCategory} onChange={v => set('facultyCategory', v)} options={options.categories}
                placeholder="Select a category…" customLabel="+ Other category…" customPlaceholder="e.g. Visiting"
                maxLength={L.facultyCategory} invalid={Boolean(errors.facultyCategory)}
              />
            </FieldShell>
            <FieldShell id="f-status" label="Availability status" error={errors.status} hint="Shown on the profile page.">
              <select id="f-status" className="input" value={form.status} onChange={e => set('status', e.target.value as FacultyStatus)}>
                {FACULTY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </FieldShell>
            <div className="field" style={{ justifyContent: 'flex-end' }}>
              <label className="checkbox-row p-3 rounded" style={{ background: 'var(--muj-orange-light)', border: '1px solid rgba(232,97,45,0.2)' }}>
                <input type="checkbox" checked={form.isHOD} onChange={e => set('isHOD', e.target.checked)} />
                <span><strong>Head of Department (HoD)</strong><br /><span className="text-xs text-muted">Shown first in searches, with an HoD badge.</span></span>
              </label>
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="card form-section" style={{ borderTop: '3px solid var(--muj-orange)' }}>
          <h2 className="form-section-title">Cabin location</h2>
          <p className="form-section-desc">What students use to find them. Fill block and cabin together, or leave both empty if unknown.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <FieldShell id="f-block" label="Block" error={errors.block}>
              <SelectOrCustom
                id="f-block" value={form.block} onChange={v => set('block', v)} options={options.blocks}
                placeholder="Not set" customLabel="+ Other block…" customPlaceholder="e.g. AB4"
                maxLength={L.block} invalid={Boolean(errors.block)} describedBy={errors.block ? 'f-block-error' : undefined}
              />
            </FieldShell>
            <FieldShell id="f-floor" label="Floor" error={errors.floor}>
              <SelectOrCustom
                id="f-floor" value={form.floor} onChange={v => set('floor', v)} options={options.floors}
                placeholder="Not set" customLabel="+ Other floor…" customPlaceholder="e.g. Mezzanine"
                maxLength={L.floor} invalid={Boolean(errors.floor)}
              />
            </FieldShell>
            <FieldShell id="f-cabinNumber" label="Cabin number" error={errors.cabinNumber}>
              <input type="text" className="input" placeholder="e.g. 305" maxLength={L.cabinNumber} autoComplete="off"
                style={{ borderColor: errors.cabinNumber ? undefined : 'var(--muj-orange)' }} {...text('cabinNumber')} />
            </FieldShell>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-5 p-3 rounded" style={{ background: 'var(--bg-subtle)' }}>
            <p className="text-sm">
              <span className="text-muted">Students will see: </span>
              <strong>{locationPreview || 'Location TBD'}</strong>
            </p>
            <label className="checkbox-row">
              <input type="checkbox" checked={form.locationVerified} disabled={!(form.block && form.cabinNumber)}
                onChange={e => { setVerifiedTouched(true); set('locationVerified', e.target.checked); }} />
              <span>
                <strong>Location verified</strong>
                <br /><span className="text-xs text-muted">Ticked automatically when you change the location — untick it if you haven&apos;t confirmed it yet.</span>
              </span>
            </label>
          </div>

          {form.email && (
            <p className="text-xs text-muted mt-3">
              Not sure?{' '}
              <a className="text-muj-orange font-semibold" href={verifyWithFacultyMailto({ ...form, id: initial?.id ?? 'new', email: form.email })}>
                ✉️ Email {form.name || 'this faculty member'} to confirm their cabin
              </a>
            </p>
          )}
        </section>

        {/* Contact */}
        <section className="card form-section" style={{ borderTop: '3px solid #9CA3AF' }}>
          <h2 className="form-section-title">Contact & photo</h2>
          <p className="form-section-desc">Optional, but helps students reach them.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FieldShell id="f-email" label="Email" error={errors.email}>
              <input type="email" className="input" placeholder="name@jaipur.manipal.edu" maxLength={L.email} autoComplete="off" {...text('email')} />
            </FieldShell>
            <FieldShell id="f-phone" label="Phone" error={errors.phone}>
              <input type="tel" className="input" placeholder="+91 141 399 9100 Ext: 123" maxLength={L.phone} autoComplete="off" {...text('phone')} />
            </FieldShell>
            <div className="md:col-span-2">
              <FieldShell id="f-photo" label="Photo URL" error={errors.photo} hint="Paste the image address of their photo on the university website.">
                <div className="flex items-center gap-3">
                  <Avatar name={form.name || '?'} photo={form.photo || undefined} size={44} />
                  <input type="url" className="input" placeholder="https://…" maxLength={L.photo} autoComplete="off" {...text('photo')} />
                </div>
              </FieldShell>
            </div>
          </div>
        </section>

        {/* Profile details */}
        <section className="card form-section" style={{ borderTop: '3px solid #22C55E' }}>
          <h2 className="form-section-title">Profile details</h2>
          <p className="form-section-desc">Optional. For lists, put <strong>one item per line</strong>.</p>
          <div className="flex flex-col gap-5">
            <FieldShell id="f-bio" label="Biography" error={errors.bio}>
              <textarea className="input" rows={4} maxLength={L.bio} {...text('bio')} />
            </FieldShell>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FieldShell id="f-officeHours" label="Office hours" error={errors.officeHours} hint="e.g. Mon & Wed, 10:00–11:00 AM">
                <textarea className="input" rows={3} {...text('officeHours')} />
              </FieldShell>
              <FieldShell id="f-subjects" label="Subjects taught" error={errors.subjects} hint="e.g. Data Structures">
                <textarea className="input" rows={3} {...text('subjects')} />
              </FieldShell>
              <FieldShell id="f-qualifications" label="Qualifications" error={errors.qualifications} hint="e.g. Ph.D. (IIT Delhi)">
                <textarea className="input" rows={3} {...text('qualifications')} />
              </FieldShell>
              <FieldShell id="f-researchAreas" label="Research areas" error={errors.researchAreas} hint="e.g. Machine Learning">
                <textarea className="input" rows={3} {...text('researchAreas')} />
              </FieldShell>
            </div>
          </div>
        </section>

        {/* Sticky action bar */}
        <div style={{
          position: 'sticky', bottom: 0, zIndex: 40, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem',
          justifyContent: 'space-between', padding: '0.875rem 1rem', background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(8px)',
          border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
        }}>
          <div className="flex items-center gap-3">
            {!isNew && (
              <button type="button" onClick={onDelete} disabled={pending} className="btn btn-danger">Delete</button>
            )}
            <span className="text-xs" style={{ color: dirty ? '#B45309' : 'var(--text-muted)' }} aria-live="polite">
              {pending ? 'Saving…' : dirty ? '● Unsaved changes' : isNew ? 'Fill in the details, then save' : 'No unsaved changes'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href={returnTo} className="btn btn-secondary">Cancel</Link>
            <button type="submit" disabled={pending} className="btn btn-primary" title="Save (Ctrl/⌘ + S)">
              {pending ? 'Saving…' : isNew ? 'Add faculty member' : pendingRequest ? 'Save & resolve report' : 'Save changes'}
            </button>
          </div>
        </div>
        </fieldset>
      </form>
    </div>
  );
}
