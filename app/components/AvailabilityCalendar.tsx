'use client';

import { useMemo } from 'react';
import {
  Charter,
  CharterStatus,
  CHARTER_STATUS_PRIORITY,
  CHARTER_STATUS_LABEL,
} from '@/lib/availability';

interface Props {
  entries: Charter[];
  mode: 'admin' | 'public';
  month: Date;
  onMonthChange: (d: Date) => void;
  onDayClick?: (dateStr: string) => void;
}

const STATUS_COLORS: Record<CharterStatus, string> = {
  signed:          'bg-green-700 text-white',
  confirmed:       'bg-green-500 text-white',
  serious_request: 'bg-yellow-500 text-white',
  broker_request:  'bg-orange-400 text-white',
  web_request:     'bg-blue-400 text-white',
  owner_use:       'bg-purple-500 text-white',
  maintenance:     'bg-gray-500 text-white',
  canceled:        'bg-red-400 text-white',
};

function toDateStr(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export default function AvailabilityCalendar({
  entries,
  mode,
  month,
  onMonthChange,
  onDayClick,
}: Props) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();

  const firstDay = new Date(year, monthIndex, 1).getDay();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  // Build a map of dateStr -> highest priority status
  const dayStatusMap = useMemo(() => {
    const map = new Map<string, CharterStatus>();
    for (const charter of entries) {
      const start = parseDate(charter.startDate);
      const end = parseDate(charter.endDate);
      const cur = new Date(start);
      while (cur <= end) {
        const key = toDateStr(cur.getFullYear(), cur.getMonth(), cur.getDate());
        const existing = map.get(key);
        if (
          !existing ||
          CHARTER_STATUS_PRIORITY[charter.status] > CHARTER_STATUS_PRIORITY[existing]
        ) {
          map.set(key, charter.status);
        }
        cur.setDate(cur.getDate() + 1);
      }
    }
    return map;
  }, [entries]);

  const prevMonth = () => onMonthChange(new Date(year, monthIndex - 1, 1));
  const nextMonth = () => onMonthChange(new Date(year, monthIndex + 1, 1));

  const monthLabel = month.toLocaleString('default', { month: 'long', year: 'numeric' });

  const blanks = Array.from({ length: firstDay });
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="bg-[#0a1628] rounded-xl p-4 text-white select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="px-3 py-1 rounded bg-[#1a2a48] hover:bg-[#243558] transition-colors"
        >
          &#8249;
        </button>
        <span className="font-semibold text-lg tracking-wide">{monthLabel}</span>
        <button
          onClick={nextMonth}
          className="px-3 py-1 rounded bg-[#1a2a48] hover:bg-[#243558] transition-colors"
        >
          &#8250;
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 text-center text-xs text-blue-300 mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {blanks.map((_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {days.map((day) => {
          const dateStr = toDateStr(year, monthIndex, day);
          const status = dayStatusMap.get(dateStr);
          const colorClass = status ? STATUS_COLORS[status] : 'bg-[#1a2a48] text-blue-200';
          const isClickable = mode === 'admin';

          return (
            <div
              key={day}
              onClick={isClickable ? () => onDayClick?.(dateStr) : undefined}
              className={`
                rounded text-center text-xs py-1.5 font-medium
                ${colorClass}
                ${isClickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
              `}
            >
              {day}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1.5">
        {(Object.keys(CHARTER_STATUS_LABEL) as CharterStatus[]).map((status) => (
          <div key={status} className="flex items-center gap-1 text-xs">
            <span className={`inline-block w-3 h-3 rounded-sm ${STATUS_COLORS[status]}`} />
            <span className="text-blue-200">{CHARTER_STATUS_LABEL[status]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
