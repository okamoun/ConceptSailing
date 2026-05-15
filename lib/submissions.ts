import {
  collection,
  getDocs,
  doc,
  addDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface BookingSubmission {
  id: string;
  type: 'booking';
  name: string;
  email: string;
  phone: string;
  boat: string;
  date: string;
  passengers: number;
  embarkationPoint: string;
  holidayDescription?: string;
  selectedTheme?: string;
  createdAt: Timestamp | null;
}

export interface ContactSubmission {
  id: string;
  type: 'contact';
  name: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: Timestamp | null;
}

export async function saveBookingSubmission(
  data: Omit<BookingSubmission, 'id' | 'type' | 'createdAt'>
): Promise<string> {
  const ref = await addDoc(collection(db, 'bookings'), {
    ...data,
    type: 'booking',
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getAllBookings(): Promise<BookingSubmission[]> {
  const snapshot = await getDocs(collection(db, 'bookings'));
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<BookingSubmission, 'id'>),
  }));
}

export async function getAllContacts(): Promise<ContactSubmission[]> {
  const snapshot = await getDocs(collection(db, 'contacts'));
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<ContactSubmission, 'id'>),
  }));
}

export async function deleteContact(id: string): Promise<void> {
  await deleteDoc(doc(db, 'contacts', id));
}

export async function deleteBooking(id: string): Promise<void> {
  await deleteDoc(doc(db, 'bookings', id));
}
