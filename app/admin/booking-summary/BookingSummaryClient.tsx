'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getAllCharters,
  type Charter,
  type CharterStatus,
  CHARTER_STATUS_LABEL,
} from '@/lib/availability';
import BookingCalendar from './BookingCalendar';

const BookingMap = dynamic(() => import('./BookingMapClient'), { ssr: false });

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-center">
      <div className="text-white font-bold text-2xl">{value}</div>
      <div className="text-blue-200 text-xs mt-0.5">{label}</div>
    </div>
  );
}

const ALL_STATUSES: CharterStatus[] = [
  'web_request', 'broker_request', 'serious_request', 'confirmed',
  'signed', 'canceled', 'owner_use', 'maintenance',
];

const DEFAULT_STATUSES = new Set<CharterStatus>([
  'broker_request', 'serious_request', 'confirmed', 'signed', 'owner_use', 'maintenance',
]);

const STATUS_TOGGLE_CLS: Record<CharterStatus, { on: string; off: string }> = {
  web_request:     { on: 'bg-sky-400/80 text-sky-900 border-sky-400/80',         off: 'bg-sky-400/10 text-sky-400 border-sky-400/30' },
  broker_request:  { on: 'bg-amber-400/80 text-amber-900 border-amber-400/80',   off: 'bg-amber-400/10 text-amber-400 border-amber-400/30' },
  serious_request: { on: 'bg-orange-500/80 text-white border-orange-500/80',     off: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
  confirmed:       { on: 'bg-emerald-500/80 text-white border-emerald-500/80',   off: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  signed:          { on: 'bg-emerald-800/80 text-white border-emerald-800/80',   off: 'bg-emerald-800/10 text-emerald-400 border-emerald-800/30' },
  canceled:        { on: 'bg-gray-500/70 text-white border-gray-500/70',         off: 'bg-gray-500/10 text-gray-400 border-gray-500/30' },
  owner_use:       { on: 'bg-purple-500/80 text-white border-purple-500/80',     off: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  maintenance:     { on: 'bg-red-500/80 text-white border-red-500/80',           off: 'bg-red-500/10 text-red-400 border-red-500/30' },
};

export default function BookingSummaryClient() {
  const { hasPermission } = useAuth();
  const [charters, setCharters] = useState<Charter[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeStatuses, setActiveStatuses] = useState<Set<CharterStatus>>(new Set(DEFAULT_STATUSES));

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

  const upcoming = charters.filter(c => c.endDate >= todayStr);
  const webRequests = charters.filter(c => c.status === 'web_request');
  const confirmed = charters.filter(c => c.status === 'confirmed' || c.status === 'signed');

  const filteredCharters = charters.filter(c => activeStatuses.has(c.status));

  if (!hasPermission('booking-summary')) {
    return (
      <main className="px-4 py-6 flex items-center justify-center min-h-64">
        <div className="text-center space-y-2">
          <p className="text-white font-semibold text-lg">Access denied</p>
          <p className="text-blue-300 text-sm">You do not have permission to view this page.</p>
        </div>
      </main>
    );
  }

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
            <StatCard label="Total Charters" value={charters.length} />
            <StatCard label="Upcoming" value={upcoming.length} />
            <StatCard label="Web Requests" value={webRequests.length} />
            <StatCard label="Confirmed / Signed" value={confirmed.length} />
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
                return (
                  <button
                    key={s}
                    onClick={() => toggleStatus(s)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-all ${on ? STATUS_TOGGLE_CLS[s].on : STATUS_TOGGLE_CLS[s].off}`}
                  >
                    {CHARTER_STATUS_LABEL[s]}
                    {on && <span className="ml-1 opacity-70">✓</span>}
                  </button>
                );
              })}
            </div>
            <p className="text-blue-300/60 text-xs">
              Showing {filteredCharters.length} of {charters.length} charter{charters.length !== 1 ? 's' : ''}
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
            <h2 className="text-white font-semibold text-base mb-3">All Charters</h2>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/20">
                      {['Status', 'Name', 'Start', 'End', 'Pax', 'Delivery', 'Boat'].map(h => (
                        <th key={h} className="text-left text-blue-200 font-semibold px-3 py-2.5 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...filteredCharters]
                      .sort((a, b) => a.startDate.localeCompare(b.startDate))
                      .map((c, i) => (
                        <tr key={c.id ?? i} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                          <td className="px-3 py-2 whitespace-nowrap">
                            <StatusBadge status={c.status} />
                          </td>
                          <td className="px-3 py-2 text-white font-medium whitespace-nowrap">{c.name || '—'}</td>
                          <td className="px-3 py-2 text-blue-200 whitespace-nowrap">
                            {new Date(`${c.startDate}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="px-3 py-2 text-blue-200 whitespace-nowrap">
                            {c.endDate !== c.startDate
                              ? new Date(`${c.endDate}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                              : '—'}
                          </td>
                          <td className="px-3 py-2 text-blue-200 text-center">{c.passengers ?? '—'}</td>
                          <td className="px-3 py-2 text-blue-200 whitespace-nowrap">{c.embarkationPoint || c.deliveryPoint || '—'}</td>
                          <td className="px-3 py-2 text-blue-200 whitespace-nowrap">{c.boat || '—'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
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

const STATUS_BADGE_CLS: Record<string, string> = {
  web_request:     'bg-sky-500/30 text-sky-200',
  broker_request:  'bg-amber-500/30 text-amber-200',
  serious_request: 'bg-orange-500/30 text-orange-200',
  confirmed:       'bg-emerald-500/30 text-emerald-200',
  signed:          'bg-emerald-800/30 text-emerald-100',
  canceled:        'bg-gray-500/30 text-gray-300',
  owner_use:       'bg-purple-500/30 text-purple-200',
  maintenance:     'bg-red-500/30 text-red-200',
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-1.5 py-0.5 rounded-full font-semibold ${STATUS_BADGE_CLS[status] ?? 'bg-white/20 text-white'}`}>
      {CHARTER_STATUS_LABEL[status as keyof typeof CHARTER_STATUS_LABEL] ?? status}
    </span>
  );
}
