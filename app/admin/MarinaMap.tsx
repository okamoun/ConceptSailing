'use client';

import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import type { Marina } from '../marinas-data';

interface Props {
  delivery: Marina | undefined;
  redelivery: Marina | undefined;
}

const MAP_OPTIONS: google.maps.MapOptions = {
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  zoomControl: true,
  clickableIcons: false,
};

export default function MarinaMap({ delivery, redelivery }: Props) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
  });

  if (!isLoaded) {
    return <div className="h-48 rounded-lg bg-white/10 animate-pulse" />;
  }

  if (!delivery && !redelivery) return null;

  const sameLocation = delivery && redelivery && delivery.id === redelivery.id;
  const points = [delivery, redelivery].filter(Boolean) as Marina[];
  const center = points.length === 1
    ? { lat: points[0].lat, lng: points[0].lng }
    : { lat: (points[0].lat + points[1].lat) / 2, lng: (points[0].lng + points[1].lng) / 2 };
  const zoom = !delivery || !redelivery || sameLocation ? 9 : 7;

  return (
    <div className="rounded-lg overflow-hidden">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '200px' }}
        center={center}
        zoom={zoom}
        options={MAP_OPTIONS}
      >
        {delivery && (
          <Marker
            position={{ lat: delivery.lat, lng: delivery.lng }}
            label={{ text: 'D', color: 'white', fontWeight: 'bold', fontSize: '12px' }}
            title={`Delivery: ${delivery.name}`}
          />
        )}
        {redelivery && !sameLocation && (
          <Marker
            position={{ lat: redelivery.lat, lng: redelivery.lng }}
            label={{ text: 'R', color: 'white', fontWeight: 'bold', fontSize: '12px' }}
            title={`Redelivery: ${redelivery.name}`}
          />
        )}
      </GoogleMap>
    </div>
  );
}
