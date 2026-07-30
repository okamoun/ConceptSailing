// Acceptance tests for GitHub issue #120 — "Improve proposal".
//
// This file encodes the pricing/inclusions requirements of the issue as
// executable checks against the pure helpers in lib/availability. They are
// written test-first: until the corresponding fixes land they FAIL, which is
// exactly how they "check the issue".
//
// Issue #120 requirements covered here:
//   2. The APA should be a percentage of the base charter fee BEFORE discount.
//   3. Remove fuel from the list of included items.
//
// (Requirement 1 — delivery/redelivery costs mentioning the ports — is a
//  display concern and is covered in proposal-issue-120-delivery.test.tsx.)

// Mock Firebase so lib/availability can be imported without a real Firestore
// connection. calcTotals and DEFAULT_INCLUSIONS are pure and never touch it.
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  addDoc: jest.fn(),
  deleteDoc: jest.fn(),
  serverTimestamp: jest.fn(),
  arrayUnion: jest.fn(),
  where: jest.fn(),
  query: jest.fn(),
}));
jest.mock('../lib/firebase', () => ({ db: {} }));

import {
  calcTotals,
  DEFAULT_INCLUSIONS,
  type ProposalPricing,
} from '../lib/availability';

// ---------------------------------------------------------------------------
// Issue #120.2 — APA is a percentage of the base charter fee, before discount
// ---------------------------------------------------------------------------

describe('issue #120.2 — APA is computed on the base fee before discount', () => {
  const pricing: ProposalPricing = {
    basePrice: 10000,
    currency: 'EUR',
    apaPercentage: 25,
    vatPercentage: 13,
    securityDeposit: 2000,
    discountPercentage: 10, // 10% discount → charter fee of 9 000
    extras: [],
  };

  it('bases APA on the pre-discount base price, not the discounted charter fee', () => {
    const { apa } = calcTotals(pricing);
    // 25% of the 10 000 base — NOT 25% of the 9 000 discounted charter fee (2 250).
    expect(apa).toBe(2500);
  });

  it('leaves APA unchanged when a discount is applied', () => {
    const withoutDiscount = calcTotals({ ...pricing, discountPercentage: 0 });
    const withDiscount = calcTotals(pricing);
    expect(withDiscount.apa).toBe(withoutDiscount.apa);
  });

  it('still subtracts the discount from the charter fee itself', () => {
    // The discount must keep affecting the charter fee — only APA changes basis.
    const { charterFee, discount } = calcTotals(pricing);
    expect(discount).toBe(1000);
    expect(charterFee).toBe(9000);
  });

  it('reflects the pre-discount APA in the grand total', () => {
    // grand total = charterFee(9 000) + apa(2 500) + vat(13% of 9 000 = 1 170)
    //             + securityDeposit(2 000) = 14 670
    const { grandTotal } = calcTotals(pricing);
    expect(grandTotal).toBe(14670);
  });
});

// ---------------------------------------------------------------------------
// Issue #120.3 — Remove fuel from the list of included items
// ---------------------------------------------------------------------------

describe('issue #120.3 — fuel is not listed as an included item', () => {
  it('DEFAULT_INCLUSIONS contains no fuel entry', () => {
    const fuelEntries = DEFAULT_INCLUSIONS.filter(item => /fuel/i.test(item));
    expect(fuelEntries).toEqual([]);
  });

  it('still lists the other standard inclusions', () => {
    // Sanity check that removing fuel does not empty the list.
    expect(DEFAULT_INCLUSIONS.length).toBeGreaterThan(0);
    expect(DEFAULT_INCLUSIONS.some(i => /skipper|crew/i.test(i))).toBe(true);
  });
});
