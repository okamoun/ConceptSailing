'use client';

import { useState } from 'react';
import {
  type Charter,
  type CharterStatus,
  CHARTER_STATUS_PRIORITY,
  CHARTER_STATUS_LABEL,
  isPubliclyAvailable,
} from '@/lib/availability';

interface Props {
  charters: Charter[];
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_ABBR = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const STATUS_BG: Record<CharterStatus, string> = {
  web_request:     'bg-sky-400/70',
  broker_request:  'bg-amber-400/70',
  serious_request: 'bg-orange-500/70',
  proposal_sent:   'bg-violet-500/70',
  confirmed:       'bg-emerald-500/70',
  signed:          'bg-emerald-800/70',
  canceled:        'bg-gray-500/50',
  owner_use:       'bg-purple-500/70',
  maintenance:     'bg-red-500/70',
};

function topStatusForDate(dateStr: string, charters: Charter[]): CharterStatus | null {
  let best: CharterStatus | null = null;
  let bestP = 0;
  for (const c of charters) {
    if (dateStr >= c.startDate && dateStr <= c.endDate) {
      const p = CHARTER_STATUS_PRIORITY[c.status];
      if (p > bestP) { best = c.status; bestP = p; }
    }
  }
  return best;
}

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function BookingCalendar({ charters }: Props) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [monthOffset, setMonthOffset] = useState(0);

  const today = new Date();
  const todayKey = toDateKey(today.getFullYear(), today.getMonth(), today.getDate());

  const months = Array.from({ length: 4 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() + monthOffset + i, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const selectedCharters = selectedDate
    ? charters.filter(c => selectedDate >= c.startDate && selectedDate <= c.endDate)
    : [];

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="grid grid-cols-3 items-center">
        <button
          onClick={() => setMonthOffset(o => o - 1)}
          className="flex items-center gap-1 text-blue-200 hover:text-white text-sm px-3 py-1 rounded-lg hover:bg-white/10 transition-colors justify-self-start"
        >
          ← Prev
        </button>
        <div className="flex flex-col items-center gap-1">
          <span className="text-blue-200 text-xs text-center">
            {MONTH_NAMES[months[0].month]} {months[0].year} – {MONTH_NAMES[months[3].month]} {months[3].year}
          </span>
          {monthOffset !== 0 && (
            <button
              onClick={() => setMonthOffset(0)}
              className="text-blue-400 hover:text-white text-[10px] px-2 py-0.5 rounded border border-blue-400/40 hover:bg-white/10 transition-colors"
            >
              Today
            </button>
          )}
        </div>
        <button
          onClick={() => setMonthOffset(o => o + 1)}
          className="flex items-center gap-1 text-blue-200 hover:text-white text-sm px-3 py-1 rounded-lg hover:bg-white/10 transition-colors justify-self-end"
        >
          Next →
        </button>
      </div>
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
                  <div key={d} className="text-blue-300 text-[10px] text-center font-medium py-0.5">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-0.5">
                {Array.from({ length: firstDow }, (_, i) => <div key={`e${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const key = toDateKey(year, month, day);
                  const status = topStatusForDate(key, charters);
                  const isToday = key === todayKey;
                  const isSelected = key === selectedDate;
                  const clickable = !!status;

                  let bg = '';
                  if (isSelected) bg = 'bg-white/80';
                  else if (status) bg = STATUS_BG[status];
                  else bg = 'bg-white/5';

                  return (
                    <button
                      key={day}
                      disabled={!clickable}
                      onClick={() => clickable && setSelectedDate(isSelected ? null : key)}
                      className={[
                        'relative text-[11px] rounded py-0.5 text-center transition-all min-h-[22px] select-none',
                        bg,
                        clickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default',
                        isSelected ? 'text-gray-900 font-bold shadow' : 'text-white',
                        !status && !isToday ? 'text-blue-300/50' : '',
                        isToday ? 'ring-1 ring-white/60' : '',
                      ].join(' ')}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected-date detail panel */}
      {selectedDate && selectedCharters.length > 0 && (
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {selectedCharters.map((c, i) => (
              <div key={c.id ?? i} className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-1">
                <div className="flex justify-between items-start gap-2 flex-wrap">
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                    isPubliclyAvailable(c.status) ? 'bg-sky-500/30 text-sky-200' : 'bg-emerald-500/30 text-emerald-200'
                  }`}>
                    {CHARTER_STATUS_LABEL[c.status]}
                  </span>
                  <span className="text-blue-200 text-xs">{c.startDate} → {c.endDate}</span>
                </div>
                {c.name && <div className="text-white font-semibold text-sm">{c.name}</div>}
                {c.email && <div className="text-blue-300/70 text-xs">{c.email}</div>}
                {c.phone && <div className="text-blue-300/70 text-xs">{c.phone}</div>}
                {c.passengers != null && (
                  <div className="text-blue-200 text-xs">{c.passengers} passengers</div>
                )}
                {(c.embarkationPoint || c.deliveryPoint) && (
                  <div className="text-blue-300 text-xs">{c.embarkationPoint || c.deliveryPoint}</div>
                )}
                {c.selectedTheme && <div className="text-amber-300 text-xs truncate">Theme: {c.selectedTheme}</div>}
                {c.note && <div className="text-blue-300/70 text-xs italic">{c.note}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-blue-200">
        {(Object.keys(STATUS_BG) as CharterStatus[]).map(s => (
          <div key={s} className="flex items-center gap-1.5">
            <span className={`w-4 h-4 rounded ${STATUS_BG[s]} inline-block`} />
            {CHARTER_STATUS_LABEL[s]}
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded ring-1 ring-white/60 bg-white/5 inline-block" />
          Today
        </div>
      </div>
    </div>
  );
}
