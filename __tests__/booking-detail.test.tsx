import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ── Firebase (db/storage singletons) ────────────────────────────────────────
jest.mock('../lib/firebase', () => ({ db: {}, storage: {} }));

// ── Firebase Storage ────────────────────────────────────────────────────────
const mockRef = jest.fn().mockReturnValue({ name: 'mock-ref' });
const mockUploadBytes = jest.fn().mockResolvedValue(undefined);
const mockGetDownloadURL = jest.fn().mockResolvedValue('https://storage.example.com/contract.pdf');
const mockDeleteObject = jest.fn().mockResolvedValue(undefined);
jest.mock('firebase/storage', () => ({
  ref: (...args: unknown[]) => mockRef(...args),
  uploadBytes: (...args: unknown[]) => mockUploadBytes(...args),
  getDownloadURL: (...args: unknown[]) => mockGetDownloadURL(...args),
  deleteObject: (...args: unknown[]) => mockDeleteObject(...args),
}));

// ── lib/availability ────────────────────────────────────────────────────────
jest.mock('../lib/availability', () => ({
  getCharterById: jest.fn(),
  updateCharter: jest.fn().mockResolvedValue(undefined),
  deleteCharter: jest.fn().mockResolvedValue(undefined),
  addBookingNote: jest.fn(),
  addBookingDocument: jest.fn(),
  deleteBookingDocument: jest.fn().mockResolvedValue(undefined),
  getChartersWithProposals: jest.fn(),
  calcTotals: jest.fn().mockReturnValue({ grandTotal: 1000 }),
  proposalRef: jest.fn().mockReturnValue('CS-TEST'),
  CHARTER_STATUS_LABEL: {
    web_request: 'Web Request',
    confirmed: 'Confirmed',
    signed: 'Signed',
    canceled: 'Canceled',
  },
}));

// ── lib/clientSpace ─────────────────────────────────────────────────────────
jest.mock('../lib/clientSpace', () => ({
  initClientSpace: jest.fn().mockResolvedValue('generated-token'),
}));

// ── marinas-data ────────────────────────────────────────────────────────────
jest.mock('../app/marinas-data', () => ({
  getMarinaById: (id: string) => (id ? { id, name: `Marina ${id}` } : undefined),
}));

