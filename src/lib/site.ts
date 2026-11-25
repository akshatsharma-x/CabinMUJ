import type { Faculty } from './types';
import { formatLocation } from './faculty-utils';

/**
 * Where students' "email an update" messages go. Set NEXT_PUBLIC_CONTACT_EMAIL
 * in .env.local (or your host's environment) to change it.
 */
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'cabinmuj@gmail.com';

export function mailto(to: string, subject: string, body: string): string {
  // encodeURIComponent turns spaces into %20 (not "+"), which every mail client understands.
  return `mailto:${encodeURIComponent(to).replace(/%40/g, '@')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

type FacultyLike = Pick<Faculty, 'id' | 'name' | 'department' | 'designation' | 'block' | 'cabinNumber' | 'floor'> &
  Partial<Pick<Faculty, 'email' | 'phone'>>;

function describe(f: FacultyLike): string {
  return [
    `Name: ${f.name}`,
    `Department: ${f.department || '—'}`,
    `Designation: ${f.designation || '—'}`,
    `Location shown on CabinMUJ: ${formatLocation(f) || 'not set'}`,
    f.email ? `Email: ${f.email}` : '',
    `Reference: ${f.id}`,
  ]
    .filter(Boolean)
    .join('\n');
}

/** Student → CabinMUJ team: "this faculty's info is wrong". */
export function updateRequestMailto(f?: FacultyLike): string {
  if (!f) {
    return mailto(
      CONTACT_EMAIL,
      'CabinMUJ: information update',
      [
        'Hi CabinMUJ team,',
        '',
        'Faculty member (name and department):',
        '',
        'What is wrong or missing:',
        '',
        'Correct information (block / floor / cabin / other):',
        '',
        'How I know (optional):',
        '',
        'Thanks!',
      ].join('\n'),
    );
  }
  return mailto(
    CONTACT_EMAIL,
    `CabinMUJ update: ${f.name} (${f.id})`,
    [
      'Hi CabinMUJ team,',
      '',
      'Please update the details for:',
      describe(f),
      '',
      'What is wrong:',
      '',
      'Correct information (block / floor / cabin / other):',
      '',
      'How I know (optional):',
      '',
      'Thanks!',
    ].join('\n'),
  );
}

/** Admin → faculty member: "please confirm your cabin details". */
export function verifyWithFacultyMailto(f: FacultyLike & { email: string }): string {
  const details = [
    `Block: ${f.block || '—'}`,
    `Floor: ${f.floor || '—'}`,
    `Cabin: ${f.cabinNumber || '—'}`,
    `Department: ${f.department || '—'}`,
    `Designation: ${f.designation || '—'}`,
    ...(f.phone ? [`Phone: ${f.phone}`] : []),
  ];
  return mailto(
    f.email,
    'Please confirm your cabin details on CabinMUJ',
    [
      `Dear ${f.name},`,
      '',
      'CabinMUJ helps MUJ students find faculty cabins. Could you please confirm (or correct) the details we list for you?',
      '',
      ...details,
      '',
      'A quick reply with any corrections is enough.',
      '',
      'Thank you!',
      'CabinMUJ Admin',
    ].join('\n'),
  );
}

/** Admin → student who reported an issue. */
export function replyToReporterMailto(
  to: string,
  facultyName: string,
  issueType: string,
  outcome: 'Approved' | 'Rejected' | 'Pending',
): string {
  const subject = `Re: your CabinMUJ update request — ${facultyName || issueType}`;
  const lines =
    outcome === 'Approved'
      ? [`Thanks for reporting "${issueType}" for ${facultyName}. We've updated CabinMUJ with the corrected information.`]
      : outcome === 'Rejected'
        ? [
            `Thanks for reporting "${issueType}" for ${facultyName}. We checked it but couldn't confirm the change, so the listing stays as it is for now.`,
            'If you have more details (for example a photo of the cabin name plate), just reply to this email.',
          ]
        : [`Thanks for reporting "${issueType}" for ${facultyName}. Could you share a little more detail so we can verify it?`];
  return mailto(to, subject, ['Hi,', '', ...lines, '', 'Thanks for helping keep CabinMUJ accurate!', 'CabinMUJ Admin'].join('\n'));
}
