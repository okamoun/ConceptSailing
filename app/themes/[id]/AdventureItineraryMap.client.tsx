import React from "react";
import { GoogleMap, Polyline, Marker, useJsApiLoader } from "@react-google-maps/api";

export interface ItineraryPoint {
  title: string;
  description: string;
  lat: number;
  lng: number;
}

interface Props {
  points: ItineraryPoint[];
}

const containerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "0.75rem",
  boxShadow: "0 10px 30px rgba(0,0,0,0.17)"
};

const DEFAULT_CENTER = { lat: 38.5, lng: 23.5 };

export default function AdventureItineraryMap({ points }: Props) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  // Compute center as the average of all points, or fallback
  const center = React.useMemo(() => {
    if (points.length === 0) return DEFAULT_CENTER;
    const lat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
    const lng = points.reduce((sum, p) => sum + p.lng, 0) / points.length;
    return { lat, lng };
  }, [points]);

  if (!isLoaded) return <div className="flex justify-center items-center h-[400px]">Loading map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={8}
      options={{
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        clickableIcons: false,
      }}
    >
      {/* Polyline for the itinerary */}
      {points.length > 1 && (
        <Polyline
          path={points}
          options={{
            strokeColor: "#00bcd4",
            strokeOpacity: 0.9,
            strokeWeight: 4,
            geodesic: true,
          }}
        />
      )}
      {/* Markers for each day */}
      {points.map((pt, idx) => (
        <Marker
          key={idx}
          position={{ lat: pt.lat, lng: pt.lng }}
          label={{ text: `${idx + 1}`, color: "#fff" }}
          title={`Day ${idx + 1}: ${pt.title}`}
        />
      ))}
    </GoogleMap>
  );
}
