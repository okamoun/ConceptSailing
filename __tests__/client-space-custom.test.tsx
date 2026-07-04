import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

// ── Next.js mocks ─────────────────────────────────────────────────────────────
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

jest.mock('../lib/firebase', () => ({ db: {}, storage: {} }));

jest.mock('../app/marinas-data', () => ({
  getMarinaById: jest.fn().mockReturnValue({ id: 'ATH', name: 'Alimos Marina' }),
  marinasByRegion: [],
  DEFAULT_MARINA_ID: 'ATH',
}));

jest.mock('../lib/availability', () => ({
  getAllCharters: jest.fn().mockResolvedValue([]),
  getMarinaById: jest.fn().mockReturnValue({ id: 'ATH', name: 'Alimos Marina' }),
  updateCharter: jest.fn().mockResolvedValue(undefined),
  CHARTER_STATUS_LABEL: {},
  CHARTER_STATUS_PRIORITY: {},
  proposalRef: jest.fn().mockReturnValue('REF-001'),
}));

// ── clientSpace mock ──────────────────────────────────────────────────────────
const mockToken = 'abc123';
const mockCharter = {
  id: 'charter-1', name: 'Smith Family', startDate: '2026-07-01', endDate: '2026-07-08',
  boat: 'Fountaine Pajot Aura 51', passengers: 2, deliveryPoint: 'ATH', redeliveryPoint: 'ATH',
  clientSpaceToken: mockToken, status: 'confirmed' as const,
};
const mockPrep = {
  token: mockToken, charterId: 'charter-1', lastSavedStep: 6,
  crew: [], travel: {}, activities: {}, food: {}, beverages: {}, special: {}, checklist: {}, custom: {},
  createdAt: null, updatedAt: null,
};

const mockSaveCustomSection = jest.fn().mockResolvedValue(undefined);
const mockSaveStep = jest.fn().mockResolvedValue(undefined);
const mockSaveSnapshot = jest.fn().mockResolvedValue(undefined);
const mockGetClientPreparation = jest.fn().mockResolvedValue(mockPrep);
const mockGetCharterByToken = jest.fn().mockResolvedValue(mockCharter);

jest.mock('../lib/clientSpace', () => ({
  getClientPreparation: (...a: unknown[]) => mockGetClientPreparation(...a),
  getCharterByClientSpaceToken: (...a: unknown[]) => mockGetCharterByToken(...a),
  saveCrew: jest.fn().mockResolvedValue(undefined),
  saveTravel: jest.fn().mockResolvedValue(undefined),
  saveActivities: jest.fn().mockResolvedValue(undefined),
  saveFood: jest.fn().mockResolvedValue(undefined),
  saveBeverages: jest.fn().mockResolvedValue(undefined),
  saveSpecial: jest.fn().mockResolvedValue(undefined),
  saveChecklist: jest.fn().mockResolvedValue(undefined),
  saveCustomSection: (...a: unknown[]) => mockSaveCustomSection(...a),
  saveStep: (...a: unknown[]) => mockSaveStep(...a),
  saveSnapshot: (...a: unknown[]) => mockSaveSnapshot(...a),
  getHistory: jest.fn().mockResolvedValue([]),
  restoreSnapshot: jest.fn().mockResolvedValue(undefined),
  CHECKLIST_CATEGORIES: [],
}));

// ── preferences mock ──────────────────────────────────────────────────────────
const mockGetPreferenceConfig = jest.fn();
jest.mock('../lib/preferences', () => {
  const actual = jest.requireActual('../lib/preferences');
  return { ...actual, getPreferenceConfig: (...a: unknown[]) => mockGetPreferenceConfig(...a) };
});

import ClientSpaceClient from '../app/client-space/[token]/ClientSpaceClient';
import { defaultSections, createSectionId, createFieldId } from '../lib/preferences';

beforeEach(() => {
  jest.clearAllMocks();
  mockGetClientPreparation.mockResolvedValue(mockPrep);
  mockGetCharterByToken.mockResolvedValue(mockCharter);
});

async function renderAndWait() {
  render(<ClientSpaceClient token={mockToken} />);
  await waitFor(() => expect(screen.getByText('Holiday Preparation')).toBeInTheDocument());
}

describe('ClientSpaceClient — section visibility from config', () => {
  test('hidden built-in sections do not appear as steps', async () => {
    const sections = defaultSections().map(s =>
      s.id === 'beverages' ? { ...s, visible: false } : s
    );
    mockGetPreferenceConfig.mockResolvedValue({ sections, updatedAt: null });
    await renderAndWait();
    await waitFor(() => {
      // Step tab for a visible section still present
      expect(screen.getAllByText('Crew Details').length).toBeGreaterThan(0);
      // Hidden section's tab is gone
      expect(screen.queryByText('Beverages & Bar')).not.toBeInTheDocument();
    });
  });
});

describe('ClientSpaceClient — custom sections', () => {
  test('renders a custom section as a step with its fields and saves responses', async () => {
    const sectionId = createSectionId();
    const fieldId = createFieldId();
    const sections = [
      ...defaultSections(),
      {
        id: sectionId, title: 'Music & Atmosphere', description: 'Tell us your vibe',
        builtIn: false, visible: true, order: 10,
        fields: [{ id: fieldId, label: 'Favourite genre', type: 'text' as const, required: false, placeholder: 'Jazz, house…' }],
      },
    ];
    mockGetPreferenceConfig.mockResolvedValue({ sections, updatedAt: null });

    await renderAndWait();

    // Navigate to the custom step via its tab
    await waitFor(() => expect(screen.getAllByText('Music & Atmosphere').length).toBeGreaterThan(0));
    const tab = screen.getAllByRole('button', { name: 'Music & Atmosphere' })[0];
    fireEvent.click(tab);

    await waitFor(() => expect(screen.getByPlaceholderText('Jazz, house…')).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText('Jazz, house…'), { target: { value: 'Deep house' } });

    fireEvent.click(screen.getByRole('button', { name: /save music & atmosphere/i }));

    await waitFor(() => expect(mockSaveCustomSection).toHaveBeenCalledWith(
      mockToken,
      sectionId,
      expect.objectContaining({ [fieldId]: 'Deep house' }),
    ));
  });
});
