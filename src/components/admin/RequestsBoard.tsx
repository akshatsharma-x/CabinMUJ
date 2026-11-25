'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { unstable_rethrow } from 'next/navigation';
import type { UpdateRequest, UpdateRequestStatus } from '@/lib/types';
import { formatDateTime } from '@/lib/faculty-utils';
import { replyToReporterMailto } from '@/lib/site';
import { setRequestStatus } from '@/lib/actions/admin';
import { useToast } from './Toast';

type Tab = 'Pending' | 'Approved' | 'Rejected' | 'All';
const TAB_LABELS: Record<Tab, string> = { Pending: 'Pending', Approved: 'Resolved', Rejected: 'Rejected', All: 'All' };
const STATUS_LABEL: Record<UpdateRequestStatus, string> = { Pending: 'Pending', Approved: 'Resolved', Rejected: 'Rejected' };

export function RequestsBoard({ requests, facultyNames }: { requests: UpdateRequest[]; facultyNames: Record<string, string> }) {
  const [tab, setTab] = useState<Tab>('Pending');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const toast = useToast();

  const counts = {
    Pending: requests.filter(r => r.status === 'Pending').length,
    Approved: requests.filter(r => r.status === 'Approved').length,
    Rejected: requests.filter(r => r.status === 'Rejected').length,
    All: requests.length,
  };
  const shown = [...requests]
    .filter(r => tab === 'All' || r.status === tab)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const changeStatus = (r: UpdateRequest, status: UpdateRequestStatus) => {
    setBusyId(r.id);
    startTransition(async () => {
      try {
        const res = await setRequestStatus(r.id, status);
        toast(res.ok ? { message: `Report marked as ${STATUS_LABEL[status].toLowerCase()}.` } : { message: res.error, tone: 'error' });
      } catch (err) {
        unstable_rethrow(err);
        toast({ message: 'Could not reach the server. Please try again.', tone: 'error' });
      } finally {
        setBusyId(null);
      }
    });
  };

  return (
    <>
      <div className="chip-scroll mb-5" role="tablist" aria-label="Filter reports">
        {(Object.keys(TAB_LABELS) as Tab[]).map(t => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} className={`chip ${tab === t ? 'chip-active' : ''}`} onClick={() => setTab(t)}>
            {TAB_LABELS[t]} <span style={{ opacity: 0.7 }}>{counts[t]}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4 animate-fade-in">
        {shown.map(req => {
          const currentName = req.facultyId ? facultyNames[req.facultyId] : undefined;
          const facultyGone = Boolean(req.facultyId) && !currentName;
          const statusBadge = req.status === 'Pending' ? 'badge-yellow' : req.status === 'Approved' ? 'badge-green' : 'badge-red';
          const evidenceIsLink = /^https?:\/\//i.test(req.evidence);
          const busy = busyId === req.id;
          const editorHref = req.facultyId
            ? `/admin/faculty/${req.facultyId}?request=${req.id}&returnTo=${encodeURIComponent('/admin/requests')}`
            : `/admin/faculty/new?request=${req.id}`;

          return (
            <div key={req.id} className="card p-5" style={{
              opacity: busy ? 0.6 : 1,
              borderLeft: `3px solid ${req.status === 'Pending' ? '#EAB308' : req.status === 'Approved' ? '#22C55E' : '#EF4444'}`,
            }}>
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`badge ${statusBadge}`}>{STATUS_LABEL[req.status]}</span>
                    <span className="text-xs text-muted">{formatDateTime(req.createdAt)}</span>
                    {req.resolvedAt && <span className="text-xs text-muted">· closed {formatDateTime(req.resolvedAt)}</span>}
                  </div>

                  <h2 className="font-semibold mb-1">
                    {req.facultyId ? (
                      facultyGone ? <>{req.facultyName || 'Unknown faculty'} <span className="badge badge-gray">deleted</span></> : (
                        <Link href={`/faculty/${req.facultyId}`} target="_blank" style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>{currentName}</Link>
                      )
                    ) : (
                      'New faculty suggestion'
                    )}
                  </h2>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3 text-muted">{req.issueType}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    {req.facultyId && (
                      <div className="p-3 rounded" style={{ background: 'var(--bg-subtle)' }}>
                        <span className="text-xs text-muted">They saw</span>
                        <p className="text-sm font-medium diff-from">{req.oldInformation || 'Not provided'}</p>
                      </div>
                    )}
                    <div className="p-3 rounded" style={{ background: 'var(--muj-orange-light)' }}>
                      <span className="text-xs text-muj-orange">{req.facultyId ? 'Suggested' : 'Details'}</span>
                      <p className="text-sm diff-to" style={{ whiteSpace: 'pre-line' }}>{req.proposedInformation}</p>
                    </div>
                  </div>

                  <p className="text-xs text-muted" style={{ wordBreak: 'break-word' }}>
                    From {req.submittedBy}
                    {req.evidence && (
                      <>
                        {' · '}Evidence:{' '}
                        {evidenceIsLink ? (
                          <a href={req.evidence} target="_blank" rel="noreferrer noopener" className="text-muj-orange">{req.evidence}</a>
                        ) : (
                          <span>{req.evidence}</span>
                        )}
                      </>
                    )}
                  </p>
                </div>

                <div className="flex flex-col gap-2 shrink-0" style={{ minWidth: '190px' }}>
                  {req.status === 'Pending' ? (
                    <>
                      {!facultyGone && (
                        <Link href={editorHref} className="btn btn-sm btn-primary">
                          {req.facultyId ? 'Open in editor' : 'Add as new faculty'}
                        </Link>
                      )}
                      <button type="button" disabled={busy} onClick={() => changeStatus(req, 'Approved')} className="btn btn-sm btn-success">✓ Mark resolved</button>
                      <button type="button" disabled={busy} onClick={() => changeStatus(req, 'Rejected')} className="btn btn-sm btn-danger">✗ Reject</button>
                    </>
                  ) : (
                    <button type="button" disabled={busy} onClick={() => changeStatus(req, 'Pending')} className="btn btn-sm btn-secondary">Reopen</button>
                  )}
                  <a href={replyToReporterMailto(req.submittedBy, currentName ?? req.facultyName, req.issueType, req.status)} className="btn btn-sm btn-ghost">
                    ✉️ Reply to student
                  </a>
                </div>
              </div>
            </div>
          );
        })}

        {shown.length === 0 && (
          <div className="text-center py-16">
            <div aria-hidden style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.4 }}>✨</div>
            <h2 className="h3 mb-1">{tab === 'Pending' ? 'All caught up!' : 'Nothing here yet'}</h2>
            <p className="text-sm text-muted">
              {tab === 'Pending' ? 'No reports are waiting for review.' : 'Reports will appear here once they are handled.'}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
