import { Faculty, Department, Block } from './types';

export const mockDepartments: Department[] = [
  { id: 'dept-cse', name: 'Computer Science and Engineering', shortName: 'CSE', facultyCount: 45, hod: 'Dr. Ramesh Kumar' },
  { id: 'dept-it', name: 'Information Technology', shortName: 'IT', facultyCount: 30, hod: 'Dr. Sunita Sharma' },
  { id: 'dept-ece', name: 'Electronics and Communication', shortName: 'ECE', facultyCount: 38, hod: 'Dr. Vivek Singh' },
  { id: 'dept-mech', name: 'Mechanical Engineering', shortName: 'Mech', facultyCount: 25, hod: 'Dr. Anil Gupta' },
  { id: 'dept-civil', name: 'Civil Engineering', shortName: 'Civil', facultyCount: 20, hod: 'Dr. Meera Desai' },
];

export const mockBlocks: Block[] = [
  { id: 'block-ab1', name: 'Academic Block 1', shortName: 'AB1', description: 'Basic Sciences and Humanities', floors: 4 },
  { id: 'block-ab2', name: 'Academic Block 2', shortName: 'AB2', description: 'Engineering and Architecture', floors: 5 },
  { id: 'block-ab3', name: 'Academic Block 3', shortName: 'AB3', description: 'Management and Commerce', floors: 4 },
  { id: 'block-tma', name: 'TMA Pai Block', shortName: 'TMA Pai', description: 'Administration and Central Library', floors: 6 },
];

