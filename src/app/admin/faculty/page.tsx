'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useFaculty } from '@/lib/FacultyContext';

export default function AdminFacultyList() {
  const { facultyList, deleteFaculty } = useFaculty();
  const [search, setSearch] = useState('');

  const filtered = facultyList.filter(f => f.name.toLowerCase().includes(search.toLowerCase()) || f.department.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      deleteFaculty(id);
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-4 text-sm font-semibold text-gray-500 flex items-center gap-2">
         <Link href="/admin" className="hover:text-muj-orange">Admin Dashboard</Link>
         <span>/</span>
         <span>Faculty Management</span>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="h2 font-bold">Faculty Management</h1>
        <Link href="/admin/faculty/add" className="btn btn-primary">
          + Add New Faculty
        </Link>
      </div>

      <div className="card p-6">
        <div className="mb-6">
          <input 
            type="text" 
            placeholder="Search faculty by name or department..." 
            className="input p-3 border rounded w-full max-w-md bg-gray-50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-sm text-gray-500 tracking-wider">
                <th className="pb-3 px-4 font-semibold uppercase">Name</th>
                <th className="pb-3 px-4 font-semibold uppercase">Department</th>
                <th className="pb-3 px-4 font-semibold uppercase">Location</th>
                <th className="pb-3 px-4 font-semibold uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(faculty => (
                <tr key={faculty.id} className="border-b hover-bg-subtle transition-colors">
                  <td className="py-4 px-4 font-medium">
                    {faculty.name} {faculty.isHOD && <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">HOD</span>}
                  </td>
                  <td className="py-4 px-4 text-gray-600">{faculty.department}</td>
                  <td className="py-4 px-4">
                    {faculty.block && faculty.cabinNumber ? (
                      <span className="font-semibold text-muj-orange">{faculty.block} - {faculty.cabinNumber}</span>
                    ) : (
                      <span className="text-gray-400 italic">Not set</span>
                    )}
                  </td>
                  <td className="py-4 px-4 flex justify-end gap-3">
                    <Link href={`/admin/faculty/${faculty.id}`} className="text-blue-600 hover:underline font-semibold text-sm">
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(faculty.id, faculty.name)} className="text-red-600 hover:underline font-semibold text-sm">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">No faculty found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
