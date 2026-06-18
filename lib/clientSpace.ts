import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  type Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Charter } from './availability';
import { updateCharter } from './availability';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CrewMember {
  firstName: string;
  lastName: string;
  gender?: string;
  dateOfBirth?: string;
  nationality?: string;
  passportNumber?: string;
  passportImageUrl?: string;
  dietaryRestrictions?: string;
  medicalNotes?: string;
}

export interface TravelGroup {
  id: string;
  memberIndices: number[];
  arrivalDate?: string;
  arrivalTime?: string;
  arrivalFlight?: string;
  stayingAtHotel?: boolean;
  hotelName?: string;
  transferFromAirport?: boolean;
  departureDate?: string;
  departureTime?: string;
  departureFlight?: string;
  transferToAirport?: boolean;
}

export interface TravelLogistics {
  groups?: TravelGroup[];
  embarkationPoint?: string;
  disembarkationPoint?: string;
  // Legacy flat fields (kept for backward compat)
  arrivalDate?: string;
  arrivalTime?: string;
  arrivalFlight?: string;
  stayingAtHotel?: boolean;
  hotelName?: string;
  transferFromAirport?: boolean;
  departureDate?: string;
  departureTime?: string;
  departureFlight?: string;
  transferToAirport?: boolean;
}

export interface FoodCategory {
  likes?: string;
  dislikes?: string;
  allergies?: string;
  passengerNotes?: Record<string, string>;
}

export interface FoodPreferences {
  seafood?: FoodCategory;
  meat?: FoodCategory;
  fruit?: FoodCategory;
  vegetables?: FoodCategory;
  dairy?: FoodCategory;
  other?: FoodCategory;
  breakfastStyle?: string[];
  breakfastItems?: string[];
  lunchStyle?: string;
  lunchDessert?: boolean;
  lunchSnacks?: string;
  dinnerStyle?: string;
  dinnerDessert?: boolean;
}

export interface BeverageItem {
  preferredBrand?: string;
  qty?: number;
  remarks?: string;
  passengerNotes?: Record<string, string>;
}

export interface BeveragePreferences {
  warmBeverages?: string[];
  warmBeveragesOther?: string;
  sodas?: Record<string, BeverageItem>;
  wines?: Record<string, BeverageItem>;
  spirits?: Record<string, BeverageItem>;
}

export interface ActivityPreferences {
  groupStyle?: 'active' | 'relaxed' | 'combination';
  specificPlaces?: string;
  activities?: string[];
  healthNotes?: string;
  sailingExperience?: string;
}

export interface SpecialRequests {
  celebration?: string;
  musicAtmosphere?: string;
  petsOnBoard?: string;
  extraNotes?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
}

export interface ClientPreparation {
  token: string;
  charterId: string;
  lastSavedStep: number;
  crew: CrewMember[];
  travel: TravelLogistics;
  activities: ActivityPreferences;
  food: FoodPreferences;
  beverages: BeveragePreferences;
  special: SpecialRequests;
  checklist: Record<string, boolean>;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  completedAt?: Timestamp | null;
}

export type PrepSnapshot = {
  id: string;
  label: string;
  savedAt: Timestamp;
  data: Pick<ClientPreparation, 'crew' | 'travel' | 'activities' | 'food' | 'beverages' | 'special' | 'checklist' | 'lastSavedStep'>;
};

// ---------------------------------------------------------------------------
// Pre-departure checklist definition
// ---------------------------------------------------------------------------

export interface ChecklistCategory {
  id: string;
  label: string;
  items: { id: string; label: string }[];
}

