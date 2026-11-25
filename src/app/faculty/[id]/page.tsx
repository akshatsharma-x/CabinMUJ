import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { CopyButton } from '@/components/ui/CopyButton';
import { formatDate, formatLocation, hasLocation } from '@/lib/faculty-utils';
import { getFacultyById } from '@/lib/server/data';
import { updateRequestMailto } from '@/lib/site';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const f = await getFacultyById(id);
  if (!f) return { title: 'Faculty not found' };
  const where = hasLocation(f) ? ` Cabin: ${formatLocation(f)}.` : '';
  return { title: f.name, description: `${f.name} — ${f.designation}, ${f.department}.${where}` };
}

/** "+91 141 399 9100 Ext: 908" → "tel:+911413999100,908" (the comma makes phones dial the extension). */
function telHref(phone: string): string | null {
  const [main, ext] = phone.split(/ext\.?:?/i);
  const digits = main.replace(/[^\d+]/g, '');
  if (digits.replace(/\D/g, '').length < 6) return null;
  const extDigits = ext?.replace(/\D/g, '');
  return `tel:${digits}${extDigits ? `,${extDigits}` : ''}`;
}

const sectionLabel = 'text-xs font-semibold uppercase tracking-wider mb-2';

export default async function FacultyProfilePage({ params }: Props) {
  const { id } = await params;
  const faculty = await getFacultyById(id);
  if (!faculty) notFound();

  const located = hasLocation(faculty);
  const locationText = formatLocation(faculty);
  const tel = faculty.phone ? telHref(faculty.phone) : null;
  const sameFloorHref = `/faculty?${new URLSearchParams({ block: faculty.block ?? '', ...(faculty.floor ? { floor: faculty.floor } : {}) })}`;
  const statusClass = faculty.status === 'Available' ? 'badge-green' : faculty.status === 'Busy' ? 'badge-red' : 'badge-yellow';

  return (
    <div className="container py-8" style={{ maxWidth: '980px' }}>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm mb-6 text-muted" style={{ flexWrap: 'wrap' }}>
        <Link href="/">Home</Link>
        <span aria-hidden>/</span>
        <Link href="/faculty">Faculty</Link>
        <span aria-hidden>/</span>
        <span style={{ color: 'var(--text-primary)' }} aria-current="page">{faculty.name}</span>
      </nav>

      {/* Profile Header */}
      <div className="card mb-6 animate-fade-in">
        <div className="p-6 flex flex-col md:flex-row gap-6 items-start">
          <Avatar name={faculty.name} photo={faculty.photo} size={88} decorative={false} />

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="h2">{faculty.name}</h1>
              {faculty.isHOD && <span className="badge badge-orange">HOD</span>}
              {faculty.facultyCategory && <span className="badge badge-blue">{faculty.facultyCategory}</span>}
            </div>
            <p className="text-sm font-medium mb-1 text-secondary">{faculty.designation}</p>
            <Link href={`/faculty?department=${encodeURIComponent(faculty.department)}`} className="text-sm text-muted" style={{ textDecoration: 'underline', textUnderlineOffset: 3 }}>
              {faculty.department}
            </Link>

            <div className="flex flex-wrap gap-2 mt-4">
              {faculty.email && (
                <a href={`mailto:${faculty.email}`} className="btn btn-sm btn-secondary" style={{ borderRadius: '6px' }}>✉️ Send email</a>
              )}
              {tel && (
                <a href={tel} className="btn btn-sm btn-secondary" style={{ borderRadius: '6px' }}>📞 Call</a>
              )}
              <Link href={`/report?facultyId=${faculty.id}`} className="btn btn-sm btn-ghost" style={{ borderRadius: '6px', color: '#B91C1C' }}>
                Report outdated info
              </Link>
            </div>
          </div>
        </div>

        {/* Cabin location — the reason most people open this page */}
        <div style={{ borderTop: '1px solid var(--border-color)', background: 'var(--muj-orange-light)', padding: '1.25rem 1.5rem' }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-muj-orange mb-2">📍 Cabin location</p>
              {located ? (
                <div className="flex flex-wrap gap-6">
                  {[
                    ['Block', faculty.block],
                    ['Floor', faculty.floor || '—'],
                    ['Cabin', faculty.cabinNumber],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-xs text-muted">{label}</p>
                      <p className="font-black" style={{ fontSize: '1.5rem', lineHeight: 1.2, color: label === 'Cabin' ? 'var(--text-primary)' : 'var(--muj-orange)' }}>{value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-secondary">Not assigned yet — <Link href={`/report?facultyId=${faculty.id}`} className="text-muj-orange font-semibold">know where it is? Tell us</Link>.</p>
              )}
            </div>
            {located && (
              <div className="flex flex-wrap gap-2">
                <CopyButton text={`${faculty.name} — ${locationText}`} label="Copy location" copiedLabel="✓ Copied" className="btn btn-primary btn-sm" style={{ borderRadius: '6px' }} />
                <Link href={sameFloorHref} className="btn btn-secondary btn-sm" style={{ borderRadius: '6px' }}>
                  Others in {faculty.block}{faculty.floor ? `, ${faculty.floor}` : ''} →
                </Link>
              </div>
            )}
          </div>
          {located && (
            <p className="text-xs mt-3" style={{ color: faculty.locationVerified ? '#166534' : '#92400E' }}>
              {faculty.locationVerified
                ? '✓ Location verified by the CabinMUJ admin.'
                : '⚠ This location hasn’t been verified yet. If it’s wrong, please report it so other students don’t get lost.'}
            </p>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6 animate-fade-in delay-100">
          {faculty.bio && (
            <div className="card p-6">
              <h2 className="h4 mb-3">About</h2>
              <p className="text-sm text-secondary" style={{ whiteSpace: 'pre-line' }}>{faculty.bio}</p>
            </div>
          )}

          {(faculty.qualifications.length > 0 || faculty.researchAreas.length > 0) && (
            <div className="card p-6">
              <h2 className="h4 mb-4">Qualifications & Research</h2>
              {faculty.qualifications.length > 0 && (
                <div className="mb-4">
                  <p className={`${sectionLabel} text-muted`}>Education</p>
                  <div className="flex flex-wrap gap-2">
                    {faculty.qualifications.map(q => <span key={q} className="badge badge-gray">{q}</span>)}
                  </div>
                </div>
              )}
              {faculty.researchAreas.length > 0 && (
                <div>
                  <p className={`${sectionLabel} text-muted`}>Research Areas</p>
                  <div className="flex flex-wrap gap-2">
                    {faculty.researchAreas.map(r => <span key={r} className="badge badge-blue">{r}</span>)}
                  </div>
                </div>
              )}
            </div>
          )}

          {faculty.subjects.length > 0 && (
            <div className="card p-6">
              <h2 className="h4 mb-4">Subjects Taught</h2>
              <div className="flex flex-wrap gap-2">
                {faculty.subjects.map(s => <span key={s} className="badge badge-orange">{s}</span>)}
              </div>
            </div>
          )}

          {faculty.officeHours.length > 0 && (
            <div className="card p-6">
              <h2 className="h4 mb-4">Office Hours</h2>
              <div className="flex flex-col gap-2">
                {faculty.officeHours.map(h => (
                  <div key={h} className="flex items-center gap-3 p-3 rounded" style={{ background: 'var(--bg-subtle)' }}>
                    <span aria-hidden>🕒</span>
                    <span className="text-sm">{h}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card p-6">
            <h2 className="h4 mb-4">Contact</h2>
            <div className="flex flex-col gap-4">
              {faculty.email ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className={`${sectionLabel} text-muted`} style={{ marginBottom: 2 }}>Email</p>
                    <a href={`mailto:${faculty.email}`} className="text-sm text-muj-orange" style={{ wordBreak: 'break-all' }}>{faculty.email}</a>
                  </div>
                  <CopyButton text={faculty.email} label="Copy" copiedLabel="✓" title="Copy email address" style={{ borderRadius: '6px' }} />
                </div>
              ) : null}
              {faculty.phone ? (
                <div>
                  <p className={`${sectionLabel} text-muted`} style={{ marginBottom: 2 }}>Phone</p>
                  {tel ? <a href={tel} className="text-sm">{faculty.phone}</a> : <p className="text-sm">{faculty.phone}</p>}
                </div>
              ) : null}
              {!faculty.email && !faculty.phone && <p className="text-sm text-muted">No contact details listed yet.</p>}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6 animate-fade-in delay-200">
          <div className="card p-4">
            <h2 className={`${sectionLabel} text-muted`} style={{ marginBottom: '0.75rem' }}>Status</h2>
            <span className={`badge ${statusClass}`}>{faculty.status}</span>
          </div>

          <div className="card p-5" style={{ borderTop: '3px solid var(--muj-orange)' }}>
            <h2 className="h4 mb-1">Spotted an error?</h2>
            <p className="text-sm text-muted mb-4">Cabin moved or details changed? Let the CabinMUJ team know — it takes a minute.</p>
            <div className="flex flex-col gap-2">
              <a href={updateRequestMailto(faculty)} className="btn btn-primary w-full">✉️ Email an update</a>
              <Link href={`/report?facultyId=${faculty.id}`} className="btn btn-secondary w-full">Use the update form</Link>
            </div>
          </div>

          <div className="text-xs text-center text-muted">
            {faculty.lastUpdated && <p>Last updated {formatDate(faculty.lastUpdated)}</p>}
            <p>Reference: {faculty.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
