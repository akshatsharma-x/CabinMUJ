'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Faculty, Department, Block, UpdateRequest } from './types';
import { mockFaculty, mockDepartments, mockBlocks } from './mock-data';

export interface UpdateHistoryLog {
  id: string;
  facultyId: string;
  message: string;
  updatedAt: string;
  verifiedBy: string;
}

interface FacultyContextType {
  facultyList: Faculty[];
  departmentsList: Department[];
  blocksList: Block[];
  updateRequests: UpdateRequest[];
  updateHistory: UpdateHistoryLog[];
  
  // Actions
  addFaculty: (faculty: Faculty) => void;
  updateFaculty: (id: string, updatedFaculty: Faculty) => void;
  deleteFaculty: (id: string) => void;
  submitUpdateRequest: (request: Omit<UpdateRequest, 'id' | 'status' | 'createdAt'>) => void;
  approveUpdateRequest: (requestId: string, newInformation: Partial<Faculty>) => void;
  rejectUpdateRequest: (requestId: string) => void;
}

const FacultyContext = createContext<FacultyContextType | undefined>(undefined);

export function FacultyProvider({ children }: { children: ReactNode }) {
  const [facultyList, setFacultyList] = useState<Faculty[]>(mockFaculty);
  const [departmentsList] = useState<Department[]>(mockDepartments);
  const [blocksList] = useState<Block[]>(mockBlocks);
  const [updateRequests, setUpdateRequests] = useState<UpdateRequest[]>([]);
  const [updateHistory, setUpdateHistory] = useState<UpdateHistoryLog[]>([]);

  const addFaculty = (faculty: Faculty) => {
    setFacultyList(prev => [faculty, ...prev]);
  };

  const updateFaculty = (id: string, updatedFaculty: Faculty) => {
    // Generate history logs for critical changes
    const oldFaculty = facultyList.find(f => f.id === id);
    if (oldFaculty) {
      if (oldFaculty.cabinNumber !== updatedFaculty.cabinNumber || oldFaculty.block !== updatedFaculty.block) {
        const log: UpdateHistoryLog = {
          id: `log-${Date.now()}`,
          facultyId: id,
          message: `Location changed from ${oldFaculty.block}-${oldFaculty.cabinNumber} to ${updatedFaculty.block}-${updatedFaculty.cabinNumber}`,
          updatedAt: new Date().toISOString(),
          verifiedBy: 'Admin'
        };
        setUpdateHistory(prev => [log, ...prev]);
      }
    }

    setFacultyList(prev => prev.map(f => f.id === id ? updatedFaculty : f));
  };

  const deleteFaculty = (id: string) => {
    setFacultyList(prev => prev.filter(f => f.id !== id));
  };

  const submitUpdateRequest = (request: Omit<UpdateRequest, 'id' | 'status' | 'createdAt'>) => {
    const newRequest: UpdateRequest = {
      ...request,
      id: `req-${Date.now()}`,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    setUpdateRequests(prev => [newRequest, ...prev]);
  };

  const approveUpdateRequest = (requestId: string, newInformation: Partial<Faculty>) => {
    setUpdateRequests(prev => prev.map(req => req.id === requestId ? { ...req, status: 'Approved' } : req));
    
    const request = updateRequests.find(r => r.id === requestId);
    if (request) {
      const oldFaculty = facultyList.find(f => f.id === request.facultyId);
      if (oldFaculty) {
        const updatedFaculty = { ...oldFaculty, ...newInformation };
        updateFaculty(request.facultyId, updatedFaculty);
        
        // Log history
        const log: UpdateHistoryLog = {
          id: `log-${Date.now()}`,
          facultyId: request.facultyId,
          message: `Update request approved: ${request.issueType}`,
          updatedAt: new Date().toISOString(),
          verifiedBy: 'Admin'
        };
        setUpdateHistory(prev => [log, ...prev]);
      }
    }
  };

  const rejectUpdateRequest = (requestId: string) => {
    setUpdateRequests(prev => prev.map(req => req.id === requestId ? { ...req, status: 'Rejected' } : req));
  };

  return (
    <FacultyContext.Provider value={{
      facultyList, departmentsList, blocksList, updateRequests, updateHistory,
      addFaculty, updateFaculty, deleteFaculty, submitUpdateRequest, approveUpdateRequest, rejectUpdateRequest
    }}>
      {children}
    </FacultyContext.Provider>
  );
}

export function useFaculty() {
  const context = useContext(FacultyContext);
  if (context === undefined) {
    throw new Error('useFaculty must be used within a FacultyProvider');
  }
  return context;
}