export const CHECKLIST_CATEGORIES: ChecklistCategory[] = [
  {
    id: 'documents',
    label: 'Documents',
    items: [
      { id: 'doc-passport',      label: 'Passport valid for 6+ months beyond return date' },
      { id: 'doc-insurance',     label: 'Travel insurance arranged and printed/saved' },
      { id: 'doc-ehic',          label: 'European Health Insurance Card (EHIC)' },
      { id: 'doc-prescriptions', label: 'Prescription medications with documentation' },
      { id: 'doc-emergency',     label: 'Emergency contact details saved offline' },
    ],
  },
  {
    id: 'packing',
    label: 'Clothing & Packing',
    items: [
      { id: 'pack-swimwear',     label: 'Swimwear (more than you think!)' },
      { id: 'pack-deck-shoes',   label: 'Non-marking soft-sole deck shoes' },
      { id: 'pack-layers',       label: 'Light layers for evenings underway' },
      { id: 'pack-sun-hat',      label: 'Wide-brim sun hat' },
      { id: 'pack-soft-bags',    label: 'Soft duffel bags only — no hard suitcases' },
      { id: 'pack-sunscreen',    label: 'Reef-safe sunscreen SPF 50+' },
      { id: 'pack-sunglasses',   label: 'Polarised sunglasses with strap' },
    ],
  },
  {
    id: 'health',
    label: 'Health & Wellbeing',
    items: [
      { id: 'health-seasick',    label: 'Seasickness tablets or patches packed' },
      { id: 'health-meds',       label: 'Sufficient personal medications for full trip' },
      { id: 'health-dietary',    label: 'Dietary restrictions submitted to crew' },
      { id: 'health-medical',    label: 'Medical needs confirmed with BlueOne' },
    ],
  },
  {
    id: 'electronics',
    label: 'Electronics & Extras',
    items: [
      { id: 'elec-powerbank',    label: 'Power bank (sufficient charge for your days aboard)' },
      { id: 'elec-camera',       label: 'Waterproof camera or phone case' },
      { id: 'elec-adapter',      label: 'European power adapter (Type C/F)' },
      { id: 'elec-reading',      label: 'Books or e-reader loaded for passages' },
    ],
  },
  {
    id: 'embarkation',
    label: 'Day of Embarkation',
    items: [
      { id: 'day-time',          label: 'Embarkation time confirmed with BlueOne' },
      { id: 'day-transport',     label: 'Transport to marina arranged' },
      { id: 'day-cash',          label: 'Local cash (Euros) for small ports' },
      { id: 'day-gps',           label: 'Marina name and GPS coordinates saved offline' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Token generation
// ---------------------------------------------------------------------------

function generateClientSpaceToken(): string {
  const bytes = new Uint8Array(24);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 24; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ---------------------------------------------------------------------------
// Firestore operations
// ---------------------------------------------------------------------------

const COLLECTION = 'clientPreparations';

function emptyPrep(token: string, charterId: string): Omit<ClientPreparation, 'createdAt' | 'updatedAt'> {
  return {
    token,
    charterId,
    lastSavedStep: 0,
    crew: [],
    travel: {},
    activities: {},
    food: {},
    beverages: {},
    special: {},
    checklist: {},
  };
}

export async function initClientSpace(charterId: string): Promise<string> {
  const token = generateClientSpaceToken();
  const ref = doc(db, COLLECTION, token);
  await setDoc(ref, {
    ...emptyPrep(token, charterId),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await updateCharter(charterId, { clientSpaceToken: token });
  return token;
}

export async function getClientPreparation(token: string): Promise<ClientPreparation | null> {
  const snap = await getDoc(doc(db, COLLECTION, token));
  if (!snap.exists()) return null;
  return { token, ...snap.data() } as ClientPreparation;
}

export async function getCharterByClientSpaceToken(token: string): Promise<Charter | null> {
  const q = query(collection(db, 'availability'), where('clientSpaceToken', '==', token));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as import('./availability').Charter;
}

async function patchPrep(token: string, data: Record<string, unknown>): Promise<void> {
  await updateDoc(doc(db, COLLECTION, token), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function saveCrew(token: string, crew: CrewMember[]): Promise<void> {
  await patchPrep(token, { crew, lastSavedStep: Math.max(1, 0) });
}

export async function saveTravel(token: string, travel: TravelLogistics): Promise<void> {
  await patchPrep(token, { travel });
}

export async function saveActivities(token: string, activities: ActivityPreferences): Promise<void> {
  await patchPrep(token, { activities });
}

export async function saveFood(token: string, food: FoodPreferences): Promise<void> {
  await patchPrep(token, { food });
}

export async function saveBeverages(token: string, beverages: BeveragePreferences): Promise<void> {
  await patchPrep(token, { beverages });
}

export async function saveSpecial(token: string, special: SpecialRequests): Promise<void> {
  await patchPrep(token, { special });
}

export async function saveChecklist(token: string, checklist: Record<string, boolean>): Promise<void> {
  await updateDoc(doc(db, COLLECTION, token), { checklist, updatedAt: serverTimestamp() });
}

export async function saveStep(token: string, step: number): Promise<void> {
  await updateDoc(doc(db, COLLECTION, token), { lastSavedStep: step, updatedAt: serverTimestamp() });
}

// ---------------------------------------------------------------------------
// History (subcollection: clientPreparations/{token}/history)
// ---------------------------------------------------------------------------

const HISTORY_LIMIT = 30;

export async function saveSnapshot(
  token: string,
  prep: ClientPreparation,
  label: string
): Promise<void> {
  const historyCol = collection(db, COLLECTION, token, 'history');
  await addDoc(historyCol, {
    label,
    savedAt: serverTimestamp(),
    data: {
      crew: prep.crew,
      travel: prep.travel,
      activities: prep.activities,
      food: prep.food,
      beverages: prep.beverages,
      special: prep.special,
      checklist: prep.checklist,
      lastSavedStep: prep.lastSavedStep,
    },
  });
}

export async function getHistory(token: string): Promise<PrepSnapshot[]> {
  const historyCol = collection(db, COLLECTION, token, 'history');
  const q = query(historyCol, orderBy('savedAt', 'desc'), limit(HISTORY_LIMIT));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as PrepSnapshot));
}

export async function restoreSnapshot(token: string, snapshot: PrepSnapshot): Promise<void> {
  await updateDoc(doc(db, COLLECTION, token), {
    ...snapshot.data,
    updatedAt: serverTimestamp(),
  });
}
