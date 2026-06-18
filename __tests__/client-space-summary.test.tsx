import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

// ---------------------------------------------------------------------------
// Mock Next.js modules
// ---------------------------------------------------------------------------
jest.mock('next/navigation', () => ({
  useRouter: jest.fn().mockReturnValue({ push: jest.fn() }),
  useSearchParams: jest.fn().mockReturnValue({ get: jest.fn() }),
  usePathname: jest.fn().mockReturnValue('/client-space/test-token/summary'),
}));

jest.mock('next/image', () =>
  function MockImage({ src, alt, ...rest }: { src: string; alt: string; [key: string]: unknown }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...rest} />;
  }
);

// ---------------------------------------------------------------------------
// Mock Firebase
// ---------------------------------------------------------------------------
jest.mock('../lib/firebase', () => ({ db: {}, storage: {} }));

// ---------------------------------------------------------------------------
// Mock marinas-data
// ---------------------------------------------------------------------------
jest.mock('../app/marinas-data', () => ({
  getMarinaById: jest.fn().mockReturnValue({ id: 'ATH', name: 'Alimos Marina' }),
  marinasByRegion: [],
  DEFAULT_MARINA_ID: 'ATH',
}));

// ---------------------------------------------------------------------------
// Mock lib/clientSpace
// ---------------------------------------------------------------------------
const mockToken = 'abc123';

const mockCharter = {
  id: 'charter-1',
  name: 'Smith Family',
  email: 'smith@example.com',
  phone: '+1 555 1234',
  startDate: '2026-07-01',
  endDate: '2026-07-08',
  boat: 'Fountaine Pajot Aura 51',
  passengers: 4,
  deliveryPoint: 'ATH',
  redeliveryPoint: 'ATH',
  embarkationPoint: 'ATH',
  clientSpaceToken: mockToken,
  status: 'confirmed' as const,
  selectedTheme: 'Island Hopping',
  holidayDescription: 'Anniversary trip',
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
  createdAt: null,
  updatedAt: null,
};

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
  CHECKLIST_CATEGORIES: [
    {
      id: 'documents',
      label: 'Documents',
      items: [
        { id: 'doc-passport', label: 'Passport valid for 6+ months' },
        { id: 'doc-insurance', label: 'Travel insurance arranged' },
      ],
    },
    {
      id: 'packing',
      label: 'Clothing & Packing',
      items: [
        { id: 'pack-swimwear', label: 'Swimwear packed' },
      ],
    },
  ],
}));

// ---------------------------------------------------------------------------
// Mock lib/availability
// ---------------------------------------------------------------------------
jest.mock('../lib/availability', () => ({
  getAllCharters: jest.fn().mockResolvedValue([]),
  updateCharter: jest.fn().mockResolvedValue(undefined),
  CHARTER_STATUS_LABEL: {},
  CHARTER_STATUS_PRIORITY: {},
  proposalRef: jest.fn().mockReturnValue('REF-001'),
}));

// ---------------------------------------------------------------------------
// Mock window.print
// ---------------------------------------------------------------------------
const mockPrint = jest.fn();
Object.defineProperty(window, 'print', { value: mockPrint, writable: true });

// ---------------------------------------------------------------------------
// Import component AFTER mocks
// ---------------------------------------------------------------------------
import SummaryClient from '../app/client-space/[token]/summary/SummaryClient';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function renderSummary(token = mockToken) {
  return render(<SummaryClient token={token} />);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SummaryClient — loading state', () => {
  it('shows loading indicator while fetching', () => {
    // Never resolve
    mockGetClientPreparation.mockReturnValueOnce(new Promise(() => {}));
    mockGetCharterByToken.mockReturnValueOnce(new Promise(() => {}));
    renderSummary();
    expect(screen.getByText(/loading summary/i)).toBeInTheDocument();
  });
});

describe('SummaryClient — not-found state', () => {
  it('shows not-found when charter is null', async () => {
    mockGetCharterByToken.mockResolvedValueOnce(null);
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText(/summary not found/i)).toBeInTheDocument();
    });
  });

  it('shows not-found when prep is null', async () => {
    mockGetClientPreparation.mockResolvedValueOnce(null);
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText(/summary not found/i)).toBeInTheDocument();
    });
  });

  it('shows not-found on fetch error', async () => {
    mockGetCharterByToken.mockRejectedValueOnce(new Error('network'));
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText(/summary not found/i)).toBeInTheDocument();
    });
  });

  it('shows contact email in not-found state', async () => {
    mockGetCharterByToken.mockResolvedValueOnce(null);
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText(/contact us at/i)).toBeInTheDocument();
    });
  });
});

