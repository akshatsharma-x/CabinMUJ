'use client';

import React, { useState, useTransition } from 'react';
import { unstable_rethrow } from 'next/navigation';
import { restoreBackup } from '@/lib/actions/admin';
import { formatDateTime } from '@/lib/faculty-utils';
import { useToast } from './Toast';

/** Upload a backup JSON (from "Download backup") to replace all data — e.g. to move data to a new server. */
export function RestoreBackup({ currentFaculty }: { currentFaculty: number }) {
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [inputKey, setInputKey] = useState(0);
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  const onPick = async (picked: File | undefined) => {
    setFile(picked ?? null);
    setSummary('');
    setInvalid(false);
    if (!picked) return;
    try {
      const data = JSON.parse(await picked.text());
      if (!Array.isArray(data?.faculty)) throw new Error('not a backup');
      const when = typeof data.exportedAt === 'string' ? formatDateTime(data.exportedAt) : 'an unknown date';
      const reports = Array.isArray(data.requests) ? data.requests.length : 0;
      setSummary(`This backup has ${data.faculty.length} faculty and ${reports} reports, exported ${when}.`);
    } catch {
      setInvalid(true);
      setSummary("This doesn't look like a CabinMUJ backup file.");
    }
  };

  const onRestore = () => {
    if (!file || invalid) return;
    const ok = window.confirm(
      `Replace ALL current data (${currentFaculty} faculty, reports and history) with this backup?\n\n${summary}\n\nTip: download a backup of the current data first.`,
    );
    if (!ok) return;
    const fd = new FormData();
    fd.set('backup', file);
    startTransition(async () => {
      try {
        const res = await restoreBackup(fd);
        if (res.ok) {
          toast({ message: `Backup restored: ${res.faculty} faculty.` });
          setFile(null);
          setSummary('');
          setInputKey(k => k + 1);
        } else {
          toast({ message: res.error, tone: 'error' });
        }
      } catch (err) {
        unstable_rethrow(err);
        toast({ message: 'Could not upload the backup. Please try again.', tone: 'error' });
      }
    });
  };

  return (
    <div className="field">
      <label htmlFor="restore-file" className="field-label">Restore from a backup file</label>
      <div className="flex flex-wrap items-center gap-2">
        <input
          key={inputKey}
          id="restore-file"
          type="file"
          accept="application/json,.json"
          className="input"
          style={{ flex: '1 1 240px', padding: '0.5rem' }}
          disabled={pending}
          onChange={e => onPick(e.target.files?.[0])}
        />
        <button type="button" className="btn btn-secondary" disabled={!file || invalid || pending} onClick={onRestore}>
          {pending ? 'Restoring…' : 'Restore…'}
        </button>
      </div>
      {summary && <p className="field-hint" style={invalid ? { color: '#B91C1C' } : undefined}>{summary}</p>}
      <p className="field-hint">Replaces all faculty, reports and history — use it to move your data to a new server.</p>
    </div>
  );
}
