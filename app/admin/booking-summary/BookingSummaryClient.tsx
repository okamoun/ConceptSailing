'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import {
  getAllCharters,
  updateCharter,
  type Charter,
  type CharterStatus,
  CHARTER_STATUS_LABEL,
  CHARTER_STATUS_PRIORITY,
} from '@/lib/availability';
import BookingCalendar from './BookingCalendar';
import { useTableSort, SortHeader } from '../useTableSort';
import { STATUS_BADGE, STATUS_BADGE_FALLBACK } from '@/lib/charterStatusStyles';

type BookingSortCol =
  | 'status' | 'name' | 'email' | 'phone' | 'startDate' | 'endDate'
  | 'nights' | 'passengers' | 'theme' | 'delivery' | 'redelivery' | 'boat' | 'note';

const nightsOf = (c: Charter) =>
  Math.round((new Date(c.endDate).getTime() - new Date(c.startDate).getTime()) / 86_400_000);

const BOOKING_COLUMNS: { label: string; col: BookingSortCol; align?: 'left' | 'center' }[] = [
  { label: 'Status',     col: 'status' },
  { label: 'Name',       col: 'name' },
  { label: 'Email',      col: 'email' },
  { label: 'Phone',      col: 'phone' },
  { label: 'Start',      col: 'startDate' },
  { label: 'End',        col: 'endDate' },
  { label: 'Nights',     col: 'nights',     align: 'center' },
  { label: 'Pax',        col: 'passengers', align: 'center' },
  { label: 'Theme',      col: 'theme' },
  { label: 'Delivery',   col: 'delivery' },
  { label: 'Redelivery', col: 'redelivery' },
  { label: 'Boat',       col: 'boat' },
  { label: 'Note',       col: 'note' },
];

const BookingMap  = dynamic(() => import('./BookingMapClient'), { ssr: false });
const DetailMap   = dynamic(() => import('./DetailMapClient'),  { ssr: false });

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-center">
      <div className="text-white font-bold text-2xl">{value}</div>
      <div className="text-blue-200 text-xs mt-0.5">{label}</div>
      {sub && <div className="text-blue-300/70 text-xs mt-0.5">{sub}</div>}
    </div>
  );
}

const ALL_STATUSES: CharterStatus[] = [
  'web_request', 'broker_request', 'serious_request', 'proposal_sent',
  'confirmed', 'signed', 'canceled', 'owner_use', 'maintenance',
];

// Show every status by default so switching to this screen can't silently hide
// new web leads (web_request) or canceled bookings — matches the Dashboard default.
const DEFAULT_STATUSES = new Set<CharterStatus>(ALL_STATUSES);

