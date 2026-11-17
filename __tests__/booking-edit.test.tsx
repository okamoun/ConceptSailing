import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

jest.mock('../lib/firebase', () => ({ db: {}, storage: {} }));

const DELETE_SENTINEL = { __delete: true };
jest.mock('firebase/firestore', () => ({
  deleteField: () => DELETE_SENTINEL,
}));

jest.mock('../lib/availability', () => ({
  getCharterById: jest.fn(),
  updateCharter: jest.fn().mockResolvedValue(undefined),
  proposalRef: jest.fn().mockReturnValue('PROP-TEST'),
  CHARTER_STATUS_LABEL: {
    web_request: 'Web Request',
    confirmed: 'Confirmed',
    signed: 'Signed',
  },
}));

jest.mock('../app/marinas-data', () => ({
  marinasByRegion: () => ({
    Attica: [
      { id: 'nea-peramos', name: 'Nea Peramos Marina' },
      { id: 'alimos', name: 'Alimos Marina' },
    ],
  }),
  getMarinaById: (id: string) =>
    ['nea-peramos', 'alimos'].includes(id) ? { id, name: id } : undefined,
}));

jest.mock('../app/adventures-data', () => ({
  __esModule: true,
  default: [{ id: '1', name: 'Gastronomy' }],
}));

import BookingEditClient from '../app/admin/bookings/[id]/edit/BookingEditClient';
import { getCharterById, updateCharter } from '../lib/availability';

const CHARTER = {
  id: 'charter-1',
  status: 'confirmed',
  startDate: '2026-08-01',
  endDate: '2026-08-08',
  name: 'Jane Skipper',
  email: 'jane@example.com',
  phone: '+30 123 456',
  passengers: 6,
  boat: 'BlueOne',
  deliveryPoint: 'nea-peramos',
  note: 'VIP',
  contractValue: 20000,
  createdAt: null,
};

beforeEach(() => {
  jest.clearAllMocks();
  (getCharterById as jest.Mock).mockResolvedValue({ ...CHARTER });
});

async function renderLoaded() {
  render(<BookingEditClient id="charter-1" />);
  await screen.findByText('Edit request & booking');
}

test('pre-fills every field from the booking', async () => {
  await renderLoaded();
  expect(screen.getByLabelText('Name')).toHaveValue('Jane Skipper');
  expect(screen.getByLabelText('Email')).toHaveValue('jane@example.com');
  expect(screen.getByLabelText('Passengers')).toHaveValue(6);
  expect(screen.getByLabelText('Start date *')).toHaveValue('2026-08-01');
  expect(screen.getByLabelText('Delivery marina')).toHaveValue('nea-peramos');
  expect(screen.getByLabelText('Contract value (€)')).toHaveValue(20000);
  expect(screen.getByLabelText('Status')).toHaveValue('confirmed');
  expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
});

test('saves only changed fields and clears emptied ones', async () => {
  await renderLoaded();
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Jane Doe' } });
  fireEvent.change(screen.getByLabelText('Internal note'), { target: { value: '' } });
  fireEvent.change(screen.getByLabelText('Passengers'), { target: { value: '8' } });
  fireEvent.change(screen.getByLabelText('Redelivery marina'), { target: { value: 'alimos' } });
  expect(screen.getByText(/Unsaved changes \(4 fields\)/)).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  await waitFor(() => expect(updateCharter).toHaveBeenCalledTimes(1));
  expect(updateCharter).toHaveBeenCalledWith('charter-1', {
    name: 'Jane Doe',
    note: DELETE_SENTINEL,
    passengers: 8,
    redeliveryPoint: 'alimos',
  });
  expect(await screen.findByText(/Saved at/)).toBeInTheDocument();
});

test('blocks saving when the end date is before the start date', async () => {
  await renderLoaded();
  fireEvent.change(screen.getByLabelText('End date *'), { target: { value: '2026-07-01' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(await screen.findByText('End date must be on or after the start date.')).toBeInTheDocument();
  expect(updateCharter).not.toHaveBeenCalled();
});

test('shows not found for a missing booking', async () => {
  (getCharterById as jest.Mock).mockResolvedValue(null);
  render(<BookingEditClient id="missing" />);
  expect(await screen.findByText('Booking not found.')).toBeInTheDocument();
});
