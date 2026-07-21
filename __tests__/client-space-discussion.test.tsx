import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

// ---------------------------------------------------------------------------
// Mock Next.js modules
// ---------------------------------------------------------------------------
jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({ push: jest.fn() }),
  useSearchParams: jest.fn().mockReturnValue({ get: jest.fn() }),
  usePathname: jest.fn().mockReturnValue('/client-space/test-token'),
}));

jest.mock('next/image', () =>
  function MockImage({ src, alt, ...rest }: { src: string; alt: string; [key: string]: unknown }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...rest} />;
  }
);

// ---------------------------------------------------------------------------
// Mock Firebase + storage
// ---------------------------------------------------------------------------
jest.mock('../lib/firebase', () => ({ db: {}, storage: {} }));

jest.mock('firebase/storage', () => ({
  ref: jest.fn().mockReturnValue({ name: 'mock-ref' }),
  uploadBytes: jest.fn().mockResolvedValue(undefined),
  getDownloadURL: jest.fn().mockResolvedValue('https://firebasestorage.example.com/passport-0.jpg'),
}));

global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ data: {} }) });

// ---------------------------------------------------------------------------
// Mock marinas-data
// ---------------------------------------------------------------------------
jest.mock('../app/marinas-data', () => ({
  getMarinaById: jest.fn().mockReturnValue({ id: 'ATH', name: 'Alimos Marina' }),
  getMarinaByName: jest.fn().mockReturnValue(undefined),
  marinasByRegion: jest.fn().mockReturnValue({ 'Attica': [{ id: 'alimos', name: 'Alimos Marina' }] }),
  getAirportByIata: jest.fn().mockReturnValue(undefined),
  nearestAirportToMarina: jest.fn().mockReturnValue({ airport: { iata: 'ATH', city: 'Athens' }, km: 10 }),
  haversineKm: jest.fn().mockReturnValue(10),
  DEFAULT_MARINA_ID: 'ATH',
}));

// ---------------------------------------------------------------------------
// Mock lib/clientSpace
// ---------------------------------------------------------------------------
const mockToken = 'abc123';

const mockCharter = {
  id: 'charter-1',
  name: 'Smith Family',
  startDate: '2026-07-01',
  endDate: '2026-07-08',
  boat: 'Fountaine Pajot Aura 51',
  passengers: 4,
  deliveryPoint: 'ATH',
  redeliveryPoint: 'ATH',
  clientSpaceToken: mockToken,
  status: 'confirmed' as const,
};

const mockPrep = {
  token: mockToken,
  charterId: 'charter-1',
  lastSavedStep: 0,
  crew: [],
  travel: {},
  activities: {},
  food: {},
  beverages: {},
  special: {},
  checklist: {},
  messages: [],
  notes: {},
  createdAt: null,
  updatedAt: null,
};

const mockUpdateClientSpaceNote = jest.fn().mockResolvedValue(undefined);
const mockAddClientSpaceMessage = jest.fn();
const mockGetAllClientSpaceThreads = jest.fn().mockResolvedValue([]);
const mockGetClientPreparation = jest.fn().mockResolvedValue(mockPrep);
const mockGetCharterByToken = jest.fn().mockResolvedValue(mockCharter);

jest.mock('../lib/clientSpace', () => ({
  getClientPreparation: (...args: unknown[]) => mockGetClientPreparation(...args),
  getCharterByClientSpaceToken: (...args: unknown[]) => mockGetCharterByToken(...args),
  saveCrew: jest.fn().mockResolvedValue(undefined),
  saveTravel: jest.fn().mockResolvedValue(undefined),
  saveActivities: jest.fn().mockResolvedValue(undefined),
  saveFood: jest.fn().mockResolvedValue(undefined),
  saveBeverages: jest.fn().mockResolvedValue(undefined),
  saveSpecial: jest.fn().mockResolvedValue(undefined),
  saveChecklist: jest.fn().mockResolvedValue(undefined),
  saveStep: jest.fn().mockResolvedValue(undefined),
  saveSnapshot: jest.fn().mockResolvedValue(undefined),
  getHistory: jest.fn().mockResolvedValue([]),
  restoreSnapshot: jest.fn().mockResolvedValue(undefined),
  updateClientSpaceNote: (...args: unknown[]) => mockUpdateClientSpaceNote(...args),
  addClientSpaceMessage: (...args: unknown[]) => mockAddClientSpaceMessage(...args),
  getAllClientSpaceThreads: (...args: unknown[]) => mockGetAllClientSpaceThreads(...args),
  DEFAULT_ON_BOARD_PCT: { breakfast: 100, lunch: 80, dinner: 50 },
  CHECKLIST_CATEGORIES: [
    { id: 'documents', label: 'Documents', items: [{ id: 'doc-passport', label: 'Passport valid for 6+ months' }] },
  ],
}));

