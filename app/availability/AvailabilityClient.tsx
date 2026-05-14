'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import MiniCalendar from '../components/MiniCalendar';
import { getAllCharters, type Charter } from '../../lib/availability';

const bg = {
  backgroundImage: `linear-gradient(rgba(30,58,138,0.55),rgba(59,130,246,0.65)),url('/images/boats/blueone/External_sailing.jpg')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
};

function addMonths(date: Date, n: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + n, 1);
}

export default function AvailabilityClient() {
  const [entries, setEntries] = useState<Charter[]>([]);
  const [startMonth, setStartMonth] = useState(() => {
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

  const months = [0, 1, 2, 3].map(i => addMonths(startMonth, i));

  return (
    <main className="min-h-screen px-4 py-16" style={bg}>
      <div className="max-w-4xl mx-auto space-y-8">

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
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 space-y-5">
            {/* Month navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setStartMonth(m => addMonths(m, -4))}
                className="text-white/70 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10 text-sm"
              >
                ← Previous
              </button>
              <span className="text-white/60 text-xs">
                {months[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                {' – '}
                {months[3].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={() => setStartMonth(m => addMonths(m, 4))}
                className="text-white/70 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10 text-sm"
              >
                Next →
              </button>
            </div>

            {/* 4-month grid */}
            <div className="grid grid-cols-2 gap-6">
              {months.map((m, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-4">
                  <MiniCalendar entries={entries} month={m} variant="dark" />
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 justify-center text-xs text-blue-200 pt-2 border-t border-white/10">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500/60 inline-block" /> Available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-red-500/50 inline-block" /> Not available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-white/10 inline-block" /> Past
              </span>
            </div>
          </div>
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
