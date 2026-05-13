'use client';

import { useState, useMemo, useCallback } from 'react';
import { GoogleMap, Marker, InfoWindow, Polyline, useJsApiLoader } from '@react-google-maps/api';
import type { BookingSubmission } from '@/lib/submissions';
import { destinations } from '@/app/destinations-data';

// Embarkation marina coordinates (Athens area)
const MARINA_COORDS: Record<string, { lat: number; lng: number }> = {
  'Nea Peramos Marina': { lat: 38.002, lng: 23.412 },
  'Piraeus Marina':     { lat: 37.947, lng: 23.637 },
  'Flisvos Marina':     { lat: 37.904, lng: 23.708 },
  'Alimos Marina':      { lat: 37.892, lng: 23.726 },
  'Glyfada Marina':     { lat: 37.868, lng: 23.751 },
  'Lake Vouliagmeni':   { lat: 37.828, lng: 23.783 },
};

// Island destinations used as end-point references (exclude Athens-area ports)
const ISLAND_DEST_IDS = ['lefkada', 'corfu', 'kos', 'rhodes'];

const MAP_CENTER = { lat: 38.2, lng: 24.8 };
const MAP_ZOOM = 6;

type LatLng = { lat: number; lng: number };

function svgMarker(color: string, label: string, size = 34) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="${color}" stroke="white" stroke-width="2"/>
    <text x="${size / 2}" y="${size / 2 + 4}" text-anchor="middle" fill="white" font-size="11" font-weight="bold" font-family="Arial,sans-serif">${label}</text>
  </svg>`;
  return { url: `data:image/svg+xml,${encodeURIComponent(svg)}` };
}

function smallDotMarker(color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
    <circle cx="10" cy="10" r="8" fill="${color}" stroke="white" stroke-width="1.5"/>
  </svg>`;
  return { url: `data:image/svg+xml,${encodeURIComponent(svg)}` };
}

interface Props {
  bookings: BookingSubmission[];
}

export default function BookingMapClient({ bookings }: Props) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const [selectedMarina, setSelectedMarina] = useState<string | null>(null);

  // Group bookings by embarkation point
  const marinaGroups = useMemo(() => {
    const map = new Map<string, BookingSubmission[]>();
    bookings.forEach(b => {
      const key = b.embarkationPoint || 'Unknown';
      map.set(key, [...(map.get(key) ?? []), b]);
    });
    return map;
  }, [bookings]);

  // Only marinas that have known coordinates
  const activeMarinaEntries = useMemo(
    () =>
      Array.from(marinaGroups.entries()).filter(([name]) => MARINA_COORDS[name]),
    [marinaGroups],
  );

  // Route polylines: from each active marina to each island destination
  const routes = useMemo(() => {
    const islandDests = destinations.filter(d => ISLAND_DEST_IDS.includes(d.id));
    const result: Array<{ from: LatLng; to: LatLng }> = [];
    activeMarinaEntries.forEach(([name]) => {
      const from = MARINA_COORDS[name];
      islandDests.forEach(dest => {
        result.push({ from, to: { lat: dest.lat, lng: dest.lng } });
      });
    });
    return result;
  }, [activeMarinaEntries]);

  const selectedBookings = selectedMarina ? (marinaGroups.get(selectedMarina) ?? []) : [];

  const handleMarinaClick = useCallback(
    (name: string) => setSelectedMarina(prev => (prev === name ? null : name)),
    [],
  );

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[420px] text-blue-300 text-sm">
        Loading map…
      </div>
    );
  }

  return (
    <div className="relative">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '420px', borderRadius: '0.75rem' }}
        center={MAP_CENTER}
        zoom={MAP_ZOOM}
        options={{
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          clickableIcons: false,
          styles: [
            { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#1a4a7a' }] },
          ],
        }}
      >
        {/* Dashed route lines: marina → island destinations */}
        {routes.map((r, i) => (
          <Polyline
            key={i}
            path={[r.from, r.to]}
            options={{
              geodesic: true,
              strokeColor: '#93c5fd',
              strokeOpacity: 0,
              icons: [
                {
                  icon: {
                    path: 'M 0,-1 0,1',
                    strokeOpacity: 0.5,
                    strokeColor: '#93c5fd',
                    scale: 2,
                  },
                  offset: '0',
                  repeat: '12px',
                },
              ],
            }}
          />
        ))}

        {/* Island destination markers (end-point references) */}
        {destinations
          .filter(d => ISLAND_DEST_IDS.includes(d.id))
          .map(dest => (
            <Marker
              key={dest.id}
              position={{ lat: dest.lat, lng: dest.lng }}
              icon={smallDotMarker('#f59e0b')}
              title={dest.name}
            />
          ))}

        {/* Athens-area port markers (shown as reference even without bookings) */}
        {destinations
          .filter(d => !ISLAND_DEST_IDS.includes(d.id))
          .map(dest => (
            <Marker
              key={dest.id}
              position={{ lat: dest.lat, lng: dest.lng }}
              icon={smallDotMarker('#60a5fa')}
              title={dest.name}
            />
          ))}

        {/* Active embarkation marina markers (departure / start points) */}
        {activeMarinaEntries.map(([name, bks]) => {
          const pos = MARINA_COORDS[name];
          const isSelected = selectedMarina === name;
          return (
            <Marker
              key={name}
              position={pos}
              icon={svgMarker(isSelected ? '#22c55e' : '#16a34a', String(bks.length))}
              title={`${name} — ${bks.length} booking${bks.length !== 1 ? 's' : ''}`}
              onClick={() => handleMarinaClick(name)}
              zIndex={10}
            />
          );
        })}

        {/* InfoWindow for selected marina */}
        {selectedMarina && MARINA_COORDS[selectedMarina] && (
          <InfoWindow
            position={MARINA_COORDS[selectedMarina]}
            onCloseClick={() => setSelectedMarina(null)}
          >
            <div className="text-xs min-w-[180px] max-w-[220px]">
              <p className="font-bold text-gray-800 mb-1">{selectedMarina}</p>
              <p className="text-gray-500 mb-2">
                {selectedBookings.length} booking{selectedBookings.length !== 1 ? 's' : ''}
              </p>
              {selectedBookings.map((b, i) => (
                <div key={i} className="py-1.5 border-t border-gray-200 first:border-0">
                  <p className="font-semibold text-gray-800">{b.name}</p>
                  <p className="text-gray-500">
                    {b.date
                      ? new Date(`${b.date.slice(0, 10)}T12:00:00`).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : '—'}
                  </p>
                  <p className="text-gray-500">{b.passengers} pax · {b.boat}</p>
                </div>
              ))}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Map legend */}
      <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 space-y-1.5 text-xs">
        <div className="flex items-center gap-2 text-white">
          <span className="w-4 h-4 rounded-full bg-green-500 inline-block flex-shrink-0" />
          Departure marina (# = bookings)
        </div>
        <div className="flex items-center gap-2 text-white">
          <span className="w-3 h-3 rounded-full bg-amber-400 inline-block flex-shrink-0" />
          Island destination
        </div>
        <div className="flex items-center gap-2 text-white">
          <span className="w-3 h-3 rounded-full bg-blue-400 inline-block flex-shrink-0" />
          Athens-area port
        </div>
        <div className="flex items-center gap-2 text-blue-200">
          <span className="w-4 h-px border-t border-dashed border-blue-300 inline-block" />
          Route (click marina for details)
        </div>
      </div>
    </div>
  );
}
