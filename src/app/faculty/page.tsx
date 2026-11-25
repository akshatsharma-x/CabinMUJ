import type { Metadata } from 'next';
import { FacultyDirectory } from '@/components/faculty/FacultyDirectory';
import { filterOptions, toSummary } from '@/lib/faculty-utils';
import { getFacultyList } from '@/lib/server/data';

export const metadata: Metadata = {
  title: 'Faculty Directory',
  description: 'Search every MUJ faculty member by name, department, block or cabin number.',
};

export default async function FacultyDirectoryPage() {
  const faculty = await getFacultyList();
  return <FacultyDirectory faculty={faculty.map(toSummary)} options={filterOptions(faculty)} />;
}
