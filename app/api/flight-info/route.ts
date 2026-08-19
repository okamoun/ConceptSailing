import { NextRequest, NextResponse } from 'next/server';

export interface FlightInfo {
  flight: string;
  airline: string;
  from: { iata: string; name: string };
  to: { iata: string; name: string };
  scheduledDep: string | null;
  scheduledArr: string | null;
  status: string;
}

// Outcome of asking one upstream provider. `unconfigured` means the provider's
// key is absent (so we can transparently skip it and try the next one).
type ProviderResult =
  | { kind: 'ok'; info: FlightInfo }
  | { kind: 'not_found' }
  | { kind: 'unconfigured' }
  | { kind: 'error'; message: string; code: string; status: number };

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// AeroDataBox returns times as "YYYY-MM-DD HH:mmZ" (or with a local offset);
// normalize the UTC field to an ISO string the client's `new Date()` accepts.
function isoFromAeroDataBox(t: { utc?: string | null } | null | undefined): string | null {
  const utc = t?.utc;
  if (!utc) return null;
  const iso = utc.replace(' ', 'T');
  return Number.isNaN(new Date(iso).getTime()) ? null : iso;
}

// Primary provider: AeroDataBox (via RapidAPI by default). `date` pins the
// right instance of a recurring flight number; without it the API returns the
// nearest active/scheduled leg.
async function fetchFromAeroDataBox(flight: string, date: string | null): Promise<ProviderResult> {
  const key = process.env.AERODATABOX_API_KEY;
  if (!key) return { kind: 'unconfigured' };

  const host = process.env.AERODATABOX_API_HOST || 'aerodatabox.p.rapidapi.com';
  const path = date
    ? `/flights/number/${encodeURIComponent(flight)}/${encodeURIComponent(date)}`
    : `/flights/number/${encodeURIComponent(flight)}`;

  try {
    const res = await fetch(`https://${host}${path}`, {
      headers: { 'X-RapidAPI-Key': key, 'X-RapidAPI-Host': host },
      next: { revalidate: 300 },
    });
    // 204 = the flight number is valid but has no leg for the requested window.
    if (res.status === 204) return { kind: 'not_found' };

    const body = await res.json().catch(() => null);
    if (!res.ok) {
      const message = body?.message ?? 'AeroDataBox lookup failed';
      return { kind: 'error', message, code: `aerodatabox_${res.status}`, status: res.status };
    }

    const list = Array.isArray(body) ? body : Array.isArray(body?.flights) ? body.flights : [];
    const f = list[0];
    if (!f) return { kind: 'not_found' };

    return {
      kind: 'ok',
      info: {
        flight,
        airline: f.airline?.name ?? '',
        from: {
          iata: f.departure?.airport?.iata ?? '',
          name: f.departure?.airport?.name ?? f.departure?.airport?.municipalityName ?? '',
        },
        to: {
          iata: f.arrival?.airport?.iata ?? '',
          name: f.arrival?.airport?.name ?? f.arrival?.airport?.municipalityName ?? '',
        },
        scheduledDep: isoFromAeroDataBox(f.departure?.scheduledTime),
        scheduledArr: isoFromAeroDataBox(f.arrival?.scheduledTime),
        status: f.status ?? '',
      },
    };
  } catch {
    return { kind: 'error', message: 'AeroDataBox request failed', code: 'aerodatabox_network', status: 0 };
  }
}

// Fallback provider: aviationstack. Kept as a backup for when AeroDataBox is
// unconfigured, errors, or has no data for the flight.
async function fetchFromAviationstack(flight: string): Promise<ProviderResult> {
  const key = process.env.AVIATIONSTACK_API_KEY;
  if (!key) return { kind: 'unconfigured' };

  try {
    const url = `https://api.aviationstack.com/v1/flights?access_key=${key}&flight_iata=${encodeURIComponent(flight)}&limit=1`;
    const res = await fetch(url, { next: { revalidate: 300 } });

    // aviationstack reports problems either as HTTP 200 with an `error` object
    // or as a non-2xx status carrying the same object; parse the body in both.
    const json = await res.json().catch(() => null);
    if (json?.error) {
      const code = json.error.code ?? json.error.type ?? 'unknown';
      const message = json.error.message ?? json.error.info ?? 'Flight lookup failed';
      return { kind: 'error', message, code: `aviationstack_${code}`, status: res.status };
    }
    if (!res.ok) {
      return { kind: 'error', message: 'Upstream error', code: 'aviationstack_upstream', status: res.status };
    }

    const f = json?.data?.[0];
    if (!f) return { kind: 'not_found' };

    return {
      kind: 'ok',
      info: {
        flight,
        airline: f.airline?.name ?? '',
        from: { iata: f.departure?.iata ?? '', name: f.departure?.airport ?? '' },
        to: { iata: f.arrival?.iata ?? '', name: f.arrival?.airport ?? '' },
        scheduledDep: f.departure?.scheduled ?? null,
        scheduledArr: f.arrival?.scheduled ?? null,
        status: f.flight_status ?? '',
      },
    };
  } catch {
    return { kind: 'error', message: 'Failed to fetch flight data', code: 'aviationstack_network', status: 0 };
  }
}

// Turn the two providers' failures into the most useful single response:
// a concrete upstream error (so problems are visible) beats a plain
// "not found", which in turn beats "both unconfigured".
function failureResponse(results: ProviderResult[]): NextResponse {
  const errored = results.find((r): r is Extract<ProviderResult, { kind: 'error' }> => r.kind === 'error');
  if (errored) {
    return NextResponse.json(
      { error: errored.message, code: errored.code, upstreamStatus: errored.status },
      { status: 502 },
    );
  }
  if (results.some(r => r.kind === 'not_found')) {
    return NextResponse.json({ error: 'No flight details found', code: 'not_found' }, { status: 404 });
  }
  return NextResponse.json({ error: 'Flight lookup not configured', code: 'not_configured' }, { status: 503 });
}

export async function GET(req: NextRequest) {
  const flight = req.nextUrl.searchParams.get('flight')?.replace(/\s+/g, '').toUpperCase();
  if (!flight) {
    return NextResponse.json({ error: 'Missing flight parameter' }, { status: 400 });
  }

  const dateParam = req.nextUrl.searchParams.get('date');
  const date = dateParam && DATE_RE.test(dateParam) ? dateParam : null;

  // Primary: AeroDataBox. Fall back to aviationstack whenever it doesn't answer.
  const primary = await fetchFromAeroDataBox(flight, date);
  if (primary.kind === 'ok') return NextResponse.json(primary.info);

  const fallback = await fetchFromAviationstack(flight);
  if (fallback.kind === 'ok') return NextResponse.json(fallback.info);

  return failureResponse([primary, fallback]);
}
