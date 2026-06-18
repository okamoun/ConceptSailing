import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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
// Mock Firebase
// ---------------------------------------------------------------------------
jest.mock('../lib/firebase', () => ({ db: {}, storage: {} }));

// ---------------------------------------------------------------------------
// Mock marinas-data
// ---------------------------------------------------------------------------
jest.mock('../app/marinas-data', () => ({
  getMarinaById: jest.fn().mockReturnValue({ id: 'ATH', name: 'Alimos Marina' }),
  marinasByRegion: jest.fn().mockReturnValue({ 'Attica': [{ id: 'alimos', name: 'Alimos Marina' }] }),
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
  createdAt: null,
  updatedAt: null,
};

const mockSaveCrew = jest.fn().mockResolvedValue(undefined);
const mockSaveTravel = jest.fn().mockResolvedValue(undefined);
const mockSaveActivities = jest.fn().mockResolvedValue(undefined);
const mockSaveFood = jest.fn().mockResolvedValue(undefined);
const mockSaveBeverages = jest.fn().mockResolvedValue(undefined);
const mockSaveSpecial = jest.fn().mockResolvedValue(undefined);
const mockSaveChecklist = jest.fn().mockResolvedValue(undefined);
const mockSaveStep = jest.fn().mockResolvedValue(undefined);
const mockSaveSnapshot = jest.fn().mockResolvedValue(undefined);
const mockGetHistory = jest.fn().mockResolvedValue([]);
const mockRestoreSnapshot = jest.fn().mockResolvedValue(undefined);
const mockGetClientPreparation = jest.fn().mockResolvedValue(mockPrep);
const mockGetCharterByToken = jest.fn().mockResolvedValue(mockCharter);

jest.mock('../lib/clientSpace', () => ({
  getClientPreparation: (...args: unknown[]) => mockGetClientPreparation(...args),
  getCharterByClientSpaceToken: (...args: unknown[]) => mockGetCharterByToken(...args),
  saveCrew: (...args: unknown[]) => mockSaveCrew(...args),
  saveTravel: (...args: unknown[]) => mockSaveTravel(...args),
  saveActivities: (...args: unknown[]) => mockSaveActivities(...args),
  saveFood: (...args: unknown[]) => mockSaveFood(...args),
  saveBeverages: (...args: unknown[]) => mockSaveBeverages(...args),
  saveSpecial: (...args: unknown[]) => mockSaveSpecial(...args),
  saveChecklist: (...args: unknown[]) => mockSaveChecklist(...args),
  saveStep: (...args: unknown[]) => mockSaveStep(...args),
  saveSnapshot: (...args: unknown[]) => mockSaveSnapshot(...args),
  getHistory: (...args: unknown[]) => mockGetHistory(...args),
  restoreSnapshot: (...args: unknown[]) => mockRestoreSnapshot(...args),
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
// Mock lib/availability (used indirectly)
// ---------------------------------------------------------------------------
jest.mock('../lib/availability', () => ({
  getAllCharters: jest.fn().mockResolvedValue([]),
  getMarinaById: jest.fn().mockReturnValue({ id: 'ATH', name: 'Alimos Marina' }),
  updateCharter: jest.fn().mockResolvedValue(undefined),
  CHARTER_STATUS_LABEL: {},
  CHARTER_STATUS_PRIORITY: {},
  proposalRef: jest.fn().mockReturnValue('REF-001'),
}));

// ---------------------------------------------------------------------------
// Import component AFTER mocks
// ---------------------------------------------------------------------------
import ClientSpaceClient from '../app/client-space/[token]/ClientSpaceClient';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
beforeEach(() => {
  jest.clearAllMocks();
  mockGetClientPreparation.mockResolvedValue(mockPrep);
  mockGetCharterByToken.mockResolvedValue(mockCharter);
  mockSaveCrew.mockResolvedValue(undefined);
  mockSaveTravel.mockResolvedValue(undefined);
  mockSaveActivities.mockResolvedValue(undefined);
  mockSaveFood.mockResolvedValue(undefined);
  mockSaveBeverages.mockResolvedValue(undefined);
  mockSaveSpecial.mockResolvedValue(undefined);
  mockSaveChecklist.mockResolvedValue(undefined);
  mockSaveStep.mockResolvedValue(undefined);
  mockSaveSnapshot.mockResolvedValue(undefined);
  mockGetHistory.mockResolvedValue([]);
});

async function renderAndWait() {
  render(<ClientSpaceClient token={mockToken} />);
  await waitFor(() => expect(screen.getByText('Holiday Preparation')).toBeInTheDocument());
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ClientSpaceClient — Loading & Error States', () => {
  test('shows loading spinner initially', () => {
    mockGetClientPreparation.mockReturnValue(new Promise(() => {})); // never resolves
    render(<ClientSpaceClient token={mockToken} />);
    expect(screen.getByText(/loading your holiday space/i)).toBeInTheDocument();
  });

  test('shows not-found state when preparation is null', async () => {
    mockGetClientPreparation.mockResolvedValue(null);
    render(<ClientSpaceClient token={mockToken} />);
    await waitFor(() => expect(screen.getByText(/link not found/i)).toBeInTheDocument());
  });

  test('shows not-found state when charter is null', async () => {
    mockGetCharterByToken.mockResolvedValue(null);
    render(<ClientSpaceClient token={mockToken} />);
    await waitFor(() => expect(screen.getByText(/link not found/i)).toBeInTheDocument());
  });

  test('shows not-found state on fetch error', async () => {
    mockGetClientPreparation.mockRejectedValue(new Error('Network error'));
    render(<ClientSpaceClient token={mockToken} />);
    await waitFor(() => expect(screen.getByText(/link not found/i)).toBeInTheDocument());
  });
});

describe('ClientSpaceClient — Header & Navigation', () => {
  test('renders BlueOne logo image', async () => {
    await renderAndWait();
    expect(screen.getByAltText('BlueOne')).toBeInTheDocument();
  });

  test('renders Holiday Preparation title', async () => {
    await renderAndWait();
    expect(screen.getByText('Holiday Preparation')).toBeInTheDocument();
  });

  test('shows welcome message with client name', async () => {
    await renderAndWait();
    expect(screen.getByText(/welcome, smith family/i)).toBeInTheDocument();
  });

  test('renders History button', async () => {
    await renderAndWait();
    expect(screen.getByRole('button', { name: /history/i })).toBeInTheDocument();
  });

  test('renders Summary link', async () => {
    await renderAndWait();
    expect(screen.getByRole('link', { name: /summary/i })).toBeInTheDocument();
  });

  test('Summary link points to correct path', async () => {
    await renderAndWait();
    const link = screen.getByRole('link', { name: /summary/i });
    expect(link).toHaveAttribute('href', `/client-space/${mockToken}/summary`);
  });
});

describe('ClientSpaceClient — Step Indicator', () => {
  test('renders all 7 step labels on md+ screens', async () => {
    await renderAndWait();
    const steps = ['Your Charter', 'Crew Details', 'Travel & Logistics', 'Activities & Health', 'Food Preferences', 'Beverages & Bar', 'Special Requests'];
    for (const label of steps) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
  });

  test('starts on step 0 (Your Charter)', async () => {
    await renderAndWait();
    // "Let's Get Started" button is only visible on step 0
    expect(screen.getByRole('button', { name: /let's get started/i })).toBeInTheDocument();
  });

  test('resumes from lastSavedStep when prep has progress', async () => {
    mockGetClientPreparation.mockResolvedValue({ ...mockPrep, lastSavedStep: 3 });
    await renderAndWait();
    // Step 3 shows Activities section title
    await waitFor(() => expect(screen.getByText('Group Style')).toBeInTheDocument());
  });
});

describe('ClientSpaceClient — Step 0: Charter Overview', () => {
  test('displays charter start and end dates', async () => {
    await renderAndWait();
    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.getByText('End')).toBeInTheDocument();
  });

  test('displays vessel name', async () => {
    await renderAndWait();
    expect(screen.getByText('Fountaine Pajot Aura 51')).toBeInTheDocument();
  });

  test('displays guest count', async () => {
    await renderAndWait();
    expect(screen.getByText('4 pax')).toBeInTheDocument();
  });

  test('displays embarkation marina', async () => {
    await renderAndWait();
    expect(screen.getAllByText('Alimos Marina').length).toBeGreaterThan(0);
  });

  test('advances to Crew Details on "Let\'s Get Started"', async () => {
    await renderAndWait();
    fireEvent.click(screen.getByRole('button', { name: /let's get started/i }));
    await waitFor(() => expect(screen.getByText('Save Crew Details')).toBeInTheDocument());
  });
});

describe('ClientSpaceClient — Step 1: Crew Details', () => {
  beforeEach(async () => {
    await renderAndWait();
    fireEvent.click(screen.getByRole('button', { name: /let's get started/i }));
    await waitFor(() => expect(screen.getByText('Save Crew Details')).toBeInTheDocument());
  });

  test('renders one crew card per passenger', () => {
    // 4 passengers → 4 "Passenger N" labels
    expect(screen.getByText('Passenger 1')).toBeInTheDocument();
    expect(screen.getByText('Passenger 4')).toBeInTheDocument();
  });

  test('first crew card is expanded by default showing name fields', async () => {
    // expanded state starts at 0 so Passenger 1 is open immediately
    await waitFor(() => {
      expect(screen.getByPlaceholderText('First name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Last name')).toBeInTheDocument();
    });
  });

  test('first crew card is expanded by default showing dietary and medical fields', async () => {
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/vegetarian/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/conditions the crew/i)).toBeInTheDocument();
    });
  });

  test('clicking a collapsed card switches the open card', async () => {
    // Passenger 2 (index 1) starts collapsed — clicking it opens it and closes Passenger 1
    const btn = screen.getAllByRole('button', { name: /passenger 2/i })[0];
    fireEvent.click(btn);
    await waitFor(() => {
      // Only one card open at a time — still one "First name" placeholder (now Pax 2's)
      expect(screen.getAllByPlaceholderText('First name').length).toBe(1);
    });
  });

  test('Save Crew Details calls saveCrew and saveStep', async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Save Crew Details' }));
    await waitFor(() => expect(mockSaveCrew).toHaveBeenCalledWith(mockToken, expect.any(Array)));
    expect(mockSaveStep).toHaveBeenCalled();
  });

  test('Save Crew Details creates a snapshot', async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Save Crew Details' }));
    await waitFor(() => expect(mockSaveSnapshot).toHaveBeenCalledWith(mockToken, expect.anything(), 'Crew details'));
  });
});

describe('ClientSpaceClient — Step 2: Travel & Logistics', () => {
  beforeEach(async () => {
    mockGetClientPreparation.mockResolvedValue({ ...mockPrep, lastSavedStep: 2 });
    await renderAndWait();
    await waitFor(() => expect(screen.getByText('Save Travel Details')).toBeInTheDocument());
  });

  test('renders Group 1 by default', () => {
    // Both mobile card and desktop table render Group 1 in the DOM
    expect(screen.getAllByText('Group 1').length).toBeGreaterThan(0);
  });

  test('shows all passengers in default group', () => {
    expect(screen.getAllByText('All passengers').length).toBeGreaterThan(0);
  });

  test('Add Travel Group button creates a second column', async () => {
    fireEvent.click(screen.getByRole('button', { name: /add travel group/i }));
    await waitFor(() => expect(screen.getAllByText('Group 2').length).toBeGreaterThan(0));
  });

  test('renders Arrival and Departure section labels', () => {
    expect(screen.getAllByText('Arrival').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Departure').length).toBeGreaterThan(0);
  });

  test('Save Travel Details calls saveTravel', async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Save Travel Details' }));
    await waitFor(() => expect(mockSaveTravel).toHaveBeenCalledWith(mockToken, expect.objectContaining({ groups: expect.any(Array) })));
  });

  test('Save Travel Details creates a snapshot', async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Save Travel Details' }));
    await waitFor(() => expect(mockSaveSnapshot).toHaveBeenCalledWith(mockToken, expect.anything(), 'Travel & logistics'));
  });
});

describe('ClientSpaceClient — Step 3: Activities & Health', () => {
  beforeEach(async () => {
    mockGetClientPreparation.mockResolvedValue({ ...mockPrep, lastSavedStep: 3 });
    await renderAndWait();
    await waitFor(() => expect(screen.getByText('Save Activities & Health')).toBeInTheDocument());
  });

  test('renders Group Style section', () => {
    expect(screen.getByText('Group Style')).toBeInTheDocument();
  });

  test('renders group style pill options', () => {
    expect(screen.getByRole('button', { name: /active & on the go/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /relaxed & laid-back/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /a bit of both/i })).toBeInTheDocument();
  });

  test('renders Activities section with chips', () => {
    expect(screen.getByText('Activities')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sailing' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Swimming' })).toBeInTheDocument();
  });

  test('clicking an activity chip toggles selection', async () => {
    const chip = screen.getByRole('button', { name: 'Sailing' });
    fireEvent.click(chip);
    await waitFor(() => expect(chip).toHaveClass('bg-blue-600'));
  });

  test('renders Health & Experience section with textareas', () => {
    expect(screen.getByText('Health & Experience')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/heart conditions/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/sailing background/i)).toBeInTheDocument();
  });

  test('Save Activities & Health calls saveActivities', async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Save Activities & Health' }));
    await waitFor(() => expect(mockSaveActivities).toHaveBeenCalledWith(mockToken, expect.any(Object)));
  });

  test('Save creates snapshot with correct label', async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Save Activities & Health' }));
    await waitFor(() => expect(mockSaveSnapshot).toHaveBeenCalledWith(mockToken, expect.anything(), 'Activities & health'));
  });
});

