// Mock next/server before anything imports it so Request is never needed.
jest.mock('next/server', () => {
  class MockResponse {
    _body: unknown;
    status: number;
    constructor(body: unknown, init?: { status?: number }) {
      this._body = body;
      this.status = init?.status ?? 200;
    }
    json() { return Promise.resolve(this._body); }
    static json(body: unknown, init?: { status?: number }) {
      return new MockResponse(body, init);
    }
  }
  return { NextRequest: class {}, NextResponse: MockResponse };
});

// ---------------------------------------------------------------------------
// Firebase stubs
// ---------------------------------------------------------------------------

const mockAddDoc = jest.fn();
const mockUpdateDoc = jest.fn();
const mockGetDoc = jest.fn();
const mockGetDocs = jest.fn();

jest.mock('../lib/firebase', () => ({ db: {} }));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => ({})),
  doc: jest.fn(() => ({})),
  addDoc: (...args: unknown[]) => mockAddDoc(...args),
  updateDoc: (...args: unknown[]) => mockUpdateDoc(...args),
  getDoc: (...args: unknown[]) => mockGetDoc(...args),
  getDocs: (...args: unknown[]) => mockGetDocs(...args),
  deleteDoc: jest.fn(),
  serverTimestamp: jest.fn(() => 'SERVER_TS'),
}));

// ---------------------------------------------------------------------------
// OpenAI stub
// ---------------------------------------------------------------------------

const mockCreate = jest.fn();

jest.mock('openai', () => ({
  __esModule: true,
  // Use a real class so `new OpenAI()` always works regardless of clearAllMocks.
  default: class MockOpenAI {
    chat = { completions: { create: (...args: unknown[]) => mockCreate(...args) } };
  },
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeNextRequest(body: unknown) {
  return {
    json: () => Promise.resolve(body),
  } as unknown as import('next/server').NextRequest;
}

const VALID_ITINERARY = Array.from({ length: 7 }, (_, i) => ({
  title: `Day ${i + 1}`,
  description: `Description for day ${i + 1}`,
  features: ['Sailing'],
  lat: 37 + i * 0.1,
  lng: 23 + i * 0.1,
}));

const VALID_EXPERIENCE_JSON = {
  name: 'Romantic Santorini Cruise',
  description: 'A dreamy sunset cruise around Santorini with wine tasting.',
  experience: 'Sail the caldera waters at dusk with curated wines from local vineyards.',
  itinerary: VALID_ITINERARY,
  features: ['Wine tasting', 'Sunset cruise', 'Private yacht'],
};

// ---------------------------------------------------------------------------
// Tests: POST /api/generate-experience
// ---------------------------------------------------------------------------

describe('POST /api/generate-experience', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns parsed adventure object on success', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(VALID_EXPERIENCE_JSON) } }],
    });

    const { POST } = await import('../app/api/generate-experience/route');
    const req = makeNextRequest({ prompt: 'A romantic sunset cruise around Santorini with wine tasting' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.name).toBe('Romantic Santorini Cruise');
    expect(data.description).toBeDefined();
    expect(data.experience).toBeDefined();
    expect(Array.isArray(data.itinerary)).toBe(true);
    expect(data.itinerary).toHaveLength(7);
    data.itinerary.forEach((day: { lat: unknown; lng: unknown }) => {
      expect(typeof day.lat).toBe('number');
      expect(typeof day.lng).toBe('number');
    });
    expect(Array.isArray(data.features)).toBe(true);
  });

  it('returns 400 when prompt is missing', async () => {
    const { POST } = await import('../app/api/generate-experience/route');
    const req = makeNextRequest({});
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('Missing prompt');
  });

  it('returns 500 when OpenAI returns malformed JSON', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'This is not JSON at all!' } }],
    });

    const { POST } = await import('../app/api/generate-experience/route');
    const req = makeNextRequest({ prompt: 'Some prompt' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(500);
    expect(data.error).toContain('Failed to parse');
  });
});

