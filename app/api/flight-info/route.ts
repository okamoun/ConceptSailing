import { NextRequest, NextResponse } from 'next/server';

export interface FlightInfo {
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
    return NextResponse.json({ error: 'Flight lookup not configured' }, { status: 503 });
  }

  try {
    const url = `https://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_iata=${encodeURIComponent(flight)}&limit=1`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) {
      return NextResponse.json({ error: 'Upstream error' }, { status: 502 });
    }
    const json = await res.json();
    const f = json?.data?.[0];
    if (!f) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const info: FlightInfo = {
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