// ---------------------------------------------------------------------------
// Mock lib/availability
// ---------------------------------------------------------------------------
const mockGetAllCharters = jest.fn().mockResolvedValue([]);
const mockAddCharterProposalComment = jest.fn().mockResolvedValue(undefined);

jest.mock('../lib/availability', () => ({
  getAllCharters: (...args: unknown[]) => mockGetAllCharters(...args),
  addCharterProposalComment: (...args: unknown[]) => mockAddCharterProposalComment(...args),
  getMarinaById: jest.fn().mockReturnValue({ id: 'ATH', name: 'Alimos Marina' }),
  updateCharter: jest.fn().mockResolvedValue(undefined),
  CHARTER_STATUS_LABEL: {},
  CHARTER_STATUS_PRIORITY: {},
  proposalRef: jest.fn().mockReturnValue('REF-001'),
}));

// ---------------------------------------------------------------------------
// Import components AFTER mocks
// ---------------------------------------------------------------------------
import ClientSpaceClient from '../app/client-space/[token]/ClientSpaceClient';
import DiscussionsClient from '../app/admin/discussions/DiscussionsClient';

beforeEach(() => {
  jest.clearAllMocks();
  mockGetClientPreparation.mockResolvedValue(mockPrep);
  mockGetCharterByToken.mockResolvedValue(mockCharter);
  mockUpdateClientSpaceNote.mockResolvedValue(undefined);
  mockAddClientSpaceMessage.mockImplementation((_t: string, m: Record<string, unknown>) =>
    Promise.resolve({ ...m, id: 'msg-new', createdAt: new Date().toISOString() })
  );
  mockGetAllClientSpaceThreads.mockResolvedValue([]);
  mockGetAllCharters.mockResolvedValue([]);
  mockAddCharterProposalComment.mockResolvedValue(undefined);
});

async function renderClientSpace() {
  render(<ClientSpaceClient token={mockToken} />);
  await waitFor(() => expect(screen.getByText('Holiday Preparation')).toBeInTheDocument());
}

// ===========================================================================
// Client-space: notes + Q&A
// ===========================================================================

describe('ClientSpaceClient — Notes for our team', () => {
  test('typing a note on step 2 autosaves via updateClientSpaceNote', async () => {
    mockGetClientPreparation.mockResolvedValue({ ...mockPrep, lastSavedStep: 2 });
    await renderClientSpace();

    const textarea = screen.getByLabelText('Notes for our team');
    fireEvent.change(textarea, { target: { value: 'We are celebrating an anniversary' } });

    await waitFor(
      () => expect(mockUpdateClientSpaceNote).toHaveBeenCalledWith(mockToken, 2, 'We are celebrating an anniversary'),
      { timeout: 4000 }
    );
  });

  test('pre-fills the note from saved prep data', async () => {
    mockGetClientPreparation.mockResolvedValue({ ...mockPrep, lastSavedStep: 2, notes: { '2': 'Existing note' } });
    await renderClientSpace();
    expect(screen.getByLabelText('Notes for our team')).toHaveValue('Existing note');
  });
});

