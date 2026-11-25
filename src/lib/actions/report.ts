'use server';

import { revalidatePath } from 'next/cache';
import { NOT_LISTED_ISSUE } from '@/lib/types';
import { clientIp, hit, limitedFor, type Limit } from '@/lib/server/rate-limit';
import { abort, mutate, newId, StorageError } from '@/lib/server/store';
import { line, validateReportInput, type ReportFieldErrors } from '@/lib/server/validation';

export type ReportResult = { ok: true } | { ok: false; errors?: ReportFieldErrors; formError?: string };

const MAX_PENDING = 500;

/** Public: a student reports outdated faculty information. Admins review it in /admin/requests. */
export async function submitUpdateReport(raw: unknown): Promise<ReportResult> {
  // Honeypot: the "trap" field is hidden from people, but bots fill in every field.
  if (raw && typeof raw === 'object' && line((raw as Record<string, unknown>).trap)) return { ok: true };

  const parsed = validateReportInput(raw);
  if (!parsed.ok) return { ok: false, errors: parsed.errors };
  const v = parsed.value;

  const limits: Limit[] = [
    { key: `report:${await clientIp()}`, limit: 6, windowMs: 10 * 60_000 },
    { key: 'report:all', limit: 40, windowMs: 10 * 60_000, global: true },
  ];
  if (limitedFor(limits)) {
    return { ok: false, formError: 'A lot of reports were sent in a short time. Please wait a few minutes, or email us instead.' };
  }

  let result: ReportResult;
  try {
    result = await mutate<ReportResult>(db => {
      let facultyName = '';
      if (v.issueType !== NOT_LISTED_ISSUE) {
        const f = db.faculty.find(x => x.id === v.facultyId);
        if (!f) return abort({ ok: false, errors: { facultyId: 'Please choose the faculty member from the list.' } });
        facultyName = f.name;
      }
      if (db.requests.filter(r => r.status === 'Pending').length >= MAX_PENDING) {
        return abort({ ok: false, formError: 'We have a lot of reports waiting for review right now. Please email us instead.' });
      }
      db.requests.unshift({
        id: newId('req'),
        facultyId: v.issueType === NOT_LISTED_ISSUE ? '' : v.facultyId,
        facultyName,
        submittedBy: v.submittedBy,
        issueType: v.issueType,
        oldInformation: v.oldInformation,
        proposedInformation: v.proposedInformation,
        evidence: v.evidence,
        status: 'Pending',
        createdAt: new Date().toISOString(),
      });
      return { ok: true };
    });
  } catch (e) {
    if (!(e instanceof StorageError)) console.error('[cabinmuj] report failed', e);
    return { ok: false, formError: 'We could not save your report right now. Please try again, or email us instead.' };
  }
  if (result.ok) {
    hit(limits);
    revalidatePath('/admin', 'layout');
  }
  return result;
}