const STATUS_TOGGLE_CLS: Record<CharterStatus, { on: string; off: string }> = {
  web_request:     { on: 'bg-sky-400/80 text-sky-900 border-sky-400/80',         off: 'bg-sky-400/10 text-sky-400 border-sky-400/30' },
  broker_request:  { on: 'bg-amber-400/80 text-amber-900 border-amber-400/80',   off: 'bg-amber-400/10 text-amber-400 border-amber-400/30' },
  serious_request: { on: 'bg-orange-500/80 text-white border-orange-500/80',     off: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
  proposal_sent:   { on: 'bg-violet-500/80 text-white border-violet-500/80',     off: 'bg-violet-500/10 text-violet-400 border-violet-500/30' },
  confirmed:       { on: 'bg-emerald-500/80 text-white border-emerald-500/80',   off: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  signed:          { on: 'bg-emerald-800/80 text-white border-emerald-800/80',   off: 'bg-emerald-800/10 text-emerald-400 border-emerald-800/30' },
  canceled:        { on: 'bg-gray-500/70 text-white border-gray-500/70',         off: 'bg-gray-500/10 text-gray-400 border-gray-500/30' },
  owner_use:       { on: 'bg-purple-500/80 text-white border-purple-500/80',     off: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  maintenance:     { on: 'bg-red-500/80 text-white border-red-500/80',           off: 'bg-red-500/10 text-red-400 border-red-500/30' },
};

export default function BookingSummaryClient() {
  const [charters, setCharters] = useState<Charter[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeStatuses, setActiveStatuses] = useState<Set<CharterStatus>>(new Set(DEFAULT_STATUSES));
  const [selected, setSelected] = useState<Charter | null>(null);
  const [selectedPrev, setSelectedPrev] = useState<Charter | null>(null);
  const [selectedNext, setSelectedNext] = useState<Charter | null>(null);
  const [editNote, setEditNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  function openDetail(c: Charter) {
    const idx = sortedCharters.findIndex(x => x.id === c.id);
    setSelected(c);
    setSelectedPrev(idx > 0 ? sortedCharters[idx - 1] : null);
    setSelectedNext(idx < sortedCharters.length - 1 ? sortedCharters[idx + 1] : null);
    setEditNote(c.note ?? '');
  }

  function closeDetail() {
    setSelected(null);
    setSelectedPrev(null);
    setSelectedNext(null);
  }

  async function saveNote() {
    if (!selected) return;
    setSavingNote(true);
    try {
      await updateCharter(selected.id, { note: editNote || undefined });
      setCharters(prev => prev.map(c => c.id === selected.id ? { ...c, note: editNote || undefined } : c));
      setSelected(prev => prev ? { ...prev, note: editNote || undefined } : prev);
    } finally {
      setSavingNote(false);
    }
  }

  function toggleStatus(s: CharterStatus) {
    setActiveStatuses(prev => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s); else next.add(s);
      return next;
    });
  }

  useEffect(() => {
    setLoading(true);
    getAllCharters()
      .then(setCharters)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const upcoming     = charters.filter(c => c.endDate >= todayStr);
  const webRequests  = charters.filter(c => c.status === 'web_request');
  const confirmed    = charters.filter(c => c.status === 'confirmed' || c.status === 'signed');

  const totalDaysBooked = charters.reduce((sum, c) => sum + Math.max(0, Math.round((new Date(c.endDate).getTime() - new Date(c.startDate).getTime()) / 86_400_000)), 0);
  const upcomingDays    = upcoming.reduce((sum, c)  => sum + Math.max(0, Math.round((new Date(c.endDate).getTime() - new Date(c.startDate).getTime()) / 86_400_000)), 0);
  const confirmedDays   = confirmed.reduce((sum, c) => sum + Math.max(0, Math.round((new Date(c.endDate).getTime() - new Date(c.startDate).getTime()) / 86_400_000)), 0);

  const filteredCharters = charters.filter(c => activeStatuses.has(c.status));

  const {
    sorted: sortedCharters, sort: bookingSort, toggle: toggleBookingSort,
  } = useTableSort<Charter, BookingSortCol>(filteredCharters, {
    status:     c => CHARTER_STATUS_PRIORITY[c.status],
    name:       c => (c.name ?? '').toLowerCase(),
    email:      c => (c.email ?? '').toLowerCase(),
    phone:      c => (c.phone ?? '').toLowerCase(),
    startDate:  c => c.startDate,
    endDate:    c => c.endDate,
    nights:     c => nightsOf(c),
    passengers: c => c.passengers ?? 0,
    theme:      c => (c.selectedTheme ?? '').toLowerCase(),
    delivery:   c => (c.deliveryPoint ?? '').toLowerCase(),
    redelivery: c => (c.redeliveryPoint ?? '').toLowerCase(),
    boat:       c => (c.boat ?? '').toLowerCase(),
    note:       c => (c.note ?? '').toLowerCase(),
  }, { col: 'startDate', dir: 'asc' });

  const statusStats = Object.fromEntries(
    ALL_STATUSES.map(s => {
      const group = charters.filter(c => c.status === s);
      const days = group.reduce((sum, c) => sum + Math.max(0, Math.round((new Date(c.endDate).getTime() - new Date(c.startDate).getTime()) / 86_400_000)), 0);
      return [s, { count: group.length, days }];
    })
  ) as Record<CharterStatus, { count: number; days: number }>;

  return (
    <main className="px-4 py-6">
      <div className="max-w-6xl mx-auto space-y-6">

        <div>
          <h1 className="text-white font-bold text-2xl">Booking Summary</h1>
          <p className="text-blue-200 text-xs mt-0.5">
            {today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {loading ? (
          <p className="text-blue-200 text-sm animate-pulse">Loading…</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Total Bookings"    value={charters.length}  sub={`${totalDaysBooked} days booked`} />
            <StatCard label="Upcoming"           value={upcoming.length}  sub={`${upcomingDays} days booked`} />
            <StatCard label="Web Requests"       value={webRequests.length} />
            <StatCard label="Confirmed / Signed" value={confirmed.length} sub={`${confirmedDays} days booked`} />
          </div>
        )}

        {/* Status filter */}
        {!loading && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-blue-200 text-xs font-semibold uppercase tracking-wide">Filter by status</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveStatuses(new Set(ALL_STATUSES))}
                  className="text-blue-300 hover:text-white text-xs px-2 py-0.5 rounded hover:bg-white/10 transition-colors"
                >
                  All
                </button>
                <button
                  onClick={() => setActiveStatuses(new Set(DEFAULT_STATUSES))}
                  className="text-blue-300 hover:text-white text-xs px-2 py-0.5 rounded hover:bg-white/10 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ALL_STATUSES.map(s => {
                const on = activeStatuses.has(s);
                const { count, days } = statusStats[s];
                return (
                  <button
                    key={s}
                    onClick={() => toggleStatus(s)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-all ${on ? STATUS_TOGGLE_CLS[s].on : STATUS_TOGGLE_CLS[s].off}`}
                  >
                    {CHARTER_STATUS_LABEL[s]}
                    <span className="ml-1.5 font-normal opacity-80">{count} · {days}d</span>
                    {on && <span className="ml-1 opacity-70">✓</span>}
                  </button>
                );
              })}
            </div>
            <p className="text-blue-300/60 text-xs">
              {(() => {
                const filteredDays = filteredCharters.reduce((sum, c) => sum + Math.max(0, Math.round((new Date(c.endDate).getTime() - new Date(c.startDate).getTime()) / 86_400_000)), 0);
                return `Showing ${filteredCharters.length} of ${charters.length} booking${charters.length !== 1 ? 's' : ''} · ${filteredDays} days`;
              })()}
            </p>
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <section>
              <h2 className="text-white font-semibold text-base mb-3">
                4-Month Calendar
                <span className="ml-2 text-blue-300 text-xs font-normal">
                  Click a highlighted date to see details
                </span>
              </h2>
              <BookingCalendar charters={filteredCharters} />
            </section>

            <section>
              <h2 className="text-white font-semibold text-base mb-3">
                Departure &amp; Destination Map
                <span className="ml-2 text-blue-300 text-xs font-normal">
                  Click a marker to see charters
                </span>
              </h2>
              <BookingMap charters={filteredCharters} />
            </section>
          </div>
        )}

        {!loading && filteredCharters.length > 0 && (
          <section>
            <h2 className="text-white font-semibold text-base mb-3">
              All Bookings
              <span className="ml-2 text-blue-300 text-xs font-normal">Click a row to view details</span>
            </h2>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/20 text-blue-200 font-semibold">
                      {BOOKING_COLUMNS.map(({ label, col, align }) => (
                        <SortHeader
                          key={col}
                          col={col}
                          current={bookingSort}
                          onToggle={toggleBookingSort}
                          align={align}
                          className="whitespace-nowrap"
                        >
                          {label}
                        </SortHeader>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCharters
                      .map((c, i) => {
                        const nights = nightsOf(c);
                        return (
                          <tr
                            key={c.id ?? i}
                            onClick={() => openDetail(c)}
                            className="border-b border-white/10 hover:bg-white/10 cursor-pointer transition-colors"
                          >
                            <td className="px-3 py-2 whitespace-nowrap"><StatusBadge status={c.status} /></td>
                            <td className="px-3 py-2 text-white font-medium whitespace-nowrap">{c.name || '—'}</td>
                            <td className="px-3 py-2 text-blue-200 whitespace-nowrap">{c.email || '—'}</td>
                            <td className="px-3 py-2 text-blue-200 whitespace-nowrap">{c.phone || '—'}</td>
                            <td className="px-3 py-2 text-blue-200 whitespace-nowrap">
                              {new Date(`${c.startDate}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="px-3 py-2 text-blue-200 whitespace-nowrap">
                              {c.endDate !== c.startDate ? new Date(`${c.endDate}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                            </td>
                            <td className="px-3 py-2 text-blue-200 text-center">{nights > 0 ? nights : '—'}</td>
                            <td className="px-3 py-2 text-blue-200 text-center">{c.passengers ?? '—'}</td>
                            <td className="px-3 py-2 text-blue-200 max-w-[120px] truncate">{c.selectedTheme || '—'}</td>
                            <td className="px-3 py-2 text-blue-200 whitespace-nowrap">{c.deliveryPoint || '—'}</td>
                            <td className="px-3 py-2 text-blue-200 whitespace-nowrap">{c.redeliveryPoint || '—'}</td>
                            <td className="px-3 py-2 text-blue-200 whitespace-nowrap">{c.boat || '—'}</td>
                            <td className="px-3 py-2 text-blue-300 italic max-w-[120px] truncate">{c.note || '—'}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Detail modal */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm" onClick={closeDetail}>
            <div className="w-full max-w-lg bg-blue-900/95 border border-white/20 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4" onClick={e => e.stopPropagation()}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-white font-bold text-lg">{selected.name || 'Charter Detail'}</h2>
                  <StatusBadge status={selected.status} />
                </div>
                <button onClick={closeDetail} className="text-blue-300 hover:text-white text-lg leading-none">✕</button>
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <DetailRow label="Start" value={new Date(`${selected.startDate}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} />
                <DetailRow label="End" value={selected.endDate !== selected.startDate ? new Date(`${selected.endDate}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'} />
                <DetailRow label="Nights" value={String(Math.round((new Date(selected.endDate).getTime() - new Date(selected.startDate).getTime()) / 86400000) || '—')} />
                <DetailRow label="Passengers" value={String(selected.passengers ?? '—')} />
                <DetailRow label="Email" value={selected.email || '—'} />
                <DetailRow label="Phone" value={selected.phone || '—'} />
                <DetailRow label="Boat" value={selected.boat || '—'} />
                <DetailRow label="Delivery" value={selected.deliveryPoint || '—'} />
                <DetailRow label="Redelivery" value={selected.redeliveryPoint || '—'} />
                <DetailRow label="Theme" value={selected.selectedTheme || '—'} />
              </dl>

              {selected.holidayDescription && (
                <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                  <p className="text-blue-300 text-xs font-medium mb-1">Holiday Description</p>
                  <p className="text-white text-xs leading-relaxed">{selected.holidayDescription}</p>
                </div>
              )}

              {/* Location map with context */}
              <div className="border-t border-white/10 pt-3 space-y-2">
                <p className="text-blue-200 text-xs font-semibold uppercase tracking-wide">
                  Locations
                  {(selectedPrev || selectedNext) && (
                    <span className="ml-2 text-blue-400 font-normal normal-case">
                      {[selectedPrev && `↑ ${selectedPrev.name || 'prev'}`, selectedNext && `↓ ${selectedNext.name || 'next'}`].filter(Boolean).join(' · ')}
                    </span>
                  )}
                </p>
                <DetailMap current={selected} prev={selectedPrev} next={selectedNext} />
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2">
                <label className="text-blue-200 text-xs font-semibold uppercase tracking-wide block">Internal Note</label>
                <textarea
                  value={editNote}
                  onChange={e => setEditNote(e.target.value)}
                  rows={3}
                  placeholder="Add internal comments…"
                  className="w-full bg-white/10 border border-white/25 text-white placeholder-blue-400 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-400 resize-none"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={saveNote}
                    disabled={savingNote}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    {savingNote ? 'Saving…' : 'Save Note'}
                  </button>
                  <a
                    href={`/admin/bookings/${selected.id}`}
                    className="bg-white/10 hover:bg-white/20 text-blue-200 text-xs font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    View Full Details
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && filteredCharters.length === 0 && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 text-center">
            <p className="text-blue-200 text-sm">
              {charters.length === 0 ? 'No charters found.' : 'No charters match the selected statuses.'}
            </p>
          </div>
        )}

      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_BADGE[status as CharterStatus] ?? STATUS_BADGE_FALLBACK;
  return (
    <span className={`px-1.5 py-0.5 rounded-full font-semibold ${cls}`}>
      {CHARTER_STATUS_LABEL[status as keyof typeof CHARTER_STATUS_LABEL] ?? status}
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-blue-300 font-medium">{label}</dt>
      <dd className="text-white">{value}</dd>
    </>
  );
}
