'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import MiniCalendar from '../components/MiniCalendar';
import PageHero from '../components/PageHero';
import { getAllCharters, type Charter } from '../../lib/availability';

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
    <div className="bg-[#0a1f3c]">
      <PageHero
        eyebrow="Plan your dates"
        title="Availability"
        subtitle="Check when BlueOne is available for your sailing experience."
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-8">

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
                className="text-white/80 hover:text-white transition-colors px-3 py-2 rounded-full hover:bg-white/10 text-sm font-medium"
              >
                ← Previous
              </button>
              <span className="text-white/70 text-sm text-center hidden sm:inline">
                {months[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                {' – '}
                {months[3].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
              <button
                onClick={() => setStartMonth(m => addMonths(m, 4))}
                className="text-white/80 hover:text-white transition-colors px-3 py-2 rounded-full hover:bg-white/10 text-sm font-medium"
              >
                Next →
              </button>
            </div>

            {/* 4-month grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {months.map((m, i) => (
                <div key={i} className="bg-white/5 rounded-xl p-4">
                  <MiniCalendar entries={entries} month={m} variant="dark" />
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 justify-center text-sm text-white/75 pt-4 border-t border-white/10">
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
          <p className="text-white/70">
            See a date that works? Request your charter.
          </p>
          <Link href="/booking" className="btn-primary">
            Request a Quote
          </Link>
        </div>

      </div>
    </div>
  );
}
