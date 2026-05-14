'use client';

import { useState, useMemo, useCallback } from 'react';
import { GoogleMap, Marker, InfoWindow, Polyline, useJsApiLoader } from '@react-google-maps/api';
import {
  type Charter,
  type CharterStatus,
  CHARTER_STATUS_PRIORITY,
  CHARTER_STATUS_LABEL,
} from '@/lib/availability';
import { getMarinaById } from '@/app/marinas-data';

type LatLng = { lat: number; lng: number };

const MAP_CENTER: LatLng = { lat: 38.2, lng: 24.8 };
const MAP_ZOOM = 6;

const STATUS_COLOUR: Record<CharterStatus, string> = {
  web_request:     '#0ea5e9',
  broker_request:  '#d97706',
  serious_request: '#f97316',
  confirmed:       '#16a34a',
  signed:          '#065f46',
  canceled:        '#6b7280',
  owner_use:       '#9333ea',
  maintenance:     '#dc2626',
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
  charters: Charter[];
}

export default function BookingMapClient({ charters }: Props) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const availRoutes = useMemo(() =>
    charters
      .filter(c => c.deliveryPoint && c.redeliveryPoint)
      .map(c => {
        const from = getMarinaById(c.deliveryPoint!);
        const to   = getMarinaById(c.redeliveryPoint!);
        if (!from || !to) return null;
        return { charter: c, from, to };
      })
      .filter(Boolean) as Array<{ charter: Charter; from: { lat: number; lng: number; name: string }; to: { lat: number; lng: number; name: string } }>,
    [charters],
  );

  const deliveryGroups = useMemo(() => {
    const map = new Map<string, { marina: ReturnType<typeof getMarinaById>; charters: Charter[] }>();
    charters.forEach(c => {
      if (!c.deliveryPoint) return;
      const m = getMarinaById(c.deliveryPoint);
      if (!m) return;
      const existing = map.get(c.deliveryPoint);
      if (existing) existing.charters.push(c);
      else map.set(c.deliveryPoint, { marina: m, charters: [c] });
    });
    return Array.from(map.values());
  }, [charters]);

  const redeliveryGroups = useMemo(() => {
    const map = new Map<string, { marina: ReturnType<typeof getMarinaById>; charters: Charter[] }>();
    charters.forEach(c => {
      const key = c.redeliveryPoint || c.deliveryPoint;
      if (!key) return;
      const m = getMarinaById(key);
      if (!m) return;
      if (key === c.deliveryPoint) return;
      const existing = map.get(key);
      if (existing) existing.charters.push(c);
      else map.set(key, { marina: m, charters: [c] });
    });
    return Array.from(map.values());
  }, [charters]);

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
        {availRoutes.map((r, i) => (
          <Polyline
            key={i}
            path={[{ lat: r.from.lat, lng: r.from.lng }, { lat: r.to.lat, lng: r.to.lng }]}
            options={polylineOptions(STATUS_COLOUR[r.charter.status])}
          />
        ))}

        {redeliveryGroups.map(({ marina, charters: groupCharters }) => {
          if (!marina) return null;
          const topCharter = groupCharters.reduce((a, b) =>
            CHARTER_STATUS_PRIORITY[a.status] >= CHARTER_STATUS_PRIORITY[b.status] ? a : b);
          return (
            <Marker
              key={`redeliv-${marina.id}`}
              position={{ lat: marina.lat, lng: marina.lng }}
              icon={dotMarker(STATUS_COLOUR[topCharter.status], 20)}
              title={`${marina.name} — redelivery`}
              onClick={() => handleClick(marina.id)}
              zIndex={8}
            />
          );
        })}

        {deliveryGroups.map(({ marina, charters: groupCharters }) => {
          if (!marina) return null;
          const isSelected = selectedKey === marina.id;
          const topCharter = groupCharters.reduce((a, b) =>
            CHARTER_STATUS_PRIORITY[a.status] >= CHARTER_STATUS_PRIORITY[b.status] ? a : b);
          return (
            <Marker
              key={`deliv-${marina.id}`}
              position={{ lat: marina.lat, lng: marina.lng }}
              icon={svgMarker(isSelected ? '#ffffff' : STATUS_COLOUR[topCharter.status], String(groupCharters.length))}
              title={`${marina.name} — ${groupCharters.length} charter${groupCharters.length !== 1 ? 's' : ''}`}
              onClick={() => handleClick(marina.id)}
              zIndex={10}
            />
          );
        })}

        {selectedKey && selectedGroup?.marina && (
          <InfoWindow
            position={{ lat: selectedGroup.marina.lat, lng: selectedGroup.marina.lng }}
            onCloseClick={() => setSelectedKey(null)}
          >
            <div className="text-xs min-w-[190px] max-w-[240px]">
              <p className="font-bold text-gray-800 mb-1">{selectedGroup.marina.name}</p>
              {selectedGroup.charters.map((c, i) => {
                const reMarina = getMarinaById(c.redeliveryPoint ?? c.deliveryPoint ?? '');
                return (
                  <div key={i} className="py-1.5 border-t border-gray-200 first:border-0">
                    <p className="font-semibold text-gray-700">{CHARTER_STATUS_LABEL[c.status]}</p>
                    <p className="text-gray-600">{c.startDate} → {c.endDate}</p>
                    {c.name && <p className="text-gray-700 font-medium">{c.name}</p>}
                    {reMarina && reMarina.id !== selectedGroup.marina?.id && (
                      <p className="text-gray-500">↑ {reMarina.name}</p>
                    )}
                    {c.note && <p className="text-gray-400 italic">{c.note}</p>}
                  </div>
                );
              })}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 space-y-1 text-xs max-h-[200px] overflow-y-auto">
        {(Object.entries(STATUS_COLOUR) as [CharterStatus, string][]).map(([status, color]) => (
          <div key={status} className="flex items-center gap-2 text-white">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            {CHARTER_STATUS_LABEL[status]}
          </div>
        ))}
        <div className="flex items-center gap-2 text-blue-200 pt-1 border-t border-white/20">
          <span className="w-3 h-3 rounded-full border-2 border-white/60 inline-block flex-shrink-0" />
          Redelivery (end)
        </div>
      </div>
    </div>
  );
}
