import type { Metadata } from 'next';
import { ReportForm } from '@/components/report/ReportForm';
import { toSummary } from '@/lib/faculty-utils';
import { getFacultyList } from '@/lib/server/data';

export const metadata: Metadata = {
  title: 'Report an Update',
  description: 'Tell the CabinMUJ team about a moved cabin or outdated faculty details.',
};

type Props = { searchParams: Promise<{ facultyId?: string | string[]; issue?: string | string[] }> };

export default async function ReportPage({ searchParams }: Props) {
  const [faculty, params] = await Promise.all([getFacultyList(), searchParams]);
  const first = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v) ?? '';
  return (
    <ReportForm
      faculty={faculty.map(f => ({ ...toSummary(f), photo: undefined }))}
      initialFacultyId={first(params.facultyId)}
      initialIssue={first(params.issue)}
    />
  );
}