describe('ClientSpaceClient — Step 4: Food Preferences', () => {
  beforeEach(async () => {
    mockGetClientPreparation.mockResolvedValue({ ...mockPrep, lastSavedStep: 4 });
    await renderAndWait();
    await waitFor(() => expect(screen.getByText('Save Food Preferences')).toBeInTheDocument());
  });

  test('renders Food Preferences by Category section', () => {
    expect(screen.getByText('Food Preferences by Category')).toBeInTheDocument();
  });

  test('renders all 6 food category labels', () => {
    for (const cat of ['Seafood', 'Meat', 'Fruit', 'Vegetables', 'Dairy', 'Other']) {
      expect(screen.getAllByText(cat).length).toBeGreaterThan(0);
    }
  });

  test('each category has Likes, Dislikes, Allergies fields', () => {
    const likesFields = screen.getAllByPlaceholderText(/grilled fish/i);
    expect(likesFields.length).toBeGreaterThan(0);
    const dislikeFields = screen.getAllByPlaceholderText(/anchovies/i);
    expect(dislikeFields.length).toBeGreaterThan(0);
    const allergyFields = screen.getAllByPlaceholderText(/shellfish/i);
    expect(allergyFields.length).toBeGreaterThan(0);
  });

  test('renders Breakfast section with style chips', () => {
    expect(screen.getByText('Breakfast')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /light \/ cold/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /american/i })).toBeInTheDocument();
  });

  test('renders Lunch and Dinner sections', () => {
    expect(screen.getByText('Lunch')).toBeInTheDocument();
    expect(screen.getByText('Dinner')).toBeInTheDocument();
  });

  test('Save Food Preferences calls saveFood', async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Save Food Preferences' }));
    await waitFor(() => expect(mockSaveFood).toHaveBeenCalledWith(mockToken, expect.any(Object)));
  });

  test('Save creates snapshot with correct label', async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Save Food Preferences' }));
    await waitFor(() => expect(mockSaveSnapshot).toHaveBeenCalledWith(mockToken, expect.anything(), 'Food preferences'));
  });
});

