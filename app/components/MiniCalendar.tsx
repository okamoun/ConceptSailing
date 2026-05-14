'use client';

import { type Charter, type CharterStatus, CHARTER_STATUS_PRIORITY, isPubliclyAvailable } from '../../lib/availability';

interface Props {
  entries: Charter[];
  month: Date;
  selectedDate?: string;
  onDayClick?: (date: string) => void;
  variant?: 'dark' | 'light';
}

const DAY_ABBR = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function topStatus(dateStr: string, entries: Charter[]): CharterStatus | null {
  let best: CharterStatus | null = null;
  let bestP = 0;
  for (const e of entries) {
    if (dateStr >= e.startDate && dateStr <= e.endDate) {
      const p = CHARTER_STATUS_PRIORITY[e.status];
      if (p > bestP) { best = e.status; bestP = p; }
    }
  }
  return best;
}

export default function MiniCalendar({ entries, month, selectedDate, onDayClick, variant = 'dark' }: Props) {
  const year = month.getFullYear();
  const mon = month.getMonth();
  const daysInMonth = new Date(year, mon + 1, 0).getDate();
  const firstDow = new Date(year, mon, 1).getDay();
  const today = new Date().toISOString().slice(0, 10);

  const monthLabel = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const dark = variant === 'dark';

  return (
    <div>
      <p className={`font-semibold text-sm text-center mb-2 ${dark ? 'text-white' : 'text-blue-900'}`}>
        {monthLabel}
      </p>
      <div className="grid grid-cols-7">
        {DAY_ABBR.map(d => (
          <div
            key={d}
            className={`text-[10px] text-center font-medium py-0.5 ${dark ? 'text-blue-300' : 'text-blue-500'}`}
          >
            {d}
          </div>
        ))}

        {Array.from({ length: firstDow }, (_, i) => <div key={`e${i}`} />)}

        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dateStr = `${year}-${String(mon + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const status = topStatus(dateStr, entries);
          const isPast = dateStr < today;
          const isSelected = dateStr === selectedDate;
          const available = !status || isPubliclyAvailable(status);
          const clickable = !isPast && available && !!onDayClick;

          let cls = 'text-[11px] rounded py-0.5 text-center transition-all min-h-[22px] ';

          if (isSelected) {
            cls += dark
              ? 'bg-white text-blue-900 font-bold ring-1 ring-blue-300 '
              : 'bg-blue-600 text-white font-bold ';
          } else if (isPast) {
            cls += dark ? 'bg-white/5 text-white/25 ' : 'bg-gray-100 text-gray-400 ';
          } else if (!available) {
            cls += dark ? 'bg-red-500/40 text-red-200 ' : 'bg-red-100 text-red-600 ';
          } else {
            cls += dark ? 'bg-emerald-500/40 text-emerald-100 ' : 'bg-emerald-100 text-emerald-800 ';
          }

          if (clickable) cls += 'cursor-pointer hover:opacity-80 ';
          else if (!isPast && !available) cls += 'cursor-not-allowed ';

          return (
            <button
              key={day}
              type="button"
              disabled={!clickable}
              onClick={() => onDayClick?.(dateStr)}
              className={cls}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