// ---------------------------------------------------------------------------
// Tests: POST /api/modify-itinerary
// ---------------------------------------------------------------------------

describe('POST /api/modify-itinerary', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns modified itinerary array only', async () => {
    const modifiedItinerary = VALID_ITINERARY.map((d, i) =>
      i === 2 ? { ...d, title: 'Dolphin Watching Day', features: ['Dolphin watching'] } : d
    );
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(modifiedItinerary) } }],
    });

    const { POST } = await import('../app/api/modify-itinerary/route');
    const req = makeNextRequest({ itinerary: VALID_ITINERARY, prompt: 'Add dolphin watching to day 3' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(7);
    // The response is the itinerary only — no name/features at top level
    expect(data.name).toBeUndefined();
    expect(data.features).toBeUndefined();
  });

  it('returns 400 when prompt is missing', async () => {
    const { POST } = await import('../app/api/modify-itinerary/route');
    const req = makeNextRequest({ itinerary: VALID_ITINERARY });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when itinerary is missing', async () => {
    const { POST } = await import('../app/api/modify-itinerary/route');
    const req = makeNextRequest({ prompt: 'Some change' });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// Tests: lib/experiences.ts Firestore CRUD
// ---------------------------------------------------------------------------

describe('createExperience', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls addDoc with experience data + timestamps and returns the new ID', async () => {
    mockAddDoc.mockResolvedValue({ id: 'abc123' });

    const { createExperience } = await import('../lib/experiences');
    const id = await createExperience({
      name: 'Test Experience',
      description: 'A test',
      experience: 'Longer description',
      itinerary: VALID_ITINERARY,
      features: ['Sailing'],
      aiGenerated: true,
      prompt: 'test prompt',
    });

    expect(id).toBe('abc123');
    expect(mockAddDoc).toHaveBeenCalledTimes(1);
    const payload = mockAddDoc.mock.calls[0][1];
    expect(payload.name).toBe('Test Experience');
    expect(payload.aiGenerated).toBe(true);
    expect(payload.createdAt).toBe('SERVER_TS');
    expect(payload.updatedAt).toBe('SERVER_TS');
  });

  it('sets aiGenerated: false when no prompt provided', async () => {
    mockAddDoc.mockResolvedValue({ id: 'def456' });

    const { createExperience } = await import('../lib/experiences');
    await createExperience({
      name: 'Manual Experience',
      description: 'Manually written',
      experience: 'Manual longer desc',
      itinerary: [],
      features: [],
      aiGenerated: false,
    });

    const payload = mockAddDoc.mock.calls[0][1];
    expect(payload.aiGenerated).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests: getAllExperiences (static + Firestore merge)
// ---------------------------------------------------------------------------

describe('getAllExperiences', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns static adventures plus custom ones from Firestore with custom- prefix', async () => {
    const firestoreDocs = [
      {
        id: 'firestore-1',
        data: () => ({
          name: 'Custom Experience 1',
          description: 'Custom desc 1',
          experience: 'Custom exp 1',
          itinerary: [],
          features: [],
          image: undefined,
          aiGenerated: true,
          createdAt: null,
          updatedAt: null,
        }),
      },
      {
        id: 'firestore-2',
        data: () => ({
          name: 'Custom Experience 2',
          description: 'Custom desc 2',
          experience: 'Custom exp 2',
          itinerary: [],
          features: [],
          image: undefined,
          aiGenerated: false,
          createdAt: null,
          updatedAt: null,
        }),
      },
    ];
    mockGetDocs.mockResolvedValue({ docs: firestoreDocs });

    const { getAllExperiences } = await import('../lib/getAllExperiences');
    const adventures = await getAllExperiences();

    // Should include 18 static + 2 custom
    expect(adventures.length).toBe(20);

    const customOnes = adventures.filter(a => a.id.startsWith('custom-'));
    expect(customOnes).toHaveLength(2);
    expect(customOnes[0].id).toBe('custom-firestore-1');
    expect(customOnes[1].id).toBe('custom-firestore-2');
  });
});
