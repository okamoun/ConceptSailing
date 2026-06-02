import {
  collection,
  doc,
  getDocs,
  setDoc,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export interface ThemeMetadata {
  id: string;
  category: string;
  order: number;
  visible: boolean;
  featured: boolean;
  updatedAt: Timestamp | null;
}

export const THEME_CATEGORIES = [
  'Active & Sports',
  'Wellness & Relaxation',
  'Culture & History',
  'Food',
  'Social & Family',
  'Celebrations & Milestones',
  'Nature & Sea',
  'Lifestyle & Connoisseur',
] as const;

export type ThemeCategory = typeof THEME_CATEGORIES[number];

const COLLECTION = 'theme_metadata';

// Mirrors the hardcoded layout in app/experiences/page.tsx
const DEFAULT_ASSIGNMENTS: Array<Pick<ThemeMetadata, 'id' | 'category' | 'order'>> = [
  { id: '1',  category: 'Active & Sports',           order: 0 },
  { id: '2',  category: 'Active & Sports',           order: 1 },
  { id: '12', category: 'Active & Sports',           order: 2 },
  { id: '3',  category: 'Wellness & Relaxation',     order: 0 },
  { id: '4',  category: 'Wellness & Relaxation',     order: 1 },
  { id: '5',  category: 'Culture & History',         order: 0 },
  { id: '9',  category: 'Culture & History',         order: 1 },
  { id: '6',  category: 'Food',                      order: 0 },
  { id: '10', category: 'Food',                      order: 1 },
  { id: '11', category: 'Food',                      order: 2 },
  { id: '7',  category: 'Social & Family',           order: 0 },
  { id: '8',  category: 'Social & Family',           order: 1 },
  { id: '15', category: 'Celebrations & Milestones', order: 0 },
  { id: '16', category: 'Celebrations & Milestones', order: 1 },
  { id: '14', category: 'Celebrations & Milestones', order: 2 },
  { id: '13', category: 'Nature & Sea',              order: 0 },
  { id: '17', category: 'Nature & Sea',              order: 1 },
  { id: '18', category: 'Lifestyle & Connoisseur',   order: 0 },
];

export async function getAllThemeMetadata(): Promise<ThemeMetadata[]> {
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs.map(d => ({ ...d.data(), id: d.id } as ThemeMetadata));
}

export async function upsertThemeMetadata(
  id: string,
  data: Partial<Omit<ThemeMetadata, 'id' | 'updatedAt'>>
): Promise<void> {
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
    if (v !== undefined) clean[k] = v;
  }
  await setDoc(
    doc(db, COLLECTION, id),
    { ...clean, id, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

// Seeds Firestore with default assignments. No-op if collection already has data.
export async function initializeThemeDefaults(): Promise<void> {
  const snap = await getDocs(collection(db, COLLECTION));
  if (!snap.empty) return;
  await Promise.all(
    DEFAULT_ASSIGNMENTS.map(entry =>
      upsertThemeMetadata(entry.id, {
        category: entry.category,
        order: entry.order,
        visible: true,
        featured: false,
      })
    )
  );
}

// Overwrites all theme metadata with default assignments regardless of existing data.
export async function resetThemeDefaults(): Promise<void> {
  await Promise.all(
    DEFAULT_ASSIGNMENTS.map(entry =>
      upsertThemeMetadata(entry.id, {
        category: entry.category,
        order: entry.order,
        visible: true,
        featured: false,
      })
    )
  );
}
