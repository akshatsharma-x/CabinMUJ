import type { Faculty, FacultySummary } from './types';
import { sortBlocks, sortFloors } from './campus';

// ─── Names ───────────────────────────────────────────────────────────────

const HONORIFICS = /^(?:\(?(?:dr|prof|mr|mrs|ms|miss|er|sh|smt)\b\.?\)?\s*)+/i;

/** "Dr. Kanika Data" → "Kanika Data"; also copes with data quirks like "Ms .Santoshi". */
export function plainName(name: string): string {
  return name.replace(HONORIFICS, '').replace(/^[^\p{L}]+/u, '').trim() || name.trim();
}

export function initials(name: string): string {
  const parts = plainName(name).split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map(p => p[0]).join('').toUpperCase() || '?';
}

export function compareByName(a: Pick<Faculty, 'name'>, b: Pick<Faculty, 'name'>): number {
  return plainName(a.name).localeCompare(plainName(b.name), 'en', { sensitivity: 'base' });
}

/** HoDs first, then alphabetical by name (ignoring titles like "Dr."). */
export function compareFaculty(a: Pick<Faculty, 'name' | 'isHOD'>, b: Pick<Faculty, 'name' | 'isHOD'>): number {
  if (!!a.isHOD !== !!b.isHOD) return a.isHOD ? -1 : 1;
  return compareByName(a, b);
}

// ─── Designation categories ──────────────────────────────────────────────

export const DESIGNATION_CATEGORIES = ['Professors', 'Associate Professors', 'Assistant Professors', 'Other'] as const;
export type DesignationCategory = (typeof DESIGNATION_CATEGORIES)[number];

export function designationCategory(designation: string): DesignationCategory {
  const d = designation.toLowerCase();
  if (d.includes('assistant professor')) return 'Assistant Professors';
  if (d.includes('associate professor')) return 'Associate Professors';
  if (d.includes('professor')) return 'Professors';
  return 'Other';
}

// ─── Departments ───────────────────────────────────────────────────────────

const ACRONYM_SKIP = new Set(['and', '&', 'of', 'the', 'in', 'for', 'school']);

