import type { Metadata } from 'next';
import Link from 'next/link';
import { summarizeDepartments } from '@/lib/faculty-utils';
import { getFacultyList } from '@/lib/server/data';

export const metadata: Metadata = {
  title: 'Departments',
  description: 'Browse MUJ faculty by department, with Heads of Department and faculty counts.',
};

export default async function DepartmentsPage() {
  const faculty = await getFacultyList();
  const departments = summarizeDepartments(faculty);

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="h2 mb-1">Departments Explorer</h1>
        <p className="text-sm text-muted">
          {departments.length} departments · {faculty.length.toLocaleString('en-IN')} faculty members. Pick one to see everyone and their cabins.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 animate-fade-in">
        {departments.map(dept => (
          <div key={dept.name} className="card card-clickable p-5 hover-lift flex flex-col">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h2 className="font-semibold" style={{ fontSize: '0.9375rem' }}>
                <Link href={`/faculty?department=${encodeURIComponent(dept.name)}`} className="stretched-link">{dept.name}</Link>
              </h2>
              {dept.acronym && <span className="badge badge-orange font-bold shrink-0">{dept.acronym}</span>}
            </div>
            <p className="text-xs text-muted" style={{ flex: 1 }}>
              {dept.hods.length === 0 ? 'HoD: not listed' : (
                <>
                  HoD:{' '}
                  {dept.hods.map((h, i) => (
                    <span key={h.id}>
                      {i > 0 && ', '}
                      <Link href={`/faculty/${h.id}`} className="above-stretched" style={{ textDecoration: 'underline', textUnderlineOffset: 2 }}>{h.name}</Link>
                    </span>
                  ))}
                </>
              )}
            </p>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-muj-orange">{dept.count}</span>
                <span className="text-xs text-muted">Faculty Members</span>
              </div>
              <span aria-hidden className="text-sm font-medium text-muj-orange">View →</span>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-6">
        <Link href="/faculty" className="btn btn-secondary">Open the full directory →</Link>
      </div>
    </div>
  );
}
