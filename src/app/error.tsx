'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container py-20 text-center" style={{ maxWidth: '520px' }}>
      <div aria-hidden style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.5 }}>⚠️</div>
      <h1 className="h2 mb-2">Something went wrong</h1>
      <p className="text-sm text-muted mb-6">
        This page couldn&apos;t be loaded right now. Please try again in a moment.
        {error.digest && <><br />Reference: {error.digest}</>}
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => retry()} className="btn btn-primary">Try again</button>
        <Link href="/" className="btn btn-secondary">Go home</Link>
      </div>
    </div>
  );
}
