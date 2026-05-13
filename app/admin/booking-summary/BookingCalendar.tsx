'use client';

import { useState } from 'react';
import type { BookingSubmission } from '@/lib/submissions';

interface Props {
  bookings: BookingSubmission[];
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_ABBR = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function BookingCalendar({ bookings }: Props) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const today = new Date();
  const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  // Build date → bookings map (normalize to YYYY-MM-DD)
  const byDate = new Map<string, BookingSubmission[]>();
  bookings.forEach(b => {
    if (!b.date) return;
    const key = b.date.slice(0, 10);
    byDate.set(key, [...(byDate.get(key) ?? []), b]);
  });

  // 4 months starting from current month
  const months = Array.from({ length: 4 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const selectedBookings = selectedDate ? (byDate.get(selectedDate) ?? []) : [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {months.map(({ year, month }) => {
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          const firstDow = new Date(year, month, 1).getDay();

          return (
            <div
              key={`${year}-${month}`}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4"
            >
              <h3 className="text-white font-semibold text-sm text-center mb-3">
                {MONTH_NAMES[month]} {year}
              </h3>

              {/* Day-of-week header */}
              <div className="grid grid-cols-7 mb-1">
                {DAY_ABBR.map(d => (
                  <div key={d} className="text-blue-300 text-[10px] text-center font-medium py-0.5">
                    {d}
                  </div>
                ))}
              </div>

              {/* Day cells */}
              <div className="grid grid-cols-7 gap-y-0.5">
                {/* Leading empty cells */}
                {Array.from({ length: firstDow }, (_, i) => (
                  <div key={`e${i}`} />
                ))}

                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const key = toDateKey(year, month, day);
                  const bks = byDate.get(key);
                  const hasBookings = !!bks;
                  const isToday = key === todayKey;
                  const isSelected = key === selectedDate;

                  return (
                    <button
                      key={day}
                      disabled={!hasBookings}
                      onClick={() => setSelectedDate(isSelected ? null : key)}
                      className={[
                        'relative text-[11px] rounded py-0.5 text-center transition-all min-h-[22px] select-none',
                        hasBookings
                          ? isSelected
                            ? 'bg-blue-400 text-white font-bold shadow-lg'
                            : 'bg-blue-500/40 text-white hover:bg-blue-400/60 cursor-pointer'
                          : 'text-blue-300/50 cursor-default',
                        isToday && !hasBookings ? 'ring-1 ring-white/50 text-white' : '',
                        isToday && hasBookings && !isSelected ? 'ring-1 ring-amber-400' : '',
                      ].join(' ')}
                    >
                      {day}
                      {hasBookings && (
                        <span className="absolute -top-1 -right-0.5 bg-amber-400 text-[8px] leading-none text-black rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold">
                          {bks.length}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected-date detail panel */}
      {selectedDate && selectedBookings.length > 0 && (
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold text-sm">
              {new Date(`${selectedDate}T12:00:00`).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </h3>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-blue-300 hover:text-white text-xs px-2 py-0.5 rounded hover:bg-white/10 transition-colors"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {selectedBookings.map((b, i) => (
              <div key={b.id ?? i} className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-1">
                <div className="flex justify-between items-start">
                  <span className="text-white font-semibold text-sm">{b.name}</span>
                  <span className="text-blue-200 text-xs bg-blue-500/30 px-1.5 py-0.5 rounded">
                    {b.passengers} pax
                  </span>
                </div>
                <div className="text-blue-300 text-xs">{b.embarkationPoint}</div>
                <div className="text-blue-300/70 text-xs">{b.email}</div>
                {b.phone && <div className="text-blue-300/70 text-xs">{b.phone}</div>}
                {b.selectedTheme && (
                  <div className="text-amber-300 text-xs truncate">Theme: {b.selectedTheme}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-blue-200">
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-blue-500/40 inline-block border border-blue-400/40" />
          Booking date
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-blue-400 inline-block" />
          Selected
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-amber-400 inline-block" />
          Booking count
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded ring-1 ring-white/50 inline-block" />
          Today
        </div>
      </div>
    </div>
  );
}
