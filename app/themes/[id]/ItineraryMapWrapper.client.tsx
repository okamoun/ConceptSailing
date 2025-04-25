"use client";
import React from "react";
import AdventureItineraryMap, { ItineraryPoint } from "./AdventureItineraryMap.client";

export default function ItineraryMapWrapper({ points }: { points: ItineraryPoint[] }) {
  if (!points || points.length === 0) return null;
  return (
    <div className="mb-10 animate-fade-in-up" style={{ animationDelay: '0.22s', animationFillMode: 'both' }}>
      <h3 className="text-2xl font-semibold mb-3 text-accent">Itinerary Map</h3>
      <AdventureItineraryMap points={points} />
    </div>
  );
}
