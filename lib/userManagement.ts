import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import type { Timestamp } from 'firebase/firestore';

export type UserRole = 'admin' | 'client';
export type AdminPermission = 'dashboard' | 'availability' | 'booking-summary' | 'reviews';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  permissions: AdminPermission[];
  reviewToken?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function setUserProfile(uid: string, data: Omit<UserProfile, 'uid'>): Promise<void> {
  await setDoc(doc(db, 'users', uid), { ...data, uid });
}

export async function updateUserProfile(uid: string, partial: Partial<Omit<UserProfile, 'uid' | 'createdAt'>>): Promise<void> {
  await updateDoc(doc(db, 'users', uid), partial);
}

export async function deleteUserProfile(uid: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid));
}

export async function getAllUserProfiles(): Promise<UserProfile[]> {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(d => d.data() as UserProfile);
}
