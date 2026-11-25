'use client';

import React, { useEffect, useRef, useState } from 'react';
import { initials } from '@/lib/faculty-utils';

interface AvatarProps {
  name: string;
  photo?: string;
  size?: number;
  /** Set when the name is shown next to the avatar, so screen readers don't read it twice. */
  decorative?: boolean;
}

/** Faculty photo with an initials fallback when there is no photo or it fails to load. */
export function Avatar({ name, photo, size = 48, decorative = true }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const [shownPhoto, setShownPhoto] = useState(photo);
  const imgRef = useRef<HTMLImageElement>(null);

  if (photo !== shownPhoto) {
    setShownPhoto(photo);
    setFailed(false);
  }

  // An image that failed before hydration never fires onError; detect that case.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, [photo]);

  const showImage = Boolean(photo) && !failed;

  return (
    <div
      style={{
        position: 'relative', width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
        background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {/* Initials sit underneath, so the circle isn't blank while a slow photo loads (or if it fails). */}
      <span aria-hidden={decorative || showImage} style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: Math.max(10, size * 0.32) }}>
        {initials(name)}
      </span>
      {showImage && (
        // Plain <img>: photos are hot-linked from the university site and lazy-loaded.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={photo}
          alt={decorative ? '' : name}
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
    </div>
  );
}
