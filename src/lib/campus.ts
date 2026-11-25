import type { Block } from './types';

/**
 * Known campus blocks, in display order. Blocks that appear in faculty data
 * but are not listed here still show up everywhere (with generic details).
 */
export const CAMPUS_BLOCKS: Block[] = [
  { id: 'block-ab1', name: 'Academic Block 1', shortName: 'AB1', description: 'Basic Sciences and Humanities', floors: 4 },
  { id: 'block-ab2', name: 'Academic Block 2', shortName: 'AB2', description: 'Engineering and Architecture', floors: 5 },
  { id: 'block-ab3', name: 'Academic Block 3', shortName: 'AB3', description: 'Management and Commerce', floors: 4 },
  { id: 'block-tma', name: 'TMA Pai Block', shortName: 'TMA Pai', description: 'Administration and Central Library', floors: 6 },
];

export function blockMeta(shortName: string): Block {
  return (
    CAMPUS_BLOCKS.find(b => b.shortName.toLowerCase() === shortName.toLowerCase()) ?? {
      id: `block-${shortName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      name: shortName,
      shortName,
      description: '',
      floors: 0,
    }
  );
}

/** Known blocks first (in campus order), then any others alphabetically. */
export function sortBlocks(names: string[]): string[] {
  const order = new Map(CAMPUS_BLOCKS.map((b, i) => [b.shortName, i]));
  return [...new Set(names.filter(Boolean))].sort((a, b) => {
    const ai = order.get(a) ?? Infinity;
    const bi = order.get(b) ?? Infinity;
    return ai !== bi ? ai - bi : a.localeCompare(b);
  });
}

export const STANDARD_FLOORS = [
  'Ground Floor',
  '1st Floor',
  '2nd Floor',
  '3rd Floor',
  '4th Floor',
  '5th Floor',
  '6th Floor',
];

export function floorRank(floor: string): number {
  const f = floor.toLowerCase();
  if (/basement|lower ground/.test(f)) return -1;
  if (/ground/.test(f)) return 0;
  const n = f.match(/\d+/);
  return n ? Number(n[0]) : 999;
}

export function sortFloors(floors: string[]): string[] {
  return [...new Set(floors.filter(Boolean))].sort((a, b) => floorRank(a) - floorRank(b) || a.localeCompare(b));
}
