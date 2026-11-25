import type { Metadata } from 'next';
import Link from 'next/link';
import { blockMeta, sortBlocks, sortFloors } from '@/lib/campus';
import { getFacultyList } from '@/lib/server/data';

export const metadata: Metadata = {
  title: 'Campus Map',
  description: 'Campus blocks and floors at MUJ, with the faculty cabins on each.',
};

const facultyHref = (block: string, floor?: string) =>
  `/faculty?${new URLSearchParams(floor ? { block, floor } : { block })}`;

export default async function BlocksPage() {
  const faculty = await getFacultyList();
  const blockNames = sortBlocks(faculty.map(f => f.block ?? ''));
  const unassigned = faculty.filter(f => !f.block).length;

  const blocks = blockNames.map(name => {
    const inBlock = faculty.filter(f => f.block === name);
    const floors = sortFloors(inBlock.map(f => f.floor ?? '')).map(floor => ({
      floor,
      count: inBlock.filter(f => f.floor === floor).length,
    }));
    return { meta: blockMeta(name), count: inBlock.length, floors };
  });

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="h2 mb-1">Campus Directory</h1>
        <p className="text-sm text-muted">
          Pick a block and floor to see whose cabins are there.
          {unassigned > 0 && ` ${unassigned} faculty member${unassigned === 1 ? ' has' : 's have'} no location yet.`}
        </p>
      </div>

      {/* Block Map */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in">
        {blocks.map(({ meta, count }) => (
          <Link key={meta.id} href={facultyHref(meta.shortName)} className="card p-4 hover-lift text-center"
            style={{ background: 'var(--muj-orange-light)', border: '2px solid var(--muj-orange)', borderRadius: 'var(--radius-lg)' }}>
            <p className="text-2xl font-black text-muj-orange mb-1">{meta.shortName}</p>
            <p className="text-xs font-medium text-secondary">{meta.name}</p>
            <p className="text-xs mt-3 text-muted">{count} faculty</p>
          </Link>
        ))}
      </div>

      {/* Floors per block */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in delay-100">
        {blocks.map(({ meta, count, floors }) => (
          <div key={meta.id} className="card" style={{ borderLeft: '3px solid var(--muj-orange)' }}>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <span className="badge badge-orange font-bold mb-2" style={{ display: 'inline-block' }}>{meta.shortName}</span>
                  <h2 className="font-semibold" style={{ fontSize: '1rem' }}>{meta.name}</h2>
                  {meta.description && <p className="text-xs text-muted mt-1">{meta.description}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-muj-orange" style={{ fontSize: '1.25rem' }}>{count}</p>
                  <p className="text-xs text-muted">faculty</p>
                </div>
              </div>

              <p className="text-xs font-semibold uppercase tracking-wider text-muted mt-4 mb-2">Floors</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {floors.map(({ floor, count: n }) => (
                  <Link key={floor} href={facultyHref(meta.shortName, floor)} className="chip">
                    {floor} <span style={{ opacity: 0.6 }}>{n}</span>
                  </Link>
                ))}
                {floors.length === 0 && <span className="text-xs text-muted">No floor information yet.</span>}
              </div>

              <Link href={facultyHref(meta.shortName)} className="btn btn-secondary btn-sm w-full" style={{ borderRadius: '6px' }}>
                View all faculty in {meta.shortName} →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
