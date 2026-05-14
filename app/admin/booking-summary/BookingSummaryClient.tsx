'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { getAllCharters, type Charter, CHARTER_STATUS_LABEL } from '@/lib/availability';
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

export default function BookingSummaryClient() {
  const [charters, setCharters] = useState<Charter[]>([]);
  const [loading, setLoading] = useState(false);

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

        {!loading && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <section>
              <h2 className="text-white font-semibold text-base mb-3">
                4-Month Calendar
                <span className="ml-2 text-blue-300 text-xs font-normal">
                  Click a highlighted date to see details
                </span>
              </h2>
              <BookingCalendar charters={charters} />
            </section>

            <section>
              <h2 className="text-white font-semibold text-base mb-3">
                Departure &amp; Destination Map
                <span className="ml-2 text-blue-300 text-xs font-normal">
                  Click a marker to see charters
                </span>
              </h2>
              <BookingMap charters={charters} />
            </section>
          </div>
        )}

        {!loading && charters.length > 0 && (
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
                    {[...charters]
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

        {!loading && charters.length === 0 && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 text-center">
            <p className="text-blue-200 text-sm">No charters found.</p>
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
