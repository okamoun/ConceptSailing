jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}));

import { GET } from '../app/api/flight-info/route';

function makeReq(flight: string, date?: string) {
  const url = new URL(`http://localhost/api/flight-info?flight=${encodeURIComponent(flight)}`);
  if (date) url.searchParams.set('date', date);
  return { nextUrl: url } as never;
}

function res(status: number, body: unknown, ok = status >= 200 && status < 300) {
  return { ok, status, json: async () => body };
}

const AERO_HIT = [
  {
    airline: { name: 'British Airways' },
    departure: { airport: { iata: 'LHR', name: 'London Heathrow' }, scheduledTime: { utc: '2026-08-22 06:00Z' } },
    arrival: { airport: { iata: 'JMK', name: 'Mykonos' }, scheduledTime: { utc: '2026-08-22 11:00Z' } },
    status: 'Scheduled',
  },
];

const AVIATIONSTACK_HIT = {
  data: [
    {
      airline: { name: 'Transavia' },
      departure: { iata: 'ORY', airport: 'Paris Orly', scheduled: '2026-05-18T09:00:00+00:00' },
      arrival: { iata: 'JTR', airport: 'Santorini', scheduled: '2026-05-18T12:30:00+00:00' },
      flight_status: 'scheduled',
    },
  ],
};

const isAero = (u: string) => u.includes('aerodatabox');
const isAviationstack = (u: string) => u.includes('aviationstack');

let fetchMock: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  process.env.AERODATABOX_API_KEY = 'aero-key';
  process.env.AVIATIONSTACK_API_KEY = 'avs-key';
  fetchMock = jest.fn();
  global.fetch = fetchMock as unknown as typeof fetch;
});

describe('GET /api/flight-info', () => {
  it('returns AeroDataBox data and does not call the fallback when the primary answers', async () => {
    fetchMock.mockImplementation((u: string) => {
      if (isAero(u)) return Promise.resolve(res(200, AERO_HIT));
      throw new Error('fallback should not be called');
    });

    const r = await GET(makeReq('BA456'));
    const data = await r.json();

    expect(r.status).toBe(200);
    expect(data.airline).toBe('British Airways');
    expect(data.from.iata).toBe('LHR');
    expect(data.scheduledDep).toBe('2026-08-22T06:00Z');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('passes the travel date into the AeroDataBox request path', async () => {
    fetchMock.mockResolvedValue(res(200, AERO_HIT));

    await GET(makeReq('BA456', '2026-08-22'));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toContain('/flights/number/BA456/2026-08-22');
  });

  it('falls back to aviationstack when AeroDataBox has no data', async () => {
    fetchMock.mockImplementation((u: string) => {
      if (isAero(u)) return Promise.resolve(res(200, []));
      if (isAviationstack(u)) return Promise.resolve(res(200, AVIATIONSTACK_HIT));
      throw new Error('unexpected url');
    });

    const r = await GET(makeReq('TO3650'));
    const data = await r.json();

    expect(r.status).toBe(200);
    expect(data.airline).toBe('Transavia');
    expect(data.from.iata).toBe('ORY');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('uses the fallback when AeroDataBox is unconfigured', async () => {
    delete process.env.AERODATABOX_API_KEY;
    fetchMock.mockImplementation((u: string) => {
      if (isAviationstack(u)) return Promise.resolve(res(200, AVIATIONSTACK_HIT));
      throw new Error('AeroDataBox should not be called without a key');
    });

    const r = await GET(makeReq('TO3650'));
    const data = await r.json();

    expect(r.status).toBe(200);
    expect(data.airline).toBe('Transavia');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('surfaces a concrete upstream error (with code) over a plain not-found', async () => {
    fetchMock.mockImplementation((u: string) => {
      if (isAero(u)) return Promise.resolve(res(429, { message: 'Too many requests' }));
      if (isAviationstack(u)) return Promise.resolve(res(200, { data: [] }));
      throw new Error('unexpected url');
    });

    const r = await GET(makeReq('BA456'));
    const data = await r.json();

    expect(r.status).toBe(502);
    expect(data.code).toBe('aerodatabox_429');
    expect(data.error).toBe('Too many requests');
    expect(data.upstreamStatus).toBe(429);
  });

  it('returns 404 not_found when neither provider has the flight', async () => {
    fetchMock.mockImplementation((u: string) => {
      if (isAero(u)) return Promise.resolve(res(200, []));
      if (isAviationstack(u)) return Promise.resolve(res(200, { data: [] }));
      throw new Error('unexpected url');
    });

    const r = await GET(makeReq('ZZ9999'));
    const data = await r.json();

    expect(r.status).toBe(404);
    expect(data.code).toBe('not_found');
  });

  it('returns 503 not_configured when no provider keys are set', async () => {
    delete process.env.AERODATABOX_API_KEY;
    delete process.env.AVIATIONSTACK_API_KEY;

    const r = await GET(makeReq('BA456'));
    const data = await r.json();

    expect(r.status).toBe(503);
    expect(data.code).toBe('not_configured');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects a request with no flight parameter', async () => {
    const r = await GET({ nextUrl: new URL('http://localhost/api/flight-info') } as never);
    expect(r.status).toBe(400);
  });
});
