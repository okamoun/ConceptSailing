import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

// ---------------------------------------------------------------------------
// Mock Next.js
// ---------------------------------------------------------------------------
jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({ push: jest.fn() }),
  useSearchParams: jest.fn().mockReturnValue({ get: jest.fn() }),
  usePathname: jest.fn().mockReturnValue('/client-space/test-token/manifest'),
}));

jest.mock('next/image', () =>
  function MockImage({ src, alt, ...rest }: { src: string; alt: string; [key: string]: unknown }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...rest} />;
  }
);

// ---------------------------------------------------------------------------
// Mock firebase + availability so the real lib/clientSpace can be loaded
// (we need the real buildCrewManifest while stubbing the async getters).
// ---------------------------------------------------------------------------
jest.mock('../lib/firebase', () => ({ db: {}, storage: {} }));
jest.mock('../lib/availability', () => ({ updateCharter: jest.fn().mockResolvedValue(undefined) }));

jest.mock('../app/marinas-data', () => ({
  getMarinaById: (id: string) => (id ? { id, name: id === 'ATH' ? 'Alimos Marina' : id === 'MYK' ? 'Mykonos Marina' : id } : undefined),
}));

const mockGetClientPreparation = jest.fn();
const mockGetCharterByToken = jest.fn();

jest.mock('../lib/clientSpace', () => {
  const actual = jest.requireActual('../lib/clientSpace');
  return {
    ...actual,
    getClientPreparation: (...args: unknown[]) => mockGetClientPreparation(...args),
    getCharterByClientSpaceToken: (...args: unknown[]) => mockGetCharterByToken(...args),
  };
});

import { buildCrewManifest } from '../lib/clientSpace';
import ManifestClient from '../app/client-space/[token]/manifest/ManifestClient';

const mockToken = 'tok123';

const baseCharter = {
  id: 'charter-1',
  name: 'Smith Family',
  startDate: '2026-07-01',
  endDate: '2026-07-08',
  boat: 'Fountaine Pajot Aura 51',
  deliveryPoint: 'ATH',
  redeliveryPoint: 'ATH',
  clientSpaceToken: mockToken,
  status: 'confirmed' as const,
};

function crew(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    firstName: ['Alice', 'Bob', 'Carla', 'Dan'][i] ?? `Guest${i}`,
    lastName: 'Smith',
    gender: 'Female',
    dateOfBirth: '1990-01-01',
    nationality: 'British',
    passportNumber: `P${i}000`,
  }));
}

// ===========================================================================
// Pure logic — buildCrewManifest
// ===========================================================================

describe('buildCrewManifest', () => {
  it('returns a single period when everyone shares the charter dates', () => {
    const periods = buildCrewManifest(baseCharter, { crew: crew(3), travel: {} });
    expect(periods).toHaveLength(1);
    expect(periods[0].startDate).toBe('2026-07-01');
    expect(periods[0].endDate).toBe('2026-07-08');
    expect(periods[0].guests).toHaveLength(3);
  });

  it('splits into separate periods when a guest joins mid-charter', () => {
    const travel = {
      groups: [
        { id: 'g1', memberIndices: [0, 1], arrivalDate: '2026-07-01', departureDate: '2026-07-08', embarkationPoint: 'ATH', disembarkationPoint: 'ATH' },
        { id: 'g2', memberIndices: [2], arrivalDate: '2026-07-04', departureDate: '2026-07-08', embarkationPoint: 'MYK' },
      ],
    };
    const periods = buildCrewManifest(baseCharter, { crew: crew(3), travel });
    expect(periods).toHaveLength(2);

    expect(periods[0].startDate).toBe('2026-07-01');
    expect(periods[0].endDate).toBe('2026-07-04');
    expect(periods[0].guests.map(g => g.index).sort()).toEqual([0, 1]);

    expect(periods[1].startDate).toBe('2026-07-04');
    expect(periods[1].endDate).toBe('2026-07-08');
    expect(periods[1].guests.map(g => g.index).sort()).toEqual([0, 1, 2]);
  });

  it('splits when a guest departs early', () => {
    const travel = {
      groups: [
        { id: 'g1', memberIndices: [0, 1], arrivalDate: '2026-07-01', departureDate: '2026-07-08' },
        { id: 'g2', memberIndices: [2], arrivalDate: '2026-07-01', departureDate: '2026-07-05' },
      ],
    };
    const periods = buildCrewManifest(baseCharter, { crew: crew(3), travel });
    expect(periods).toHaveLength(2);
    expect(periods[0].guests.map(g => g.index).sort()).toEqual([0, 1, 2]); // 07-01 → 07-05
    expect(periods[1].guests.map(g => g.index).sort()).toEqual([0, 1]);    // 07-05 → 07-08
  });

  it('returns one fallback period with no guests when the crew is empty', () => {
    const periods = buildCrewManifest(baseCharter, { crew: [], travel: {} });
    expect(periods).toHaveLength(1);
    expect(periods[0].guests).toHaveLength(0);
  });
});