describe('SummaryClient — screen header', () => {
  beforeEach(() => {
    mockGetClientPreparation.mockResolvedValue(mockPrep);
    mockGetCharterByToken.mockResolvedValue(mockCharter);
  });

  it('renders BlueOne logo', async () => {
    renderSummary();
    await waitFor(() => {
      const logo = screen.getByAltText('BlueOne');
      expect(logo).toBeInTheDocument();
    });
  });

  it('shows "Preference Summary" title', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText('Preference Summary')).toBeInTheDocument();
    });
  });

  it('shows client name and charter start date in header', async () => {
    renderSummary();
    await waitFor(() => {
      const matches = screen.getAllByText(/smith family/i);
      expect(matches.length).toBeGreaterThan(0);
    });
  });

  it('renders Edit Preferences link pointing to /client-space/{token}', async () => {
    renderSummary();
    await waitFor(() => {
      const link = screen.getByText(/edit preferences/i).closest('a');
      expect(link).toHaveAttribute('href', `/client-space/${mockToken}`);
    });
  });

  it('renders Print / Save PDF button', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /print \/ save pdf/i })).toBeInTheDocument();
    });
  });
});

describe('SummaryClient — PDF / print', () => {
  beforeEach(() => {
    mockPrint.mockClear();
    mockGetClientPreparation.mockResolvedValue(mockPrep);
    mockGetCharterByToken.mockResolvedValue(mockCharter);
  });

  it('calls window.print() when Print button is clicked', async () => {
    renderSummary();
    const btn = await screen.findByRole('button', { name: /print \/ save pdf/i });
    fireEvent.click(btn);
    expect(mockPrint).toHaveBeenCalledTimes(1);
  });
});

describe('SummaryClient — section titles', () => {
  beforeEach(() => {
    mockGetClientPreparation.mockResolvedValue(mockPrep);
    mockGetCharterByToken.mockResolvedValue(mockCharter);
  });

  const sections = [
    'Charter Details',
    'Crew / Passenger Details',
    'Travel & Logistics',
    'Activities & Health',
    'Food Preferences',
    'Beverages & Bar',
    'Special Requests',
  ];

  sections.forEach(title => {
    it(`renders "${title}" section`, async () => {
      renderSummary();
      await waitFor(() => {
        expect(screen.getByText(title)).toBeInTheDocument();
      });
    });
  });

  it('renders checklist section with progress count', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText(/pre-departure checklist/i)).toBeInTheDocument();
      expect(screen.getByText(/0 \/ 3 completed/i)).toBeInTheDocument();
    });
  });
});

describe('SummaryClient — empty state messages', () => {
  beforeEach(() => {
    mockGetClientPreparation.mockResolvedValue(mockPrep);
    mockGetCharterByToken.mockResolvedValue(mockCharter);
  });

  it('shows empty message for crew', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText('No crew details submitted yet.')).toBeInTheDocument();
    });
  });

  it('shows empty message for travel', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText('No travel details submitted yet.')).toBeInTheDocument();
    });
  });

  it('shows empty message for activities', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText('No activity or health details submitted yet.')).toBeInTheDocument();
    });
  });

  it('shows empty message for food', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText('No food preferences submitted yet.')).toBeInTheDocument();
    });
  });

  it('shows empty message for beverages', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText('No beverage preferences submitted yet.')).toBeInTheDocument();
    });
  });

  it('shows empty message for special requests', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText('No special requests submitted yet.')).toBeInTheDocument();
    });
  });
});

describe('SummaryClient — Charter Details section', () => {
  beforeEach(() => {
    mockGetClientPreparation.mockResolvedValue(mockPrep);
    mockGetCharterByToken.mockResolvedValue(mockCharter);
  });

  it('renders vessel name', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText('Fountaine Pajot Aura 51')).toBeInTheDocument();
    });
  });

  it('renders guest count', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText('4 passengers')).toBeInTheDocument();
    });
  });

  it('renders marina name from getMarinaById', async () => {
    renderSummary();
    await waitFor(() => {
      // getMarinaById returns 'Alimos Marina'
      const marinaLabels = screen.getAllByText('Alimos Marina');
      expect(marinaLabels.length).toBeGreaterThan(0);
    });
  });

  it('renders experience theme', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText('Island Hopping')).toBeInTheDocument();
    });
  });

  it('renders holiday description', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText('Anniversary trip')).toBeInTheDocument();
    });
  });
});

