import { readFileSync } from 'fs';
import { join } from 'path';

// lib/availability pulls in the Firebase SDK at import time — stub it so the
// test can read CHARTER_STATUS_LABEL (the canonical status list) without booting
// a real Firebase app.
jest.mock('../lib/firebase', () => ({ db: {}, storage: {} }));
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  addDoc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  serverTimestamp: jest.fn(),
  arrayUnion: jest.fn(),
  arrayRemove: jest.fn(),
  where: jest.fn(),
  query: jest.fn(),
  Timestamp: {},
}));

import { STATUS_BADGE, STATUS_BADGE_FALLBACK } from '../lib/charterStatusStyles';
import { CHARTER_STATUS_LABEL, type CharterStatus } from '../lib/availability';

const ALL_STATUSES = Object.keys(CHARTER_STATUS_LABEL) as CharterStatus[];

describe('STATUS_BADGE (shared charter status styles)', () => {
  test('has an entry for every CharterStatus', () => {
    for (const status of ALL_STATUSES) {
      expect(STATUS_BADGE[status]).toBeTruthy();
      expect(typeof STATUS_BADGE[status]).toBe('string');
    }
    // No extra keys beyond the known statuses.
    expect(Object.keys(STATUS_BADGE).sort()).toEqual([...ALL_STATUSES].sort());
  });

  test('exposes a fallback class for unknown statuses', () => {
    expect(STATUS_BADGE_FALLBACK).toBeTruthy();
  });
});

describe('status badges are sourced from the single shared module (no re-duplication)', () => {
  const root = join(__dirname, '..');
  const consumers = [
    'app/admin/AdminDashboardClient.tsx',
    'app/admin/availability/AvailabilityAdminClient.tsx',
    'app/admin/booking-summary/BookingSummaryClient.tsx',
    'app/admin/reconcile/ReconcileClient.tsx',
  ];

  test.each(consumers)('%s imports STATUS_BADGE from charterStatusStyles', (file) => {
    const src = readFileSync(join(root, file), 'utf8');
    expect(src).toMatch(/charterStatusStyles/);
  });

  test.each(consumers)('%s does not re-declare a local STATUS_BADGE map', (file) => {
    const src = readFileSync(join(root, file), 'utf8');
    // Guards against a screen re-introducing its own (drift-prone) copy.
    expect(src).not.toMatch(/const\s+STATUS_BADGE(_CLS)?\s*:\s*Record<CharterStatus/);
  });
});
