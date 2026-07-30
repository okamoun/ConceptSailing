// Acceptance test for GitHub issue #120 — "Improve proposal", requirement 1:
//   1. Add delivery and redelivery costs mentioning the ports.
//
// The proposal shown to the client must surface the delivery and redelivery
// costs and make clear which port each relates to (the embarkation port for
// delivery, the disembarkation port for redelivery).
//
// Written test-first: the current ProposalClient renders no delivery/redelivery
// cost lines, so these expectations FAIL until the feature is implemented — that
// failure is the check that the issue is still open.
//
// Assumed data shape (adapt the implementation to satisfy the behaviour, not the
// exact field names): the proposal pricing carries a delivery cost and a
// redelivery cost, and the pricing breakdown renders one row per leg whose
// label references the corresponding port.

jest.mock('../lib/availability', () => ({
  getCharterByProposalToken: jest.fn(),
  markCharterProposalViewed: jest.fn().mockResolvedValue(undefined),
  addCharterProposalComment: jest.fn().mockResolvedValue(undefined),
  approveCharterProposal: jest.fn().mockResolvedValue(undefined),
  rejectCharterProposal: jest.fn().mockResolvedValue(undefined),
  calcTotals: jest.fn().mockReturnValue({
    base: 10000, apa: 2500, vat: 1300, extrasSum: 1400,
    discount: 0, charterFee: 11400, grandTotal: 17200,
    delivery: 800, redelivery: 600,
  }),
  proposalRef: jest.fn().mockReturnValue('PROP-CHARTER1'),
}));

jest.mock('../app/marinas-data', () => ({
  // Map the marina ids used below to human-readable port names.
  getMarinaById: jest.fn((id: string) => {
    const names: Record<string, string> = {
      mykonos: 'Mykonos Marina',
      santorini: 'Santorini Marina',
    };
    return names[id] ? { id, name: names[id] } : null;
  }),
}));

jest.mock('../app/config/contact', () => ({
  CONTACT: {
    email: 'contact@test.com',
    phone: { formatted: '+33 6 00 00 00 00' },
    company: { name: 'Test Co' },
  },
}));

import React from 'react';
import { render, screen } from '@testing-library/react';
import ProposalClient from '../app/proposal/[token]/ProposalClient';
import { getCharterByProposalToken } from '../lib/availability';

const mockGet = getCharterByProposalToken as jest.MockedFunction<typeof getCharterByProposalToken>;

// A charter whose delivery and redelivery happen at two different ports, each
// with its own cost.
const CHARTER = {
  id: 'charter-123',
  status: 'confirmed' as const,
  startDate: '2026-07-01',
  endDate: '2026-07-08',
  name: 'Jean Dupont',
  email: 'jean@example.com',
  phone: '+33 6 12 34 56 78',
  boat: 'BlueOne — Fountaine Pajot Aura 51',
  passengers: 4,
  deliveryPoint: 'mykonos',
  redeliveryPoint: 'santorini',
  createdAt: null,
  proposal: {
    token: 'abc123def456',
    status: 'sent' as const,
    pricing: {
      basePrice: 10000,
      currency: 'EUR',
      apaPercentage: 25,
      vatPercentage: 13,
      securityDeposit: 2000,
      discountPercentage: 0,
      extras: [],
      // Proposed fields carrying the per-leg relocation costs.
      deliveryFee: 800,
      redeliveryFee: 600,
    },
    paymentTerms: [
      { label: 'Deposit — 50%', percentage: 50, description: '50% due on signing of MYBA.' },
      { label: 'Balance — 50%', percentage: 50, description: '50% due 28 days before.' },
    ],
    comments: [],
    expiresAt: '2026-06-01',
    sentAt: null,
    viewedAt: null,
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  window.print = jest.fn();
});

describe('issue #120.1 — proposal shows delivery & redelivery costs with their ports', () => {
  it('renders a delivery cost line referencing the delivery port', async () => {
    mockGet.mockResolvedValue(CHARTER);
    const { container } = render(<ProposalClient token="abc123def456" />);
    await screen.findByText('Jean Dupont');

    const text = container.textContent ?? '';
    expect(text).toMatch(/delivery/i);
    expect(text).toContain('Mykonos');
    // The delivery cost (800) is displayed.
    expect(text).toMatch(/800/);
  });

  it('renders a redelivery cost line referencing the redelivery port', async () => {
    mockGet.mockResolvedValue(CHARTER);
    const { container } = render(<ProposalClient token="abc123def456" />);
    await screen.findByText('Jean Dupont');

    const text = container.textContent ?? '';
    expect(text).toMatch(/redelivery/i);
    expect(text).toContain('Santorini');
    // The redelivery cost (600) is displayed.
    expect(text).toMatch(/600/);
  });
});