describe('SummaryClient — Crew section with data', () => {
  const prepWithCrew = {
    ...mockPrep,
    crew: [
      { firstName: 'Alice', lastName: 'Smith', gender: 'Female', nationality: 'British', passportNumber: 'AB123456', dateOfBirth: '1985-03-15', dietaryRestrictions: 'Vegan', medicalNotes: 'None' },
      { firstName: 'Bob', lastName: 'Smith', gender: 'Male', nationality: 'American' },
    ],
  };

  beforeEach(() => {
    mockGetClientPreparation.mockResolvedValue(prepWithCrew);
    mockGetCharterByToken.mockResolvedValue(mockCharter);
  });

  it('renders passenger subsection headings', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText(/passenger 1.*alice smith/i)).toBeInTheDocument();
      expect(screen.getByText(/passenger 2.*bob smith/i)).toBeInTheDocument();
    });
  });

  it('renders passport number', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText('AB123456')).toBeInTheDocument();
    });
  });

  it('renders dietary restrictions', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText('Vegan')).toBeInTheDocument();
    });
  });
});

describe('SummaryClient — Travel section with groups (new UI)', () => {
  const prepWithGroups = {
    ...mockPrep,
    crew: [
      { firstName: 'Alice', lastName: 'Smith' },
      { firstName: 'Bob', lastName: 'Smith' },
    ],
    travel: {
      groups: [
        {
          id: 'g1',
          memberIndices: [0, 1],
          arrivalDate: '2026-06-30',
          arrivalFlight: 'BA123',
          arrivalTime: '14:30',
          stayingAtHotel: true,
          hotelName: 'Grand Hotel Athens',
          transferFromAirport: true,
          departureDate: '2026-07-09',
          departureFlight: 'BA456',
        },
      ],
    },
  };

  beforeEach(() => {
    mockGetClientPreparation.mockResolvedValue(prepWithGroups);
    mockGetCharterByToken.mockResolvedValue(mockCharter);
  });

  it('renders group subsection with member names', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText(/group 1.*alice smith.*bob smith/i)).toBeInTheDocument();
    });
  });

  it('renders Arrival sub-header', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText('Arrival')).toBeInTheDocument();
    });
  });

  it('renders flight number', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText('BA123')).toBeInTheDocument();
    });
  });

  it('renders hotel name', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText('Grand Hotel Athens')).toBeInTheDocument();
    });
  });

  it('renders "Yes" for airport transfer', async () => {
    renderSummary();
    await waitFor(() => {
      const yesValues = screen.getAllByText('Yes');
      expect(yesValues.length).toBeGreaterThan(0);
    });
  });

  it('renders Departure sub-header', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText('Departure')).toBeInTheDocument();
    });
  });

  it('renders departure flight', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText('BA456')).toBeInTheDocument();
    });
  });
});

describe('SummaryClient — Travel section with legacy flat fields', () => {
  const prepWithLegacyTravel = {
    ...mockPrep,
    travel: {
      arrivalDate: '2026-06-30',
      arrivalFlight: 'EZ999',
      departureDate: '2026-07-09',
    },
  };

  beforeEach(() => {
    mockGetClientPreparation.mockResolvedValue(prepWithLegacyTravel);
    mockGetCharterByToken.mockResolvedValue(mockCharter);
  });

  it('renders flight number from legacy data', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText('EZ999')).toBeInTheDocument();
    });
  });
});

describe('SummaryClient — Food section with data', () => {
  const prepWithFood = {
    ...mockPrep,
    food: {
      seafood: { likes: 'Grilled fish', dislikes: 'Raw', allergies: '' },
      breakfastStyle: ['light'],
      breakfastItems: ['Croissant', 'Yogurt'],
      lunchStyle: 'Light salads',
      dinnerStyle: 'Fine dining',
    },
  };

  beforeEach(() => {
    mockGetClientPreparation.mockResolvedValue(prepWithFood);
    mockGetCharterByToken.mockResolvedValue(mockCharter);
  });

  it('renders Food Categories subsection', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText('Food Categories')).toBeInTheDocument();
    });
  });

  it('renders seafood likes', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getAllByText('Grilled fish').length).toBeGreaterThan(0);
    });
  });

  it('renders Breakfast subsection', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText('Breakfast')).toBeInTheDocument();
    });
  });

  it('renders breakfast style tag', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText('Light / Cold')).toBeInTheDocument();
    });
  });

  it('renders Lunch & Dinner subsection', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText('Lunch & Dinner')).toBeInTheDocument();
    });
  });

  it('renders lunch style', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText('Light salads')).toBeInTheDocument();
    });
  });
});

