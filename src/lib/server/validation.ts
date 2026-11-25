import 'server-only';
import type { FacultyFieldErrors, FacultyInput, FacultyStatus } from '@/lib/types';
import { FACULTY_LIMITS as L, FACULTY_STATUSES, NOT_LISTED_ISSUE, REPORT_ISSUE_TYPES } from '@/lib/types';

/** Single-line text: collapses whitespace. */
export const line = (v: unknown) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim() : '');
/** Multi-line text: keeps line breaks, trims each line's trailing spaces. */
export const paragraph = (v: unknown) =>
  typeof v === 'string'
    ? v
        .replace(/\r\n?/g, '\n')
        .split('\n')
        .map(s => s.trimEnd())
        .join('\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    : '';
/** One item per line (arrays are accepted too); blanks and duplicates removed. */
const list = (v: unknown) => {
  const items = Array.isArray(v) ? v : typeof v === 'string' ? v.split('\n') : [];
  return [...new Set(items.map(line).filter(Boolean))];
};

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isHttpUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export type ValidationResult = { ok: true; value: FacultyInput } | { ok: false; errors: FacultyFieldErrors };

/** Validates untrusted input from the admin form. Server-side; the browser's checks are only a convenience. */
export function validateFacultyInput(raw: unknown): ValidationResult {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const value: FacultyInput = {
    name: line(r.name),
    designation: line(r.designation),
    department: line(r.department),
    facultyCategory: line(r.facultyCategory) || 'Regular',
    isHOD: r.isHOD === true,
    status: FACULTY_STATUSES.includes(r.status as FacultyStatus) ? (r.status as FacultyStatus) : 'Available',
    block: line(r.block),
    floor: line(r.floor),
    cabinNumber: line(r.cabinNumber),
    locationVerified: r.locationVerified === true,
    email: line(r.email).toLowerCase(),
    phone: line(r.phone),
    photo: line(r.photo),
    bio: paragraph(r.bio),
    qualifications: list(r.qualifications),
    researchAreas: list(r.researchAreas),
    subjects: list(r.subjects),
    officeHours: list(r.officeHours),
  };

  const errors: FacultyFieldErrors = {};
  const tooLong = (key: keyof typeof L & keyof FacultyInput, label: string) => {
    const v = value[key];
    if (typeof v === 'string' && v.length > L[key]) errors[key] = `${label} must be at most ${L[key]} characters.`;
  };

  if (!value.name) errors.name = 'Name is required.';
  if (!value.designation) errors.designation = 'Designation is required.';
  if (!value.department) errors.department = 'Department is required.';
  tooLong('name', 'Name');
  tooLong('designation', 'Designation');
  tooLong('department', 'Department');
  tooLong('facultyCategory', 'Category');
  tooLong('block', 'Block');
  tooLong('floor', 'Floor');
  tooLong('cabinNumber', 'Cabin number');
  tooLong('email', 'Email');
  tooLong('phone', 'Phone');
  tooLong('photo', 'Photo URL');
  tooLong('bio', 'Biography');

  // A cabin without a block (or vice versa) would show a half location to students.
  if (value.block && !value.cabinNumber) errors.cabinNumber = 'Add the cabin number, or clear the block if the location is unknown.';
  if (value.cabinNumber && !value.block) errors.block = 'Choose the block for this cabin, or clear the cabin number.';
  if (!value.block && !value.cabinNumber) value.locationVerified = false;

  if (value.email && !EMAIL_RE.test(value.email)) errors.email = 'Enter a valid email address, e.g. name@jaipur.manipal.edu.';
  if (value.photo && !isHttpUrl(value.photo) && !value.photo.startsWith('/')) {
    errors.photo = 'Photo must be a web address starting with https:// (or left empty).';
  }

  for (const [key, label] of [
    ['qualifications', 'Qualifications'],
    ['researchAreas', 'Research areas'],
    ['subjects', 'Subjects'],
    ['officeHours', 'Office hours'],
  ] as const) {
    const items = value[key];
    if (items.length > L.listItems) errors[key] = `${label}: at most ${L.listItems} lines.`;
    else if (items.some(i => i.length > L.listItem)) errors[key] = `${label}: each line must be at most ${L.listItem} characters.`;
  }

  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value };
}

// ─── Student update reports ─────────────────────────────────────────────

export interface ReportInput {
  facultyId: string;
  issueType: string;
  oldInformation: string;
  proposedInformation: string;
  evidence: string;
  submittedBy: string;
}

export type ReportFieldErrors = Partial<Record<keyof ReportInput, string>>;

export function validateReportInput(raw: unknown): { ok: true; value: ReportInput } | { ok: false; errors: ReportFieldErrors } {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const value: ReportInput = {
    facultyId: line(r.facultyId),
    issueType: (REPORT_ISSUE_TYPES as readonly string[]).includes(r.issueType as string) ? (r.issueType as string) : '',
    oldInformation: line(r.oldInformation),
    proposedInformation: paragraph(r.proposedInformation),
    evidence: line(r.evidence),
    submittedBy: line(r.submittedBy).toLowerCase(),
  };
  const errors: ReportFieldErrors = {};
  if (!value.issueType) errors.issueType = 'Choose what needs updating.';
  if (value.issueType !== NOT_LISTED_ISSUE && !value.facultyId) errors.facultyId = 'Choose the faculty member this is about.';
  if (!value.proposedInformation) {
    errors.proposedInformation =
      value.issueType === NOT_LISTED_ISSUE
        ? 'Tell us the faculty member’s name, department and cabin.'
        : 'Tell us the correct information.';
  } else if (value.proposedInformation.length > 1000) errors.proposedInformation = 'Please keep this under 1000 characters.';
  if (value.oldInformation.length > 300) errors.oldInformation = 'Please keep this under 300 characters.';
  if (value.evidence.length > 500) errors.evidence = 'Please keep this under 500 characters.';
  if (!value.submittedBy) errors.submittedBy = 'Your email is required so we can follow up.';
  else if (!EMAIL_RE.test(value.submittedBy) || value.submittedBy.length > 254) errors.submittedBy = 'Enter a valid email address.';
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value };
}