/** "Computer Science & Engineering" → "CSE"; "Interaction … Design (ICD)" → "ICD". */
export function departmentAcronym(name: string): string {
  const explicit = name.match(/\(([A-Za-z]{2,})\)/);
  if (explicit) return explicit[1].toUpperCase();
  const letters = name
    .replace(/[^A-Za-z&\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w && !ACRONYM_SKIP.has(w.toLowerCase()))
    .map(w => w[0].toUpperCase());
  return letters.length >= 2 ? letters.join('') : '';
}

export interface DepartmentSummary {
  name: string;
  acronym: string;
  count: number;
  hods: { id: string; name: string }[];
}

export function summarizeDepartments(list: Faculty[]): DepartmentSummary[] {
  const map = new Map<string, DepartmentSummary>();
  for (const f of list) {
    if (!f.department) continue;
    let d = map.get(f.department);
    if (!d) {
      d = { name: f.department, acronym: departmentAcronym(f.department), count: 0, hods: [] };
      map.set(f.department, d);
    }
    d.count++;
    if (f.isHOD) d.hods.push({ id: f.id, name: f.name });
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

// ─── Location ────────────────────────────────────────────────────────────

export function hasLocation(f: Pick<Faculty, 'block' | 'cabinNumber'>): boolean {
  return Boolean(f.block && f.cabinNumber);
}

/** "AB1 · Cabin 371 · 3rd Floor" (parts that are missing are skipped). */
export function formatLocation(f: Pick<Faculty, 'block' | 'cabinNumber' | 'floor'>): string {
  return [f.block, f.cabinNumber && `Cabin ${f.cabinNumber}`, f.floor].filter(Boolean).join(' · ');
}

// ─── Filter options ──────────────────────────────────────────────────────

export interface FilterOptions {
  departments: string[];
  blocks: string[];
  floors: string[];
}

export function filterOptions(list: Pick<Faculty, 'department' | 'block' | 'floor'>[]): FilterOptions {
  return {
    departments: [...new Set(list.map(f => f.department).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    blocks: sortBlocks(list.map(f => f.block ?? '')),
    floors: sortFloors(list.map(f => f.floor ?? '')),
  };
}

export function toSummary(f: Faculty): FacultySummary {
  return {
    id: f.id,
    name: f.name,
    designation: f.designation,
    department: f.department,
    block: f.block,
    cabinNumber: f.cabinNumber,
    floor: f.floor,
    isHOD: f.isHOD,
    photo: f.photo,
  };
}

// ─── Search ──────────────────────────────────────────────────────────────

/** Words that carry no meaning in a faculty search ("AB2 block", "Dr. Singh", "3rd floor"). */
const STOP_WORDS = new Set([
  'faculty', 'faculties', 'block', 'blocks', 'cabin', 'cabins', 'room', 'floor',
  'the', 'of', 'and', 'in', 'at', 'for', 'dept', 'department', 'dr', 'mr', 'mrs', 'ms',
]);

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export function tokenize(query: string): string[] {
  return normalize(query).split(' ').filter(t => t && !STOP_WORDS.has(t));
}

type Searchable = Pick<Faculty, 'name' | 'designation' | 'department' | 'block' | 'cabinNumber' | 'floor' | 'isHOD'> & {
  email?: string;
};

export interface SearchIndexEntry<T> {
  item: T;
  nameWords: string[];
  deptWords: string[];
  designationWords: string[];
  acronym: string;
  block: string;
  cabin: string;
  haystack: string;
  hod: boolean;
}

export function buildSearchIndex<T extends Searchable>(list: T[]): SearchIndexEntry<T>[] {
  return list.map(item => {
    const name = normalize(item.name);
    const dept = normalize(item.department);
    const designation = normalize(item.designation);
    const acronym = departmentAcronym(item.department).toLowerCase();
    const block = normalize(item.block ?? '');
    const cabin = normalize(item.cabinNumber ?? '');
    return {
      item,
      nameWords: name.split(' '),
      deptWords: dept.split(' '),
      designationWords: designation.split(' '),
      acronym,
      block,
      cabin,
      haystack: [name, designation, dept, acronym, block, cabin, normalize(item.floor ?? ''), normalize(item.email ?? '')].join(' '),
      hod: Boolean(item.isHOD) || /\bhod\b/.test(designation),
    };
  });
}

/**
 * Every token must match some field. Returns a relevance score, or -1 for no match.
 * Name/cabin/acronym hits score highest so "IT" ranks the IT department above names containing "it".
 */
export function scoreEntry(e: SearchIndexEntry<unknown>, tokens: string[]): number {
  let total = 0;
  for (const t of tokens) {
    let s = 0;
    if ((t === 'hod' || t === 'hods') && e.hod) s = 3;
    if (e.cabin && e.cabin === t) s = Math.max(s, 5);
    if (e.nameWords.some(w => w.startsWith(t))) s = Math.max(s, 4);
    if (e.acronym === t) s = Math.max(s, 4);
    if (e.block && (e.block === t || e.block.replace(/\s/g, '') === t)) s = Math.max(s, 3);
    if (e.deptWords.some(w => w.startsWith(t))) s = Math.max(s, 2);
    if (e.cabin.startsWith(t)) s = Math.max(s, 2);
    if (e.designationWords.some(w => w.startsWith(t))) s = Math.max(s, 1.5);
    if (s === 0 && e.haystack.includes(t)) s = 1;
    if (s === 0) return -1;
    total += s;
  }
  return total;
}

/** Returns matching items, best matches first (HoDs, then name, when there is no query). */
export function searchIndex<T extends Searchable>(
  index: SearchIndexEntry<T>[],
  query: string,
  filter?: (item: T) => boolean,
): T[] {
  const tokens = tokenize(query);
  const results: { item: T; score: number }[] = [];
  for (const e of index) {
    if (filter && !filter(e.item)) continue;
    const score = tokens.length ? scoreEntry(e, tokens) : 0;
    if (score >= 0) results.push({ item: e.item, score });
  }
  results.sort((a, b) => b.score - a.score || compareFaculty(a.item, b.item));
  return results.map(r => r.item);
}

// ─── Dates ───────────────────────────────────────────────────────────────

// Formatted by hand in India Standard Time (UTC+5:30, no daylight saving) so the server and
// every browser produce exactly the same text — Intl output differs between engines
// ("Sep" vs "Sept", "am" vs "AM"), which would cause hydration mismatches.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const IST_OFFSET_MS = 330 * 60_000;

function inIst(iso?: string): Date | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? null : new Date(t + IST_OFFSET_MS); // read with getUTC* below
}

/** "26 Nov 2026" */
export function formatDate(iso?: string): string {
  const d = inIst(iso);
  if (!d) return iso ?? '';
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** "26 Nov 2026, 1:05 AM" */
export function formatDateTime(iso?: string): string {
  const d = inIst(iso);
  if (!d) return iso ?? '';
  const h = d.getUTCHours();
  const time = `${h % 12 || 12}:${String(d.getUTCMinutes()).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
  return `${formatDate(iso)}, ${time}`;
}
