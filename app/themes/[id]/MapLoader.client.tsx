'use client';

import dynamic from 'next/dynamic';
import type { ItineraryPoint } from './AdventureItineraryMap.client';

const ItineraryMapWrapper = dynamic(() => import('./ItineraryMapWrapper.client'), { ssr: false });

export default function MapLoader({ points }: { points: ItineraryPoint[] }) {
  return <ItineraryMapWrapper points={points} />;
}
