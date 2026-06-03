import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  type Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { AdventureItineraryDay } from '@/app/adventures-data';

const COLLECTION = 'adventures';

export interface CustomExperience {
  id: string;
  name: string;
  description: string;
  experience: string;
  itinerary: AdventureItineraryDay[];
  features: string[];
  image?: string;
  partnerName?: string;
  partnerUrl?: string;
  prompt?: string;
  aiGenerated: boolean;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export type CustomExperienceInput = Omit<CustomExperience, 'id' | 'createdAt' | 'updatedAt'>;

export async function createExperience(data: CustomExperienceInput): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getExperienceById(id: string): Promise<CustomExperience | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as CustomExperience;
}

export async function getAllCustomExperiences(): Promise<CustomExperience[]> {
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as CustomExperience));
}

export async function updateExperience(
  id: string,
  data: Partial<Omit<CustomExperience, 'id' | 'createdAt'>>,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteExperience(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
