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

// Round a coordinate to ~1 m precision to keep the persisted polyline compact.
const round6 = (n: number) => Math.round(n * 1e6) / 1e6;

// POST { stops: [{ id, lat, lng }, ...] }  (in visiting order)
// →    { routed: { [arrivingStopId]: nauticalMiles },
//        paths:  { [arrivingStopId]: [{ lat, lng }, ...] } }
// Each key is the id of a stop whose inbound leg was successfully sea-routed:
// `routed` carries the leg distance, `paths` the polyline to draw for it.
// Legs that fail to route are simply omitted so the client keeps its
// straight-line fallback for both distance and drawing.
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

  const routed: Record<string, number> = {};
  const paths: Record<string, { lat: number; lng: number }[]> = {};
  // Route only legs between *adjacent* stops that both have coordinates, matching
  // how the UI defines a leg (legNm(stops[i-1], stops[i])) — never bridging a
  // coordinate-less stop.
  if (rawStops.filter(isCoord).length < 2) {
    return NextResponse.json({ routed, paths });
  }

  // Lazy-load the router + high-resolution network only when actually needed.
  const { seaRoute } = await import('searoute-ts');
  const { DEFAULT_MARNET } = await import('searoute-ts/marnet-20km');

  for (let i = 1; i < rawStops.length; i++) {
    const a = rawStops[i - 1];
    const b = rawStops[i];
    if (!isCoord(a) || !isCoord(b)) continue;
    const straightNm = haversineKm(a.lat, a.lng, b.lat, b.lng) / 1.852;
    try {
      // GeoJSON position order is [lng, lat]. appendOriginDestination anchors
      // the drawn line to the real stop coordinates (not the snapped network
      // vertex), so the polyline meets the map markers with no visible gap.
      const route = seaRoute([a.lng, a.lat], [b.lng, b.lat], {
        network: DEFAULT_MARNET,
        maxSnapDistanceKm: MAX_SNAP_KM,
        appendOriginDestination: true,
      });
      const length = route.properties.length; // nautical miles (searoute default unit)
      if (Number.isFinite(length)) {
        routed[b.id] = Math.round(reconcileRoutedNm(length, straightNm) * 10) / 10;
      }
      // geometry.coordinates is [lng, lat][] — swap back to { lat, lng } for the map.
      const coords = route.geometry?.coordinates;
      if (Array.isArray(coords) && coords.length >= 2) {
        paths[b.id] = coords.map(([lng, lat]) => ({ lat: round6(lat), lng: round6(lng) }));
      }
    } catch {
      // SnapFailedError / NoRouteError → leave this leg to the straight-line fallback.
    }
  }

  return NextResponse.json({ routed, paths });
}
