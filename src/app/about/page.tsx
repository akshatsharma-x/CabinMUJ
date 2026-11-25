import type { Metadata } from 'next';
import Link from 'next/link';
import { CONTACT_EMAIL, updateRequestMailto } from '@/lib/site';
import { NOT_LISTED_ISSUE } from '@/lib/types';

export const metadata: Metadata = {
  title: 'About',
  description: 'What CabinMUJ is, how the faculty cabin data is kept up to date, and answers to common questions.',
};

const FAQ = [
  {
    q: 'How do I find a professor’s cabin?',
    a: 'Search their name (or department, block, or cabin number) on the home page or in the Faculty Directory. Each profile shows the block, floor and cabin at the top.',
  },
  {
    q: 'Can I search with partial information?',
    a: 'Yes. Combine words freely — “CSE HoD”, “AB2 305”, “physics 3rd floor” or just a surname all work.',
  },
  {
    q: 'What does “location not verified” mean?',
    a: 'The cabin hasn’t been confirmed by the CabinMUJ admin yet. It is usually right, but if you find it is wrong, please report it so the next student doesn’t get lost.',
  },
  {
    q: 'A cabin is wrong or a professor has moved. What do I do?',
    a: 'Open their profile and choose “Report outdated info” (or “Email an update”). The admin reviews every report and updates the listing for everyone.',
  },
  {
    q: 'A faculty member is missing.',
    a: 'Use the update form and choose “Faculty member is missing from CabinMUJ”, with their name, department and cabin if you know it.',
  },
];

export default function AboutPage() {
  return (
    <div className="container py-12" style={{ maxWidth: '820px' }}>
      <h1 className="h2 mb-2">About CabinMUJ</h1>
      <p className="text-secondary mb-8 leading-relaxed">
        CabinMUJ helps students at Manipal University Jaipur find any faculty member — and the exact block, floor and cabin
        where they sit — in seconds. It is maintained by an admin and kept accurate by reports from students like you.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        {[
          ['🔍', 'Search', 'Find faculty by name, department, block or cabin.'],
          ['📍', 'Locate', 'See the block, floor and cabin, and who else is nearby.'],
          ['✍️', 'Improve', 'Report changes by form or email; the admin verifies them.'],
        ].map(([icon, title, text]) => (
          <div key={title} className="card p-5">
            <div aria-hidden style={{ fontSize: '1.5rem' }}>{icon}</div>
            <h2 className="h4 mt-2 mb-1">{title}</h2>
            <p className="text-sm text-muted">{text}</p>
          </div>
        ))}
      </div>

      <section id="faq" className="mb-12" style={{ scrollMarginTop: '90px' }}>
        <h2 className="h3 mb-4">Frequently asked questions</h2>
        <div className="flex flex-col gap-3">
          {FAQ.map(({ q, a }) => (
            <details key={q} className="card p-4">
              <summary className="font-semibold cursor-pointer">{q}</summary>
              <p className="text-sm text-secondary mt-2 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="guidelines" className="mb-12" style={{ scrollMarginTop: '90px' }}>
        <h2 className="h3 mb-4">Guidelines for reporting updates</h2>
        <ul className="card p-5 flex flex-col gap-2 text-sm text-secondary" style={{ listStyle: 'none' }}>
          <li>✓ Check the name plate on the cabin door before reporting a change.</li>
          <li>✓ Say how you know (visited, timetable, notice) — it speeds up verification.</li>
          <li>✓ Use your MUJ email so the admin can follow up if needed.</li>
          <li>✕ Don&apos;t submit guesses or rumors, and never share anyone&apos;s personal details.</li>
        </ul>
      </section>

      <section className="card p-6 text-center" style={{ borderTop: '3px solid var(--muj-orange)' }}>
        <h2 className="h3 mb-2">Something out of date?</h2>
        <p className="text-sm text-muted mb-5">Reach the CabinMUJ team at <a href={`mailto:${CONTACT_EMAIL}`} className="text-muj-orange font-semibold">{CONTACT_EMAIL}</a>.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/report" className="btn btn-primary">Use the update form</Link>
          <a href={updateRequestMailto()} className="btn btn-secondary">✉️ Email an update</a>
          <Link href={`/report?issue=${encodeURIComponent(NOT_LISTED_ISSUE)}`} className="btn btn-secondary">Suggest a missing faculty</Link>
        </div>
      </section>
    </div>
  );
}
