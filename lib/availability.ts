import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type CharterStatus =
  | 'web_request'
  | 'broker_request'
  | 'serious_request'
  | 'confirmed'
  | 'signed'
  | 'canceled'
  | 'owner_use'
  | 'maintenance';

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

export const CHARTER_STATUS_PRIORITY: Record<CharterStatus, number> = {
  signed:          8,
  confirmed:       7,
  serious_request: 6,
  broker_request:  5,
  web_request:     4,
  owner_use:       3,
  maintenance:     2,
  canceled:        1,
};

export interface Charter {
  id: string;
  status: CharterStatus;
  startDate: string;   // 'YYYY-MM-DD'
  endDate: string;     // 'YYYY-MM-DD'
  name?: string;
  email?: string;
  phone?: string;
  passengers?: number;
  boat?: string;
  deliveryPoint?: string;
  redeliveryPoint?: string;
  embarkationPoint?: string;
  note?: string;
  selectedTheme?: string;
  holidayDescription?: string;
  createdAt: Timestamp | null;
}

export function isPubliclyAvailable(status: CharterStatus): boolean {
  return status === 'web_request' || status === 'broker_request' || status === 'serious_request';
}

export async function getAllCharters(): Promise<Charter[]> {
  const snapshot = await getDocs(collection(db, 'charters'));
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Charter, 'id'>),
  }));
}

export async function createCharter(
  data: Omit<Charter, 'id' | 'createdAt'>
): Promise<string> {
  const ref = await addDoc(collection(db, 'charters'), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCharter(
  id: string,
  data: Partial<Omit<Charter, 'id' | 'createdAt'>>
): Promise<void> {
  await updateDoc(doc(db, 'charters', id), data);
}

export async function deleteCharter(id: string): Promise<void> {
  await deleteDoc(doc(db, 'charters', id));
}
