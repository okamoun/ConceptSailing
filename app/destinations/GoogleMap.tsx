import React, { useMemo, useRef } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import type { Destination } from '../destinations-data';

const containerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '0.75rem',
  boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
};

interface Props {
  destinations: Destination[];
  selectedId?: string;
  onMarkerClick?: (id: string) => void;
}

const DEFAULT_CENTER = { lat: 38.5, lng: 23.5 };
const DEFAULT_ZOOM = 6;
const SELECTED_ZOOM = 11;

export default function CustomGoogleMap({ destinations, selectedId, onMarkerClick }: Props) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });
  const mapRef = useRef<google.maps.Map | null>(null);

  // Find the selected destination
  const selected = useMemo(() => destinations.find(d => d.id === selectedId), [destinations, selectedId]);

  // Center and zoom logic
  const center = selected ? { lat: selected.lat, lng: selected.lng } : DEFAULT_CENTER;
  const zoom = selected ? SELECTED_ZOOM : DEFAULT_ZOOM;

  // When selected changes, pan/zoom map
  React.useEffect(() => {
    if (mapRef.current && selected) {
      mapRef.current.panTo(center);
      mapRef.current.setZoom(SELECTED_ZOOM);
    } else if (mapRef.current && !selected) {
      mapRef.current.panTo(DEFAULT_CENTER);
      mapRef.current.setZoom(DEFAULT_ZOOM);
    }
  }, [selectedId]);

  if (!isLoaded) return <div className="flex justify-center items-center h-[500px]">Loading map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      onLoad={(map: google.maps.Map) => {
        mapRef.current = map;
      }}
      options={{
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        clickableIcons: false,
        styles: [
          { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }
        ]
      }}
    >
      {destinations.map(dest => (
        <Marker
          key={dest.id}
          position={{ lat: dest.lat, lng: dest.lng }}
          label={dest.name[0]}
          onClick={() => onMarkerClick?.(dest.id)}
          icon={selectedId === dest.id ? {
            url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            scaledSize: typeof window !== 'undefined' && window.google && window.google.maps ? new window.google.maps.Size(40, 40) : undefined
          } : undefined}
        />
      ))}
    </GoogleMap>
  );
}
