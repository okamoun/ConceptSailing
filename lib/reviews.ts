import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export interface Review {
  id: string;
  token: string;
  status: 'pending' | 'confirmed';
  name: string;
  email: string;
  title: string;
  description: string;
  rating: number;
  photos: string[];
  createdAt: Timestamp | null;
  confirmedAt: Timestamp | null;
  order: number;
}

const COLLECTION = 'reviews';

export async function createReview(data: Omit<Review, 'id' | 'createdAt' | 'confirmedAt'>): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    confirmedAt: null,
  });
  return ref.id;
}

export async function getConfirmedReviews(): Promise<Review[]> {
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as Review))
    .filter(r => r.status === 'confirmed')
    .sort((a, b) => {
      if ((b.order ?? 0) !== (a.order ?? 0)) return (b.order ?? 0) - (a.order ?? 0);
      const aTime = a.confirmedAt?.toMillis?.() ?? 0;
      const bTime = b.confirmedAt?.toMillis?.() ?? 0;
      return bTime - aTime;
    });
}

export async function getAllReviews(): Promise<Review[]> {
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as Review))
    .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
}

export async function getReviewByToken(token: string): Promise<Review | null> {
  const q = query(collection(db, COLLECTION), where('token', '==', token));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Review;
}

export async function confirmReview(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    status: 'confirmed',
    confirmedAt: serverTimestamp(),
  });
}

export async function updateReview(id: string, data: Partial<Pick<Review, 'title' | 'description' | 'rating' | 'photos' | 'name'>>): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    status: 'pending',
    confirmedAt: null,
  });
}

export async function deleteReview(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function updateReviewOrder(id: string, order: number): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { order });
}

export async function adminDeleteReview(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
