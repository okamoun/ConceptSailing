import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FieldType = 'text' | 'textarea' | 'select' | 'checkbox' | 'number';

export interface PreferenceField {
  id: string;
  label: string;
  type: FieldType;
  options?: string[];   // for select / checkbox fields
  required?: boolean;
  placeholder?: string;
}

export interface PreferenceSection {
  id: string;
  title: string;
  description?: string;
  builtIn: boolean;     // built-in wizard sections cannot be deleted, only hidden
  visible: boolean;
  order: number;
  fields: PreferenceField[]; // empty for built-in sections (their UI is code-defined)
}

// Stored in Firestore `preference_config` collection — single doc: 'default'
export interface PreferenceConfig {
  sections: PreferenceSection[];
  updatedAt: Timestamp | null;
}

// ---------------------------------------------------------------------------
// Built-in sections (map 1:1 to the client-space wizard steps)
// ---------------------------------------------------------------------------

export const BUILT_IN_SECTIONS: { id: string; title: string; description: string }[] = [
  { id: 'crew',       title: 'Crew Details',       description: 'Passenger names, passports, dietary restrictions and medical notes' },
  { id: 'travel',     title: 'Travel & Logistics', description: 'Flights, hotels and airport transfers per travel group' },
  { id: 'activities', title: 'Activities & Health', description: 'Group style, activity interests, health notes and sailing experience' },
  { id: 'food',       title: 'Food Preferences',   description: 'Likes, dislikes and allergies by category, plus meal styles' },
  { id: 'beverages',  title: 'Beverages & Bar',    description: 'Hot drinks, sodas, wines and spirits with quantities and brands' },
  { id: 'special',    title: 'Special Requests',   description: 'Celebrations, music, emergency contact and pre-departure checklist' },
];

export function defaultSections(): PreferenceSection[] {
  return BUILT_IN_SECTIONS.map((s, i) => ({
    ...s,
    builtIn: true,
    visible: true,
    order: i,
    fields: [],
  }));
}

export function createSectionId(): string {
  return `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createFieldId(): string {
  return `field-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function visibleSections(sections: PreferenceSection[]): PreferenceSection[] {
  return [...sections].sort((a, b) => a.order - b.order).filter(s => s.visible);
}

// ---------------------------------------------------------------------------
// Firestore operations
// ---------------------------------------------------------------------------

const CONFIG_COLLECTION = 'preference_config';
const CONFIG_DOC = 'default';

/**
 * Reads the preference configuration. If none exists yet, seeds the default
 * built-in sections (best effort — read-only clients still get the defaults).
 * Built-in sections added to the code after the config was saved are appended
 * so they never disappear from the admin screen.
 */
export async function getPreferenceConfig(): Promise<PreferenceConfig> {
  const ref = doc(db, CONFIG_COLLECTION, CONFIG_DOC);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    const sections = defaultSections();
    try {
      await setDoc(ref, { sections, updatedAt: serverTimestamp() });
    } catch {
      // Seeding is best-effort; clients without write access still get defaults.
    }
    return { sections, updatedAt: null };
  }

  const data = snap.data() as { sections?: PreferenceSection[]; updatedAt?: Timestamp | null };
  const sections = [...(data.sections ?? [])];
  for (const b of BUILT_IN_SECTIONS) {
    if (!sections.some(s => s.id === b.id)) {
      sections.push({ ...b, builtIn: true, visible: true, order: sections.length, fields: [] });
    }
  }
  sections.sort((a, b) => a.order - b.order);
  return { sections, updatedAt: data.updatedAt ?? null };
}

export async function updatePreferenceConfig(sections: PreferenceSection[]): Promise<void> {
  // Re-number order to match array position and strip undefined values
  // (Firestore rejects undefined in nested objects).
  const normalized = JSON.parse(JSON.stringify(
    sections.map((s, i) => ({ ...s, order: i }))
  )) as PreferenceSection[];
  await setDoc(doc(db, CONFIG_COLLECTION, CONFIG_DOC), {
    sections: normalized,
    updatedAt: serverTimestamp(),
  });
}
