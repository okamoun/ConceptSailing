import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

// ── Firebase singletons ──────────────────────────────────────────────────────
jest.mock('../lib/firebase', () => ({ db: {}, storage: {} }));

// ── Heavy map children (dynamic, Google-Maps-backed) — stub them out ─────────
jest.mock('../app/admin/booking-summary/BookingMapClient', () => ({
  __esModule: true,
  default: () => <div data-testid="booking-map" />,
}));
jest.mock('../app/admin/booking-summary/DetailMapClient', () => ({
  __esModule: true,
  default: () => <div data-testid="detail-map" />,
}));

// ── lib/availability ─────────────────────────────────────────────────────────
const mockGetAllCharters = jest.fn();
jest.mock('../lib/availability', () => ({
  getAllCharters: (...args: unknown[]) => mockGetAllCharters(...args),
  updateCharter: jest.fn().mockResolvedValue(undefined),
  isPubliclyAvailable: (s: string) => s === 'web_request' || s === 'canceled',
  CHARTER_STATUS_LABEL: {
    web_request: 'Web Request',
    broker_request: 'Broker Request',
    serious_request: 'Serious Request',
    proposal_sent: 'Proposal Sent',
    confirmed: 'Confirmed',
    signed: 'Signed',
    canceled: 'Canceled',
    owner_use: 'Owner Use',
    maintenance: 'Maintenance',
  },
  CHARTER_STATUS_PRIORITY: {
    signed: 8, confirmed: 7, owner_use: 6, maintenance: 5, proposal_sent: 4,
    serious_request: 3, broker_request: 2, web_request: 1, canceled: 0,
  },
}));

import BookingSummaryClient from '../app/admin/booking-summary/BookingSummaryClient';

const charter = (id: string, status: string) => ({
  id,
  name: `Client ${id}`,
  email: `${id}@example.com`,
  startDate: '2026-07-01',
  endDate: '2026-07-08',
  status,
  createdAt: null,
});

describe('Booking Summary default status filter', () => {
  beforeEach(() => {
    mockGetAllCharters.mockResolvedValue([
      charter('web', 'web_request'),
      charter('canceled', 'canceled'),
      charter('confirmed', 'confirmed'),
    ]);
  });

  test('includes web_request and canceled by default (does not hide new web leads)', async () => {
    render(<BookingSummaryClient />);

    // Wait for the async load to populate the status filter chips.
    const webChip = await screen.findByRole('button', { name: /Web Request/ });
    const canceledChip = screen.getByRole('button', { name: /Canceled/ });

    // Active ("on") chips render a ✓ marker; hidden statuses do not.
    expect(webChip.textContent).toContain('✓');
    expect(canceledChip.textContent).toContain('✓');
  });

  test('shows all bookings — none hidden by the default filter', async () => {
    render(<BookingSummaryClient />);
    await waitFor(() =>
      expect(screen.getByText(/Showing 3 of 3 bookings/)).toBeInTheDocument()
    );
  });
});
