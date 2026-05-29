import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  arrayUnion,
  where,
  query,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// ---------------------------------------------------------------------------
// Charter status
// ---------------------------------------------------------------------------

export type CharterStatus =
  | 'web_request'
  | 'broker_request'
  | 'serious_request'
  | 'confirmed'
  | 'signed'
  | 'canceled'
  | 'owner_use'
  | 'maintenance';

export const CHARTER_STATUS_PRIORITY: Record<CharterStatus, number> = {
  signed:          8,
  confirmed:       7,
  owner_use:       6,
  maintenance:     5,
  serious_request: 4,
  broker_request:  3,
  web_request:     2,
  canceled:        1,
};

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

// External (public) view: web_request and canceled appear as available
export function isPubliclyAvailable(status: CharterStatus): boolean {
  return status === 'web_request' || status === 'canceled';
}

// ---------------------------------------------------------------------------
// Proposal types (stored as a sub-object on each Charter document)
// ---------------------------------------------------------------------------

export type ProposalStatus = 'draft' | 'sent' | 'viewed' | 'commented' | 'approved' | 'rejected';

export interface PricingExtra {
  label: string;
  amount: number;
}

export interface ProposalPricing {
  basePrice: number;
  currency: string;
  apaPercentage: number;
  vatPercentage: number;
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

export interface ProposalData {
  token: string;
  status: ProposalStatus;
  pricing: ProposalPricing;
  paymentTerms: PaymentTerm[];
  specialConditions?: string;
  adminNotes?: string;
  comments: ProposalComment[];
  expiresAt: string;
  sentAt: Timestamp | null;
  viewedAt: Timestamp | null;
}

// MYBA standard payment schedule (editable per charter)
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

export const DEFAULT_PRICING: ProposalPricing = {
  basePrice: 0,
  currency: 'EUR',
  apaPercentage: 30,
  vatPercentage: 13,
  securityDeposit: 2000,
  discountAmount: 0,
  extras: [],
};

export function calcTotals(pricing: ProposalPricing) {
  const base = pricing.basePrice || 0;
  const apa = Math.round(base * (pricing.apaPercentage || 0) / 100);
  const extrasSum = (pricing.extras || []).reduce((s, e) => s + (e.amount || 0), 0);
  const discount = pricing.discountAmount || 0;
  const charterFee = base - discount + extrasSum;
  const vat = Math.round(charterFee * (pricing.vatPercentage ?? 13) / 100);
  const grandTotal = charterFee + vat + apa + (pricing.securityDeposit || 0);
  return { base, apa, extrasSum, discount, charterFee, vat, grandTotal };
}

export function proposalRef(charterId: string): string {
  return `PROP-${charterId.slice(0, 8).toUpperCase()}`;
}

function defaultExpiresAt(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split('T')[0];
}

function generateToken(): string {
  const bytes = new Array(16);
  for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ---------------------------------------------------------------------------
// Charter interface
// ---------------------------------------------------------------------------

export interface Charter {
  id: string;
  status: CharterStatus;
  startDate: string; // 'YYYY-MM-DD'
  endDate: string;   // 'YYYY-MM-DD'
  // Client info (optional for owner_use / maintenance)
  name?: string;
  email?: string;
  phone?: string;
  passengers?: number;
  boat?: string;
  // Location
  embarkationPoint?: string;  // free-text from web form
  deliveryPoint?: string;     // marina id
  redeliveryPoint?: string;   // marina id
  // Content
  selectedTheme?: string;
  holidayDescription?: string;
  note?: string;
  // Financials (optional — override computed season rates)
  contractValue?: number;      // agreed charter fee in €; if set, used directly instead of rate × weeks
  brokerCommission?: number;   // broker fee % of contractValue, for reference
  apaAmount?: number;          // actual APA collected from client in €; overrides apaPercent default
  relocationAmount?: number;   // actual relocation fee in €; overrides config default
  createdAt: Timestamp | null;
  // Proposal sub-object (present once a proposal is created for this charter)
  proposal?: ProposalData;
}

// ---------------------------------------------------------------------------
// Charter CRUD
// ---------------------------------------------------------------------------

const COLLECTION = 'availability';

export async function createCharter(
  data: Omit<Charter, 'id' | 'createdAt'>
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getAllCharters(): Promise<Charter[]> {
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as Charter))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export async function getCharterById(id: string): Promise<Charter | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Charter;
}

export async function updateCharter(
  id: string,
  data: Partial<Omit<Charter, 'id' | 'createdAt'>>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), data as Record<string, unknown>);
}

export async function deleteCharter(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

// ---------------------------------------------------------------------------
// Proposal operations (all write to the charter's `proposal` sub-object)
// ---------------------------------------------------------------------------

// Initialise a proposal on a charter that doesn't have one yet.
// Generates a unique token and sets status to 'draft'.
export async function initCharterProposal(charterId: string): Promise<string> {
  const token = generateToken();
  await updateDoc(doc(db, COLLECTION, charterId), {
    proposal: {
      token,
      status: 'draft',
      pricing: DEFAULT_PRICING,
      paymentTerms: DEFAULT_PAYMENT_TERMS,
      comments: [],
      expiresAt: defaultExpiresAt(),
      sentAt: null,
      viewedAt: null,
    } satisfies ProposalData,
  });
  return token;
}

// Partial update of the proposal sub-object using dot-notation so other
// charter fields are not overwritten.
export async function updateCharterProposal(
  charterId: string,
  data: Partial<Omit<ProposalData, 'token' | 'comments' | 'sentAt' | 'viewedAt'>>
): Promise<void> {
  const updates: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    updates[`proposal.${k}`] = v;
  }
  await updateDoc(doc(db, COLLECTION, charterId), updates);
}

export async function getCharterByProposalToken(token: string): Promise<Charter | null> {
  const q = query(collection(db, COLLECTION), where('proposal.token', '==', token));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Charter;
}

// Returns all charters that have a proposal sub-object.
export async function getChartersWithProposals(): Promise<Charter[]> {
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as Charter))
    .filter(c => c.proposal != null)
    .sort((a, b) => {
      // Most recently created first (fallback to startDate)
      const at = a.createdAt?.toMillis?.() ?? 0;
      const bt = b.createdAt?.toMillis?.() ?? 0;
      return bt - at;
    });
}

export async function markCharterProposalSent(charterId: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, charterId), {
    'proposal.status': 'sent',
    'proposal.sentAt': serverTimestamp(),
  });
}

export async function markCharterProposalViewed(charterId: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, charterId), {
    'proposal.status': 'viewed',
    'proposal.viewedAt': serverTimestamp(),
  });
}

export async function addCharterProposalComment(
  charterId: string,
  comment: Omit<ProposalComment, 'id' | 'createdAt'>,
  currentStatus: ProposalStatus
): Promise<void> {
  const newComment: ProposalComment = {
    ...comment,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  const updates: Record<string, unknown> = {
    'proposal.comments': arrayUnion(newComment),
  };
  if (!comment.isAdmin && currentStatus !== 'approved' && currentStatus !== 'rejected') {
    updates['proposal.status'] = 'commented';
  }
  await updateDoc(doc(db, COLLECTION, charterId), updates);
}

export async function approveCharterProposal(charterId: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, charterId), { 'proposal.status': 'approved' });
}

export async function rejectCharterProposal(charterId: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, charterId), { 'proposal.status': 'rejected' });
}
