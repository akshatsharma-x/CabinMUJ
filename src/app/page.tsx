import Link from 'next/link';
import Image from 'next/image';
import { HeroSearch } from '@/components/home/HeroSearch';
import { FeatureSection } from '@/components/home/FeatureSection';
import { filterOptions, toSummary } from '@/lib/faculty-utils';
import { getFacultyList } from '@/lib/server/data';
import campusBuilding from '../../public/campus-building.png';

const floatingCard: React.CSSProperties = {
  zIndex: 30, background: 'white', padding: '0.5rem', borderRadius: '12px', display: 'flex',
  alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
};
const floatingAvatar: React.CSSProperties = {
  width: '28px', height: '28px', borderRadius: '50%', background: '#E5E7EB', display: 'flex',
  alignItems: 'center', justifyContent: 'center', fontSize: '10px',
};
const liveDot: React.CSSProperties = { width: '6px', height: '6px', borderRadius: '50%', background: '#10B981', marginLeft: '4px' };

export default async function Home() {
  const faculty = await getFacultyList();
  // Photos aren't needed for search suggestions; leaving them out keeps the page lighter.
  const searchable = faculty.map(f => ({ ...toSummary(f), photo: undefined }));

  return (
    <>
      {/* Hero Section */}
      <section style={{ padding: 'clamp(3rem, 8vw, 6rem) 0', background: 'var(--bg-surface)' }}>
        <div className="container" style={{ maxWidth: '1200px' }}>
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

              <h1 className="font-extrabold leading-tight mb-4" style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', letterSpacing: '-0.02em', color: '#1F2937' }}>
                Find Any Faculty<br />at MUJ in <span style={{ color: 'var(--muj-orange)' }}>Seconds</span>
              </h1>

              <p className="mb-8 leading-relaxed" style={{ fontSize: '1.125rem', maxWidth: '480px', color: '#4B5563' }}>
                Search faculty members, locate cabins, discover departments, and stay updated — all in one place. No more lost corridors or guessing cabin blocks.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link href="/faculty" className="btn font-bold" style={{
                  background: 'var(--muj-orange)', color: 'white', padding: '0.875rem 1.75rem', borderRadius: '8px',
                  boxShadow: '0 4px 14px rgba(232, 97, 45, 0.3)'
                }}>
                  Search Faculty
                </Link>
                <Link href="/departments" className="btn btn-secondary font-bold" style={{
                  color: '#1F2937', padding: '0.875rem 1.75rem', borderRadius: '8px',
                  border: '2px solid #1F2937'
                }}>
                  Explore Departments
                </Link>
              </div>
            </div>

            {/* Right Graphic */}
            <div className="relative w-full flex items-center justify-center animate-fade-in" style={{ background: '#FAFAFA', height: 'clamp(320px, 42vw, 500px)', borderRadius: '24px', overflow: 'hidden' }}>
              <Image
                src={campusBuilding}
                alt="Illustration of a campus building"
                preload
                sizes="(min-width: 1024px) 470px, 80vw"
                style={{ width: '80%', height: 'auto', maxHeight: '100%', objectFit: 'contain' }}
              />

              {/* Flying Birds over the dome */}
              <div className="bird-container bird-1" aria-hidden>
                <svg className="bird-svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s4-4 10-2c6-2 10 2 10 2" />
                </svg>
              </div>
              <div className="bird-container bird-2" aria-hidden>
                <svg className="bird-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s4-4 10-2c6-2 10 2 10 2" />
                </svg>
              </div>
              <div className="bird-container bird-3" aria-hidden>
                <svg className="bird-svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s4-4 10-2c6-2 10 2 10 2" />
                </svg>
              </div>

              {/* Decorative floating cards */}
              <div aria-hidden className="absolute animate-float-card" style={{ ...floatingCard, top: '15%', left: '10%' }}>
                <div style={floatingAvatar}>👨‍🏫</div>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: '#1F2937' }}>Dr. Arjun Singh</p>
                  <p className="flex items-center gap-1" style={{ fontSize: '8px', fontWeight: 700, color: '#6B7280' }}><span style={{ color: 'var(--muj-orange)' }}>📍</span> AB2-305 (CS)</p>
                </div>
                <div className="animate-pulse-ring" style={liveDot}></div>
              </div>

              <div aria-hidden className="absolute animate-float-card float-delay-1" style={{ ...floatingCard, bottom: '25%', left: '15%' }}>
                <div style={floatingAvatar}>👨‍🦳</div>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: '#1F2937' }}>Dr. VK Kapoor</p>
                  <p className="flex items-center gap-1" style={{ fontSize: '8px', fontWeight: 700, color: '#6B7280' }}><span style={{ color: 'var(--muj-orange)' }}>📍</span> FOM-210</p>
                </div>
                <div className="animate-pulse-ring" style={liveDot}></div>
              </div>

              <div aria-hidden className="absolute animate-float-card float-delay-2" style={{ ...floatingCard, top: '40%', right: '5%' }}>
                <div style={floatingAvatar}>👩‍🏫</div>
                <div>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: '#1F2937' }}>Dr. Priya Sharma</p>
                  <p className="flex items-center gap-1" style={{ fontSize: '8px', fontWeight: 700, color: '#6B7280' }}><span style={{ color: 'var(--muj-orange)' }}>📍</span> AB1-102 (ECE)</p>
                </div>
                <div className="animate-pulse-ring" style={liveDot}></div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Big Search Section */}
      <section style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', padding: '5rem 0 8rem', background: 'linear-gradient(180deg, #FAFAFA 0%, #F3F4F6 100%)' }}>
        <div style={{ width: '100%', position: 'relative', zIndex: 10, padding: '0 1rem' }}>
          <HeroSearch faculty={searchable} options={filterOptions(faculty)} />
        </div>
      </section>

      <FeatureSection facultyCount={faculty.length} />
    </>
  );
}
