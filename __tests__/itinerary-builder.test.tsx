import React from 'react';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';

// ---------------------------------------------------------------------------
// Mock next/server so the API routes can be invoked directly in jsdom.
// ---------------------------------------------------------------------------
jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}));

// ---------------------------------------------------------------------------
// Mock OpenAI — a single shared create() spy drives both routes.
// ---------------------------------------------------------------------------
const mockCreate = jest.fn();
jest.mock('openai', () =>
  jest.fn().mockImplementation(() => ({
    chat: { completions: { create: mockCreate } },
  })),
);

// ---------------------------------------------------------------------------
// Mock Firebase so the real lib/clientSpace can be loaded (via requireActual)
// without initialising an app.
// ---------------------------------------------------------------------------
jest.mock('../lib/firebase', () => ({ db: {}, storage: {} }));

// ---------------------------------------------------------------------------
// Keep the real pure helpers (makeItineraryStops, newStopId) but stub the
// Firestore-touching functions.
// ---------------------------------------------------------------------------
const mockGetPrep = jest.fn();
const mockGetCharter = jest.fn();
const mockSaveItinerary = jest.fn().mockResolvedValue(undefined);
const mockAddItineraryMessage = jest.fn().mockResolvedValue(undefined);

jest.mock('../lib/clientSpace', () => {
  const actual = jest.requireActual('../lib/clientSpace');
  return {
    ...actual,
    getClientPreparation: (...a: unknown[]) => mockGetPrep(...a),
    getCharterByClientSpaceToken: (...a: unknown[]) => mockGetCharter(...a),
    saveItinerary: (...a: unknown[]) => mockSaveItinerary(...a),
    addItineraryMessage: (...a: unknown[]) => mockAddItineraryMessage(...a),
  };
});

// ---------------------------------------------------------------------------
// Mock the SSR-safe map loader so we don't pull in @react-google-maps/api.
// Renders one marker per stop and flags the selected one.
// ---------------------------------------------------------------------------
jest.mock('../app/client-space/[token]/itinerary/ItineraryMapLoader.client', () => ({
  __esModule: true,
  default: ({ stops, selectedId }: { stops: Array<{ id: string; title: string }>; selectedId?: string }) => (
    <div data-testid="itinerary-map">
      {stops.map(s => (
        <div key={s.id} data-testid="map-marker" data-selected={selectedId === s.id ? 'true' : 'false'}>
          {s.title}
        </div>
      ))}
    </div>
  ),
}));

// ---------------------------------------------------------------------------
// Imports AFTER mocks
// ---------------------------------------------------------------------------
import { POST as generatePOST } from '../app/api/itinerary-generate/route';
import { POST as chatPOST } from '../app/api/itinerary-chat/route';
import ItineraryBuilderClient from '../app/client-space/[token]/itinerary/ItineraryBuilderClient';
import adventures from '../app/adventures-data';

const TOKEN = 'tok-123';

const baseCharter = {
  id: 'charter-1',
  name: 'Smith',
  startDate: '2026-07-01',
  endDate: '2026-07-08',
  boat: 'BlueOne',
  passengers: 4,
  embarkationPoint: 'Athens',
  selectedTheme: '3', // Yoga & Wellness Retreat
  holidayDescription: 'A calm, wellness-focused week',
  status: 'confirmed' as const,
};

const emptyPrep = {
  token: TOKEN,
  charterId: 'charter-1',
  lastSavedStep: 0,
  crew: [],
  travel: {},
  activities: {},
  food: {},
  beverages: {},
  special: {},
  checklist: {},
  itineraryMessages: [],
  createdAt: null,
  updatedAt: null,
};

function makeRequest(body: unknown) {
  return { json: async () => body } as never;
}

function stops(...titles: string[]) {
  return titles.map((title, i) => ({
    id: `s${i}`,
    order: i,
    title,
    description: `${title} description`,
    features: [] as string[],
    lat: 37 + i,
    lng: 24 + i,
  }));
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetCharter.mockResolvedValue(baseCharter);
  mockGetPrep.mockResolvedValue(emptyPrep);
  mockSaveItinerary.mockResolvedValue(undefined);
  mockAddItineraryMessage.mockResolvedValue(undefined);
  global.fetch = jest.fn();
});

async function renderBuilderNoItinerary() {
  render(<ItineraryBuilderClient token={TOKEN} />);
  await waitFor(() => expect(screen.getByText('Start your itinerary')).toBeInTheDocument());
}

