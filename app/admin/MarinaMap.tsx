'use client';

import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { Marina } from '@/app/marinas-data';

interface Props {
  delivery?: Marina;
  redelivery?: Marina;
}

const GREECE_CENTER = { lat: 38.2, lng: 24.8 };

const containerStyle = {
  width: '100%',
  height: '200px',
};

export default function MarinaMap({ delivery, redelivery }: Props) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  if (!isLoaded) {
    return (
      <div
        style={{ width: '100%', height: '200px' }}
        className="bg-gray-200 rounded flex items-center justify-center text-gray-500 text-sm"
      >
        Loading map...
      </div>
    );
  }

  const isSame =
    delivery &&
    redelivery &&
    delivery.id === redelivery.id;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={GREECE_CENTER}
      zoom={6}
    >
      {delivery && (
        <Marker
          position={{ lat: delivery.lat, lng: delivery.lng }}
          label={{ text: 'D', color: 'white' }}
          icon={{
            path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
            fillColor: '#3b82f6',
            fillOpacity: 1,
            strokeColor: '#1d4ed8',
            strokeWeight: 1,
            scale: 1.5,
            anchor: { x: 12, y: 22 } as google.maps.Point,
          }}
          title={`Delivery: ${delivery.name}`}
        />
      )}
      {redelivery && !isSame && (
        <Marker
          position={{ lat: redelivery.lat, lng: redelivery.lng }}
          label={{ text: 'R', color: 'white' }}
          icon={{
            path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
            fillColor: '#f97316',
            fillOpacity: 1,
            strokeColor: '#c2410c',
            strokeWeight: 1,
            scale: 1.5,
            anchor: { x: 12, y: 22 } as google.maps.Point,
          }}
          title={`Redelivery: ${redelivery.name}`}
        />
      )}
    </GoogleMap>
  );
}
