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
  await setDoc(doc(db, COL, user.username), { ...user, updatedAt: serverTimestamp() }, { merge: true });
}

export async function deleteAdminUser(username: string): Promise<void> {
  await deleteDoc(doc(db, COL, username));
}