export const mockFaculty: Faculty[] = [
  {
    id: 'fac-001', name: 'Dr. Arjun Singh', photo: 'https://i.pravatar.cc/150?img=11', designation: 'Associate Professor',
    department: 'Computer Science and Engineering', facultyCategory: 'Regular', block: 'AB2', cabinNumber: '305', floor: '3rd Floor',
    email: 'arjun.singh@muj.manipal.edu', phone: '+91 9876543210', officeHours: ['Monday 10:00 AM - 12:00 PM'],
    subjects: ['Data Structures'], researchAreas: ['Machine Learning'], qualifications: ['Ph.D.'], bio: '', status: 'Available', lastUpdated: ''
  },
  {
    id: 'fac-002', name: 'Dr. Priya Sharma', photo: 'https://i.pravatar.cc/150?img=5', designation: 'Assistant Professor',
    department: 'Information Technology', facultyCategory: 'Regular', block: 'AB1', cabinNumber: '210', floor: '2nd Floor',
    email: 'priya.sharma@muj.manipal.edu', phone: '+91 8765432109', officeHours: [], subjects: [], researchAreas: [], qualifications: [], bio: '', status: 'Busy', lastUpdated: ''
  },
  {
    id: 'fac-003', name: 'Dr. Ramesh Kumar', photo: 'https://i.pravatar.cc/150?img=15', designation: 'Professor & HOD',
    department: 'Computer Science and Engineering', facultyCategory: 'Regular', block: 'AB2', cabinNumber: '401', floor: '4th Floor',
    email: 'ramesh.kumar@muj.manipal.edu', phone: '', officeHours: [], subjects: [], researchAreas: [], qualifications: [], bio: '', status: 'On Leave', lastUpdated: '', isHOD: true
  },
  {
    id: 'fac-004', name: 'Dr. Sunita Sharma', designation: 'Professor & HOD', // Missing photo
    department: 'Information Technology', facultyCategory: 'Regular', block: 'AB1', cabinNumber: '205', floor: '2nd Floor',
    officeHours: [], subjects: [], researchAreas: [], qualifications: [], bio: '', status: 'Available', lastUpdated: '', isHOD: true
  },
  {
    id: 'fac-005', name: 'Dr. Vivek Singh', photo: 'https://i.pravatar.cc/150?img=12', designation: 'Professor & HOD',
    department: 'Electronics and Communication', facultyCategory: 'Regular', block: 'AB2', cabinNumber: '102', floor: '1st Floor',
    email: 'vivek.singh@muj.manipal.edu', officeHours: [], subjects: [], researchAreas: [], qualifications: [], bio: '', status: 'Available', lastUpdated: '', isHOD: true
  },
  {
    id: 'fac-006', name: 'Prof. Anil Gupta', photo: 'https://i.pravatar.cc/150?img=8', designation: 'Professor & HOD',
    department: 'Mechanical Engineering', facultyCategory: 'Regular', block: 'AB3', cabinNumber: '015', floor: 'Ground Floor',
    email: 'anil.gupta@muj.manipal.edu', officeHours: [], subjects: [], researchAreas: [], qualifications: [], bio: '', status: 'Available', lastUpdated: '', isHOD: true
  },
  {
    id: 'fac-007', name: 'Dr. Meera Desai', designation: 'Professor & HOD', // Missing photo
    department: 'Civil Engineering', facultyCategory: 'Regular', block: 'AB3', cabinNumber: '110', floor: '1st Floor',
    officeHours: [], subjects: [], researchAreas: [], qualifications: [], bio: '', status: 'Busy', lastUpdated: '', isHOD: true
  },
  {
    id: 'fac-008', name: 'Dr. Rohan Verma', photo: 'https://i.pravatar.cc/150?img=33', designation: 'Assistant Professor',
    department: 'Computer Science and Engineering', facultyCategory: 'Regular', block: 'AB2', cabinNumber: '308', floor: '3rd Floor',
    email: 'rohan.verma@muj.manipal.edu', officeHours: [], subjects: [], researchAreas: [], qualifications: [], bio: '', status: 'Available', lastUpdated: ''
  },
  {
    id: 'fac-009', name: 'Dr. Neha Kapoor', photo: 'https://i.pravatar.cc/150?img=42', designation: 'Associate Professor',
    department: 'Information Technology', facultyCategory: 'Regular', block: 'AB1', cabinNumber: '215', floor: '2nd Floor',
    officeHours: [], subjects: [], researchAreas: [], qualifications: [], bio: '', status: 'On Leave', lastUpdated: ''
  },
  {
    id: 'fac-010', name: 'Dr. Sanjay Patel', photo: 'https://i.pravatar.cc/150?img=53', designation: 'Assistant Professor',
    department: 'Electronics and Communication', facultyCategory: 'Regular', block: 'AB2', // Missing cabin info to test fallback
    officeHours: [], subjects: [], researchAreas: [], qualifications: [], bio: '', status: 'Available', lastUpdated: ''
  },
  {
    id: 'fac-011', name: 'Dr. Ayesha Khan', photo: 'https://i.pravatar.cc/150?img=44', designation: 'Assistant Professor',
    department: 'Mechanical Engineering', facultyCategory: 'Regular', block: 'AB3', cabinNumber: '022', floor: 'Ground Floor',
    officeHours: [], subjects: [], researchAreas: [], qualifications: [], bio: '', status: 'Available', lastUpdated: ''
  },
  {
    id: 'fac-012', name: 'Prof. Vikram Joshi', photo: 'https://i.pravatar.cc/150?img=55', designation: 'Professor',
    department: 'Civil Engineering', facultyCategory: 'Regular', block: 'AB3', cabinNumber: '115', floor: '1st Floor',
    email: 'vikram.joshi@muj.manipal.edu', officeHours: [], subjects: [], researchAreas: [], qualifications: [], bio: '', status: 'Available', lastUpdated: ''
  },
  {
    id: 'fac-013', name: 'Dr. Suman Das', designation: 'Associate Professor', // Missing photo
    department: 'Computer Science and Engineering', facultyCategory: 'Regular', block: 'TMA Pai', cabinNumber: '501', floor: '5th Floor',
    email: 'suman.das@muj.manipal.edu', officeHours: [], subjects: [], researchAreas: [], qualifications: [], bio: '', status: 'Available', lastUpdated: ''
  },
  {
    id: 'fac-014', name: 'Dr. Kavita Reddy', photo: 'https://i.pravatar.cc/150?img=49', designation: 'Assistant Professor',
    department: 'Information Technology', facultyCategory: 'Regular', block: 'AB1', cabinNumber: '220', floor: '2nd Floor',
    officeHours: [], subjects: [], researchAreas: [], qualifications: [], bio: '', status: 'Busy', lastUpdated: ''
  },
  {
    id: 'fac-015', name: 'Dr. Rakesh Nair', photo: 'https://i.pravatar.cc/150?img=60', designation: 'Associate Professor',
    department: 'Electronics and Communication', facultyCategory: 'Regular', // Missing block and cabin to test extreme fallback
    email: 'rakesh.nair@muj.manipal.edu', officeHours: [], subjects: [], researchAreas: [], qualifications: [], bio: '', status: 'Available', lastUpdated: ''
  }
];