async function renderBuilderWithItinerary(itineraryStops: ReturnType<typeof stops>) {
  mockGetPrep.mockResolvedValue({
    ...emptyPrep,
    itinerary: { source: 'manual', stops: itineraryStops },
  });
  render(<ItineraryBuilderClient token={TOKEN} />);
  await waitFor(() => expect(screen.getByText('Day-by-Day Stops')).toBeInTheDocument());
}

// ===========================================================================
// 1. Seed from theme (client-side, no AI route)
// ===========================================================================
describe('Seeding from a booked theme', () => {
  test('copies the theme itinerary into saveItinerary without calling the AI route', async () => {
    await renderBuilderNoItinerary();

    fireEvent.click(screen.getByRole('button', { name: /Yoga & Wellness Retreat/ }));

    await waitFor(() => expect(mockSaveItinerary).toHaveBeenCalled());
    const [tok, saved] = mockSaveItinerary.mock.calls[0];
    expect(tok).toBe(TOKEN);
    expect(saved.source).toBe('theme');
    expect(saved.sourceThemeId).toBe('3');

    const themeItinerary = adventures.find(a => a.id === '3')!.itinerary;
    expect(saved.stops).toHaveLength(themeItinerary.length);
    expect(saved.stops[0].title).toBe(themeItinerary[0].title);

    // No AI generation request was made.
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

// ===========================================================================
// 2 & 3. POST /api/itinerary-generate (AI path)
// ===========================================================================
describe('POST /api/itinerary-generate', () => {
  const aiCharter = { ...baseCharter, selectedTheme: undefined };

  test('returns an AI itinerary whose stop count reflects the trip length', async () => {
    const aiStops = Array.from({ length: 8 }, (_, i) => ({
      title: `Day ${i + 1}`,
      description: 'Sail and swim',
      features: ['Swimming'],
      lat: 37 + i * 0.1,
      lng: 24 + i * 0.1,
    }));
    mockCreate.mockResolvedValue({ choices: [{ message: { content: JSON.stringify({ stops: aiStops }) } }] });

    const res = await generatePOST(makeRequest({ charter: aiCharter }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.itinerary.source).toBe('ai');
    expect(data.itinerary.stops).toHaveLength(8);
    expect(data.itinerary.stops[0]).toHaveProperty('id');
    expect(data.itinerary.stops[0].order).toBe(0);

    // Trip is 2026-07-01 → 2026-07-08 (8 days) and that reaches the prompt.
    const prompt = mockCreate.mock.calls[0][0].messages[0].content as string;
    expect(prompt).toContain('8 day');
  });

  test('returns 500 on malformed AI JSON without crashing', async () => {
    mockCreate.mockResolvedValue({ choices: [{ message: { content: 'this is not json {' } }] });

    const res = await generatePOST(makeRequest({ charter: aiCharter }));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBeTruthy();
  });
});

// ===========================================================================
// 4. POST /api/itinerary-chat
// ===========================================================================
describe('POST /api/itinerary-chat', () => {
  test('returns revised stops and a reply', async () => {
    const current = stops('Athens', 'Poros', 'Hydra');
    const revised = stops('Athens', 'Kea', 'Hydra');
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ stops: revised, reply: 'Swapped Poros for Kea.' }) } }],
    });

    const res = await chatPOST(makeRequest({ stops: current, message: 'Swap day 2 for a quieter island' }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.reply).toBe('Swapped Poros for Kea.');
    expect(data.stops[1].title).toBe('Kea');
  });

  test('leaves stops unchanged when the AI returns no stops', async () => {
    const current = stops('Athens', 'Poros');
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ reply: 'Your itinerary already looks great!' }) } }],
    });

    const res = await chatPOST(makeRequest({ stops: current, message: 'What is the weather like?' }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.stops).toHaveLength(2);
    expect(data.stops.map((s: { title: string }) => s.title)).toEqual(['Athens', 'Poros']);
    expect(data.reply).toContain('already looks great');
  });
});