// ── AdminAuthContext (logged-in admin) ──────────────────────────────────────
jest.mock('../app/admin/AdminAuthContext', () => ({
  useAdminAuth: () => ({
    authed: true,
    currentUser: { username: 'admin' },
    allowedPages: ['/admin'],
    isSuperAdmin: true,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

// Import components AFTER mocks
import BookingDetailClient from '../app/admin/bookings/[id]/BookingDetailClient';
import ProposalsClient from '../app/admin/proposals/ProposalsClient';
import {
  getCharterById,
  addBookingNote,
  addBookingDocument,
  deleteBookingDocument,
  getChartersWithProposals,
} from '../lib/availability';

const BASE_CHARTER = {
  id: 'charter-1',
  status: 'confirmed',
  startDate: '2026-08-01',
  endDate: '2026-08-08',
  name: 'Jane Skipper',
  email: 'jane@example.com',
  phone: '+30 123 456',
  passengers: 6,
  boat: 'BlueOne',
  embarkationPoint: 'Athens',
  selectedTheme: 'Island Hopping',
  holidayDescription: 'A relaxed week around the Cyclades.',
  note: 'VIP client',
  createdAt: null,
  documents: [],
  activityNotes: [],
};

beforeEach(() => {
  jest.clearAllMocks();
  (getCharterById as jest.Mock).mockResolvedValue({ ...BASE_CHARTER });
  (getChartersWithProposals as jest.Mock).mockResolvedValue([]);
});

describe('BookingDetailClient', () => {
  test('loads and renders a charter by id with all overview fields', async () => {
    render(<BookingDetailClient id="charter-1" />);

    expect(await screen.findByText('Jane Skipper')).toBeInTheDocument();
    expect(getCharterById).toHaveBeenCalledWith('charter-1');
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('+30 123 456')).toBeInTheDocument();
    expect(screen.getByText('2026-08-01 → 2026-08-08')).toBeInTheDocument();
    expect(screen.getByText('BlueOne')).toBeInTheDocument();
    expect(screen.getByText('Island Hopping')).toBeInTheDocument();
    expect(screen.getByText(/A relaxed week around the Cyclades/)).toBeInTheDocument();
  });

  test('shows a not-found message when the charter does not exist', async () => {
    (getCharterById as jest.Mock).mockResolvedValue(null);
    render(<BookingDetailClient id="missing" />);
    expect(await screen.findByText('Booking not found.')).toBeInTheDocument();
  });

  test('uploads a document: uploadBytes → getDownloadURL → addBookingDocument', async () => {
    (addBookingDocument as jest.Mock).mockResolvedValue({
      id: 'doc-new',
      name: 'contract.pdf',
      url: 'https://storage.example.com/contract.pdf',
      path: 'bookingDocuments/charter-1/contract.pdf',
      size: 1234,
      contentType: 'application/pdf',
      uploadedAt: '2026-07-20T10:00:00.000Z',
      uploadedBy: 'admin',
    });

    const { container } = render(<BookingDetailClient id="charter-1" />);
    await screen.findByText('Jane Skipper');

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['%PDF-1.4'], 'contract.pdf', { type: 'application/pdf' });
    await userEvent.upload(input, file);

    await waitFor(() => expect(addBookingDocument).toHaveBeenCalled());

    expect(mockUploadBytes).toHaveBeenCalled();
    expect(mockGetDownloadURL).toHaveBeenCalled();
    // ordering: upload happens before fetching the URL
    expect(mockUploadBytes.mock.invocationCallOrder[0])
      .toBeLessThan(mockGetDownloadURL.mock.invocationCallOrder[0]);

    expect(addBookingDocument).toHaveBeenCalledWith(
      'charter-1',
      expect.objectContaining({
        name: 'contract.pdf',
        url: 'https://storage.example.com/contract.pdf',
        uploadedBy: 'admin',
        contentType: 'application/pdf',
      })
    );
    expect(await screen.findByText('contract.pdf')).toBeInTheDocument();
  });

  test('deletes a document: deleteObject + deleteBookingDocument, row removed', async () => {
    (getCharterById as jest.Mock).mockResolvedValue({
      ...BASE_CHARTER,
      documents: [{
        id: 'doc-1',
        name: 'passport.jpg',
        url: 'https://storage.example.com/passport.jpg',
        path: 'bookingDocuments/charter-1/passport.jpg',
        uploadedAt: '2026-07-19T09:00:00.000Z',
        uploadedBy: 'admin',
      }],
    });
    jest.spyOn(window, 'confirm').mockReturnValue(true);

    render(<BookingDetailClient id="charter-1" />);
    expect(await screen.findByText('passport.jpg')).toBeInTheDocument();

    fireEvent.click(screen.getByTitle('Delete document'));

    await waitFor(() => expect(deleteBookingDocument).toHaveBeenCalled());
    expect(mockDeleteObject).toHaveBeenCalled();
    expect(deleteBookingDocument).toHaveBeenCalledWith(
      'charter-1',
      expect.objectContaining({ id: 'doc-1', path: 'bookingDocuments/charter-1/passport.jpg' })
    );
    await waitFor(() => expect(screen.queryByText('passport.jpg')).not.toBeInTheDocument());
  });

  test('adds a note stamped with the admin username, shown immediately', async () => {
    (addBookingNote as jest.Mock).mockResolvedValue({
      id: 'note-1',
      author: 'admin',
      text: 'Called the client to confirm.',
      createdAt: '2026-07-20T12:00:00.000Z',
    });

    render(<BookingDetailClient id="charter-1" />);
    await screen.findByText('Jane Skipper');

    fireEvent.change(screen.getByPlaceholderText('Add a note about this booking…'), {
      target: { value: 'Called the client to confirm.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add note' }));

    await waitFor(() => expect(addBookingNote).toHaveBeenCalled());
    expect(addBookingNote).toHaveBeenCalledWith(
      'charter-1',
      { author: 'admin', text: 'Called the client to confirm.' }
    );
    expect(await screen.findByText('Called the client to confirm.')).toBeInTheDocument();
  });

  test('links to the client space when a token exists', async () => {
    (getCharterById as jest.Mock).mockResolvedValue({
      ...BASE_CHARTER,
      clientSpaceToken: 'space-1',
    });

    render(<BookingDetailClient id="charter-1" />);
    await screen.findByText('Jane Skipper');

    const link = screen.getByRole('link', { name: /Open Client Space/ });
    expect(link).toHaveAttribute('href', '/client-space/space-1');
  });
});

describe('List view links to the booking detail page', () => {
  test('ProposalsClient renders a "View Details" link to /admin/bookings/{id}', async () => {
    (getChartersWithProposals as jest.Mock).mockResolvedValue([{
      ...BASE_CHARTER,
      proposal: {
        status: 'sent',
        token: 'tok-1',
        expiresAt: '2026-09-01T00:00:00.000Z',
        pricing: {},
        comments: [],
      },
    }]);

    render(<ProposalsClient />);

    const link = await screen.findByRole('link', { name: 'View Details' });
    expect(link).toHaveAttribute('href', '/admin/bookings/charter-1');
  });
});
