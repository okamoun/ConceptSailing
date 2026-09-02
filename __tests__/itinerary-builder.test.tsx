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
import { POST as weatherPOST } from '../app/api/itinerary-weather/route';
import ItineraryBuilderClient from '../app/client-space/[token]/itinerary/ItineraryBuilderClient';
import ItineraryReportClient from '../app/client-space/[token]/itinerary/report/ItineraryReportClient';
import { searchGreekLocations } from '../app/greek-locations';
import { buildItineraryPrompt } from '../app/itinerary-prompt';
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
  process.env.OPENAI_API_KEY = 'test-key';
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

    // Each stop is dated sequentially from the charter start.
    expect(data.itinerary.stops[0].date).toBe('2026-07-01');
    expect(data.itinerary.stops[7].date).toBe('2026-07-08');

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

  test('returns a clear error when the OpenAI key is not configured', async () => {
    const saved = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;
    try {
      const res = await generatePOST(makeRequest({ charter: aiCharter }));
      expect(res.status).toBe(500);
      const data = await res.json();
      expect(data.details).toMatch(/API key/i);
      expect(mockCreate).not.toHaveBeenCalled();
    } finally {
      process.env.OPENAI_API_KEY = saved;
    }
  });

  test('uses the client-supplied prompt verbatim and skips the theme fast-path', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify({ stops: [{ title: 'Bay', description: 'Quiet', features: [], lat: 37, lng: 24 }] }) } }],
    });

    // baseCharter has selectedTheme '3', but an explicit prompt forces AI generation.
    const res = await generatePOST(makeRequest({ charter: { ...baseCharter }, prompt: 'PLAN ONLY QUIET BAYS' }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.itinerary.source).toBe('ai');
    expect(mockCreate.mock.calls[0][0].messages[0].content).toBe('PLAN ONLY QUIET BAYS');
  });
});

