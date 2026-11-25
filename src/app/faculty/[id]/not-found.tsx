import Link from 'next/link';
import { NOT_LISTED_ISSUE } from '@/lib/types';

export default function FacultyNotFound() {
  return (
    <div className="container py-20 text-center" style={{ maxWidth: '520px' }}>
      <div aria-hidden style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.5 }}>🧭</div>
      <h1 className="h2 mb-2">Faculty member not found</h1>
      <p className="text-sm text-muted mb-6">
        This profile may have been removed or the link is mistyped. Try searching the directory instead.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/faculty" className="btn btn-primary">Search the directory</Link>
        <Link href={`/report?issue=${encodeURIComponent(NOT_LISTED_ISSUE)}`} className="btn btn-secondary">Report a missing faculty</Link>
      </div>
    </div>
  );
}
