'use client';

import React from 'react';
import Link from 'next/link';
import { mockFaculty } from '@/lib/mock-data';
import styles from './Footer.module.css';

export const Footer = () => {
  // Compute real dynamic statistics
  const totalFaculty = mockFaculty.length;
  const uniqueDepartments = Array.from(new Set(mockFaculty.map(f => f.department).filter(Boolean))).length;
  const uniqueBuildings = Array.from(new Set(mockFaculty.map(f => f.block).filter(Boolean))).length;
  const dailySearches = "2,450+"; // Configurable placeholder for analytics

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        
        {/* ─── TOP GRID ─── */}
        <div className={styles.topGrid}>
          
          {/* 1. Brand & Contact */}
          <div>
            <div className={styles.brandHeader}>
              <div className={styles.brandLogo}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
              <h4 className={styles.contactTitle}>Let's Connect</h4>
              <p className={styles.contactSubtitle}>Have an update or suggestion?</p>
              
              <a href="mailto:contact@cabinmuj.com" className={styles.contactLink}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                contact@cabinmuj.com
              </a>
              <a href="tel:+911234567890" className={styles.contactLink}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                +91 12345 67890
              </a>
              
              <div className={styles.socialRow}>
                <a href="#" aria-label="Instagram" className={styles.socialBtn}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
                <a href="#" aria-label="LinkedIn" className={styles.socialBtn}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
                <a href="#" aria-label="Twitter" className={styles.socialBtn}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                </a>
                <a href="#" aria-label="GitHub" className={styles.socialBtn}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                </a>
              </div>
            </div>
          </div>

          {/* 2. Platform */}
          <div className={styles.navColumn}>
            <h4 className={styles.navHeading}>PLATFORM</h4>
            <div className={styles.navAccent}></div>
            <Link href="/faculty" className={styles.navLink}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Faculty Directory
            </Link>
            <Link href="/departments" className={styles.navLink}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M3 7v1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1h-18l2-4h14l2 4"/><line x1="5" y1="21" x2="5" y2="10"/><line x1="19" y1="21" x2="19" y2="10"/><path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"/></svg>
              Departments
            </Link>
            <Link href="/blocks" className={styles.navLink}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>
              Campus Map
            </Link>
            <Link href="/blocks" className={styles.navLink}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
              Blocks & Buildings
            </Link>
            <Link href="/" className={styles.navLink}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              Search Faculty
            </Link>
          </div>

          {/* 3. Resources */}
          <div className={styles.navColumn}>
            <h4 className={styles.navHeading}>RESOURCES</h4>
            <div className={styles.navAccent}></div>
            <Link href="/report" className={styles.navLink}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
              Report Update
            </Link>
            <Link href="/report" className={styles.navLink}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
              Suggest Faculty
            </Link>
            <Link href="/" className={styles.navLink}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
              FAQs
            </Link>
            <Link href="/" className={styles.navLink}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
              Guidelines
            </Link>
            <Link href="/" className={styles.navLink}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
              Release Notes
            </Link>
          </div>

          {/* 4. For Admin & Quick Tip */}
          <div className={styles.navColumn}>
            <h4 className={styles.navHeading}>FOR ADMIN</h4>
            <div className={styles.navAccent}></div>
            <Link href="/admin" className={styles.navLink}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Admin Portal
            </Link>
            <Link href="/admin/dashboard" className={styles.navLink}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
              Dashboard
            </Link>
            <Link href="/admin/faculty" className={styles.navLink}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Manage Faculty
            </Link>
            <Link href="/admin/reports" className={styles.navLink}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
              Update Requests
            </Link>
            <Link href="/admin/analytics" className={styles.navLink}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>
              Analytics
            </Link>

          </div>

          {/* 5. Quick Tip Card */}
          <div className={styles.quickTipCard}>
            <div className={styles.quickTipHeader}>
              <div className={styles.quickTipIconBox}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/></svg>
              </div>
              <span className={styles.quickTipTitle}>Quick Tip</span>
            </div>
            <p className={styles.quickTipText}>
              Use search filters to find faculty by block, cabin, department or designation in seconds.
            </p>
            
            {/* Complex CSS Campus Illustration */}
            <div className={styles.illustrationContainer}>
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
          
          <div className={styles.statItem}>
            <div className={styles.statIconContainer}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div className={styles.statData}>
              <span className={styles.statValue}>{totalFaculty}+</span>
              <span className={styles.statLabel}>Faculty</span>
            </div>
          </div>

          <div className={styles.statDivider}></div>

          <div className={styles.statItem}>
            <div className={styles.statIconContainer}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M3 7v1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1h-18l2-4h14l2 4"/><line x1="5" y1="21" x2="5" y2="10"/><line x1="19" y1="21" x2="19" y2="10"/><path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"/></svg>
            </div>
            <div className={styles.statData}>
              <span className={styles.statValue}>{uniqueDepartments}</span>
              <span className={styles.statLabel}>Departments</span>
            </div>
          </div>

          <div className={styles.statDivider}></div>

          <div className={styles.statItem}>
            <div className={styles.statIconContainer}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>
            </div>
            <div className={styles.statData}>
              <span className={styles.statValue}>{uniqueBuildings}</span>
              <span className={styles.statLabel}>Campus Buildings</span>
            </div>
          </div>

          <div className={styles.statDivider}></div>

          <div className={styles.statItem}>
            <div className={styles.statIconContainer}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <div className={styles.statData}>
              <span className={styles.statValue}>{dailySearches}</span>
              <span className={styles.statLabel}>Daily Searches</span>
            </div>
          </div>

        </div>

        {/* ─── BOTTOM BAR ─── */}
        <div className={styles.bottomBar}>
          
          <div className={styles.verifiedSection}>
            <div className={styles.verifiedIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            <div>
              <div className={styles.verifiedTitle}>Community Verified</div>
              <div className={styles.verifiedSubtitle}>Information verified by MUJ community</div>
            </div>
          </div>

          <div className={styles.copyrightSection}>
            <div className={styles.copyrightText}>© {new Date().getFullYear()} CabinMUJ. All rights reserved.</div>
            <div className={styles.builtWith}>Built with <span>❤️</span> for MUJians.</div>
          </div>

          <div className={styles.legalSection}>
            <div className={styles.legalLinks}>
              <Link href="/privacy" className={styles.legalLink}>Privacy Policy</Link>
              <span className={styles.legalDot}>•</span>
              <Link href="/terms" className={styles.legalLink}>Terms of Use</Link>
            </div>
            <button aria-label="Toggle Dark Mode" className={styles.darkModeBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              Dark Mode
            </button>
          </div>

        </div>

      </div>
    </footer>
  );
};
