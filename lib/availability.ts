import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export interface AvailabilityEntry {
  id: string;
  startDate: string; // 'YYYY-MM-DD'
  endDate: string;   // 'YYYY-MM-DD'
  status: 'requested' | 'blocked' | 'booked';
  note?: string;
  deliveryPoint?: string;   // marina id from marinas-data.ts
  redeliveryPoint?: string; // marina id from marinas-data.ts
  createdAt: Timestamp | null;
}

const COLLECTION = 'availability';

export async function createAvailabilityEntry(
  data: Omit<AvailabilityEntry, 'id' | 'createdAt'>
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getAllAvailabilityEntries(): Promise<AvailabilityEntry[]> {
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as AvailabilityEntry))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export async function updateAvailabilityEntry(
  id: string,
  data: Partial<Pick<AvailabilityEntry, 'startDate' | 'endDate' | 'status' | 'note' | 'deliveryPoint' | 'redeliveryPoint'>>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteAvailabilityEntry(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
