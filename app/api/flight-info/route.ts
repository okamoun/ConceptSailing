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

export async function GET(req: NextRequest) {
  const flight = req.nextUrl.searchParams.get('flight')?.replace(/\s+/g, '').toUpperCase();
  if (!flight) {
    return NextResponse.json({ error: 'Missing flight parameter' }, { status: 400 });
  }

  const apiKey = process.env.AVIATIONSTACK_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Flight lookup not configured', code: 'not_configured' }, { status: 503 });
  }

  try {
    const url = `https://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_iata=${encodeURIComponent(flight)}&limit=1`;
    const res = await fetch(url, { next: { revalidate: 300 } });

    // aviationstack reports problems (quota exhausted, invalid key, https/plan
    // restriction, rate limiting, …) either as HTTP 200 with an `error` object
    // or as a non-2xx status carrying the same object. Parse the body in both
    // cases so the real reason and code reach the caller instead of a generic
    // "Upstream error".
    const json = await res.json().catch(() => null);
    if (json?.error) {
      const code = json.error.code ?? json.error.type ?? 'unknown';
      const message = json.error.message ?? json.error.info ?? 'Flight lookup failed';
      return NextResponse.json({ error: message, code, upstreamStatus: res.status }, { status: 502 });
    }
    if (!res.ok) {
      return NextResponse.json({ error: 'Upstream error', code: 'upstream_error', upstreamStatus: res.status }, { status: 502 });
    }

    const f = json?.data?.[0];
    if (!f) {
      return NextResponse.json({ error: 'No flight details found', code: 'not_found' }, { status: 404 });
    }
    const info: FlightInfo = {
      flight,
      airline: f.airline?.name ?? '',
      from: { iata: f.departure?.iata ?? '', name: f.departure?.airport ?? '' },
      to: { iata: f.arrival?.iata ?? '', name: f.arrival?.airport ?? '' },
      scheduledDep: f.departure?.scheduled ?? null,
      scheduledArr: f.arrival?.scheduled ?? null,
      status: f.flight_status ?? '',
    };
    return NextResponse.json(info);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch flight data' }, { status: 500 });
  }
}
