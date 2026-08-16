export type FacultyStatus = 'Available' | 'On Leave' | 'Busy';

export interface Faculty {
  id: string;
  name: string;
  photo?: string;
  designation: string;
  department: string;
  facultyCategory: string;
  block?: string;
  cabinNumber?: string;
  floor?: string;
  email?: string;
  phone?: string;
  officeHours: string[]; // e.g., ["Monday 10:00 AM - 11:00 AM"]
  subjects: string[];
  researchAreas: string[];
  qualifications: string[];
  bio: string;
  status: FacultyStatus;
  lastUpdated: string;
}

export interface Department {
  id: string;
  name: string;
  shortName: string;
  facultyCount: number;
  hod: string;
}

export interface Block {
  id: string;
  name: string;
  shortName: string;
  description: string;
  floors: number;
}

export interface UpdateRequest {
  id: string;
  facultyId: string;
  submittedBy: string;
  issueType: string;
  oldInformation: string;
  proposedInformation: string;
  evidence: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}