// ===========================================================================
// 5. Manual edits — add / remove / reorder
// ===========================================================================
describe('Manual stop editing', () => {
  test('adding a stop appends it with the next order and persists', async () => {
    await renderBuilderWithItinerary(stops('Athens', 'Poros'));

    fireEvent.click(screen.getByRole('button', { name: /Add a stop/i }));

    await waitFor(() => expect(mockSaveItinerary).toHaveBeenCalled());
    const saved = mockSaveItinerary.mock.calls.at(-1)![1];
    expect(saved.stops).toHaveLength(3);
    expect(saved.stops[2].order).toBe(2);
  });

  test('removing a stop drops it and re-saves', async () => {
    await renderBuilderWithItinerary(stops('Athens', 'Poros'));

    fireEvent.click(screen.getByRole('button', { name: 'Remove stop 1' }));

    await waitFor(() => expect(mockSaveItinerary).toHaveBeenCalled());
    const saved = mockSaveItinerary.mock.calls.at(-1)![1];
    expect(saved.stops).toHaveLength(1);
    expect(saved.stops[0].title).toBe('Poros');
    expect(saved.stops[0].order).toBe(0);
  });

  test('reordering updates order values and persists', async () => {
    await renderBuilderWithItinerary(stops('Athens', 'Poros'));

    fireEvent.click(screen.getByRole('button', { name: 'Move stop 1 down' }));

    await waitFor(() => expect(mockSaveItinerary).toHaveBeenCalled());
    const saved = mockSaveItinerary.mock.calls.at(-1)![1];
    expect(saved.stops[0].title).toBe('Poros');
    expect(saved.stops[0].order).toBe(0);
    expect(saved.stops[1].title).toBe('Athens');
    expect(saved.stops[1].order).toBe(1);
  });
});

// ===========================================================================
// 6. Map renders one marker per stop and highlights the focused one
// ===========================================================================
describe('Itinerary map', () => {
  test('renders one marker per stop and highlights the hovered stop', async () => {
    await renderBuilderWithItinerary(stops('Athens', 'Poros', 'Hydra'));

    const map = screen.getByTestId('itinerary-map');
    expect(within(map).getAllByTestId('map-marker')).toHaveLength(3);

    fireEvent.mouseEnter(screen.getAllByTestId('itinerary-stop')[0]);

    await waitFor(() => {
      const markers = within(screen.getByTestId('itinerary-map')).getAllByTestId('map-marker');
      expect(markers[0]).toHaveAttribute('data-selected', 'true');
      expect(markers[1]).toHaveAttribute('data-selected', 'false');
    });
  });
});

// ===========================================================================
// 7. Chat composer
// ===========================================================================
describe('Chat composer', () => {
  test('shows the user bubble immediately, disables input in flight, then shows the AI reply and updates stops', async () => {
    await renderBuilderWithItinerary(stops('Athens', 'Poros', 'Hydra'));

    // Defer the fetch so we can observe the in-flight state.
    let resolveFetch: (v: unknown) => void = () => {};
    (global.fetch as jest.Mock).mockReturnValue(
      new Promise(resolve => { resolveFetch = resolve; }),
    );

    const input = screen.getByLabelText('Message the itinerary assistant') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Add a sunset dinner stop' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));

    // User bubble appears immediately and the input is disabled while in flight.
    expect(screen.getByText('Add a sunset dinner stop')).toBeInTheDocument();
    expect(input).toBeDisabled();
    expect(mockAddItineraryMessage).toHaveBeenCalledWith(
      TOKEN,
      expect.objectContaining({ isAi: false, text: 'Add a sunset dinner stop' }),
    );

    // Resolve the AI response.
    resolveFetch({
      ok: true,
      json: async () => ({ stops: stops('Athens', 'Poros', 'Hydra', 'Sunset dinner'), reply: 'Added a sunset dinner stop.' }),
    });

    await waitFor(() => expect(screen.getByText('Added a sunset dinner stop.')).toBeInTheDocument());
    expect(input).not.toBeDisabled();

    // Stops were persisted with the new stop, and the AI reply was recorded.
    const saved = mockSaveItinerary.mock.calls.at(-1)![1];
    expect(saved.stops).toHaveLength(4);
    expect(mockAddItineraryMessage).toHaveBeenCalledWith(TOKEN, expect.objectContaining({ isAi: true }));
  });
});

// ===========================================================================
// 8. AI failure surfaces an error and leaves the itinerary untouched
// ===========================================================================
describe('AI failure handling', () => {
  test('a failed generation on an empty itinerary shows an error and saves nothing', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 500, json: async () => ({ error: 'boom' }) });

    await renderBuilderNoItinerary();
    fireEvent.click(screen.getByRole('button', { name: /Generate with AI/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByRole('alert').textContent).toMatch(/could not generate/i);
    expect(mockSaveItinerary).not.toHaveBeenCalled();
  });

  test('a failed regeneration leaves the existing itinerary untouched', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('network'));

    await renderBuilderWithItinerary(stops('Athens', 'Poros'));
    fireEvent.click(screen.getByRole('button', { name: /Regenerate with AI/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    // The two original stops are still on screen; nothing was persisted.
    expect(screen.getByDisplayValue('Athens')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Poros')).toBeInTheDocument();
    expect(mockSaveItinerary).not.toHaveBeenCalled();
  });
});
