// Mock Firebase so the module can be imported without a real Firestore connection.
// calcTotals, proposalRef, and the constants are pure functions that don't touch Firestore.
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
  proposalRef,
  DEFAULT_PAYMENT_TERMS,
  DEFAULT_PRICING,
  type ProposalPricing,
} from '../lib/availability';

// ---------------------------------------------------------------------------
// calcTotals
// ---------------------------------------------------------------------------

describe('calcTotals', () => {
  const base: ProposalPricing = {
    basePrice: 10000,
    currency: 'EUR',
    apaPercentage: 30,
    vatPercentage: 13,
    securityDeposit: 2000,
    discountAmount: 0,
    extras: [],
  };

  it('computes charter fee as base price when no discount or extras', () => {
    const { base: b, charterFee } = calcTotals(base);
    expect(b).toBe(10000);
    expect(charterFee).toBe(10000);
  });

  it('computes APA as a percentage of the charter fee', () => {
    const { apa } = calcTotals(base);
    expect(apa).toBe(3000); // 30% of 10 000
  });

  it('computes VAT as a percentage of the charter fee', () => {
    const { vat } = calcTotals(base);
    expect(vat).toBe(1300); // 13% of 10 000
  });

  it('includes APA, VAT and security deposit in the grand total', () => {
    const { grandTotal } = calcTotals(base);
    expect(grandTotal).toBe(16300); // 10 000 + 3 000 + 1 300 + 2 000
  });

  it('subtracts discount from the charter fee', () => {
    const { charterFee, discount } = calcTotals({ ...base, discountAmount: 1000 });
    expect(discount).toBe(1000);
    expect(charterFee).toBe(9000);
  });

  it('adds extras to the charter fee', () => {
    const { charterFee, extrasSum } = calcTotals({
      ...base,
      extras: [
        { label: 'Skipper', amount: 500 },
        { label: 'Chef', amount: 300 },
      ],
    });
    expect(extrasSum).toBe(800);
    expect(charterFee).toBe(10800);
  });

  it('combines discount and extras correctly', () => {
    const { charterFee } = calcTotals({
      ...base,
      discountAmount: 500,
      extras: [{ label: 'Transfer', amount: 200 }],
    });
    expect(charterFee).toBe(9700); // 10 000 - 500 + 200
  });

  it('handles zero APA percentage', () => {
    const { apa, grandTotal } = calcTotals({ ...base, apaPercentage: 0 });
    expect(apa).toBe(0);
    expect(grandTotal).toBe(13300); // 10 000 + 0 + 1 300 + 2 000
  });

  it('handles zero VAT percentage', () => {
    const { vat, grandTotal } = calcTotals({ ...base, vatPercentage: 0 });
    expect(vat).toBe(0);
    expect(grandTotal).toBe(15000); // 10 000 + 3 000 + 0 + 2 000
  });

  it('handles all-zero pricing without errors', () => {
    const result = calcTotals({
      basePrice: 0,
      currency: 'EUR',
      apaPercentage: 0,
      vatPercentage: 0,
      securityDeposit: 0,
      discountAmount: 0,
      extras: [],
    });
    expect(result.base).toBe(0);
    expect(result.apa).toBe(0);
    expect(result.vat).toBe(0);
    expect(result.charterFee).toBe(0);
    expect(result.grandTotal).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// proposalRef
// ---------------------------------------------------------------------------

describe('proposalRef', () => {
  it('returns a PROP- prefixed reference', () => {
    expect(proposalRef('abc12345xyz')).toMatch(/^PROP-/);
  });

  it('uses the first 8 characters of the charter ID', () => {
    const ref = proposalRef('abcdefghijklmnop');
    expect(ref).toBe('PROP-ABCDEFGH');
  });

  it('uppercases the ID fragment', () => {
    const ref = proposalRef('lowercase');
    expect(ref).toBe(ref.toUpperCase().replace('PROP-', 'PROP-') );
    expect(ref).toBe('PROP-LOWERCAS');
  });

  it('handles a short ID', () => {
    const ref = proposalRef('abc');
    expect(ref).toBe('PROP-ABC');
  });
});

// ---------------------------------------------------------------------------
// DEFAULT_PAYMENT_TERMS
// ---------------------------------------------------------------------------

describe('DEFAULT_PAYMENT_TERMS', () => {
  it('contains exactly two terms', () => {
    expect(DEFAULT_PAYMENT_TERMS).toHaveLength(2);
  });

  it('first term is the deposit at 50%', () => {
    const deposit = DEFAULT_PAYMENT_TERMS[0];
    expect(deposit.percentage).toBe(50);
    expect(deposit.label.toLowerCase()).toContain('deposit');
  });

  it('second term is the balance at 50%', () => {
    const balance = DEFAULT_PAYMENT_TERMS[1];
    expect(balance.percentage).toBe(50);
    expect(balance.label.toLowerCase()).toContain('balance');
  });

  it('percentages sum to 100', () => {
    const total = DEFAULT_PAYMENT_TERMS.reduce((sum, t) => sum + t.percentage, 0);
    expect(total).toBe(100);
  });

  it('each term has a non-empty description', () => {
    DEFAULT_PAYMENT_TERMS.forEach(t => {
      expect(t.description.length).toBeGreaterThan(0);
    });
  });

  it('description references MYBA', () => {
    const allDescriptions = DEFAULT_PAYMENT_TERMS.map(t => t.description).join(' ');
    expect(allDescriptions).toMatch(/MYBA/i);
  });
});

// ---------------------------------------------------------------------------
// DEFAULT_PRICING
// ---------------------------------------------------------------------------

describe('DEFAULT_PRICING', () => {
  it('starts with a base price of zero', () => {
    expect(DEFAULT_PRICING.basePrice).toBe(0);
  });

  it('uses EUR as the default currency', () => {
    expect(DEFAULT_PRICING.currency).toBe('EUR');
  });

  it('sets APA to 25% by default', () => {
    expect(DEFAULT_PRICING.apaPercentage).toBe(25);
  });

  it('sets VAT to 13% by default', () => {
    expect(DEFAULT_PRICING.vatPercentage).toBe(13);
  });

  it('has an empty extras array', () => {
    expect(DEFAULT_PRICING.extras).toEqual([]);
  });
});
