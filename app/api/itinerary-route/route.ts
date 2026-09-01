import { NextRequest, NextResponse } from 'next/server';
import { haversineKm } from '../../marinas-data';
import { reconcileRoutedNm } from '../../client-space/[token]/itinerary/itinerary-utils';

// Real sea-routing runs server-side only: searoute-ts bundles a ~3.5 MB Eurostat
// maritime network, so it must never reach the client. It's imported lazily
// inside the handler and pinned to the module-singleton 20 km network so the
// library's finder cache is reused across warm invocations.
export const runtime = 'nodejs';

interface StopCoord {
  id: string;
  lat: number;
  lng: number;
}

// Reject snaps farther than this from the network — a coordinate this far from
// any sea lane is almost certainly a typo or a landlocked point; fall back to
// the straight-line estimate rather than snapping to a distant coast.
const MAX_SNAP_KM = 60;

function isCoord(s: unknown): s is StopCoord {
  return (
    typeof s === 'object' && s !== null &&
    typeof (s as StopCoord).id === 'string' &&
    typeof (s as StopCoord).lat === 'number' && Number.isFinite((s as StopCoord).lat) &&
    typeof (s as StopCoord).lng === 'number' && Number.isFinite((s as StopCoord).lng)
  );
}

// POST { stops: [{ id, lat, lng }, ...] }  (in visiting order)
// →    { routed: { [arrivingStopId]: nauticalMiles } }
// Each key is the id of a stop whose inbound leg was successfully sea-routed;
// legs that fail to route are simply omitted so the client keeps its
// straight-line fallback for them.
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const rawStops = (body as { stops?: unknown })?.stops;
  if (!Array.isArray(rawStops)) {
    return NextResponse.json({ error: 'Expected { stops: [...] }' }, { status: 400 });
  }
  const stops = rawStops.filter(isCoord);

  const routed: Record<string, number> = {};
  if (stops.length < 2) {
    return NextResponse.json({ routed });
  }

  // Lazy-load the router + high-resolution network only when actually needed.
  const { seaRoute } = await import('searoute-ts');
  const { DEFAULT_MARNET } = await import('searoute-ts/marnet-20km');

  for (let i = 1; i < stops.length; i++) {
    const a = stops[i - 1];
    const b = stops[i];
    const straightNm = haversineKm(a.lat, a.lng, b.lat, b.lng) / 1.852;
    try {
      // GeoJSON position order is [lng, lat].
      const route = seaRoute([a.lng, a.lat], [b.lng, b.lat], {
        network: DEFAULT_MARNET,
        maxSnapDistanceKm: MAX_SNAP_KM,
      });
      const length = route.properties.length; // nautical miles (searoute default unit)
      if (Number.isFinite(length)) {
        routed[b.id] = Math.round(reconcileRoutedNm(length, straightNm) * 10) / 10;
      }
    } catch {
      // SnapFailedError / NoRouteError → leave this leg to the straight-line fallback.
    }
  }

  return NextResponse.json({ routed });
}
