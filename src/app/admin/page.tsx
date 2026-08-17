'use client';

import React from 'react';
import Link from 'next/link';
import { useFaculty } from '@/lib/FacultyContext';

export default function AdminDashboard() {
  const { facultyList, departmentsList, updateRequests, updateHistory } = useFaculty();

  const pendingUpdates = updateRequests.filter(req => req.status === 'Pending');

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="h2 font-bold">Admin Dashboard</h1>
          <p className="text-gray-500">Manage faculty data and review student update reports.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6 border-l-4" style={{ borderColor: 'var(--muj-orange)' }}>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Total Faculty</h3>
          <span className="text-4xl font-bold">{facultyList.length}</span>
        </div>
        <div className="card p-6 border-l-4 border-blue-500">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Departments</h3>
          <span className="text-4xl font-bold">{departmentsList.length}</span>
        </div>
        <div className="card p-6 border-l-4 border-yellow-500 bg-yellow-50">
          <h3 className="text-sm font-semibold text-yellow-700 uppercase tracking-wider mb-2">Pending Updates</h3>
          <span className="text-4xl font-bold text-yellow-700">{pendingUpdates.length}</span>
        </div>
        <div className="card p-6 border-l-4 border-green-500">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Recent Changes</h3>
          <span className="text-4xl font-bold">{updateHistory.length}</span>
        </div>
      </div>

      {/* Admin Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Quick Links */}
        <div className="card p-6">
          <h3 className="h3 font-bold mb-4">Management Areas</h3>
          <div className="flex flex-col gap-3">
            <Link href="/admin/faculty" className="p-4 bg-gray-50 hover:bg-gray-100 rounded border flex justify-between items-center">
              <div>
                <span className="font-bold block text-lg">👨‍🏫 Faculty Directory</span>
                <span className="text-sm text-gray-500">Add, edit, or remove faculty members.</span>
              </div>
              <span className="text-xl">→</span>
            </Link>
            
            <Link href="/admin/updates" className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded border border-yellow-200 flex justify-between items-center relative">
              <div>
                <span className="font-bold block text-lg text-yellow-800">📋 Update Requests</span>
                <span className="text-sm text-yellow-700">Review and approve changes reported by students.</span>
              </div>
              {pendingUpdates.length > 0 && (
                <span className="bg-red-500 text-white font-bold px-2 py-1 rounded-full text-xs absolute top-4 right-12">
                  {pendingUpdates.length} New
                </span>
              )}
              <span className="text-xl text-yellow-800">→</span>
            </Link>
            
            <div className="p-4 bg-gray-50 rounded border opacity-50 cursor-not-allowed flex justify-between items-center">
              <div>
                <span className="font-bold block text-lg">🏢 Departments & Blocks</span>
                <span className="text-sm text-gray-500">Manage infrastructure data (Locked for demo)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Update History Feed */}
        <div className="card p-6">
          <h3 className="h3 font-bold mb-4">Recent Update History</h3>
          {updateHistory.length > 0 ? (
            <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-2">
              {updateHistory.slice(0, 10).map((log, idx) => {
                const fac = facultyList.find(f => f.id === log.facultyId);
                return (
                  <div key={idx} className="border-l-2 pl-4 py-2" style={{ borderColor: 'var(--border-color)' }}>
                    <p className="text-sm font-semibold">{fac ? fac.name : 'Unknown Faculty'}</p>
                    <p className="text-gray-600 text-sm mt-1">{log.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(log.updatedAt).toLocaleDateString()} • Verified by {log.verifiedBy}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 italic p-4 text-center">No recent updates recorded.</p>
          )}
        </div>

      </div>
    </div>
  );
}
