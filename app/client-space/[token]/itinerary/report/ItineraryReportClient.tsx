'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  getClientPreparation,
  getCharterByClientSpaceToken,
  type ClientPreparation,
  type ClientItineraryStop,
} from '../../../../../lib/clientSpace';
import type { Charter } from '../../../../../lib/availability';
import { formatNavTime } from '../../../../marinas-data';
import { featureIconMap } from '../../../../feature-icons';
import { CONTACT } from '../../../../config/contact';
import { CRUISE_SPEED_KN, legNm, totalNm, groupStopsByDay } from '../itinerary-utils';
import type { DayWeather } from '../../../../../lib/greekWeather';
import ItineraryMapLoader from '../ItineraryMapLoader.client';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

function nightCount(start?: string, end?: string): number | null {
  if (!start || !end) return null;
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000);
}

// ---------------------------------------------------------------------------
// Print styles
// ---------------------------------------------------------------------------

const PRINT_STYLES = `
  @media print {
    .no-print { display: none !important; }
    /* Map tiles / embedded content never print reliably — drop them. */
    object, embed, iframe, canvas, .map-block { display: none !important; }
    body { background: white !important; color: #1a1a2e !important; }
    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

    .report-stop { page-break-inside: avoid; }
    .report-section-title {
      background: #27368B !important;
      color: white !important;
    }
    .report-day-badge { background: #1F8FCA !important; color: white !important; }
    .report-footer { border-top: 2px solid #27368B !important; color: #64748b; }
  }

  @media screen {
    .report-header { background: linear-gradient(135deg, #27368B 0%, #1F8FCA 100%); }
  }
`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface Props {
  token: string;
}

