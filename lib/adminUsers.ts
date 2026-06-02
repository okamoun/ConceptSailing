import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export const ALL_ADMIN_PAGES = [
  '/admin',
  '/admin/booking-summary',
  '/admin/availability',
  '/admin/reviews',
  '/admin/photos',
  '/admin/users',
  '/admin/proposals',
  '/admin/financial',
  '/admin/themes',
  '/admin/reconcile',
] as const;

export type AdminPage = typeof ALL_ADMIN_PAGES[number];

export interface AdminUser {
  username: string;
  password: string;
  pages: AdminPage[];
  isSuperAdmin?: boolean;
  updatedAt?: unknown;
}

const COL = 'admin_users';

export async function getAllAdminUsers(): Promise<AdminUser[]> {
  const snap = await getDocs(collection(db, COL));
  return snap.docs.map(d => d.data() as AdminUser);
}

export async function saveAdminUser(user: Omit<AdminUser, 'updatedAt'>): Promise<void> {
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(user as Record<string, unknown>)) {
    if (v !== undefined) clean[k] = v;
  }
  await setDoc(doc(db, COL, user.username), { ...clean, updatedAt: serverTimestamp() }, { merge: true });
}

export async function deleteAdminUser(username: string): Promise<void> {
  await deleteDoc(doc(db, COL, username));
}
