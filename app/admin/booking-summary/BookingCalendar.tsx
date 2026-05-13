'use client';

import { useState } from 'react';
import type { BookingSubmission } from '@/lib/submissions';
import type { AvailabilityEntry } from '@/lib/availability';

interface Props {
  bookings: BookingSubmission[];
  availability: AvailabilityEntry[];
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_ABBR = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// Highest-priority availability status that covers a given date
function statusForDate(dateStr: string, entries: AvailabilityEntry[]): AvailabilityEntry['status'] | null {
  const priority: Record<AvailabilityEntry['status'], number> = { booked: 3, blocked: 2, requested: 1 };
  let best: AvailabilityEntry['status'] | null = null;
  let bestP = 0;
  for (const e of entries) {
    if (dateStr >= e.startDate && dateStr <= e.endDate) {
      const p = priority[e.status];
      if (p > bestP) { best = e.status; bestP = p; }
    }
  }
  return best;
}

const AVAIL_BG: Record<AvailabilityEntry['status'], string> = {
  booked:    'bg-emerald-600/70',
  blocked:   'bg-red-500/70',
  requested: 'bg-amber-400/70',
};

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function BookingCalendar({ bookings, availability }: Props) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const today = new Date();
  const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  // Build date → bookings map
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
  const selectedEntry = selectedDate
    ? availability.find(e => selectedDate >= e.startDate && selectedDate <= e.endDate)
    : null;

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

              <div className="grid grid-cols-7 mb-1">
                {DAY_ABBR.map(d => (
                  <div key={d} className="text-blue-300 text-[10px] text-center font-medium py-0.5">
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-y-0.5">
                {Array.from({ length: firstDow }, (_, i) => <div key={`e${i}`} />)}

                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const key = toDateKey(year, month, day);
                  const bks = byDate.get(key);
                  const status = statusForDate(key, availability);
                  const isToday = key === todayKey;
                  const isSelected = key === selectedDate;
                  const clickable = !!bks || !!status;

                  // Base background from availability status
                  let bg = '';
                  if (status && !isSelected) bg = AVAIL_BG[status];
                  if (isSelected) bg = 'bg-white/80';

                  return (
                    <button
                      key={day}
                      disabled={!clickable}
                      onClick={() => clickable && setSelectedDate(isSelected ? null : key)}
                      className={[
                        'relative text-[11px] rounded py-0.5 text-center transition-all min-h-[22px] select-none',
                        bg,
                        !status && !isSelected ? 'bg-white/5' : '',
                        clickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default',
                        isSelected ? 'text-gray-900 font-bold shadow' : 'text-white',
                        !status && !bks && !isToday ? 'text-blue-300/50' : '',
                        isToday ? 'ring-1 ring-white/60' : '',
                      ].join(' ')}
                    >
                      {day}
                      {/* Booking count badge */}
                      {bks && (
                        <span className="absolute -top-1 -right-0.5 bg-blue-400 text-[8px] leading-none text-white rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold shadow">
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
      {selectedDate && (selectedBookings.length > 0 || selectedEntry) && (
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold text-sm">
              {new Date(`${selectedDate}T12:00:00`).toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}
            </h3>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-blue-300 hover:text-white text-xs px-2 py-0.5 rounded hover:bg-white/10 transition-colors"
            >
              ✕ Close
            </button>
          </div>

          {/* Availability entry info */}
          {selectedEntry && (
            <div className={`rounded-lg px-3 py-2 text-xs flex items-center gap-3 ${
              selectedEntry.status === 'booked'    ? 'bg-emerald-600/30 border border-emerald-500/40' :
              selectedEntry.status === 'blocked'   ? 'bg-red-500/30 border border-red-400/40' :
                                                    'bg-amber-400/30 border border-amber-400/40'
            }`}>
              <span className="text-white font-semibold capitalize">{selectedEntry.status}</span>
              <span className="text-blue-200">{selectedEntry.startDate} → {selectedEntry.endDate}</span>
              {selectedEntry.note && <span className="text-blue-200 italic truncate">{selectedEntry.note}</span>}
            </div>
          )}

          {/* Bookings on this date */}
          {selectedBookings.length > 0 && (
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
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-blue-200">
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-emerald-600/70 inline-block" />
          Booked
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-red-500/70 inline-block" />
          Blocked
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-amber-400/70 inline-block" />
          Requested
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-blue-400 inline-block" />
          Booking request (count)
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded ring-1 ring-white/60 bg-white/5 inline-block" />
          Today
        </div>
      </div>
    </div>
  );
}