describe('buildItineraryPrompt', () => {
  test('reflects the trip length, dates, embarkation and preferences', () => {
    const prompt = buildItineraryPrompt({
      startDate: '2026-07-01',
      endDate: '2026-07-08',
      embarkationPoint: 'Lavrio',
      passengers: 6,
      holidayDescription: 'lots of snorkelling',
    });
    expect(prompt).toContain('8 day');
    expect(prompt).toContain('Lavrio');
    expect(prompt).toContain('6');
    expect(prompt).toContain('lots of snorkelling');
    // The actual dates and season reach the prompt.
    expect(prompt).toContain('1 July 2026');
    expect(prompt).toMatch(/July/);
  });

  test('includes the chosen theme and the disembarkation point from the booking', () => {
    const prompt = buildItineraryPrompt({
      startDate: '2026-07-01',
      endDate: '2026-07-08',
      embarkationPoint: 'Lavrio',
      disembarkationPort: 'Mykonos',
      selectedTheme: '3', // Yoga & Wellness Retreat
      passengers: 4,
      holidayDescription: 'calm and restorative',
    });
    expect(prompt).toContain('Yoga & Wellness Retreat');
    expect(prompt).toContain('Mykonos');
    expect(prompt).toContain('Lavrio');
    expect(prompt).toMatch(/theme/i);
  });

  test('resolves marina ids to names for delivery / redelivery points', () => {
    const prompt = buildItineraryPrompt({
      startDate: '2026-05-01',
      endDate: '2026-05-05',
      deliveryPoint: 'alimos',
      redeliveryPoint: 'lavrio',
    });
    expect(prompt).toContain('Alimos Marina');
    expect(prompt).toContain('Lavrio Port');
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
// POST /api/itinerary-weather
// ===========================================================================
describe('POST /api/itinerary-weather', () => {
  function isoInDays(days: number) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
  }

  test('returns a live forecast when the date is within range', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        daily: {
          temperature_2m_max: [30],
          temperature_2m_min: [22],
          weather_code: [0],
          wind_speed_10m_max: [18],
        },
      }),
    });

    const res = await weatherPOST(makeRequest({ lat: 37.4, lng: 25.3, date: isoInDays(3) }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.weather.source).toBe('forecast');
    expect(data.weather.tempMaxC).toBe(30);
    expect(data.weather.windKmh).toBe(18);
    expect(data.weather.emoji).toBeTruthy();
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('falls back to a seasonal average beyond the forecast window (no network call)', async () => {
    const res = await weatherPOST(makeRequest({ lat: 37.4, lng: 25.3, date: isoInDays(120) }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.weather.source).toBe('seasonal');
    expect(typeof data.weather.tempMaxC).toBe('number');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('falls back to seasonal when the forecast request fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('network'));

    const res = await weatherPOST(makeRequest({ lat: 37.4, lng: 25.3, date: isoInDays(2) }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.weather.source).toBe('seasonal');
  });
});

// ===========================================================================
// 5. Manual edits — add / remove / reorder
// ===========================================================================
describe('Manual stop editing', () => {
  test('adding a new day appends a stop with the next order and persists', async () => {
    await renderBuilderWithItinerary(stops('Athens', 'Poros'));

    fireEvent.click(screen.getByRole('button', { name: /Add a new day/i }));

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

  test('each stop has a date field that persists changes', async () => {
    await renderBuilderWithItinerary(stops('Athens', 'Poros'));

    const dateInput = screen.getByLabelText('Stop 1 date') as HTMLInputElement;
    expect(dateInput).toBeInTheDocument();
    fireEvent.change(dateInput, { target: { value: '2026-07-03' } });

    await waitFor(() => expect(mockSaveItinerary).toHaveBeenCalled());
    const saved = mockSaveItinerary.mock.calls.at(-1)![1];
    expect(saved.stops[0].date).toBe('2026-07-03');
  });

  test('adding a stop within a day inserts it after that day and keeps the date', async () => {
    // Undated stops fall into one day each (Day 1, Day 2) from 2026-07-01.
    await renderBuilderWithItinerary(stops('Athens', 'Poros'));

    fireEvent.click(screen.getByRole('button', { name: /Add stop to Day 1/i }));

    await waitFor(() => expect(mockSaveItinerary).toHaveBeenCalled());
    const saved = mockSaveItinerary.mock.calls.at(-1)![1];
    expect(saved.stops).toHaveLength(3);
    // Inserted right after Day 1's stop, sharing its date.
    expect(saved.stops[1].title).toBe('New stop');
    expect(saved.stops[1].date).toBe('2026-07-01');
    expect(saved.stops[2].title).toBe('Poros');
  });

  test('picking a location moves the point and records the place', async () => {
    await renderBuilderWithItinerary(stops('Athens', 'Poros'));

    fireEvent.change(screen.getByLabelText('Stop 1 location'), { target: { value: 'Hydra' } });
    const option = await screen.findByRole('button', { name: /Hydra/ });
    fireEvent.mouseDown(option);

    await waitFor(() => expect(mockSaveItinerary).toHaveBeenCalled());
    const saved = mockSaveItinerary.mock.calls.at(-1)![1];
    expect(saved.stops[0].locationName).toBe('Hydra');
    expect(saved.stops[0].lat).toBeCloseTo(37.349, 2);
    expect(saved.stops[0].lng).toBeCloseTo(23.467, 2);
  });

  test('the single field accepts manual entry, saving the typed name without a map point', async () => {
    await renderBuilderWithItinerary(stops('Athens', 'Poros'));

    fireEvent.change(screen.getByLabelText('Stop 1 location'), { target: { value: 'Secret cove' } });

    await waitFor(() => expect(mockSaveItinerary).toHaveBeenCalled());
    const saved = mockSaveItinerary.mock.calls.at(-1)![1];
    expect(saved.stops[0].title).toBe('Secret cove');
    expect(saved.stops[0].locationName).toBeUndefined();
    expect(saved.stops[0].lat).toBeUndefined();
  });

  test('editing the name of a located stop clears its now-stale map point', async () => {
    await renderBuilderWithItinerary([
      { id: 'a', order: 0, title: 'Hydra', locationName: 'Hydra', description: '', features: [], lat: 37.349, lng: 23.467 },
      { id: 'b', order: 1, title: 'Poros', description: '', features: [] },
    ]);

    fireEvent.change(screen.getByLabelText('Stop 1 location'), { target: { value: 'Hydra bay' } });

    await waitFor(() => expect(mockSaveItinerary).toHaveBeenCalled());
    const saved = mockSaveItinerary.mock.calls.at(-1)![1];
    expect(saved.stops[0].title).toBe('Hydra bay');
    expect(saved.stops[0].lat).toBeUndefined();
    expect(saved.stops[0].lng).toBeUndefined();
    expect(saved.stops[0].locationName).toBeUndefined();
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
// Distance & navigation time per leg
// ===========================================================================
describe('Sailing distance & navigation time', () => {
  test('shows a leg badge for every stop after the first, plus a total', async () => {
    await renderBuilderWithItinerary(stops('Athens', 'Poros', 'Hydra'));

    // One leg badge per hop between located stops (n - 1).
    expect(screen.getAllByTestId('leg-info')).toHaveLength(2);
    // Distance is expressed in nautical miles.
    expect(screen.getAllByTestId('leg-info')[0].textContent).toMatch(/nm/);
    // A total summary is shown.
    expect(screen.getByText(/under way/i)).toBeInTheDocument();
    // The first stop is flagged as the embarkation point (no inbound leg).
    expect(screen.getByText('Embarkation')).toBeInTheDocument();
  });

  test('omits the leg badge when a stop has no coordinates', async () => {
    const withGap = stops('Athens', 'Poros');
    delete (withGap[1] as { lat?: number }).lat; // second stop loses its coordinates
    await renderBuilderWithItinerary(withGap);

    expect(screen.queryByTestId('leg-info')).not.toBeInTheDocument();
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
// Greek location search
// ===========================================================================
describe('searchGreekLocations', () => {
  test('finds a known island with coordinates and ranks prefix matches first', () => {
    const results = searchGreekLocations('poros');
    expect(results.length).toBeGreaterThan(0);
    const poros = results.find(r => r.name === 'Poros');
    expect(poros).toBeDefined();
    expect(poros!.lat).toBeCloseTo(37.5, 1);
    // A prefix match ('Poros') ranks ahead of a mere substring ('Porto Cheli').
    expect(results[0].name.toLowerCase().startsWith('poros')).toBe(true);
  });

  test('matches marinas too and returns nothing for a blank query', () => {
    expect(searchGreekLocations('  ')).toHaveLength(0);
    const alimos = searchGreekLocations('alimos');
    expect(alimos.some(r => /alimos/i.test(r.name))).toBe(true);
  });
});

// ===========================================================================
// Prompt editor before AI generation
// ===========================================================================
describe('AI prompt editor', () => {
  test('shows the editable prompt and sends the edited version', async () => {
    await renderBuilderNoItinerary();

    // Clicking generate opens the prompt editor rather than firing immediately.
    fireEvent.click(screen.getByRole('button', { name: /Generate with AI/i }));
    const promptBox = (await screen.findByLabelText('AI prompt')) as HTMLTextAreaElement;
    expect(promptBox.value).toMatch(/day-by-day sailing itinerary/i);
    // The booking context reaches the prompt: embarkation and the chosen theme.
    expect(promptBox.value).toContain('Athens');
    expect(promptBox.value).toContain('Yoga & Wellness Retreat'); // baseCharter.selectedTheme = '3'
    expect(global.fetch).not.toHaveBeenCalled();

    fireEvent.change(promptBox, { target: { value: 'Custom prompt: quiet bays only' } });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ itinerary: { source: 'ai', stops: stops('Kea', 'Serifos') } }),
    });
    fireEvent.click(screen.getByRole('button', { name: /Generate itinerary/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.prompt).toBe('Custom prompt: quiet bays only');
    await waitFor(() => expect(mockSaveItinerary).toHaveBeenCalled());
  });

  test('cancel closes the editor without generating', async () => {
    await renderBuilderNoItinerary();
    fireEvent.click(screen.getByRole('button', { name: /Generate with AI/i }));
    await screen.findByLabelText('AI prompt');
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));

    await waitFor(() => expect(screen.queryByLabelText('AI prompt')).not.toBeInTheDocument());
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

// ===========================================================================
// Per-day navigation hours
// ===========================================================================
describe('Per-day navigation hours', () => {
  test('the report shows sailing time per day (and "At anchor" for a stay-put day)', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({}) });
    mockGetPrep.mockResolvedValue({
      ...emptyPrep,
      itinerary: { source: 'manual', stops: stops('Athens', 'Poros', 'Hydra') },
    });
    render(<ItineraryReportClient token={TOKEN} />);

    await waitFor(() => expect(screen.getByText('Day-by-Day Itinerary')).toBeInTheDocument());
    // One nav summary per day; Day 1 has no inbound leg → "At anchor".
    expect(screen.getAllByTestId('day-nav')).toHaveLength(3);
    expect(screen.getByText(/At anchor/)).toBeInTheDocument();
    expect(screen.getAllByText(/sailing/).length).toBeGreaterThanOrEqual(2);
  });
});

// ===========================================================================
// Itinerary report
// ===========================================================================
describe('Itinerary report', () => {
  test('renders an overview and a day-by-day breakdown with dates and weather', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        weather: { source: 'seasonal', emoji: '☀️', label: 'Hot and sunny', tempMaxC: 31, tempMinC: 23, windLabel: 'Meltemi' },
      }),
    });
    mockGetPrep.mockResolvedValue({
      ...emptyPrep,
      itinerary: { source: 'manual', stops: stops('Athens', 'Poros', 'Hydra') },
    });
    render(<ItineraryReportClient token={TOKEN} />);

    await waitFor(() => expect(screen.getByText('Trip Overview')).toBeInTheDocument());
    expect(screen.getByText('Day-by-Day Itinerary')).toBeInTheDocument();

    // One day entry per stop, with a total distance and an embarkation flag.
    expect(screen.getAllByText('Day')).toHaveLength(3);
    expect(screen.getByText('Total distance')).toBeInTheDocument();
    expect(screen.getByText(/⚓ Embarkation/)).toBeInTheDocument();
    // Two hops between the three stops, each showing an inbound leg.
    expect(screen.getAllByText(/from previous stop/)).toHaveLength(2);

    // Dates are shown (charter starts 2026-07-01) and weather loads per day.
    expect(screen.getByText('1 July 2026')).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByTestId('weather')).toHaveLength(3));
  });

  test('groups several stops that share a date under a single day', async () => {
    const dated = [
      { id: 'a', order: 0, title: 'Piraeus', description: 'Board', features: [] as string[], date: '2026-07-01', lat: 37.98, lng: 23.72 },
      { id: 'b', order: 1, title: 'Cape Sounion', description: 'Temple', features: [] as string[], date: '2026-07-01', lat: 37.65, lng: 24.02 },
      { id: 'c', order: 2, title: 'Kea', description: 'Bay', features: [] as string[], date: '2026-07-02', lat: 37.61, lng: 24.33 },
    ];
    mockGetPrep.mockResolvedValue({ ...emptyPrep, itinerary: { source: 'manual', stops: dated } });
    render(<ItineraryReportClient token={TOKEN} />);

    await waitFor(() => expect(screen.getByText('Day-by-Day Itinerary')).toBeInTheDocument());

    // Two dates → two day badges, but all three stops are listed (as headings).
    expect(screen.getAllByText('Day')).toHaveLength(2);
    expect(screen.getByRole('heading', { name: 'Piraeus' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Cape Sounion' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Kea' })).toBeInTheDocument();
  });

  test('shows an empty state with a link back to the builder when no itinerary exists', async () => {
    mockGetPrep.mockResolvedValue({ ...emptyPrep, itinerary: undefined });
    render(<ItineraryReportClient token={TOKEN} />);

    await waitFor(() => expect(screen.getByText(/No itinerary has been built yet/i)).toBeInTheDocument());
    expect(screen.getByRole('link', { name: /Build your itinerary/i })).toHaveAttribute(
      'href',
      `/client-space/${TOKEN}/itinerary`,
    );
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
    fireEvent.click(await screen.findByRole('button', { name: /Generate itinerary/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByRole('alert').textContent).toMatch(/could not generate/i);
    // The server's reason is surfaced to the client, not hidden behind a generic message.
    expect(screen.getByRole('alert').textContent).toMatch(/boom/);
    expect(mockSaveItinerary).not.toHaveBeenCalled();
  });

  test('a failed regeneration leaves the existing itinerary untouched', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('network'));

    await renderBuilderWithItinerary(stops('Athens', 'Poros'));
    fireEvent.click(screen.getByRole('button', { name: /Regenerate with AI/i }));
    fireEvent.click(await screen.findByRole('button', { name: /Generate itinerary/i }));

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    // The two original stops are still on screen; nothing was persisted.
    expect(screen.getByDisplayValue('Athens')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Poros')).toBeInTheDocument();
    expect(mockSaveItinerary).not.toHaveBeenCalled();
  });
});
