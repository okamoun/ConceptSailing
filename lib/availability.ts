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

export type CharterStatus =
  | 'web_request'
  | 'broker_request'
  | 'serious_request'
  | 'confirmed'
  | 'signed'
  | 'canceled'
  | 'owner_use'
  | 'maintenance';

export const CHARTER_STATUS_PRIORITY: Record<CharterStatus, number> = {
  signed:          8,
  confirmed:       7,
  owner_use:       6,
  maintenance:     5,
  serious_request: 4,
  broker_request:  3,
  web_request:     2,
  canceled:        1,
};

export const CHARTER_STATUS_LABEL: Record<CharterStatus, string> = {
  web_request:     'Web Request',
  broker_request:  'Broker Request',
  serious_request: 'Serious Request',
  confirmed:       'Confirmed',
  signed:          'Signed',
  canceled:        'Canceled',
  owner_use:       'Owner Use',
  maintenance:     'Maintenance',
};

// External (public) view: web_request and canceled appear as available
export function isPubliclyAvailable(status: CharterStatus): boolean {
  return status === 'web_request' || status === 'canceled';
}

export interface Charter {
  id: string;
  status: CharterStatus;
  startDate: string; // 'YYYY-MM-DD'
  endDate: string;   // 'YYYY-MM-DD'
  // Client info (optional for owner_use / maintenance)
  name?: string;
  email?: string;
  phone?: string;
  passengers?: number;
  boat?: string;
  // Location
  embarkationPoint?: string;  // free-text from web form
  deliveryPoint?: string;     // marina id
  redeliveryPoint?: string;   // marina id
  // Content
  selectedTheme?: string;
  holidayDescription?: string;
  note?: string;
  createdAt: Timestamp | null;
}

const COLLECTION = 'availability';

export async function createCharter(
  data: Omit<Charter, 'id' | 'createdAt'>
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getAllCharters(): Promise<Charter[]> {
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as Charter))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export async function updateCharter(
  id: string,
  data: Partial<Omit<Charter, 'id' | 'createdAt'>>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteCharter(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
