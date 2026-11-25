export type FacultyStatus = 'Available' | 'On Leave' | 'Busy';

export const FACULTY_STATUSES: FacultyStatus[] = ['Available', 'Busy', 'On Leave'];

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
  /** ISO timestamp of the last admin edit ('' for records that were never edited). */
  lastUpdated: string;
  isHOD?: boolean;
  /** True once an admin has confirmed the block/floor/cabin are correct. */
  locationVerified?: boolean;
}

/** The editable fields of a faculty record, as submitted by the admin form. */
export type FacultyInput = Omit<Faculty, 'id' | 'lastUpdated'>;

export type FacultyFieldErrors = Partial<Record<keyof FacultyInput, string>>;

/** Max lengths, shared by the admin form (maxLength) and the server-side validator. */
export const FACULTY_LIMITS = {
  name: 120,
  designation: 150,
  department: 120,
  facultyCategory: 60,
  block: 40,
  floor: 40,
  cabinNumber: 20,
  email: 254,
  phone: 60,
  photo: 500,
  bio: 3000,
  listItems: 40,
  listItem: 200,
} as const;

export const REPORT_ISSUE_TYPES = [
  'Cabin Changed',
  'Block Changed',
  'Floor Changed',
  'Department Changed',
  'Designation Changed',
  'Email Incorrect',
  'Phone Incorrect',
  'Faculty No Longer at MUJ',
  'Faculty Not Listed',
  'Other',
] as const;

/** Reports of this type are about someone missing from the directory, so no faculty is selected. */
export const NOT_LISTED_ISSUE = 'Faculty Not Listed';

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

export type UpdateRequestStatus = 'Pending' | 'Approved' | 'Rejected';

export interface UpdateRequest {
  id: string;
  /** '' when the report is about a faculty member who is not listed yet. */
  facultyId: string;
  /** Name at the time of the report, so the request still reads well if the record changes. */
  facultyName: string;
  submittedBy: string;
  issueType: string;
  oldInformation: string;
  proposedInformation: string;
  evidence: string;
  status: UpdateRequestStatus;
  createdAt: string;
  resolvedAt?: string;
}

export type HistoryAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'restored'
  | 'verified'
  | 'unverified'
  | 'request-approved'
  | 'request-rejected'
  | 'request-reopened';

export interface FieldChange {
  field: string;
  from: string;
  to: string;
}

export interface HistoryEntry {
  id: string;
  at: string;
  by: string;
  action: HistoryAction;
  facultyId?: string;
  facultyName?: string;
  summary: string;
  changes?: FieldChange[];
  /** Full record at deletion time, so it can be restored. */
  snapshot?: Faculty;
  restoredAt?: string;
}

/** A history entry as sent to the browser: a deleted record's full snapshot stays on the server. */
export type HistoryRow = Omit<HistoryEntry, 'snapshot'> & { restorable: boolean };

/** Slim record used for search/autocomplete on the client. */
export type FacultySummary = Pick<
  Faculty,
  'id' | 'name' | 'designation' | 'department' | 'block' | 'cabinNumber' | 'floor' | 'isHOD' | 'photo'
>;
