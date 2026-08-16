import { AppShell } from '@/components/layout/AppShell';
import { mockFaculty } from '@/lib/mock-data';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default async function FacultyProfile({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const facultyId = resolvedParams.id;
  // For demo, just use the first faculty member if ID not found, to simulate dynamic page
  const faculty = mockFaculty.find(f => f.id === facultyId) || mockFaculty[0];

  return (
    <AppShell>
      <div className="container">
        <div className="card p-6 flex flex-col md:flex-row justify-between mb-8" style={{ gap: '2rem' }}>
           <div className="flex gap-6 items-center">
             <div className="overflow-hidden rounded-full" style={{ width: '120px', height: '120px', flexShrink: 0 }}>
               <img src={faculty.photo} alt={faculty.name} className="w-full h-full" style={{ objectFit: 'cover' }} />
             </div>
             <div>
               <h1 className="h2 font-bold mb-2">{faculty.name}</h1>
               <p className="text-gray-500 mb-2">{faculty.designation}</p>
               <div className="flex gap-2">
                 <Badge variant="orange">{faculty.department}</Badge>
                 <Badge>{faculty.block}</Badge>
               </div>
             </div>
           </div>
           
           <div className="flex items-center gap-4">
             <Button variant="secondary">Share</Button>
             <Button variant="primary">Copy Email Address</Button>
           </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
           <div className="flex flex-col gap-8">
             <div className="card p-6">
                <h3 className="h3 font-bold mb-4">Qualifications & Research</h3>
                <p className="mb-4 text-sm text-gray-500">{faculty.qualifications.join(' • ')}</p>
                <div className="mb-4">
                  <span className="font-semibold text-sm mr-2" style={{ color: 'var(--text-secondary)' }}>RESEARCH AREAS</span>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {faculty.researchAreas.map((area, i) => <Badge key={i}>{area}</Badge>)}
                  </div>
                </div>
                <div>
                  <span className="font-semibold text-sm mr-2" style={{ color: 'var(--text-secondary)' }}>SUBJECTS TAUGHT</span>
                  <p className="text-sm mt-2">{faculty.subjects.join(', ')}</p>
                </div>
             </div>

             <div className="card p-6">
                <h3 className="h3 font-bold mb-4">Office Hours & Availability</h3>
                <div className="flex flex-col gap-2">
                  {faculty.officeHours.map((hours, i) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                      <span className="font-semibold text-sm">{hours.split(' ')[0]}</span>
                      <Badge variant="orange">{hours.replace(hours.split(' ')[0], '').trim()}</Badge>
                    </div>
                  ))}
                </div>
             </div>
           </div>

           <div>
             {/* CRITICAL FEATURE: CABIN LOCATION EMPHASIS */}
             <div className="card p-6 flex flex-col items-center text-center" style={{ border: '2px solid var(--muj-orange)' }}>
                <h3 className="font-bold text-gray-500 text-sm mb-6" style={{ letterSpacing: '0.05em' }}>CABIN LOCATION</h3>
                
                <span className="text-gray-500 font-semibold mb-2">{faculty.block}</span>
                <span className="font-bold" style={{ fontSize: '3.5rem', lineHeight: '1', color: 'var(--muj-orange)', marginBottom: '1rem' }}>
                  {faculty.cabinNumber}
                </span>
                <span className="text-gray-500 text-sm font-medium mb-8">{faculty.floor}</span>
                
                <div style={{ width: '100%', height: '150px', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="text-gray-400 text-sm">Map Visualization Area</span>
                </div>
                
                <Button variant="primary" className="w-full" style={{ padding: '1rem' }}>
                  Directions to Cabin
                </Button>
             </div>
           </div>
        </div>
      </div>
    </AppShell>
  );
}
