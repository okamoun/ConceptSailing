'use client';

import dynamic from 'next/dynamic';
import type { ClientItineraryStop } from '../../../../lib/clientSpace';

// SSR-safe dynamic import — the Google Maps JS loader must never run on the
// server. Mirrors the MapLoader → wrapper chain used on /themes/[id].
const ItineraryMap = dynamic(() => import('./ItineraryMap.client'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-[420px] text-blue-200 bg-white/5 rounded-xl">Loading map…</div>
  ),
});

interface Props {
  stops: ClientItineraryStop[];
  selectedId?: string;
  editable?: boolean;
  onMarkerClick?: (id: string) => void;
  onMarkerDragEnd?: (id: string, lat: number, lng: number) => void;
}

export default function ItineraryMapLoader(props: Props) {
  return <ItineraryMap {...props} />;
}
