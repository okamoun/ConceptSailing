'use client';

import React from 'react';
import { GoogleMap, Polyline, Marker, useJsApiLoader } from '@react-google-maps/api';
import type { ClientItineraryStop } from '../../../../lib/clientSpace';

interface Props {
  stops: ClientItineraryStop[];
  selectedId?: string;
  editable?: boolean;
  onMarkerClick?: (id: string) => void;
  onMarkerDragEnd?: (id: string, lat: number, lng: number) => void;
}

// Responsive height via Tailwind classes so the map is compact on phones and
// taller on desktop. GoogleMap needs an explicitly-sized container element.
const MAP_HEIGHT_CLASSES = 'w-full h-64 sm:h-80 lg:h-[420px] rounded-xl shadow-lg';

const DEFAULT_CENTER = { lat: 37.8, lng: 24.0 };

export default function ItineraryMap({ stops, selectedId, editable, onMarkerClick, onMarkerDragEnd }: Props) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  // Only stops with real coordinates can be plotted.
  const located = React.useMemo(
    () => stops.filter(s => typeof s.lat === 'number' && typeof s.lng === 'number'),
    [stops],
  );

  const center = React.useMemo(() => {
    if (located.length === 0) return DEFAULT_CENTER;
    const lat = located.reduce((sum, p) => sum + (p.lat as number), 0) / located.length;
    const lng = located.reduce((sum, p) => sum + (p.lng as number), 0) / located.length;
    return { lat, lng };
  }, [located]);

  if (!isLoaded) {
    return <div className={`flex justify-center items-center text-blue-200 bg-white/5 ${MAP_HEIGHT_CLASSES}`}>Loading map…</div>;
  }

  return (
    <GoogleMap
      mapContainerClassName={MAP_HEIGHT_CLASSES}
      center={center}
      zoom={7}
      options={{
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        clickableIcons: false,
      }}
    >
      {located.length > 1 && (
        <Polyline
          path={located.map(p => ({ lat: p.lat as number, lng: p.lng as number }))}
          options={{ strokeColor: '#00a8ff', strokeOpacity: 0.9, strokeWeight: 4, geodesic: true }}
        />
      )}
      {located.map(pt => {
        const idx = stops.findIndex(s => s.id === pt.id);
        return (
          <Marker
            key={pt.id}
            position={{ lat: pt.lat as number, lng: pt.lng as number }}
            label={{ text: `${idx + 1}`, color: '#fff' }}
            title={`Stop ${idx + 1}: ${pt.title}`}
            draggable={editable}
            onClick={() => onMarkerClick?.(pt.id)}
            onDragEnd={(e: google.maps.MapMouseEvent) => {
              if (e.latLng && onMarkerDragEnd) onMarkerDragEnd(pt.id, e.latLng.lat(), e.latLng.lng());
            }}
            icon={selectedId === pt.id ? {
              url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              scaledSize: typeof window !== 'undefined' && window.google && window.google.maps
                ? new window.google.maps.Size(42, 42)
                : undefined,
            } : undefined}
          />
        );
      })}
    </GoogleMap>
  );
}
