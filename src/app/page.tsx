'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { HeroSearch } from '@/components/home/HeroSearch';
import { FeatureSection } from '@/components/home/FeatureSection';

export default function Home() {
  const router = useRouter();

  return (
    <AppShell>
      {/* Hero Section */}
      <section style={{ padding: '6rem 0', background: 'var(--bg-surface)' }}>
        <div className="container max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Content */}
            <div className="flex flex-col items-start text-left">
              <div style={{
                background: 'var(--muj-orange-light)',
                color: 'var(--muj-orange)',
                padding: '0.375rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.625rem',
                fontWeight: 800,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: '1.5rem'
              }}>
                MANIPAL UNIVERSITY JAIPUR SMART ASSISTANT
              </div>
              
              <h1 className="font-extrabold leading-tight mb-4 text-[#1F2937]" style={{ fontSize: '4rem', letterSpacing: '-0.02em' }}>
                Find Any Faculty<br />at MUJ in <span style={{ color: 'var(--muj-orange)' }}>Seconds</span>
              </h1>
              
              <p className="text-gray-600 mb-8 leading-relaxed" style={{ fontSize: '1.125rem', maxWidth: '480px' }}>
                Search faculty members, locate cabins, discover departments, and stay updated — all in one place. No more lost corridors or guessing cabin blocks.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link href="/faculty" className="btn font-bold transition-transform hover:scale-105" style={{ 
                  background: 'var(--muj-orange)', color: 'white', padding: '0.875rem 1.75rem', borderRadius: '8px',
                  boxShadow: '0 4px 14px rgba(232, 97, 45, 0.3)'
                }}>
                  Search Faculty
                </Link>
                <Link href="/departments" className="btn font-bold transition-colors hover:bg-gray-50" style={{ 
                  background: 'white', color: '#1F2937', padding: '0.875rem 1.75rem', borderRadius: '8px',
                  border: '2px solid #1F2937'
                }}>
                  Explore Departments
                </Link>
              </div>
            </div>

            {/* Right Graphic */}
            <div className="relative w-full h-[500px] rounded-3xl flex items-center justify-center animate-fade-in" style={{ background: '#FAFAFA' }}>
              <img src="/campus-building.png" alt="Campus Building" style={{ width: '80%', height: 'auto', objectFit: 'contain' }} />
              
              {/* Flying Birds over the dome */}
              <div className="bird-container bird-1">
                <svg className="bird-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s4-4 10-2c6-2 10 2 10 2" />
                </svg>
              </div>
              <div className="bird-container bird-2">
                <svg className="bird-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s4-4 10-2c6-2 10 2 10 2" />
                </svg>
              </div>
              <div className="bird-container bird-3">
                <svg className="bird-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s4-4 10-2c6-2 10 2 10 2" />
                </svg>
              </div>

              {/* Floating Avatars (Mockup like screenshot) */}
              <div className="absolute animate-float-card" style={{ zIndex: 30, top: '15%', left: '10%', background: 'white', padding: '0.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>👨‍🏫</div>
                <div>
                  <p className="text-[10px] font-bold text-gray-800">Dr. Arjun Singh</p>
                  <p className="text-[8px] font-bold text-gray-500 flex items-center gap-1"><span style={{color: 'var(--muj-orange)'}}>📍</span> AB2-305 (CS)</p>
                </div>
                <div className="animate-pulse-ring" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', marginLeft: '4px' }}></div>
              </div>

              <div className="absolute animate-float-card float-delay-1" style={{ zIndex: 30, bottom: '25%', left: '15%', background: 'white', padding: '0.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>👨‍🦳</div>
                <div>
                  <p className="text-[10px] font-bold text-gray-800">Dr. VK Kapoor</p>
                  <p className="text-[8px] font-bold text-gray-500 flex items-center gap-1"><span style={{color: 'var(--muj-orange)'}}>📍</span> FOM-210</p>
                </div>
                <div className="animate-pulse-ring" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', marginLeft: '4px' }}></div>
              </div>

              <div className="absolute animate-float-card float-delay-2" style={{ zIndex: 30, top: '40%', right: '5%', background: 'white', padding: '0.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>👩‍🏫</div>
                <div>
                  <p className="text-[10px] font-bold text-gray-800">Dr. Priya Sharma</p>
                  <p className="text-[8px] font-bold text-gray-500 flex items-center gap-1"><span style={{color: 'var(--muj-orange)'}}>📍</span> AB1-102 (ECE)</p>
                </div>
                <div className="animate-pulse-ring" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', marginLeft: '4px' }}></div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Big Search Section */}
      <section style={{ position: 'relative', overflow: 'hidden', width: '100%', display: 'flex', justifyContent: 'center', padding: '5rem 0 8rem', background: 'linear-gradient(180deg, #FAFAFA 0%, #F3F4F6 100%)' }}>
        <div style={{ width: '100%', position: 'relative', zIndex: 10, padding: '0 1rem' }}>
          <HeroSearch />
        </div>
      </section>

      <FeatureSection />
    </AppShell>
  );
}
