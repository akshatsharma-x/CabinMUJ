'use client';

import React, { useState } from 'react';
import styles from './FeatureSection.module.css';

export const FeatureSection = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  // No default active card. Only active when hovered.
  const activeIndex = hoveredCard;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        
        {/* Header Badge */}
        <div className={styles.badge}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
          BUILT FOR MUJIANS
        </div>

        {/* Main Heading */}
        <h2 className={styles.title}>
          Engineered for Seamless <br />
          <span className={styles.titleOrange}>Campus Discovery</span>
        </h2>

        {/* Description */}
        <p className={styles.description}>
          Level up your university navigation experience with high fidelity tools crafted for Manipal University students.
        </p>

        {/* Cards Grid */}
        <div className={styles.grid}>
          
          {/* 1. Faculty Finder Card */}
          <div 
            className={`${styles.card} ${activeIndex === 0 ? styles.cardActive : ''}`}
            onMouseEnter={() => setHoveredCard(0)}
            onMouseLeave={() => setHoveredCard(null)}
            onFocus={() => setHoveredCard(0)}
            onBlur={() => setHoveredCard(null)}
            tabIndex={0}
            style={{ animationDelay: '0.1s' }}
          >
            <div className={styles.cardHeader}>
              <div className={styles.iconBox}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                </svg>
              </div>
              <span className={styles.cardNumber}>01</span>
            </div>
            
            <h3 className={styles.cardTitle}>Faculty Finder</h3>
            <p className={styles.cardDescription}>
              Instant search across 500+ educators with smart fuzzy logic. Find contact, research, and schedule profiles in a click.
            </p>
            
            <button aria-label="Explore Faculty Finder" className={styles.actionBtn}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </button>

            {/* Decorative Graphic 1 */}
            <div className={styles.graphic}>
              <div className={styles.searchGlow}></div>
              <div className={styles.ring1}></div>
              <div className={styles.ring2}></div>
              <div className={styles.ring3}></div>
            </div>
          </div>

          {/* 2. Campus Navigator Card */}
          <div 
            className={`${styles.card} ${activeIndex === 1 ? styles.cardActive : ''}`}
            onMouseEnter={() => setHoveredCard(1)}
            onMouseLeave={() => setHoveredCard(null)}
            onFocus={() => setHoveredCard(1)}
            onBlur={() => setHoveredCard(null)}
            tabIndex={0}
            style={{ animationDelay: '0.17s' }}
          >
            <div className={styles.cardHeader}>
              <div className={styles.iconBox}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <span className={styles.cardNumber}>02</span>
            </div>
            
            <h3 className={styles.cardTitle}>Campus Navigator</h3>
            <p className={styles.cardDescription}>
              Detailed indoor routing diagrams and block directions to any faculty cabin. Map out exactly how to reach Academic Block 2, Floor 3.
            </p>
            
            <button aria-label="Explore Campus Navigator" className={styles.actionBtn}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </button>

            {/* Decorative Graphic 2 */}
            <div className={styles.graphic}>
              <div className={styles.mapGrid}></div>
              <div className={styles.routeLine}></div>
              <div className={styles.mapPin}></div>
            </div>
          </div>

          {/* 3. Live Status Card */}
          <div 
            className={`${styles.card} ${activeIndex === 2 ? styles.cardActive : ''}`}
            onMouseEnter={() => setHoveredCard(2)}
            onMouseLeave={() => setHoveredCard(null)}
            onFocus={() => setHoveredCard(2)}
            onBlur={() => setHoveredCard(null)}
            tabIndex={0}
            style={{ animationDelay: '0.24s' }}
          >
            <div className={styles.cardHeader}>
              <div className={styles.iconBox}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <span className={styles.cardNumber}>03</span>
            </div>
            
            <h3 className={styles.cardTitle}>Live Status</h3>
            <p className={styles.cardDescription}>
              Know when professors are in class, holding office hours, or available for consultation before taking the walk.
            </p>
            
            <button aria-label="Explore Live Status" className={styles.actionBtn}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
              </svg>
            </button>

            {/* Decorative Graphic 3 */}
            <div className={styles.graphic}>
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
          </div>

        </div>
      </div>
    </section>
  );
};
