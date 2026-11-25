'use client';

import { Analytics, type BeforeSendEvent } from '@vercel/analytics/next';

/** Admin pages are left out, so visitor and page-view numbers reflect students. */
function skipAdminPages(event: BeforeSendEvent): BeforeSendEvent | null {
  try {
    return new URL(event.url).pathname.startsWith('/admin') ? null : event;
  } catch {
    return event;
  }
}

/** Vercel Web Analytics (cookie-free). Only collects on Vercel deployments. */
export function SiteAnalytics() {
  return <Analytics beforeSend={skipAdminPages} />;
}
