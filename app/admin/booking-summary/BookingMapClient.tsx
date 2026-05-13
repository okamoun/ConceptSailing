'use client';

import { useState, useMemo, useCallback } from 'react';
import { GoogleMap, Marker, InfoWindow, Polyline, useJsApiLoader } from '@react-google-maps/api';
import type { AvailabilityEntry } from '@/lib/availability';
import { getMarinaById } from '@/app/marinas-data';

type LatLng = { lat: number; lng: number };

const MAP_CENTER: LatLng = { lat: 38.2, lng: 24.8 };
const MAP_ZOOM = 6;

const STATUS_COLOUR: Record<AvailabilityEntry['status'], string> = {
  booked:    '#16a34a',
  blocked:   '#dc2626',
  requested: '#d97706',
};

function svgMarker(color: string, label: string, size = 34) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <circle cx="${size/2}" cy="${size/2}" r="${size/2-2}" fill="${color}" stroke="white" stroke-width="2"/>
    <text x="${size/2}" y="${size/2+4}" text-anchor="middle" fill="white" font-size="11" font-weight="bold" font-family="Arial,sans-serif">${label}</text>
  </svg>`;
  return { url: `data:image/svg+xml,${encodeURIComponent(svg)}` };
}

function dotMarker(color: string, size = 16) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <circle cx="${size/2}" cy="${size/2}" r="${size/2-1.5}" fill="${color}" stroke="white" stroke-width="1.5"/>
  </svg>`;
  return { url: `data:image/svg+xml,${encodeURIComponent(svg)}` };
}

function polylineOptions(color: string) {
  return {
    geodesic: true,
    strokeColor: color,
    strokeOpacity: 0,
    icons: [
      {
        icon: { path: 'M 0,-1 0,1', strokeOpacity: 0.7, strokeColor: color, scale: 2.5 },
        offset: '0',
        repeat: '14px',
      },
    ],
  };
}

interface Props {
  availability: AvailabilityEntry[];
}

