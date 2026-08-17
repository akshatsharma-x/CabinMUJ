'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFaculty } from '@/lib/FacultyContext';
import { Faculty } from '@/lib/types';

export default function FacultyForm({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { facultyList, departmentsList, blocksList, addFaculty, updateFaculty } = useFaculty();
  const resolvedParams = use(params);
  const isAddMode = resolvedParams.id === 'add';

  const initialFacultyState: Faculty = {
    id: '',
    name: '',
    photo: '',
    department: '',
    designation: '',
    facultyCategory: 'Other Faculty',
    block: '',
    cabinNumber: '',
    floor: '',
    email: '',
    phone: '',
    isHOD: false,
    bio: '',
    qualifications: [],
    researchAreas: [],
    subjects: [],
    officeHours: [],
    status: 'Available',
    lastUpdated: ''
  };

  const [formData, setFormData] = useState<Faculty>(initialFacultyState);
  const [error, setError] = useState('');

  // Comma-separated temp states for arrays
  const [qualStr, setQualStr] = useState('');
  const [resStr, setResStr] = useState('');
  const [subStr, setSubStr] = useState('');

  useEffect(() => {
    if (!isAddMode) {
      const existing = facultyList.find(f => f.id === resolvedParams.id);
      if (existing) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData(existing);
        setQualStr(existing.qualifications.join(', '));
        setResStr(existing.researchAreas.join(', '));
        setSubStr(existing.subjects.join(', '));
      } else {
        setError('Faculty member not found.');
      }
    }
  }, [isAddMode, resolvedParams.id, facultyList]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Custom Validation as requested by prompt
    if (!formData.block) {
      setError('Block is mandatory for all faculty members.');
      return;
    }
    if (!formData.cabinNumber) {
      setError('Cabin Number is mandatory for all faculty members.');
      return;
    }

    const payload: Faculty = {
      ...formData,
      qualifications: qualStr.split(',').map(s => s.trim()).filter(Boolean),
      researchAreas: resStr.split(',').map(s => s.trim()).filter(Boolean),
      subjects: subStr.split(',').map(s => s.trim()).filter(Boolean),
    };

    if (isAddMode) {
      addFaculty({ ...payload, id: `fac-${Date.now()}` });
    } else {
      updateFaculty(payload.id, payload);
    }

    router.push('/admin/faculty');
  };

  if (error === 'Faculty member not found.') return <div className="p-8 text-center">{error}</div>;

  return (
    <div className="container max-w-4xl py-8 mb-16">
      <div className="flex items-center gap-2 text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
         <Link href="/admin">Admin</Link>
         <span>/</span>
         <Link href="/admin/faculty">Faculty</Link>
         <span>/</span>
         <span style={{ color: 'var(--text-primary)' }}>{isAddMode ? 'Add New' : 'Edit'}</span>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h1 className="h2 font-bold">{isAddMode ? 'Add New Faculty' : `Edit: ${formData.name}`}</h1>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md font-semibold">{error}</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        
        {/* Core Info */}
        <div className="card p-6 shadow-sm border-t-4 border-t-blue-500">
          <h3 className="h3 font-bold mb-4">Core Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Full Name *</label>
              <input required type="text" className="input bg-transparent border p-3 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Designation *</label>
              <input required type="text" className="input bg-transparent border p-3 rounded" value={formData.designation} onChange={e => setFormData({...formData, designation: e.target.value})} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Department *</label>
              <select required className="input bg-transparent border p-3 rounded" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
                <option value="">Select Department...</option>
                {departmentsList.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Category</label>
              <select className="input bg-transparent border p-3 rounded" value={formData.facultyCategory} onChange={e => setFormData({...formData, facultyCategory: e.target.value as Faculty['facultyCategory']})}>
                <option value="Professors">Professors</option>
                <option value="Associate Professors">Associate Professors</option>
                <option value="Assistant Professors">Assistant Professors</option>
                <option value="Other Faculty">Other Faculty</option>
              </select>
            </div>
            <div className="flex items-center gap-3 md:col-span-2 p-4 bg-orange-50 border border-orange-100 rounded">
              <input type="checkbox" id="isHOD" className="w-5 h-5 accent-muj-orange" checked={formData.isHOD} onChange={e => setFormData({...formData, isHOD: e.target.checked})} />
              <label htmlFor="isHOD" className="font-bold text-orange-900 cursor-pointer">This faculty member is a Head of Department (HOD)</label>
            </div>
          </div>
        </div>

        {/* Location - CRITICAL */}
        <div className="card p-6 shadow-sm border-t-4 border-t-muj-orange">
          <div className="mb-4">
            <h3 className="h3 font-bold">Location Editor</h3>
            <p className="text-sm text-gray-500">Block and Cabin are mandatory for the CabinMUJ product to function correctly.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Block *</label>
              <select required className="input bg-transparent border p-3 rounded" value={formData.block} onChange={e => setFormData({...formData, block: e.target.value})}>
                <option value="">Select Block...</option>
                {blocksList.map(b => <option key={b.id} value={b.shortName}>{b.shortName}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Floor</label>
              <input type="text" className="input bg-transparent border p-3 rounded" placeholder="e.g. 3rd Floor" value={formData.floor} onChange={e => setFormData({...formData, floor: e.target.value})} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-muj-orange">Cabin Number *</label>
              <input required type="text" className="input" placeholder="e.g. 305" value={formData.cabinNumber} onChange={e => setFormData({...formData, cabinNumber: e.target.value})} style={{ borderColor: 'var(--muj-orange)' }} />
            </div>
          </div>
        </div>

        {/* Contact & Bio */}
        <div className="card p-6 shadow-sm border-t-4 border-t-gray-300">
          <h3 className="h3 font-bold mb-4">Contact & Biography</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Email</label>
              <input type="email" className="input bg-transparent border p-3 rounded" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Phone</label>
              <input type="text" className="input bg-transparent border p-3 rounded" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-semibold">Biography</label>
              <textarea className="input" style={{ height: '8rem' }} value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-semibold">Photo URL</label>
              <input type="text" className="input bg-transparent border p-3 rounded" placeholder="https://..." value={formData.photo} onChange={e => setFormData({...formData, photo: e.target.value})} />
            </div>
          </div>
        </div>

        {/* Academic Details (Arrays) */}
        <div className="card p-6 shadow-sm border-t-4 border-t-green-500 mb-8">
          <h3 className="h3 font-bold mb-4">Academic Details (Comma separated)</h3>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Qualifications</label>
              <input type="text" className="input bg-transparent border p-3 rounded" placeholder="Ph.D., M.Tech., B.Tech." value={qualStr} onChange={e => setQualStr(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Research Areas</label>
              <input type="text" className="input bg-transparent border p-3 rounded" placeholder="Machine Learning, IoT" value={resStr} onChange={e => setResStr(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Subjects Taught</label>
              <input type="text" className="input bg-transparent border p-3 rounded" placeholder="Data Structures, Algorithms" value={subStr} onChange={e => setSubStr(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 border-t pt-6" style={{ borderColor: 'var(--border-color)' }}>
           <button type="button" onClick={() => router.push('/admin/faculty')} className="btn btn-secondary px-6 py-3">Cancel</button>
           <button type="submit" className="btn btn-primary px-8 py-3">{isAddMode ? 'Save New Faculty' : 'Save Changes'}</button>
        </div>

      </form>
    </div>
  );
}
