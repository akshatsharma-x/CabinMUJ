'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { HeroSearch } from '@/components/home/HeroSearch';

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

      {/* Features Section */}
      <section style={{ padding: '6rem 0', background: 'var(--bg-surface)', borderTop: '1px solid var(--border-light)' }}>
        <div className="container max-w-[1200px] mx-auto text-center px-4">
          <h2 className="font-extrabold text-[#1F2937] mb-3" style={{ fontSize: '2.5rem', letterSpacing: '-0.02em' }}>
            Engineered for Seamless Campus Discovery
          </h2>
          <p className="text-gray-500 mb-12 mx-auto" style={{ fontSize: '1.125rem', maxWidth: '600px' }}>
            Level up your university navigation experience with high fidelity tools crafted for Manipal University students.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 hover-lift" style={{ border: '2px solid var(--muj-orange-light)', boxShadow: '0 10px 30px rgba(232, 97, 45, 0.05)' }}>
              <div className="mb-6 flex items-center justify-center" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--muj-orange-light)', color: 'var(--muj-orange)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
              <h3 className="font-bold text-[#1F2937] mb-3" style={{ fontSize: '1.25rem' }}>Faculty Finder</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Instant search across 500+ educators with smart fuzzy logic. Find contact, research, and schedule profiles in a click.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 hover-lift" style={{ border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
              <div className="mb-6 flex items-center justify-center" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--muj-orange-light)', color: 'var(--muj-orange)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              </div>
              <h3 className="font-bold text-[#1F2937] mb-3" style={{ fontSize: '1.25rem' }}>Campus Navigator</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Detailed indoor routing diagrams and block directions to any faculty cabin. Map out exactly how to reach Academic Block 2, Floor 3.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 hover-lift" style={{ border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
              <div className="mb-6 flex items-center justify-center" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--muj-orange-light)', color: 'var(--muj-orange)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </div>
              <h3 className="font-bold text-[#1F2937] mb-3" style={{ fontSize: '1.25rem' }}>Live Status</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Know when professors are in class, holding office hours, or available for consultation before taking the walk.
              </p>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