export default function ItineraryReportClient({ token }: Props) {
  const [charter, setCharter] = useState<Charter | null>(null);
  const [prep, setPrep] = useState<ClientPreparation | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [weather, setWeather] = useState<Record<string, DayWeather>>({});

  useEffect(() => {
    Promise.all([getCharterByClientSpaceToken(token), getClientPreparation(token)])
      .then(([c, p]) => {
        if (!c || !p) { setNotFound(true); return; }
        setCharter(c);
        setPrep(p);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [token]);

  // Best-effort expected weather for each day: a live forecast when the date is
  // within range, otherwise a seasonal average. Failures are silently ignored.
  useEffect(() => {
    if (!prep || !charter) return;
    const dayStops = prep.itinerary?.stops ?? [];
    if (dayStops.length === 0) return;
    const days = groupStopsByDay(dayStops, charter.startDate);
    let active = true;
    (async () => {
      const results: Record<string, DayWeather> = {};
      await Promise.all(days.map(async d => {
        if (!d.date) return;
        const located = d.stops.find(s => typeof s.lat === 'number' && typeof s.lng === 'number');
        try {
          const res = await fetch('/api/itinerary-weather', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat: located?.lat, lng: located?.lng, date: d.date }),
          });
          if (!res.ok) return;
          const data = (await res.json()) as { weather?: DayWeather };
          if (data.weather) results[d.date as string] = data.weather;
        } catch { /* weather is optional — ignore */ }
      }));
      if (active) setWeather(results);
    })();
    return () => { active = false; };
  }, [prep, charter]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-400 text-sm animate-pulse">Loading itinerary…</p>
      </div>
    );
  }

  if (notFound || !charter || !prep) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500 text-sm">Itinerary not found.</p>
          <p className="text-slate-400 text-xs mt-1">
            Contact us at <a href={`mailto:${CONTACT.email}`} className="underline">{CONTACT.email}</a>
          </p>
        </div>
      </div>
    );
  }

  const stops: ClientItineraryStop[] = prep.itinerary?.stops ?? [];
  const printedAt = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const total = totalNm(stops);
  const nights = nightCount(charter.startDate, charter.endDate);
  const days = groupStopsByDay(stops, charter.startDate);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PRINT_STYLES }} />

      <div className="min-h-screen bg-slate-50">

        {/* Screen header */}
        <div className="report-header no-print sticky top-0 z-30 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Image
              src="/images/boats/blueone/logo_blueone.png"
              alt="BlueOne"
              width={72}
              height={28}
              className="object-contain flex-shrink-0 sm:w-[100px] sm:h-[40px]"
              unoptimized
            />
            <div className="min-w-0">
              <p className="text-white font-bold text-sm sm:text-base leading-tight">Itinerary Report</p>
              {charter.name && (
                <p className="text-blue-200 text-[10px] sm:text-xs truncate">
                  {charter.name} · {fmtDate(charter.startDate)}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={`/client-space/${token}/itinerary`}
              className="flex items-center gap-1.5 px-2 sm:px-4 py-2 rounded-xl text-xs font-semibold border border-white/30 text-white hover:bg-white/10 transition-colors"
              aria-label="Back to builder"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Edit Itinerary</span>
            </a>
            {stops.length > 0 && (
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 sm:px-5 py-2 rounded-xl text-xs font-bold bg-white text-blue-800 hover:bg-blue-50 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span className="hidden sm:inline">Print / Save PDF</span>
                <span className="sm:hidden">Print</span>
              </button>
            )}
          </div>
        </div>

        {/* Print-only header */}
        <div className="hidden print:block report-header px-8 py-5 mb-6" style={{ background: '#27368B' }}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-white font-bold text-lg">BlueOne Yacht Charter</p>
              <p className="text-blue-200 text-sm">Sailing Itinerary</p>
            </div>
            <div className="text-right">
              <p className="text-white font-semibold text-sm">{charter.name ?? ''}</p>
              <p className="text-blue-200 text-xs">
                {fmtDate(charter.startDate)}{charter.endDate ? ` – ${fmtDate(charter.endDate)}` : ''}
              </p>
              <p className="text-blue-300 text-xs mt-0.5">Printed: {printedAt}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">

          {stops.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
              <p className="text-slate-600 text-sm">No itinerary has been built yet.</p>
              <a
                href={`/client-space/${token}/itinerary`}
                className="inline-block mt-4 px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-700 text-white hover:bg-blue-600 transition-colors"
              >
                Build your itinerary
              </a>
            </div>
          ) : (
            <>
              {/* Overview */}
              <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="report-section-title px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white" style={{ background: '#27368B' }}>
                  Trip Overview
                </div>
                <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3 p-5 text-sm">
                  <Fact label="Yacht" value={charter.boat || 'BlueOne — Aura 51'} />
                  <Fact label="Guests" value={charter.passengers ? String(charter.passengers) : '—'} />
                  <Fact label="Embarkation" value={charter.embarkationPoint || '—'} />
                  <Fact label="Dates" value={`${fmtDate(charter.startDate)}${charter.endDate ? ` – ${fmtDate(charter.endDate)}` : ''}`} />
                  {nights != null && <Fact label="Nights" value={String(nights)} />}
                  <Fact label="Stops" value={String(stops.length)} />
                  {total > 0 && <Fact label="Total distance" value={`~${Math.round(total)} nm`} />}
                  {total > 0 && <Fact label="Time under way" value={`~${formatNavTime(total, CRUISE_SPEED_KN)}`} />}
                </dl>
              </section>

              {/* Route map (screen only) */}
              <section className="map-block no-print bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <h3 className="text-slate-700 font-bold text-sm mb-3">Route</h3>
                <ItineraryMapLoader stops={stops} />
              </section>

              {/* Day-by-day */}
              <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="report-section-title px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white" style={{ background: '#27368B' }}>
                  Day-by-Day Itinerary
                </div>
                <ol className="divide-y divide-slate-100">
                  {days.map(day => {
                    const w = day.date ? weather[day.date] : undefined;
                    return (
                      <li key={`${day.dayNumber}-${day.date ?? ''}`} className="report-stop p-5">
                        <div className="flex items-start gap-4">
                          <div
                            className="report-day-badge flex-shrink-0 w-14 rounded-xl text-white text-center py-2"
                            style={{ background: '#1F8FCA' }}
                          >
                            <div className="text-[10px] uppercase tracking-wide opacity-90">Day</div>
                            <div className="text-lg font-bold leading-none">{day.dayNumber}</div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              {day.date && <span className="text-slate-500 text-xs font-semibold">{fmtDate(day.date)}</span>}
                              {w && <WeatherChip w={w} />}
                            </div>

                            <div className="mt-2 space-y-3">
                              {day.stops.map(s => {
                                const gi = stops.findIndex(x => x.id === s.id);
                                const nm = gi > 0 ? legNm(stops[gi - 1], s) : null;
                                return (
                                  <div key={s.id}>
                                    <div className="flex flex-wrap items-baseline gap-x-2">
                                      <h4 className="text-slate-800 font-bold text-sm">{s.title}</h4>
                                      {s.locationName && s.locationName !== s.title && (
                                        <span className="text-slate-400 text-xs">📍 {s.locationName}</span>
                                      )}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-0.5">
                                      {gi === 0 ? (
                                        <span>⚓ Embarkation</span>
                                      ) : nm != null ? (
                                        <span>⛵ ~{Math.round(nm)} nm · {formatNavTime(nm, CRUISE_SPEED_KN)} from previous stop</span>
                                      ) : null}
                                    </div>
                                    {s.description && (
                                      <p className="text-slate-600 text-sm leading-relaxed mt-1.5">{s.description}</p>
                                    )}
                                    {s.features.length > 0 && (
                                      <div className="flex flex-wrap gap-1.5 mt-2">
                                        {s.features.map(f => (
                                          <span key={f} className="inline-flex items-center gap-1 bg-blue-50 border border-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                                            {featureIconMap[f] ? <span>{featureIconMap[f]}</span> : null}
                                            {f}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </section>

              {/* Footer */}
              <div className="report-footer pt-4 mt-2 border-t border-slate-200 text-center">
                <p className="text-slate-500 text-xs italic">
                  Distances and sailing times are estimates and subject to weather, sea conditions and the skipper&apos;s judgement.
                </p>
                <p className="text-slate-400 text-xs mt-2">
                  BlueOne Yacht Charter · <a href={`mailto:${CONTACT.email}`} className="underline">{CONTACT.email}</a> · Printed {printedAt}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function WeatherChip({ w }: { w: DayWeather }) {
  return (
    <span
      data-testid="weather"
      title={w.note}
      className="inline-flex items-center gap-1.5 text-xs bg-sky-50 border border-sky-100 text-sky-800 px-2.5 py-1 rounded-full"
    >
      <span aria-hidden="true">{w.emoji}</span>
      <span className="font-medium">{w.label}</span>
      {typeof w.tempMaxC === 'number' && (
        <span className="text-sky-600">
          {w.tempMaxC}°{typeof w.tempMinC === 'number' ? `/${w.tempMinC}°` : ''}
        </span>
      )}
      {typeof w.windKmh === 'number' && <span className="text-sky-600">· 💨 {w.windKmh} km/h</span>}
      {w.windLabel && <span className="text-sky-600">· {w.windLabel}</span>}
      <span className="text-[10px] uppercase tracking-wide text-sky-400 border-l border-sky-200 pl-1.5">
        {w.source === 'forecast' ? 'forecast' : 'seasonal avg'}
      </span>
    </span>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">{label}</dt>
      <dd className="text-slate-800 font-medium mt-0.5 break-words">{value}</dd>
    </div>
  );
}
