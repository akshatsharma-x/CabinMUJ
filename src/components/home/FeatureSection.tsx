'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './FeatureSection.module.css';

const ArrowIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
);

export const FeatureSection = ({ facultyCount }: { facultyCount: number }) => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const cardProps = (index: number, delay: string) => ({
    className: `${styles.card} ${hoveredCard === index ? styles.cardActive : ''}`,
    onMouseEnter: () => setHoveredCard(index),
    onMouseLeave: () => setHoveredCard(null),
    onFocus: () => setHoveredCard(index),
    onBlur: () => setHoveredCard(null),
    style: { animationDelay: delay },
  });

  // Round down to a friendly "800+" style number.
  const roundedCount = facultyCount >= 100 ? `${Math.floor(facultyCount / 100) * 100}+` : String(facultyCount);

  return (
    <section className={styles.section}>
      <div className={styles.container}>

        {/* Header Badge */}
        <div className={styles.badge}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
          BUILT FOR MUJIANS
        </div>

        <h2 className={styles.title}>
          Engineered for Seamless <br />
          <span className={styles.titleOrange}>Campus Discovery</span>
        </h2>

        <p className={styles.description}>
          Everything you need to find the right faculty member — and their cabin — before you start walking.
        </p>

        <div className={styles.grid}>

          {/* 1. Faculty Finder */}
          <Link href="/faculty" {...cardProps(0, '0.1s')}>
            <div className={styles.cardHeader}>
              <div className={styles.iconBox}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
              </div>
              <span className={styles.cardNumber}>01</span>
            </div>
            <h3 className={styles.cardTitle}>Faculty Finder</h3>
            <p className={styles.cardDescription}>
              Search {roundedCount} faculty members by name, department, block or cabin — results appear as you type.
            </p>
            <span className={styles.actionBtn} aria-hidden><ArrowIcon /></span>
            <div className={styles.graphic} aria-hidden>
              <div className={styles.searchGlow}></div>
              <div className={styles.ring1}></div>
              <div className={styles.ring2}></div>
              <div className={styles.ring3}></div>
            </div>
          </Link>

          {/* 2. Campus Navigator */}
          <Link href="/blocks" {...cardProps(1, '0.17s')}>
            <div className={styles.cardHeader}>
              <div className={styles.iconBox}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <span className={styles.cardNumber}>02</span>
            </div>
            <h3 className={styles.cardTitle}>Campus Navigator</h3>
            <p className={styles.cardDescription}>
              Browse every block and floor to see who sits where, then head straight to the right cabin.
            </p>
            <span className={styles.actionBtn} aria-hidden><ArrowIcon /></span>
            <div className={styles.graphic} aria-hidden>
              <div className={styles.mapGrid}></div>
              <div className={styles.routeLine}></div>
              <div className={styles.mapPin}></div>
            </div>
          </Link>

          {/* 3. Always up to date */}
          <Link href="/report" {...cardProps(2, '0.24s')}>
            <div className={styles.cardHeader}>
              <div className={styles.iconBox}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <span className={styles.cardNumber}>03</span>
            </div>
            <h3 className={styles.cardTitle}>Always Up to Date</h3>
            <p className={styles.cardDescription}>
              Cabin moved? Report it in one click or by email — the admin team verifies changes so the directory stays accurate.
            </p>
            <span className={styles.actionBtn} aria-hidden><ArrowIcon /></span>
            <div className={styles.graphic} aria-hidden>
              <div className={styles.radarPulse1}></div>
              <div className={styles.radarPulse2}></div>
              <div className={styles.radarCenter}></div>
              <div className={styles.userNode1}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div className={styles.userNode2}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div className={styles.userNode3}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
            </div>
          </Link>

        </div>
      </div>
    </section>
  );
};
