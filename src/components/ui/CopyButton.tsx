'use client';

import React, { useEffect, useRef, useState } from 'react';

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }
  // navigator.clipboard is unavailable on plain-HTTP origins (e.g. a LAN IP).
  const el = document.createElement('textarea');
  el.value = text;
  el.setAttribute('readonly', '');
  el.style.position = 'fixed';
  el.style.opacity = '0';
  document.body.appendChild(el);
  el.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  el.remove();
  return ok;
}

interface CopyButtonProps {
  text: string;
  label: React.ReactNode;
  copiedLabel?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  copiedStyle?: React.CSSProperties;
  title?: string;
}

export function CopyButton({ text, label, copiedLabel = 'Copied!', className = 'btn btn-sm btn-secondary', style, copiedStyle, title }: CopyButtonProps) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const onClick = async () => {
    const ok = await copyText(text);
    setState(ok ? 'copied' : 'failed');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), 2000);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={className}
      title={title}
      aria-label={title}
      style={{ ...style, ...(state === 'copied' ? copiedStyle : null) }}
    >
      <span aria-live="polite">{state === 'copied' ? copiedLabel : state === 'failed' ? 'Copy failed' : label}</span>
    </button>
  );
}
