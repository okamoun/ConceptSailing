'use client';

import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import { getAllBookings, type BookingSubmission } from '@/lib/submissions';
import { getAllAvailabilityEntries, type AvailabilityEntry } from '@/lib/availability';
import BookingCalendar from './BookingCalendar';
import Link from 'next/link';

const BookingMap = dynamic(() => import('./BookingMapClient'), { ssr: false });

const ADMIN_SECRET = process.env.NEXT_PUBLIC_ADMIN_SECRET || 'admin';

const bg = {
  backgroundImage: `linear-gradient(rgba(30,58,138,0.55),rgba(59,130,246,0.65)),url('/images/boats/blueone/External_sailing.jpg')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
};

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-center">
      <div className="text-white font-bold text-2xl">{value}</div>
      <div className="text-blue-200 text-xs mt-0.5">{label}</div>
    </div>
  );
}

export default function BookingSummaryClient() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [bookings, setBookings] = useState<BookingSubmission[]>([]);
  const [availability, setAvailability] = useState<AvailabilityEntry[]>([]);
  const [loading, setLoading] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_SECRET) { setAuthed(true); setAuthError(''); }
    else setAuthError('Incorrect password.');
  }

  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    Promise.all([getAllBookings(), getAllAvailabilityEntries()])
      .then(([b, a]) => { setBookings(b); setAvailability(a); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [authed]);

  // Derived stats
  const today = new Date();
  const upcoming = bookings.filter(b => {
    if (!b.date) return false;
    return new Date(`${b.date.slice(0, 10)}T12:00:00`) >= today;
  });
  const totalPassengers = bookings.reduce((s, b) => s + (b.passengers ?? 0), 0);

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4" style={bg}>
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl p-8 space-y-4"
        >
          <h1 className="text-white font-bold text-xl text-center">Booking Summary</h1>
          <div>
            <label className="text-blue-100 text-xs font-medium block mb-1">Admin Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-white/10 border border-white/25 text-white placeholder-blue-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
              autoFocus
            />
          </div>
          {authError && <p className="text-red-300 text-xs">{authError}</p>}
          <button type="submit" className="btn-primary w-full py-3 text-sm">Enter</button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-10" style={bg}>
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-white font-bold text-2xl">Booking Summary</h1>
            <p className="text-blue-200 text-xs mt-0.5">
              {today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <Link
            href="/admin"
            className="text-blue-200 text-xs hover:text-white border border-white/20 rounded-lg px-3 py-1.5 hover:bg-white/10 transition-colors"
          >
            ← Admin Dashboard
          </Link>
        </div>

        {/* Stats */}
        {loading ? (
          <p className="text-blue-200 text-sm animate-pulse">Loading…</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard label="Total Bookings" value={bookings.length} />
            <StatCard label="Upcoming" value={upcoming.length} />
            <StatCard label="Total Passengers" value={totalPassengers} />
            <StatCard label="Availability Entries" value={availability.length} />
          </div>
        )}

        {/* Calendar + Map layout */}
        {!loading && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            {/* Calendar panel */}
            <section>
              <h2 className="text-white font-semibold text-base mb-3">
                4-Month Calendar
                <span className="ml-2 text-blue-300 text-xs font-normal">
                  Click a highlighted date to see details
                </span>
              </h2>
              <BookingCalendar bookings={bookings} availability={availability} />
            </section>

            {/* Map panel */}
            <section>
              <h2 className="text-white font-semibold text-base mb-3">
                Departure &amp; Destination Map
                <span className="ml-2 text-blue-300 text-xs font-normal">
                  Click a green marker to see bookings
                </span>
              </h2>
              <BookingMap bookings={bookings} availability={availability} />
            </section>

          </div>
        )}

        {/* Recent bookings table */}
        {!loading && bookings.length > 0 && (
          <section>
            <h2 className="text-white font-semibold text-base mb-3">All Bookings</h2>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/20">
                      {['Name', 'Date', 'Pax', 'Departure Marina', 'Boat', 'Theme'].map(h => (
                        <th
                          key={h}
                          className="text-left text-blue-200 font-semibold px-3 py-2.5 whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...bookings]
                      .sort((a, b) => (a.date ?? '') < (b.date ?? '') ? -1 : 1)
                      .map((b, i) => (
                        <tr
                          key={b.id ?? i}
                          className="border-b border-white/10 hover:bg-white/5 transition-colors"
                        >
                          <td className="px-3 py-2 text-white font-medium whitespace-nowrap">{b.name}</td>
                          <td className="px-3 py-2 text-blue-200 whitespace-nowrap">
                            {b.date
                              ? new Date(`${b.date.slice(0, 10)}T12:00:00`).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                              : '—'}
                          </td>
                          <td className="px-3 py-2 text-blue-200 text-center">{b.passengers}</td>
                          <td className="px-3 py-2 text-blue-200 whitespace-nowrap">{b.embarkationPoint}</td>
                          <td className="px-3 py-2 text-blue-200 whitespace-nowrap">{b.boat}</td>
                          <td className="px-3 py-2 text-amber-300 whitespace-nowrap">
                            {b.selectedTheme || '—'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {!loading && bookings.length === 0 && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 text-center">
            <p className="text-blue-200 text-sm">No bookings found.</p>
          </div>
        )}

      </div>
    </main>
  );
}
