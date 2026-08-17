'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setIsClient(true);
    const auth = sessionStorage.getItem('adminAuth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === 'admin123') { // Simple mock auth
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuth', 'true');
      setError('');
    } else {
      setError('Invalid PIN. Hint: try admin123');
    }
  };

  // Prevent hydration mismatch by returning null until client loads
  if (!isClient) return null;

  if (!isAuthenticated) {
    return (
      <AppShell>
        <div className="container max-w-md py-20">
          <div className="card p-8 text-center">
             <div className="text-5xl mb-4">🔒</div>
             <h1 className="h3 font-bold mb-2">Admin Access Required</h1>
             <p className="text-gray-500 mb-6 text-sm">Please enter the registrar PIN to access the management portal.</p>
             
             <form onSubmit={handleLogin} className="flex flex-col gap-4">
               <input 
                 type="password" 
                 placeholder="Enter PIN" 
                 className="input p-3 bg-gray-50 border rounded text-center text-xl tracking-widest"
                 value={pin}
                 onChange={e => setPin(e.target.value)}
                 autoFocus
               />
               {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}
               <button type="submit" className="btn btn-primary p-3">Unlock</button>
             </form>
          </div>
        </div>
      </AppShell>
    );
  }

  // Once authenticated, show the admin children wrapped in the shell but with an Admin specific top nav marker
  return (
    <AppShell>
      <div className="bg-slate-900 text-white p-2 text-center text-sm font-semibold tracking-wider flex justify-between px-6">
        <span>⚙️ CABINMUJ ADMIN PORTAL</span>
        <button 
          onClick={() => {
            sessionStorage.removeItem('adminAuth');
            setIsAuthenticated(false);
          }} 
          className="text-gray-300 hover:text-white"
        >
          Logout
        </button>
      </div>
      <div className="pt-6">
        {children}
      </div>
    </AppShell>
  );
}
