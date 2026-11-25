import React from 'react';
import Link from 'next/link';
import { unstable_rethrow } from 'next/navigation';
import { getFacultyList } from '@/lib/server/data';
import { CONTACT_EMAIL, updateRequestMailto } from '@/lib/site';
import { NOT_LISTED_ISSUE } from '@/lib/types';
import styles from './Footer.module.css';

const icon = {
  people: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  building: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M3 7v1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1h-18l2-4h14l2 4"/><line x1="5" y1="21" x2="5" y2="10"/><line x1="19" y1="21" x2="19" y2="10"/><path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"/></svg>,
  map: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>,
  search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  pencil: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>,
  userPlus: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>,
  help: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>,
  book: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>,
  info: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>,
  shield: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  bell: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>,
  clock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
};

export async function Footer() {
  // The footer is on every page (including admin login), so a storage problem
  // must not take the whole site down — show the footer without numbers instead.
  const faculty = await getFacultyList().catch((e: unknown) => {
    unstable_rethrow(e); // let Next.js handle its own signals (e.g. "render this page per request")
    console.error('[cabinmuj] footer could not read data', e);
    return null;
  });
  const totalFaculty = faculty?.length ?? 0;
  const departments = new Set((faculty ?? []).map(f => f.department).filter(Boolean)).size;
  const buildings = new Set((faculty ?? []).map(f => f.block).filter(Boolean)).size;
  const hods = (faculty ?? []).filter(f => f.isHOD).length;

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>

        {/* ─── TOP GRID ─── */}
        <div className={styles.topGrid}>

          {/* 1. Brand & Contact */}
          <div>
            <div className={styles.brandHeader}>
              <div className={styles.brandLogo}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <span className={styles.brandName}>Cabin<span className={styles.brandOrange}>MUJ</span></span>
            </div>
            <p className={styles.brandDescription}>
              Navigate campus and find faculty cabins at Manipal University Jaipur instantly.
            </p>

            <div className={styles.contactCard}>
              <h4 className={styles.contactTitle}>Let&apos;s Connect</h4>
              <p className={styles.contactSubtitle}>Spotted outdated info or have a suggestion?</p>

              <a href={updateRequestMailto()} className={styles.contactLink}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                {CONTACT_EMAIL}
              </a>
              <Link href="/report" className={styles.contactLink} style={{ marginBottom: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
                Use the update form
              </Link>
            </div>
          </div>

          {/* 2. Platform */}
          <div className={styles.navColumn}>
            <h4 className={styles.navHeading}>PLATFORM</h4>
            <div className={styles.navAccent}></div>
            <Link href="/faculty" className={styles.navLink}>{icon.people}Faculty Directory</Link>
            <Link href="/departments" className={styles.navLink}>{icon.building}Departments</Link>
            <Link href="/blocks" className={styles.navLink}>{icon.map}Campus Map</Link>
            <Link href="/faculty?hod=1" className={styles.navLink}>{icon.search}Heads of Department</Link>
          </div>

          {/* 3. Resources */}
          <div className={styles.navColumn}>
            <h4 className={styles.navHeading}>RESOURCES</h4>
            <div className={styles.navAccent}></div>
            <Link href="/report" className={styles.navLink}>{icon.pencil}Report Update</Link>
            <Link href={`/report?issue=${encodeURIComponent(NOT_LISTED_ISSUE)}`} className={styles.navLink}>{icon.userPlus}Suggest Faculty</Link>
            <Link href="/about#faq" className={styles.navLink}>{icon.help}FAQs</Link>
            <Link href="/about#guidelines" className={styles.navLink}>{icon.book}Guidelines</Link>
            <Link href="/about" className={styles.navLink}>{icon.info}About CabinMUJ</Link>
          </div>

          {/* 4. For Admin */}
          <div className={styles.navColumn}>
            <h4 className={styles.navHeading}>FOR ADMIN</h4>
            <div className={styles.navAccent}></div>
            <Link href="/admin" className={styles.navLink}>{icon.shield}Admin Portal</Link>
            <Link href="/admin/faculty" className={styles.navLink}>{icon.people}Manage Faculty</Link>
            <Link href="/admin/requests" className={styles.navLink}>{icon.bell}Update Requests</Link>
            <Link href="/admin/history" className={styles.navLink}>{icon.clock}Change History</Link>
          </div>

          {/* 5. Quick Tip Card */}
          <div className={styles.quickTipCard}>
            <div className={styles.quickTipHeader}>
              <div className={styles.quickTipIconBox}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>
              </div>
              <span className={styles.quickTipTitle}>Quick Tip</span>
            </div>
            <p className={styles.quickTipText}>
              Search like you talk: try &ldquo;CSE HoD&rdquo;, &ldquo;AB2 305&rdquo; or a professor&apos;s first name.
            </p>

            {/* CSS Campus Illustration */}
            <div className={styles.illustrationContainer} aria-hidden>
              <div className={styles.glowOrb}></div>
              <div className={styles.dottedPath}></div>
              <div className={styles.basePlatform}></div>
              <div className={styles.buildingBody}></div>
              <div className={styles.buildingRoof}></div>
              <div className={`${styles.buildingWindow} ${styles.w1}`}></div>
              <div className={`${styles.buildingWindow} ${styles.w2}`}></div>
              <div className={`${styles.buildingWindow} ${styles.w3}`}></div>
              <div className={`${styles.buildingWindow} ${styles.w4}`}></div>
              <div className={`${styles.buildingWindow} ${styles.w5}`}></div>
              <div className={`${styles.buildingWindow} ${styles.w6}`}></div>
              <div className={styles.locationPin}></div>
            </div>
          </div>
        </div>

        {/* ─── STATISTICS BAR ─── */}
        <div className={styles.statsBar}>
          {[
            { value: totalFaculty, label: 'Faculty', svg: icon.people },
            { value: departments, label: 'Departments', svg: icon.building },
            { value: buildings, label: 'Campus Buildings', svg: icon.map },
            { value: hods, label: 'Heads of Department', svg: icon.shield },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <div className={styles.statDivider}></div>}
              <div className={styles.statItem}>
                <div className={styles.statIconContainer}>{s.svg}</div>
                <div className={styles.statData}>
                  <span className={styles.statValue}>{s.value.toLocaleString('en-IN')}</span>
                  <span className={styles.statLabel}>{s.label}</span>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* ─── BOTTOM BAR ─── */}
        <div className={styles.bottomBar}>
          <div className={styles.verifiedSection}>
            <div className={styles.verifiedIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            <div>
              <div className={styles.verifiedTitle}>Community Maintained</div>
              <div className={styles.verifiedSubtitle}>Updates from MUJians, reviewed by the CabinMUJ admin</div>
            </div>
          </div>

          <div className={styles.copyrightSection}>
            <div className={styles.copyrightText}>© {new Date().getFullYear()} CabinMUJ. All rights reserved.</div>
            <div className={styles.builtWith}>Built with <span>❤️</span> for MUJians.</div>
          </div>

          <div className={styles.legalSection}>
            <Link href="/report" className={styles.footerCta}>
              {icon.pencil}
              Report an update
            </Link>
          </div>
        </div>

        {/* ─── CREDIT ─── */}
        <div className={styles.madeBy}>
          Made by{' '}
          <a
            href="https://www.linkedin.com/in/akshatsharma-in"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.madeByLink}
            aria-label="Akshat Sharma on LinkedIn (opens in a new tab)"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
            Akshat Sharma
          </a>
        </div>

      </div>
    </footer>
  );
}
