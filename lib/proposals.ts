import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  arrayUnion,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export type ProposalStatus = 'draft' | 'sent' | 'viewed' | 'commented' | 'approved' | 'rejected';

export interface PricingExtra {
  label: string;
  amount: number;
}

export interface ProposalPricing {
  basePrice: number;
  currency: string;
  apaPercentage: number;
  securityDeposit: number;
  discountAmount: number;
  extras: PricingExtra[];
}

export interface PaymentTerm {
  label: string;
  percentage: number;
  description: string;
}

export interface ProposalComment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
  isAdmin: boolean;
}

export interface Proposal {
  id: string;
  token: string;
  status: ProposalStatus;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  charterId?: string;
  boatName: string;
  startDate: string;
  endDate: string;
  embarkationPort: string;
  disembarkationPort: string;
  passengers: number;
  selectedTheme?: string;
  itinerarySummary?: string;
  pricing: ProposalPricing;
  paymentTerms: PaymentTerm[];
  specialConditions?: string;
  adminNotes?: string;
  comments: ProposalComment[];
  createdAt: Timestamp | null;
  sentAt: Timestamp | null;
  viewedAt: Timestamp | null;
  expiresAt: string;
}

// MYBA standard charter payment schedule
export const DEFAULT_PAYMENT_TERMS: PaymentTerm[] = [
  {
    label: 'Deposit — 50%',
    percentage: 50,
    description:
      '50% of the total charter fee is due upon signing of the MYBA Charter Agreement.',
  },
  {
    label: 'Balance — 50%',
    percentage: 50,
    description:
      '50% balance of the total charter fee is due 28 days prior to the charter commencement date.',
  },
];

const COLLECTION = 'proposals';

function generateToken(): string {
  const bytes = new Array(16);
  for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function calcTotals(pricing: ProposalPricing) {
  const base = pricing.basePrice || 0;
  const apa = Math.round(base * (pricing.apaPercentage || 0) / 100);
  const extrasSum = (pricing.extras || []).reduce((s, e) => s + (e.amount || 0), 0);
  const discount = pricing.discountAmount || 0;
  const charterFee = base - discount + extrasSum;
  const grandTotal = charterFee + apa + (pricing.securityDeposit || 0);
  return { base, apa, extrasSum, discount, charterFee, grandTotal };
}

export function proposalRef(id: string) {
  return `PROP-${id.slice(0, 8).toUpperCase()}`;
}

export async function createProposal(
  data: Omit<Proposal, 'id' | 'token' | 'createdAt' | 'sentAt' | 'viewedAt' | 'comments'>
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    token: generateToken(),
    status: 'draft',
    comments: [],
    createdAt: serverTimestamp(),
    sentAt: null,
    viewedAt: null,
  });
  return ref.id;
}

export async function getProposals(): Promise<Proposal[]> {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Proposal));
}

export async function getProposalById(id: string): Promise<Proposal | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Proposal;
}

export async function getProposalsByCharterId(charterId: string): Promise<Proposal[]> {
  const q = query(collection(db, COLLECTION), where('charterId', '==', charterId));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Proposal));
}

export async function getProposalByToken(token: string): Promise<Proposal | null> {
  const q = query(collection(db, COLLECTION), where('token', '==', token));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Proposal;
}

export async function updateProposal(
  id: string,
  data: Partial<Omit<Proposal, 'id'>>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), data as Record<string, unknown>);
}

export async function deleteProposal(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function markProposalSent(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    status: 'sent',
    sentAt: serverTimestamp(),
  });
}

export async function markProposalViewed(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    status: 'viewed',
    viewedAt: serverTimestamp(),
  });
}

export async function addProposalComment(
  id: string,
  comment: Omit<ProposalComment, 'id' | 'createdAt'>,
  currentStatus: ProposalStatus
): Promise<void> {
  const newComment: ProposalComment = {
    ...comment,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  const updates: Record<string, unknown> = { comments: arrayUnion(newComment) };
  if (!comment.isAdmin && currentStatus !== 'approved' && currentStatus !== 'rejected') {
    updates.status = 'commented';
  }
  await updateDoc(doc(db, COLLECTION, id), updates);
}

export async function approveProposal(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { status: 'approved' });
}

export async function rejectProposal(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { status: 'rejected' });
}