describe('ClientSpaceClient — Ask a question', () => {
  test('submitting a question on step 4 calls addClientSpaceMessage with the right step', async () => {
    mockGetClientPreparation.mockResolvedValue({ ...mockPrep, lastSavedStep: 4 });
    await renderClientSpace();

    fireEvent.click(screen.getByRole('button', { name: /ask a question/i }));
    const composer = screen.getByPlaceholderText(/ask the blueone team about food preferences/i);
    fireEvent.change(composer, { target: { value: 'Can you cater a gluten-free menu?' } });
    fireEvent.click(screen.getByRole('button', { name: /send question/i }));

    await waitFor(() =>
      expect(mockAddClientSpaceMessage).toHaveBeenCalledWith(
        mockToken,
        expect.objectContaining({
          step: 4,
          stepLabel: 'Food Preferences',
          author: 'Smith Family',
          text: 'Can you cater a gluten-free menu?',
          isAdmin: false,
        })
      )
    );
  });

  test('a question thread renders only on its own step', async () => {
    mockGetClientPreparation.mockResolvedValue({
      ...mockPrep,
      lastSavedStep: 3,
      messages: [
        {
          id: 'm1',
          step: 3,
          stepLabel: 'Activities & Health',
          author: 'Smith Family',
          text: 'Do we need diving certificates?',
          createdAt: '2026-07-10T10:00:00Z',
          isAdmin: false,
        },
      ],
    });
    await renderClientSpace();

    // On step 3 the question is visible
    expect(screen.getByText('Do we need diving certificates?')).toBeInTheDocument();

    // Navigate to a different step — the step-3 question is filtered out
    fireEvent.click(screen.getByRole('button', { name: 'Food Preferences' }));
    await waitFor(() =>
      expect(screen.queryByText('Do we need diving certificates?')).not.toBeInTheDocument()
    );
  });
});

// ===========================================================================
// Admin discussions: merged sources
// ===========================================================================

describe('DiscussionsClient — merges proposal and client-space threads', () => {
  const proposalCharter = {
    id: 'charter-proposal',
    name: 'Jones Party',
    startDate: '2026-08-01',
    endDate: '2026-08-08',
    proposal: {
      status: 'commented' as const,
      comments: [
        { id: 'p1', author: 'Jones Party', text: 'Is insurance included?', createdAt: '2026-07-01T09:00:00Z', isAdmin: false },
      ],
    },
  };

  const clientSpaceThread = {
    token: mockToken,
    charterId: 'charter-1',
    messages: [
      {
        id: 'cs1',
        step: 4,
        stepLabel: 'Food Preferences',
        author: 'Smith Family',
        text: 'Can you cater vegan meals?',
        createdAt: '2026-07-15T12:00:00Z',
        isAdmin: false,
      },
    ],
  };

  test('both threads appear, client-space sorted first (latest), with a step tag', async () => {
    mockGetAllCharters.mockResolvedValue([proposalCharter, mockCharter]);
    mockGetAllClientSpaceThreads.mockResolvedValue([clientSpaceThread]);

    render(<DiscussionsClient />);
    // Both clients present
    await waitFor(() => expect(screen.getByText('Smith Family')).toBeInTheDocument());
    expect(screen.getByText('Jones Party')).toBeInTheDocument();

    // Client-space thread carries the step tag
    expect(screen.getByText('Food Preferences')).toBeInTheDocument();

    // Sorted by latest timestamp — client-space (Jul 15) appears before proposal (Jul 1)
    const smith = screen.getByText('Smith Family');
    const jones = screen.getByText('Jones Party');
    expect(smith.compareDocumentPosition(jones) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  test('replying to a client-space thread calls addClientSpaceMessage as admin', async () => {
    mockGetAllCharters.mockResolvedValue([mockCharter]);
    mockGetAllClientSpaceThreads.mockResolvedValue([clientSpaceThread]);

    render(<DiscussionsClient />);
    await waitFor(() => expect(screen.getByText('Smith Family')).toBeInTheDocument());

    // Expand the thread
    fireEvent.click(screen.getByText('Smith Family'));
    const replyInput = await screen.findByPlaceholderText(/reply to client/i);
    fireEvent.change(replyInput, { target: { value: 'Yes, our chef prepares vegan menus.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Reply' }));

    await waitFor(() =>
      expect(mockAddClientSpaceMessage).toHaveBeenCalledWith(
        mockToken,
        expect.objectContaining({
          step: 4,
          stepLabel: 'Food Preferences',
          author: 'BlueOne Team',
          text: 'Yes, our chef prepares vegan menus.',
          isAdmin: true,
        })
      )
    );
  });
});
