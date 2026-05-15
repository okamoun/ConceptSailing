import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Review {
  id: string;
  token: string;
  status: 'pending' | 'confirmed';
  name: string;
  email: string;
  title: string;
  description: string;
  rating: number;
  photos?: string[];
  createdAt: Timestamp | null;
  confirmedAt?: Timestamp | null;
  order?: number;
}

export async function getAllReviews(): Promise<Review[]> {
  const snapshot = await getDocs(collection(db, 'reviews'));
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Review, 'id'>),
  }));
}

export async function getConfirmedReviews(): Promise<Review[]> {
  const q = query(
    collection(db, 'reviews'),
    where('status', '==', 'confirmed'),
    orderBy('order', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Review, 'id'>),
  }));
}

export async function createReview(
  data: Omit<Review, 'id' | 'createdAt' | 'confirmedAt'>
): Promise<string> {
  const ref = await addDoc(collection(db, 'reviews'), {
    ...data,
    createdAt: serverTimestamp(),
    confirmedAt: null,
  });
  return ref.id;
}

export async function confirmReview(id: string): Promise<void> {
  await updateDoc(doc(db, 'reviews', id), {
    status: 'confirmed',
    confirmedAt: serverTimestamp(),
  });
}

export async function adminDeleteReview(id: string): Promise<void> {
  await deleteDoc(doc(db, 'reviews', id));
}

export async function updateReviewOrder(id: string, order: number): Promise<void> {
  await updateDoc(doc(db, 'reviews', id), { order });
}

export async function getReviewByToken(token: string): Promise<Review | null> {
  const q = query(collection(db, 'reviews'), where('token', '==', token));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const d = snapshot.docs[0];
  return { id: d.id, ...(d.data() as Omit<Review, 'id'>) };
}

export async function updateReview(
  id: string,
  data: Partial<Omit<Review, 'id' | 'createdAt' | 'confirmedAt'>>
): Promise<void> {
  await updateDoc(doc(db, 'reviews', id), data);
}

export async function deleteReview(id: string): Promise<void> {
  await deleteDoc(doc(db, 'reviews', id));
}
