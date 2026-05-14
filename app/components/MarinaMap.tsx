'use client';

import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import type { Marina } from '../marinas-data';

const containerStyle = {
  width: '100%',
  height: '220px',
  borderRadius: '0.5rem',
};

interface Props {
  marina: Marina;
}

export default function MarinaMap({ marina }: Props) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  if (!isLoaded) {
    return (
      <div className="w-full h-[220px] rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
        <p className="text-blue-400 text-sm">Loading map…</p>
      </div>
    );
  }

  const center = { lat: marina.lat, lng: marina.lng };

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={13}
      options={{
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        clickableIcons: false,
        styles: [
          { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        ],
      }}
    >
      <Marker position={center} title={marina.name} />
    </GoogleMap>
  );
}
