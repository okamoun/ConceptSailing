'use client';

import { useCallback } from 'react';
import { GoogleMap, Marker, Polyline, useJsApiLoader } from '@react-google-maps/api';
import type { Charter } from '@/lib/availability';
import { getMarinaById, type Marina } from '@/app/marinas-data';

function haversineNm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3440.065;
  const toRad = (d: number) => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function markerIcon(color: string, label: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30"><circle cx="15" cy="15" r="13" fill="${color}" stroke="white" stroke-width="2"/><text x="15" y="20" text-anchor="middle" fill="white" font-size="10" font-weight="bold" font-family="Arial,sans-serif">${label}</text></svg>`;
  return { url: `data:image/svg+xml,${encodeURIComponent(svg)}` };
}

const DASHED_LINE = (color: string) => ({
  geodesic: true,
  strokeColor: color,
  strokeOpacity: 0,
  icons: [{
    icon: { path: 'M 0,-1 0,1', strokeOpacity: 0.55, strokeColor: color, scale: 2.2 },
    offset: '0',
    repeat: '12px',
  }],
});

const SOLID_LINE = {
  geodesic: true,
  strokeColor: '#3b82f6',
  strokeOpacity: 0.75,
  strokeWeight: 2.5,
};

interface Props {
  current: Charter;
  prev: Charter | null;
  next: Charter | null;
}

export default function DetailMapClient({ current, prev, next }: Props) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
  });

  const prevRedeliv = prev
    ? getMarinaById(prev.redeliveryPoint ?? prev.deliveryPoint ?? '')
    : undefined;
  const curDeliv    = getMarinaById(current.deliveryPoint ?? '');
  const curRedeliv  = getMarinaById(current.redeliveryPoint ?? current.deliveryPoint ?? '');
  const nextDeliv   = next ? getMarinaById(next.deliveryPoint ?? '') : undefined;

  const points = [prevRedeliv, curDeliv, curRedeliv, nextDeliv].filter((p): p is Marina => !!p);

  type Segment = { from: Marina; to: Marina; nm: number; fromLabel: string; toLabel: string; dashed: boolean; days?: number };
  const segments: Segment[] = [];

  const gapBefore = prev ? Math.round((new Date(current.startDate).getTime() - new Date(prev.endDate).getTime()) / 86_400_000) : undefined;
  const gapAfter  = next ? Math.round((new Date(next.startDate).getTime() - new Date(current.endDate).getTime()) / 86_400_000) : undefined;

  if (prevRedeliv && curDeliv && prevRedeliv.id !== curDeliv.id)
    segments.push({ from: prevRedeliv, to: curDeliv, nm: Math.round(haversineNm(prevRedeliv.lat, prevRedeliv.lng, curDeliv.lat, curDeliv.lng)), fromLabel: prevRedeliv.name, toLabel: curDeliv.name, dashed: true, days: gapBefore });

  if (curDeliv && curRedeliv && curDeliv.id !== curRedeliv.id)
    segments.push({ from: curDeliv, to: curRedeliv, nm: Math.round(haversineNm(curDeliv.lat, curDeliv.lng, curRedeliv.lat, curRedeliv.lng)), fromLabel: curDeliv.name, toLabel: curRedeliv.name, dashed: false });

  if (curRedeliv && nextDeliv && curRedeliv.id !== nextDeliv.id)
    segments.push({ from: curRedeliv, to: nextDeliv, nm: Math.round(haversineNm(curRedeliv.lat, curRedeliv.lng, nextDeliv.lat, nextDeliv.lng)), fromLabel: curRedeliv.name, toLabel: nextDeliv.name, dashed: true, days: gapAfter });

  const onLoad = useCallback((map: google.maps.Map) => {
    if (points.length === 0) return;
    if (points.length === 1) { map.setCenter({ lat: points[0].lat, lng: points[0].lng }); map.setZoom(9); return; }
    const bounds = new google.maps.LatLngBounds();
    points.forEach(p => bounds.extend({ lat: p.lat, lng: p.lng }));
    map.fitBounds(bounds, 48);
  }, // eslint-disable-next-line react-hooks/exhaustive-deps
  [points.map(p => p.id).join(',')]);

  if (points.length === 0) return null;
  if (!isLoaded) return <div className="h-48 rounded-xl bg-white/10 animate-pulse" />;

  return (
    <div className="space-y-2">
      <div className="rounded-xl overflow-hidden">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '210px' }}
          center={{ lat: points[0].lat, lng: points[0].lng }}
          zoom={7}
          onLoad={onLoad}
          options={{ mapTypeControl: false, streetViewControl: false, fullscreenControl: false, zoomControl: true, clickableIcons: false }}
        >
          {prevRedeliv && (
            <Marker position={{ lat: prevRedeliv.lat, lng: prevRedeliv.lng }}
              icon={markerIcon('#64748b', 'P')} title={`Prev redelivery: ${prevRedeliv.name}`} />
          )}
          {curDeliv && (
            <Marker position={{ lat: curDeliv.lat, lng: curDeliv.lng }}
              icon={markerIcon('#16a34a', 'D')} title={`Delivery: ${curDeliv.name}`} />
          )}
          {curRedeliv && curRedeliv.id !== curDeliv?.id && (
            <Marker position={{ lat: curRedeliv.lat, lng: curRedeliv.lng }}
              icon={markerIcon('#2563eb', 'R')} title={`Redelivery: ${curRedeliv.name}`} />
          )}
          {nextDeliv && (
            <Marker position={{ lat: nextDeliv.lat, lng: nextDeliv.lng }}
              icon={markerIcon('#64748b', 'N')} title={`Next delivery: ${nextDeliv.name}`} />
          )}
          {segments.map((seg, i) => (
            <Polyline key={i}
              path={[{ lat: seg.from.lat, lng: seg.from.lng }, { lat: seg.to.lat, lng: seg.to.lng }]}
              options={seg.dashed ? DASHED_LINE('#94a3b8') : SOLID_LINE}
            />
          ))}
        </GoogleMap>
      </div>

      {segments.length > 0 && (
        <div className="space-y-1">
          {segments.map((seg, i) => (
            <div key={i} className={`flex items-center justify-between rounded-lg px-3 py-1.5 ${seg.dashed ? 'bg-white/5' : 'bg-blue-500/15 border border-blue-500/20'}`}>
              <span className="text-blue-300 text-xs truncate mr-2">{seg.fromLabel} → {seg.toLabel}</span>
              <span className="text-white text-xs font-semibold whitespace-nowrap">
                {seg.nm} nm{seg.days !== undefined ? ` · ${seg.days}d gap` : ''}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3 text-xs text-blue-400 pt-0.5">
        {prevRedeliv && <span><span className="inline-block w-2 h-2 rounded-full bg-slate-500 mr-1" />P = prev redelivery</span>}
        {curDeliv    && <span><span className="inline-block w-2 h-2 rounded-full bg-emerald-600 mr-1" />D = delivery</span>}
        {curRedeliv && curRedeliv.id !== curDeliv?.id && <span><span className="inline-block w-2 h-2 rounded-full bg-blue-600 mr-1" />R = redelivery</span>}
        {nextDeliv   && <span><span className="inline-block w-2 h-2 rounded-full bg-slate-500 mr-1" />N = next delivery</span>}
      </div>
    </div>
  );
}