export default function BookingMapClient({ availability }: Props) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  // --- Availability routes (delivery → redelivery) ---
  const availRoutes = useMemo(() =>
    availability
      .filter(e => e.deliveryPoint && e.redeliveryPoint)
      .map(e => {
        const from = getMarinaById(e.deliveryPoint!);
        const to   = getMarinaById(e.redeliveryPoint!);
        if (!from || !to) return null;
        return { entry: e, from, to };
      })
      .filter(Boolean) as Array<{ entry: AvailabilityEntry; from: { lat: number; lng: number; name: string }; to: { lat: number; lng: number; name: string } }>,
    [availability],
  );

  // Unique delivery marinas with entry lists
  const deliveryGroups = useMemo(() => {
    const map = new Map<string, { marina: ReturnType<typeof getMarinaById>; entries: AvailabilityEntry[] }>();
    availability.forEach(e => {
      if (!e.deliveryPoint) return;
      const m = getMarinaById(e.deliveryPoint);
      if (!m) return;
      const existing = map.get(e.deliveryPoint);
      if (existing) existing.entries.push(e);
      else map.set(e.deliveryPoint, { marina: m, entries: [e] });
    });
    return Array.from(map.values());
  }, [availability]);

  // Unique redelivery marinas (end points)
  const redeliveryGroups = useMemo(() => {
    const map = new Map<string, { marina: ReturnType<typeof getMarinaById>; entries: AvailabilityEntry[] }>();
    availability.forEach(e => {
      const key = e.redeliveryPoint || e.deliveryPoint;
      if (!key) return;
      const m = getMarinaById(key);
      if (!m) return;
      // Skip if same as delivery (would be a round-trip — already shown as start)
      if (key === e.deliveryPoint) return;
      const existing = map.get(key);
      if (existing) existing.entries.push(e);
      else map.set(key, { marina: m, entries: [e] });
    });
    return Array.from(map.values());
  }, [availability]);

  const handleClick = useCallback((key: string) =>
    setSelectedKey(prev => prev === key ? null : key), []);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[420px] text-blue-300 text-sm">
        Loading map…
      </div>
    );
  }

  const selectedGroup =
    deliveryGroups.find(g => g.marina?.id === selectedKey) ||
    redeliveryGroups.find(g => g.marina?.id === selectedKey);

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
        {/* Route lines: delivery → redelivery, coloured by status */}
        {availRoutes.map((r, i) => (
          <Polyline
            key={i}
            path={[{ lat: r.from.lat, lng: r.from.lng }, { lat: r.to.lat, lng: r.to.lng }]}
            options={polylineOptions(STATUS_COLOUR[r.entry.status])}
          />
        ))}

        {/* Redelivery (end-point) markers — square-ish dot */}
        {redeliveryGroups.map(({ marina, entries }) => {
          if (!marina) return null;
          const color = STATUS_COLOUR[entries[0].status];
          return (
            <Marker
              key={`redeliv-${marina.id}`}
              position={{ lat: marina.lat, lng: marina.lng }}
              icon={dotMarker(color, 20)}
              title={`${marina.name} — redelivery`}
              onClick={() => handleClick(marina.id)}
              zIndex={8}
            />
          );
        })}

        {/* Delivery (start-point) markers — larger circle with count */}
        {deliveryGroups.map(({ marina, entries }) => {
          if (!marina) return null;
          const isSelected = selectedKey === marina.id;
          // Use the highest-priority status colour
          const priority: Record<AvailabilityEntry['status'], number> = { booked: 3, blocked: 2, requested: 1 };
          const topEntry = entries.reduce((a, b) =>
            priority[a.status] >= priority[b.status] ? a : b);
          const color = STATUS_COLOUR[topEntry.status];
          return (
            <Marker
              key={`deliv-${marina.id}`}
              position={{ lat: marina.lat, lng: marina.lng }}
              icon={svgMarker(isSelected ? '#ffffff' : color, String(entries.length))}
              title={`${marina.name} — ${entries.length} charter${entries.length !== 1 ? 's' : ''}`}
              onClick={() => handleClick(marina.id)}
              zIndex={10}
            />
          );
        })}

        {/* InfoWindow */}
        {selectedKey && selectedGroup?.marina && (
          <InfoWindow
            position={{ lat: selectedGroup.marina.lat, lng: selectedGroup.marina.lng }}
            onCloseClick={() => setSelectedKey(null)}
          >
            <div className="text-xs min-w-[190px] max-w-[240px]">
              <p className="font-bold text-gray-800 mb-1">{selectedGroup.marina.name}</p>
              {selectedGroup.entries.map((e, i) => {
                const reMarina = getMarinaById(e.redeliveryPoint ?? e.deliveryPoint ?? '');
                return (
                  <div key={i} className="py-1.5 border-t border-gray-200 first:border-0">
                    <p className={`font-semibold capitalize ${
                      e.status === 'booked' ? 'text-green-700' :
                      e.status === 'blocked' ? 'text-red-600' : 'text-amber-600'
                    }`}>{e.status}</p>
                    <p className="text-gray-600">{e.startDate} → {e.endDate}</p>
                    {reMarina && reMarina.id !== selectedGroup.marina?.id && (
                      <p className="text-gray-500">↑ {reMarina.name}</p>
                    )}
                    {e.note && <p className="text-gray-400 italic">{e.note}</p>}
                  </div>
                );
              })}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 space-y-1.5 text-xs">
        <div className="flex items-center gap-2 text-white">
          <span className="w-4 h-4 rounded-full bg-green-600 inline-block flex-shrink-0" />
          Booked — delivery marina
        </div>
        <div className="flex items-center gap-2 text-white">
          <span className="w-4 h-4 rounded-full bg-red-600 inline-block flex-shrink-0" />
          Blocked
        </div>
        <div className="flex items-center gap-2 text-white">
          <span className="w-4 h-4 rounded-full bg-amber-500 inline-block flex-shrink-0" />
          Requested
        </div>
        <div className="flex items-center gap-2 text-blue-200">
          <span className="w-3 h-3 rounded-full border-2 border-white/60 inline-block flex-shrink-0" />
          Redelivery marina (end)
        </div>
        <div className="flex items-center gap-2 text-blue-200">
          <span className="w-4 h-px border-t-2 border-dashed border-white/50 inline-block" />
          Charter route
        </div>
      </div>
    </div>
  );
}