describe('ClientSpaceClient — Step 4: Per-passenger notes on food categories', () => {
  beforeEach(async () => {
    mockGetClientPreparation.mockResolvedValue({
      ...mockPrep,
      lastSavedStep: 4,
      crew: [
        { firstName: 'Alice', lastName: 'Smith', gender: '', dateOfBirth: '', nationality: '', passportNumber: '', dietaryRestrictions: '', medicalNotes: '' },
        { firstName: 'Bob', lastName: 'Smith', gender: '', dateOfBirth: '', nationality: '', passportNumber: '', dietaryRestrictions: '', medicalNotes: '' },
      ],
    });
    await renderAndWait();
    await waitFor(() => expect(screen.getByText('Save Food Preferences')).toBeInTheDocument());
  });

  test('shows "Per passenger details" toggle on each food category', () => {
    const toggles = screen.getAllByText(/per passenger details/i);
    expect(toggles.length).toBeGreaterThanOrEqual(6); // one per category
  });

  test('expanding per-passenger toggle reveals passenger name inputs', async () => {
    const toggles = screen.getAllByText(/per passenger details/i);
    fireEvent.click(toggles[0]);
    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    });
  });
});

describe('ClientSpaceClient — Step 5: Beverages & Bar', () => {
  beforeEach(async () => {
    mockGetClientPreparation.mockResolvedValue({ ...mockPrep, lastSavedStep: 5 });
    await renderAndWait();
    await waitFor(() => expect(screen.getByText('Save Beverage Preferences')).toBeInTheDocument());
  });

  test('renders Hot Beverages section', () => {
    expect(screen.getByText('Hot Beverages')).toBeInTheDocument();
  });

  test('renders beverage chip options', () => {
    expect(screen.getByRole('button', { name: 'Espresso' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cappuccino' })).toBeInTheDocument();
  });

  test('renders Sodas, Juices & Water table section', () => {
    expect(screen.getByText('Sodas, Juices & Water')).toBeInTheDocument();
    expect(screen.getByText('Coke 0.5 l')).toBeInTheDocument();
  });

  test('renders Wines & Sparkling table section', () => {
    expect(screen.getByText('Wines & Sparkling')).toBeInTheDocument();
    expect(screen.getByText('White Wine')).toBeInTheDocument();
    expect(screen.getByText('Rosé Wine')).toBeInTheDocument();
  });

  test('renders Spirits & Beer table section', () => {
    expect(screen.getByText('Spirits & Beer')).toBeInTheDocument();
    expect(screen.getByText('Vodka')).toBeInTheDocument();
    expect(screen.getByText('Gin')).toBeInTheDocument();
  });

  test('renders Qty and Brand columns', () => {
    const qtyLabels = screen.getAllByText('Qty');
    expect(qtyLabels.length).toBeGreaterThan(0);
    const brandLabels = screen.getAllByText('Brand / Notes');
    expect(brandLabels.length).toBeGreaterThan(0);
  });

  test('Save Beverage Preferences calls saveBeverages', async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Save Beverage Preferences' }));
    await waitFor(() => expect(mockSaveBeverages).toHaveBeenCalledWith(mockToken, expect.any(Object)));
  });

  test('Save creates snapshot with correct label', async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Save Beverage Preferences' }));
    await waitFor(() => expect(mockSaveSnapshot).toHaveBeenCalledWith(mockToken, expect.anything(), 'Beverages & bar'));
  });
});

describe('ClientSpaceClient — Step 6: Special Requests & Checklist', () => {
  beforeEach(async () => {
    mockGetClientPreparation.mockResolvedValue({ ...mockPrep, lastSavedStep: 6 });
    await renderAndWait();
    await waitFor(() => expect(screen.getByText('Save & Complete')).toBeInTheDocument());
  });

  test('renders Special Requests section', () => {
    expect(screen.getAllByText('Special Requests').length).toBeGreaterThan(0);
  });

  test('renders special occasion field', () => {
    expect(screen.getByPlaceholderText(/birthday, anniversary/i)).toBeInTheDocument();
  });

  test('renders music atmosphere field', () => {
    expect(screen.getByPlaceholderText(/jazz, mediterranean/i)).toBeInTheDocument();
  });

  test('renders emergency contact fields', () => {
    expect(screen.getByPlaceholderText('Full name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Phone number')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Relationship')).toBeInTheDocument();
  });

  test('renders Pre-Departure Checklist heading', () => {
    expect(screen.getByText('Pre-Departure Checklist')).toBeInTheDocument();
  });

  test('renders checklist categories from mock', () => {
    expect(screen.getByText('Documents')).toBeInTheDocument();
    expect(screen.getByText('Clothing & Packing')).toBeInTheDocument();
  });

  test('renders checklist items', () => {
    expect(screen.getByText('Passport valid for 6+ months')).toBeInTheDocument();
    expect(screen.getByText('Travel insurance arranged')).toBeInTheDocument();
  });

  test('shows 0 / 3 progress initially', () => {
    expect(screen.getByText('0 / 3')).toBeInTheDocument();
  });

  test('toggling a checklist item calls saveChecklist', async () => {
    const item = screen.getByRole('button', { name: /passport valid/i });
    fireEvent.click(item);
    await waitFor(() => expect(mockSaveChecklist).toHaveBeenCalledWith(
      mockToken,
      expect.objectContaining({ 'doc-passport': true })
    ));
  });

  test('toggling a checklist item updates progress counter', async () => {
    const item = screen.getByRole('button', { name: /passport valid/i });
    fireEvent.click(item);
    await waitFor(() => expect(screen.getByText('1 / 3')).toBeInTheDocument());
  });

  test('Save & Complete calls saveSpecial and saveStep(6)', async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Save & Complete' }));
    await waitFor(() => expect(mockSaveSpecial).toHaveBeenCalledWith(mockToken, expect.any(Object)));
    expect(mockSaveStep).toHaveBeenCalledWith(mockToken, 6);
  });

  test('Save creates snapshot with correct label', async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Save & Complete' }));
    await waitFor(() => expect(mockSaveSnapshot).toHaveBeenCalledWith(mockToken, expect.anything(), 'Special requests'));
  });
});

describe('ClientSpaceClient — History drawer', () => {
  test('clicking History button loads and shows history drawer', async () => {
    mockGetHistory.mockResolvedValue([
      {
        id: 'snap-1',
        label: 'Crew details',
        savedAt: { toDate: () => new Date('2026-06-01T10:00:00') },
        data: mockPrep,
      },
    ]);
    await renderAndWait();
    fireEvent.click(screen.getByRole('button', { name: /history/i }));
    await waitFor(() => expect(screen.getByText('Crew details')).toBeInTheDocument());
  });

  test('History drawer shows empty state when no snapshots', async () => {
    mockGetHistory.mockResolvedValue([]);
    await renderAndWait();
    fireEvent.click(screen.getByRole('button', { name: /history/i }));
    await waitFor(() => expect(screen.getByText(/no history yet/i)).toBeInTheDocument());
  });
});