// ===========================================================================
// Rendering — ManifestClient
// ===========================================================================

describe('ManifestClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCharterByToken.mockResolvedValue(baseCharter);
  });

  async function renderManifest() {
    render(<ManifestClient token={mockToken} />);
    await waitFor(() => expect(screen.getAllByText('Crew Manifest').length).toBeGreaterThan(0));
  }

  it('renders each guest with passport number and a passport image', async () => {
    mockGetClientPreparation.mockResolvedValue({
      token: mockToken,
      crew: [
        { firstName: 'Alice', lastName: 'Smith', nationality: 'British', passportNumber: 'P1', passportImageUrl: 'https://fb.example.com/passport-0.jpg' },
        { firstName: 'Bob', lastName: 'Smith', nationality: 'British', passportNumber: 'P2' },
      ],
      travel: {},
    });
    await renderManifest();

    // Alice appears in the table and again in her passport card caption
    expect(screen.getAllByText('Alice Smith').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    expect(screen.getByText('P1')).toBeInTheDocument();

    const img = screen.getByAltText('Passport — Alice Smith');
    expect(img).toHaveAttribute('src', 'https://fb.example.com/passport-0.jpg');
  });

  it('renders a PDF passport as an embed with an open/print link, not a broken image', async () => {
    mockGetClientPreparation.mockResolvedValue({
      token: mockToken,
      crew: [
        { firstName: 'Alice', lastName: 'Smith', passportNumber: 'P1', passportImageUrl: 'https://fb.example.com/passport-0', passportContentType: 'application/pdf' },
      ],
      travel: {},
    });
    await renderManifest();

    // No <img> for the PDF passport
    expect(screen.queryByAltText('Passport — Alice Smith')).not.toBeInTheDocument();
    // Instead an open/print link is offered
    const link = screen.getByRole('link', { name: /open \/ print passport pdf/i });
    expect(link).toHaveAttribute('href', 'https://fb.example.com/passport-0');
  });

  it('renders a separate leg page for each crew-change period', async () => {
    mockGetClientPreparation.mockResolvedValue({
      token: mockToken,
      crew: crew(3),
      travel: {
        groups: [
          { id: 'g1', memberIndices: [0, 1], arrivalDate: '2026-07-01', departureDate: '2026-07-08' },
          { id: 'g2', memberIndices: [2], arrivalDate: '2026-07-04', departureDate: '2026-07-08' },
        ],
      },
    });
    await renderManifest();

    expect(screen.getByText(/Leg 1 of 2/)).toBeInTheDocument();
    expect(screen.getByText(/Leg 2 of 2/)).toBeInTheDocument();
  });

  it('shows an empty state when no crew has been submitted', async () => {
    mockGetClientPreparation.mockResolvedValue({ token: mockToken, crew: [], travel: {} });
    await renderManifest();
    expect(screen.getByText(/no crew details have been submitted yet/i)).toBeInTheDocument();
  });

  it('shows a not-found state when the manifest cannot be loaded', async () => {
    mockGetClientPreparation.mockResolvedValue(null);
    render(<ManifestClient token={mockToken} />);
    await waitFor(() => expect(screen.getByText(/manifest not found/i)).toBeInTheDocument());
  });
});
