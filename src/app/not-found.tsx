import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container py-20 text-center" style={{ maxWidth: '520px' }}>
      <div aria-hidden style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.5 }}>🧭</div>
      <h1 className="h2 mb-2">Page not found</h1>
      <p className="text-sm text-muted mb-6">This page doesn&apos;t exist. Looking for a faculty member&apos;s cabin?</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/faculty" className="btn btn-primary">Search faculty</Link>
        <Link href="/" className="btn btn-secondary">Go home</Link>
      </div>
    </div>
  );
}
