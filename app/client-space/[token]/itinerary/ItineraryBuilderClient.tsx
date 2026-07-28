'use client';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import {
  getClientPreparation,
  getCharterByClientSpaceToken,
  saveItinerary,
  addItineraryMessage,
  makeItineraryStops,
  newStopId,
  type ClientPreparation,
  type ClientItinerary,
  type ClientItineraryStop,
  type ItineraryChatMessage,
} from '../../../../lib/clientSpace';
import type { Charter } from '../../../../lib/availability';
import adventures from '../../../adventures-data';
import { featureIconMap } from '../../../feature-icons';
import { CONTACT } from '../../../config/contact';
import { formatNavTime } from '../../../marinas-data';
import { CRUISE_SPEED_KN, legNm, assignSequentialDates, daysBetween } from './itinerary-utils';
import ItineraryMapLoader from './ItineraryMapLoader.client';

const fmtDayLabel = (iso?: string) =>
  iso ? new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : '';

// Re-sequence a stop list so `order` matches array position.
function reindex(stops: ClientItineraryStop[]): ClientItineraryStop[] {
  return stops.map((s, i) => ({ ...s, order: i }));
}

export default function ItineraryBuilderClient({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [charter, setCharter] = useState<Charter | null>(null);
  const [itinerary, setItinerary] = useState<ClientItinerary | null>(null);
  const [messages, setMessages] = useState<ItineraryChatMessage[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  const [generating, setGenerating] = useState(false);
  const [chatText, setChatText] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientName = charter?.name || 'Guest';
  const themeAdventure = useMemo(
    () => (charter?.selectedTheme ? adventures.find(a => a.id === charter.selectedTheme) : undefined),
    [charter?.selectedTheme],
  );

  // ---- Load charter + preparation on mount --------------------------------
  useEffect(() => {
    let active = true;
    Promise.all([getCharterByClientSpaceToken(token), getClientPreparation(token)])
      .then(([c, prep]: [Charter | null, ClientPreparation | null]) => {
        if (!active) return;
        setCharter(c);
        if (prep?.itinerary) setItinerary(prep.itinerary);
        if (prep?.itineraryMessages) setMessages(prep.itineraryMessages);
      })
      .catch(() => { if (active) setError('We could not load your itinerary. Please try again.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token]);

  const stops = useMemo(() => itinerary?.stops ?? [], [itinerary]);

  // Total sailing distance across every leg that has coordinates on both ends.
  const totalNm = useMemo(() => {
    let sum = 0;
    for (let i = 1; i < stops.length; i++) {
      const nm = legNm(stops[i - 1], stops[i]);
      if (nm != null) sum += nm;
    }
    return sum;
  }, [stops]);

  // Persist an itinerary update to Firestore, keeping local state in sync.
  // A failed save surfaces an error but never discards the client's edits.
  async function persist(next: ClientItinerary) {
    setItinerary(next);
    try {
      await saveItinerary(token, next);
    } catch {
      setError('Your latest change could not be saved. Please check your connection.');
    }
  }

  function updateStops(nextStops: ClientItineraryStop[], source?: ClientItinerary['source']) {
    const base = itinerary ?? { source: 'manual' as const, stops: [] };
    persist({ ...base, source: source ?? base.source, stops: reindex(nextStops) });
  }

  // ---- Seeding ------------------------------------------------------------
  function useThemeItinerary() {
    if (!themeAdventure) return;
    setError(null);
    const seeded: ClientItinerary = {
      source: 'theme',
      sourceThemeId: themeAdventure.id,
      stops: assignSequentialDates(makeItineraryStops(themeAdventure.itinerary), charter?.startDate, charter?.endDate),
      generatedAt: new Date().toISOString(),
    };
    persist(seeded);
  }

  async function generateWithAi() {
    if (!charter) return;
    setError(null);
    setGenerating(true);
    try {
      const res = await fetch('/api/itinerary-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          charter: {
            startDate: charter.startDate,
            endDate: charter.endDate,
            boat: charter.boat,
            passengers: charter.passengers,
            embarkationPoint: charter.embarkationPoint,
            selectedTheme: charter.selectedTheme,
            holidayDescription: charter.holidayDescription,
          },
        }),
      });
      if (!res.ok) throw new Error('generation failed');
      const data = (await res.json()) as { itinerary?: ClientItinerary };
      if (!data.itinerary || !Array.isArray(data.itinerary.stops) || data.itinerary.stops.length === 0) {
        throw new Error('empty itinerary');
      }
      await persist(data.itinerary);
    } catch {
      // Leave any previous itinerary untouched — only surface the error.
      setError('We could not generate an itinerary right now. Please try again in a moment.');
    } finally {
      setGenerating(false);
    }
  }

  // ---- Manual stop editing ------------------------------------------------
  function editStop(id: string, patch: Partial<ClientItineraryStop>) {
    updateStops(stops.map(s => (s.id === id ? { ...s, ...patch } : s)));
  }

  function addStop() {
    // Default the new stop to the last stop's date (or the charter start) so it
    // slots onto a real day — the client can move it to another day after.
    const defaultDate = stops[stops.length - 1]?.date || charter?.startDate;
    const next: ClientItineraryStop = {
      id: newStopId(),
      order: stops.length,
      title: 'New stop',
      description: '',
      features: [],
      ...(defaultDate ? { date: defaultDate } : {}),
    };
    updateStops([...stops, next]);
  }

  function removeStop(id: string) {
    updateStops(stops.filter(s => s.id !== id));
  }

  function moveStop(id: string, dir: -1 | 1) {
    const idx = stops.findIndex(s => s.id === id);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= stops.length) return;
    const next = [...stops];
    [next[idx], next[target]] = [next[target], next[idx]];
    updateStops(next);
  }

  function removeFeature(id: string, feature: string) {
    editStop(id, { features: (stops.find(s => s.id === id)?.features ?? []).filter(f => f !== feature) });
  }

  function addFeature(id: string, feature: string) {
    const trimmed = feature.trim();
    if (!trimmed) return;
    const current = stops.find(s => s.id === id)?.features ?? [];
    if (current.includes(trimmed)) return;
    editStop(id, { features: [...current, trimmed] });
  }

  function onMarkerDragEnd(id: string, lat: number, lng: number) {
    editStop(id, { lat, lng });
  }

  // ---- Chat ---------------------------------------------------------------
  async function sendChat() {
    const text = chatText.trim();
    if (!text || chatSending) return;
    setError(null);
    setChatText('');
    setChatSending(true);

    // Optimistically show the client's message immediately.
    const userMsg: ItineraryChatMessage = {
      id: newStopId(),
      author: clientName,
      text,
      createdAt: new Date().toISOString(),
      isAi: false,
    };
    setMessages(prev => [...prev, userMsg]);
    addItineraryMessage(token, { author: clientName, text, isAi: false }).catch(() => {});

    try {
      const res = await fetch('/api/itinerary-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stops, message: text }),
      });
      if (!res.ok) throw new Error('chat failed');
      const data = (await res.json()) as { stops?: ClientItineraryStop[]; reply?: string };
      if (Array.isArray(data.stops)) {
        await persist({ ...(itinerary ?? { source: 'manual', stops: [] }), source: 'manual', stops: reindex(data.stops) });
      }
      const reply = data.reply || 'I have updated your itinerary.';
      const aiMsg: ItineraryChatMessage = {
        id: newStopId(), author: 'AI', text: reply, createdAt: new Date().toISOString(), isAi: true,
      };
      setMessages(prev => [...prev, aiMsg]);
      addItineraryMessage(token, { author: 'AI', text: reply, isAi: true }).catch(() => {});
    } catch {
      setError('The itinerary assistant is unavailable right now. Your itinerary is unchanged.');
    } finally {
      setChatSending(false);
    }
  }

  // ---- Render -------------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #003d7a 0%, #0066cc 100%)' }}>
        <p className="text-blue-100 text-sm">Loading your itinerary…</p>
      </div>
    );
  }

  if (!charter) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #003d7a 0%, #0066cc 100%)' }}>
        <p className="text-blue-100 text-sm text-center">
          We couldn&apos;t find your booking. Please contact us at{' '}
          <a href={`mailto:${CONTACT.email}`} className="underline">{CONTACT.email}</a>.
        </p>
      </div>
    );
  }

  const hasItinerary = stops.length > 0;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #003d7a 0%, #0066cc 100%)' }}>
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#003d7a]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Image src="/images/boats/blueone/logo_blueone.png" alt="BlueOne" width={90} height={36} className="object-contain" unoptimized />
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold leading-tight">Itinerary Builder</p>
            <p className="text-blue-300 text-xs truncate">Welcome, {clientName}</p>
          </div>
          <a
            href={`/client-space/${token}`}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-colors"
          >
            ← Back
          </a>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {error && (
          <div role="alert" className="bg-red-500/20 border border-red-400/40 rounded-xl px-4 py-3 text-red-100 text-sm">
            {error}
          </div>
        )}

        {/* Entry / seeding */}
        {!hasItinerary && (
          <div className="bg-white/10 border border-white/20 rounded-2xl p-6 text-center space-y-4">
            <h2 className="text-white text-xl font-bold">Start your itinerary</h2>
            <p className="text-blue-200 text-sm">
              Begin from your chosen theme or let our AI plan the perfect route from your trip details.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {themeAdventure && (
                <button
                  type="button"
                  onClick={useThemeItinerary}
                  className="btn-primary px-6 py-3 text-sm font-semibold"
                >
                  Use “{themeAdventure.name}” itinerary
                </button>
              )}
              <button
                type="button"
                onClick={generateWithAi}
                disabled={generating}
                className="px-6 py-3 rounded-xl text-sm font-semibold bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-colors disabled:opacity-50"
              >
                {generating ? 'Generating…' : '✨ Generate with AI'}
              </button>
            </div>
          </div>
        )}

        {hasItinerary && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Map */}
            <section className="bg-white/10 border border-white/20 rounded-2xl p-4 lg:sticky lg:top-24">
              <h3 className="text-white font-bold mb-3">Your Route</h3>
              <ItineraryMapLoader
                stops={stops}
                selectedId={selectedId}
                editable
                onMarkerClick={setSelectedId}
                onMarkerDragEnd={onMarkerDragEnd}
              />
              <p className="text-blue-300 text-xs mt-2">Drag a marker to fine-tune a stop&apos;s location.</p>
            </section>

            {/* Day list */}
            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-white font-bold">Day-by-Day Stops</h3>
                <div className="flex items-center gap-3">
                  <a
                    href={`/client-space/${token}/itinerary/report`}
                    className="inline-flex items-center gap-1 text-blue-200 hover:text-white text-xs font-semibold"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    View report
                  </a>
                  <button
                    type="button"
                    onClick={generateWithAi}
                    disabled={generating}
                    className="text-blue-200 hover:text-white text-xs underline disabled:opacity-50"
                  >
                    {generating ? 'Regenerating…' : 'Regenerate with AI'}
                  </button>
                </div>
              </div>

              {totalNm > 0 && (
                <div className="flex items-center gap-2 text-xs text-blue-100 bg-white/10 border border-white/20 rounded-xl px-3 py-2">
                  <CompassIcon />
                  <span>
                    Approx. <strong className="text-white">{Math.round(totalNm)} nm</strong> total ·{' '}
                    <strong className="text-white">{formatNavTime(totalNm, CRUISE_SPEED_KN)}</strong> under way
                  </span>
                </div>
              )}

              <ul className="space-y-3">
                {stops.map((s, i) => {
                  const nm = i > 0 ? legNm(stops[i - 1], s) : null;
                  const showDayHeader = i === 0 || s.date !== stops[i - 1].date;
                  const dayNumber = charter.startDate && s.date ? daysBetween(charter.startDate, s.date) + 1 : i + 1;
                  return (
                  <Fragment key={s.id}>
                  {showDayHeader && (
                    <li className="flex items-center gap-2 pt-1">
                      <span className="text-white text-xs font-bold uppercase tracking-wide">Day {dayNumber}</span>
                      {s.date && <span className="text-blue-300 text-xs">· {fmtDayLabel(s.date)}</span>}
                      <span className="flex-1 h-px bg-white/15" />
                    </li>
                  )}
                  <li
                    data-testid="itinerary-stop"
                    onMouseEnter={() => setSelectedId(s.id)}
                    onMouseLeave={() => setSelectedId(undefined)}
                    className={`rounded-xl border px-3 py-3 sm:px-4 transition-colors ${selectedId === s.id ? 'border-blue-300 bg-white/20' : 'border-white/20 bg-white/10'}`}
                  >
                    <div className="flex items-start gap-2.5 sm:gap-3">
                      <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs mt-1">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <input
                          type="date"
                          aria-label={`Stop ${i + 1} date`}
                          value={s.date ?? ''}
                          min={charter.startDate}
                          max={charter.endDate}
                          onChange={e => editStop(s.id, { date: e.target.value })}
                          className="mb-1 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-400 [color-scheme:dark]"
                        />
                        {i === 0 ? (
                          <div className="inline-flex items-center gap-1.5 text-[11px] text-blue-200 mb-1">
                            <AnchorIcon />
                            <span>Embarkation</span>
                          </div>
                        ) : nm != null ? (
                          <div className="inline-flex items-center gap-1.5 text-[11px] text-blue-200 mb-1" data-testid="leg-info">
                            <CompassIcon />
                            <span>
                              ~{Math.round(nm)} nm · {formatNavTime(nm, CRUISE_SPEED_KN)} from previous stop
                            </span>
                          </div>
                        ) : null}
                        <input
                          aria-label={`Stop ${i + 1} title`}
                          value={s.title}
                          onChange={e => editStop(s.id, { title: e.target.value })}
                          className="w-full bg-transparent text-white font-semibold text-sm focus:outline-none focus:bg-white/10 rounded px-1 -mx-1"
                        />
                        <textarea
                          aria-label={`Stop ${i + 1} description`}
                          value={s.description}
                          onChange={e => editStop(s.id, { description: e.target.value })}
                          rows={2}
                          className="w-full mt-1 bg-transparent text-blue-100 text-xs leading-relaxed focus:outline-none focus:bg-white/10 rounded px-1 -mx-1 resize-none"
                        />
                        {s.features.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {s.features.map(f => (
                              <span key={f} className="inline-flex items-center gap-1 bg-white/20 border border-white/30 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                                {featureIconMap[f] ? <span>{featureIconMap[f]}</span> : null}
                                {f}
                                <button
                                  type="button"
                                  aria-label={`Remove ${f}`}
                                  onClick={() => removeFeature(s.id, f)}
                                  className="ml-0.5 text-white/70 hover:text-white"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 flex-shrink-0">
                        <button
                          type="button" aria-label={`Move stop ${i + 1} up`} onClick={() => moveStop(s.id, -1)} disabled={i === 0}
                          className="w-7 h-7 sm:w-6 sm:h-6 rounded bg-white/10 hover:bg-white/20 text-white text-xs disabled:opacity-30"
                        >↑</button>
                        <button
                          type="button" aria-label={`Move stop ${i + 1} down`} onClick={() => moveStop(s.id, 1)} disabled={i === stops.length - 1}
                          className="w-7 h-7 sm:w-6 sm:h-6 rounded bg-white/10 hover:bg-white/20 text-white text-xs disabled:opacity-30"
                        >↓</button>
                        <button
                          type="button" aria-label={`Remove stop ${i + 1}`} onClick={() => removeStop(s.id)}
                          className="w-7 h-7 sm:w-6 sm:h-6 rounded bg-red-500/30 hover:bg-red-500/50 text-white text-xs"
                        >×</button>
                      </div>
                    </div>
                    <FeatureAdder onAdd={f => addFeature(s.id, f)} />
                  </li>
                  </Fragment>
                  );
                })}
              </ul>

              <button
                type="button"
                onClick={addStop}
                className="w-full py-2.5 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 text-white border border-dashed border-white/30 transition-colors"
              >
                + Add a stop
              </button>
            </section>
          </div>
        )}

        {/* Chat panel */}
        {hasItinerary && (
          <section className="bg-white/10 border border-white/20 rounded-2xl p-5">
            <h3 className="text-white font-bold mb-1">Ask AI to adjust your itinerary</h3>
            <p className="text-blue-300 text-xs mb-4">e.g. “swap day 3 for a quieter bay” or “add a sunset dinner stop”.</p>

            {messages.length > 0 && (
              <div className="space-y-4 mb-4 max-h-72 overflow-y-auto pr-1">
                {messages.map(m => (
                  <div key={m.id} className={`flex gap-3 ${m.isAi ? '' : 'flex-row-reverse'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${m.isAi ? 'bg-white/20 text-white' : 'bg-blue-600/50 text-blue-100'}`}>
                      {m.isAi ? 'AI' : m.author.charAt(0).toUpperCase()}
                    </div>
                    <div className={`max-w-[75%] ${m.isAi ? '' : 'items-end flex flex-col'}`}>
                      <div className={`rounded-2xl px-4 py-3 text-sm ${m.isAi ? 'bg-white/15 text-white rounded-tl-sm' : 'bg-blue-600/30 text-blue-50 rounded-tr-sm'}`}>
                        <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                aria-label="Message the itinerary assistant"
                value={chatText}
                onChange={e => setChatText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); } }}
                disabled={chatSending}
                placeholder="Ask for a change…"
                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder:text-blue-400 focus:outline-none focus:border-blue-400 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={sendChat}
                disabled={chatSending || !chatText.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-colors"
              >
                {chatSending ? '…' : 'Send'}
              </button>
            </div>
          </section>
        )}

        <div className="text-center pb-8">
          <p className="text-blue-400 text-xs">Your itinerary is saved automatically.</p>
        </div>
      </div>
    </div>
  );
}

function CompassIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-shrink-0">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

function AnchorIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-shrink-0">
      <circle cx="12" cy="5" r="3" />
      <line x1="12" y1="22" x2="12" y2="8" />
      <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
    </svg>
  );
}

// Small inline input for adding an activity highlight to a stop.
function FeatureAdder({ onAdd }: { onAdd: (feature: string) => void }) {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="flex gap-1 mt-2 pl-9">
      <input
        ref={ref}
        type="text"
        aria-label="Add an activity highlight"
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onAdd(value); setValue(''); } }}
        placeholder="+ add highlight"
        className="flex-1 bg-white/5 border border-white/15 rounded-lg px-2 py-1 text-xs text-white placeholder:text-blue-400 focus:outline-none focus:border-blue-400"
      />
    </div>
  );
}
