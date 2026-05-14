'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import { getAllCharters, type Charter } from '../../lib/availability';

const bg = {
  backgroundImage: `linear-gradient(rgba(30,58,138,0.55),rgba(59,130,246,0.65)),url('/images/boats/blueone/External_sailing.jpg')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
};

export default function AvailabilityClient() {
  const [entries, setEntries] = useState<Charter[]>([]);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAllCharters()
      .then(setEntries)
      .catch(() => setError('Could not load availability. Please try again later.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen px-4 py-16" style={bg}>
      <div className="max-w-2xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-white font-bold text-4xl">Availability</h1>
          <p className="text-blue-200 text-lg">
            Check when BlueOne is available for your sailing experience.
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <p className="text-red-300 text-sm text-center bg-red-500/20 rounded-xl px-4 py-3">{error}</p>
        )}

        {!loading && !error && (
          <AvailabilityCalendar
            entries={entries}
            mode="user"
            month={month}
            onMonthChange={setMonth}
          />
        )}

        {/* CTA */}
        <div className="text-center space-y-3">
          <p className="text-blue-200 text-sm">
            See a date that works? Request your charter.
          </p>
          <Link
            href="/booking"
            className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-xl transition-colors duration-200"
          >
            Get a Quote
          </Link>
        </div>

      </div>
    </main>
  );
}
