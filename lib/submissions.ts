import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export interface ContactSubmission {
  id: string;
  type: 'contact';
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: Timestamp | null;
}

const CONTACTS_COL = 'contacts';

export async function saveContactSubmission(
  data: Omit<ContactSubmission, 'id' | 'createdAt'>
): Promise<void> {
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
    if (v !== undefined) clean[k] = v;
  }
  await addDoc(collection(db, CONTACTS_COL), {
    ...clean,
    createdAt: serverTimestamp(),
  });
}

export async function getAllContacts(): Promise<ContactSubmission[]> {
  const snap = await getDocs(collection(db, CONTACTS_COL));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as ContactSubmission))
    .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
}

export async function deleteContact(id: string): Promise<void> {
  await deleteDoc(doc(db, CONTACTS_COL, id));
}
