'use client';

import type { AvailabilityEntry } from '../../lib/availability';

interface AvailabilityCalendarProps {
  entries: AvailabilityEntry[];
  mode: 'user' | 'admin';
  month: Date;
  onMonthChange: (d: Date) => void;
  onDayClick?: (dateStr: string) => void;
}

const STATUS_PRIORITY: Record<AvailabilityEntry['status'], number> = {
  booked: 3,
  blocked: 2,
  requested: 1,
};

const ADMIN_CELL: Record<AvailabilityEntry['status'], string> = {
  requested: 'bg-amber-400/80 text-amber-900',
  blocked:   'bg-red-500/80 text-white',
  booked:    'bg-emerald-600/80 text-white',
};

const ADMIN_BADGE: Record<AvailabilityEntry['status'], string> = {
  requested: 'bg-amber-400/30 text-amber-200',
  blocked:   'bg-red-500/30 text-red-200',
  booked:    'bg-emerald-600/30 text-emerald-200',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getStatusForDate(
  dateStr: string,
  entries: AvailabilityEntry[]
): AvailabilityEntry['status'] | null {
  let best: AvailabilityEntry['status'] | null = null;
  let bestPriority = 0;
  for (const e of entries) {
    if (dateStr >= e.startDate && dateStr <= e.endDate) {
      const p = STATUS_PRIORITY[e.status];
      if (p > bestPriority) { best = e.status; bestPriority = p; }
    }
  }
  return best;
}

export default function AvailabilityCalendar({
  entries,
  mode,
  month,
  onMonthChange,
  onDayClick,
}: AvailabilityCalendarProps) {
  const year = month.getFullYear();
  const mon = month.getMonth();

  const firstDay = new Date(year, mon, 1).getDay();
  const daysInMonth = new Date(year, mon + 1, 0).getDate();

  const monthLabel = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  function prevMonth() {
    onMonthChange(new Date(year, mon - 1, 1));
  }
  function nextMonth() {
    onMonthChange(new Date(year, mon + 1, 1));
  }

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="bg-white/15 backdrop-blur-sm border border-white/25 rounded-2xl p-6 space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-colors"
          aria-label="Previous month"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-white font-bold text-lg">{monthLabel}</h2>
        <button
          onClick={nextMonth}
          className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-colors"
          aria-label="Next month"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-blue-300 text-xs font-semibold py-1">
            {d}
          </div>
        ))}

        {/* Day cells */}
        {cells.map((day, idx) => {
          if (day === null) {
            return <div key={`empty-${idx}`} />;
          }

          const dateStr = `${year}-${String(mon + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const status = getStatusForDate(dateStr, entries);
          const today = toDateStr(new Date());
          const isPast = dateStr < today;

          let cellClass = 'rounded-lg p-1 text-center text-xs font-medium transition-colors relative ';

          if (mode === 'user') {
            if (!status && !isPast) {
              cellClass += 'bg-emerald-500/30 text-emerald-100 border border-emerald-400/40';
            } else if (!status && isPast) {
              cellClass += 'bg-white/5 text-white/30 border border-white/10';
            } else {
              cellClass += 'bg-red-500/30 text-red-200 border border-red-400/30';
            }
          } else {
            // admin mode
            if (status) {
              cellClass += `${ADMIN_CELL[status]} border border-white/20 cursor-pointer hover:opacity-80`;
            } else if (isPast) {
              cellClass += 'bg-white/5 text-white/30 border border-white/10';
            } else {
              cellClass += 'bg-white/10 text-white border border-white/20 cursor-pointer hover:bg-white/20';
            }
          }

          const clickable = mode === 'admin' && !isPast && onDayClick;

          return (
            <div
              key={dateStr}
              className={cellClass}
              onClick={clickable ? () => onDayClick(dateStr) : undefined}
              title={mode === 'admin' && status ? status : undefined}
            >
              <span>{day}</span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 pt-2 border-t border-white/10">
        {mode === 'user' ? (
          <>
            <LegendDot color="bg-emerald-500/50 border border-emerald-400/50" label="Available" />
            <LegendDot color="bg-red-500/40 border border-red-400/30" label="Not available" />
            <LegendDot color="bg-white/10 border border-white/10" label="Past" />
          </>
        ) : (
          <>
            <LegendDot color="bg-white/20 border border-white/20" label="Free" />
            <LegendDot color="bg-amber-400/80" label="Requested" />
            <LegendDot color="bg-red-500/80" label="Blocked" />
            <LegendDot color="bg-emerald-600/80" label="Booked" />
            <LegendDot color="bg-white/10 border border-white/10" label="Past" />
          </>
        )}
      </div>

      {/* Admin: entry chips below calendar */}
      {mode === 'admin' && entries.length > 0 && (
        <div className="space-y-1 pt-2 border-t border-white/10">
          <p className="text-blue-300 text-xs font-semibold mb-2">Active entries this month</p>
          {entries
            .filter(e => {
              const start = new Date(e.startDate);
              const end = new Date(e.endDate);
              return start.getFullYear() === year && start.getMonth() === mon ||
                     end.getFullYear() === year && end.getMonth() === mon ||
                     (start < new Date(year, mon, 1) && end >= new Date(year, mon, 1));
            })
            .map(e => (
              <div key={e.id} className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${ADMIN_BADGE[e.status]}`}>
                  {e.status}
                </span>
                <span className="text-white text-xs">{e.startDate} → {e.endDate}</span>
                {e.note && <span className="text-blue-300 text-xs italic truncate">{e.note}</span>}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-3 h-3 rounded-sm ${color}`} />
      <span className="text-blue-200 text-xs">{label}</span>
    </div>
  );
}