describe('SummaryClient — Beverages section with data', () => {
  const prepWithBeverages = {
    ...mockPrep,
    beverages: {
      warmBeverages: ['Coffee', 'Tea'],
      warmBeveragesOther: 'Herbal infusions',
      sodas: {
        'Coke 0.5 l': { qty: 12, preferredBrand: 'Coca-Cola' },
      },
      wines: {
        'White Wine': { qty: 6, preferredBrand: 'Chardonnay' },
      },
    },
  };

  beforeEach(() => {
    mockGetClientPreparation.mockResolvedValue(prepWithBeverages);
    mockGetCharterByToken.mockResolvedValue(mockCharter);
  });

  it('renders Hot Beverages subsection', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText('Hot Beverages')).toBeInTheDocument();
    });
  });

  it('renders warm beverage selections as tags', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText('Coffee')).toBeInTheDocument();
      expect(screen.getByText('Tea')).toBeInTheDocument();
    });
  });

  it('renders other warm beverages', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText('Herbal infusions')).toBeInTheDocument();
    });
  });

  it('renders Sodas, Juices & Water subsection', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText('Sodas, Juices & Water')).toBeInTheDocument();
    });
  });

  it('renders soda quantity', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText('12')).toBeInTheDocument();
    });
  });

  it('renders Wines & Sparkling subsection', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText('Wines & Sparkling')).toBeInTheDocument();
    });
  });
});

describe('SummaryClient — Special Requests with data', () => {
  const prepWithSpecial = {
    ...mockPrep,
    special: {
      celebration: 'Wedding anniversary',
      musicAtmosphere: 'Jazz and lounge',
      petsOnBoard: 'Small dog',
      extraNotes: 'Please have flowers on board',
      emergencyContactName: 'Jane Smith',
      emergencyContactPhone: '+1 555 9999',
      emergencyContactRelation: 'Sister',
    },
  };

  beforeEach(() => {
    mockGetClientPreparation.mockResolvedValue(prepWithSpecial);
    mockGetCharterByToken.mockResolvedValue(mockCharter);
  });

  it('renders celebration', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText('Wedding anniversary')).toBeInTheDocument();
    });
  });

  it('renders music atmosphere', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText('Jazz and lounge')).toBeInTheDocument();
    });
  });

  it('renders pets on board', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText('Small dog')).toBeInTheDocument();
    });
  });

  it('renders emergency contact', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText(/jane smith/i)).toBeInTheDocument();
    });
  });

  it('renders additional notes', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText('Please have flowers on board')).toBeInTheDocument();
    });
  });
});

describe('SummaryClient — Checklist section', () => {
  beforeEach(() => {
    mockGetCharterByToken.mockResolvedValue(mockCharter);
  });

  it('shows 0 / 3 completed when checklist is empty', async () => {
    mockGetClientPreparation.mockResolvedValue(mockPrep);
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText(/0 \/ 3 completed/i)).toBeInTheDocument();
    });
  });

  it('shows 2 / 3 completed when 2 items are checked', async () => {
    const prepWithChecklist = {
      ...mockPrep,
      checklist: { 'doc-passport': true, 'doc-insurance': true },
    };
    mockGetClientPreparation.mockResolvedValue(prepWithChecklist);
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText(/2 \/ 3 completed/i)).toBeInTheDocument();
    });
  });

  it('renders checklist category labels', async () => {
    mockGetClientPreparation.mockResolvedValue(mockPrep);
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText('Documents')).toBeInTheDocument();
      expect(screen.getByText('Clothing & Packing')).toBeInTheDocument();
    });
  });

  it('renders individual checklist item labels', async () => {
    mockGetClientPreparation.mockResolvedValue(mockPrep);
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText('Passport valid for 6+ months')).toBeInTheDocument();
      expect(screen.getByText('Swimwear packed')).toBeInTheDocument();
    });
  });

  it('shows checkmark for completed items', async () => {
    const prepWithChecklist = {
      ...mockPrep,
      checklist: { 'doc-passport': true },
    };
    mockGetClientPreparation.mockResolvedValue(prepWithChecklist);
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText('✓')).toBeInTheDocument();
    });
  });
});

describe('SummaryClient — footer', () => {
  beforeEach(() => {
    mockGetClientPreparation.mockResolvedValue(mockPrep);
    mockGetCharterByToken.mockResolvedValue(mockCharter);
  });

  it('renders contact email in footer', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText(/blueone luxury yacht charters/i)).toBeInTheDocument();
    });
  });

  it('renders confidentiality message', async () => {
    renderSummary();
    await waitFor(() => {
      expect(screen.getByText(/confidential.*blueone crew/i)).toBeInTheDocument();
    });
  });
});
