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

const BOOKINGS_COL = 'bookings';
const CONTACTS_COL = 'contacts';

export async function saveBookingSubmission(
  data: Omit<BookingSubmission, 'id' | 'createdAt'>
): Promise<void> {
  await addDoc(collection(db, BOOKINGS_COL), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function saveContactSubmission(
  data: Omit<ContactSubmission, 'id' | 'createdAt'>
): Promise<void> {
  await addDoc(collection(db, CONTACTS_COL), {
    ...data,
    createdAt: serverTimestamp(),
  });
}

export async function getAllBookings(): Promise<BookingSubmission[]> {
  const snap = await getDocs(collection(db, BOOKINGS_COL));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as BookingSubmission))
    .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
}

export async function getAllContacts(): Promise<ContactSubmission[]> {
  const snap = await getDocs(collection(db, CONTACTS_COL));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as ContactSubmission))
    .sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
}

export async function deleteBooking(id: string): Promise<void> {
  await deleteDoc(doc(db, BOOKINGS_COL, id));
}

export async function deleteContact(id: string): Promise<void> {
  await deleteDoc(doc(db, CONTACTS_COL, id));
}
