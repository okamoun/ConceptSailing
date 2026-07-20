'use client';

import { useMemo, useState } from 'react';

export type SortDir = 'asc' | 'desc';

/**
 * Generic, reusable column-sorting hook for admin tables.
 *
 * `accessors` maps each sortable column key to a function returning a
 * comparable (string | number) value for a row. Generalized from the
 * original charter-sort logic in AdminDashboardClient.tsx.
 */
export function useTableSort<T, K extends string>(
  rows: T[],
  accessors: Record<K, (row: T) => string | number>,
  initial: { col: K; dir: SortDir },
): { sorted: T[]; sort: { col: K; dir: SortDir }; toggle: (col: K) => void } {
  const [sort, setSort] = useState<{ col: K; dir: SortDir }>(initial);

  const sorted = useMemo(() => {
    const accessor = accessors[sort.col];
    const copy = [...rows];
    copy.sort((a, b) => {
      const va = accessor(a);
      const vb = accessor(b);
      if (va < vb) return sort.dir === 'asc' ? -1 : 1;
      if (va > vb) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
    // accessors is a stable literal defined at call site; intentionally omitted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, sort]);

  function toggle(col: K) {
    setSort(s => (s.col === col ? { col, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'asc' }));
  }

  return { sorted, sort, toggle };
}

/**
 * Clickable table header cell with a sort-direction indicator (↑/↓/↕).
 * Generalized from the original `SortTh` component in AdminDashboardClient.tsx.
 */
export function SortHeader<K extends string>({
  children,
  col,
  current,
  onToggle,
  className = '',
  align = 'left',
}: {
  children: React.ReactNode;
  col: K;
  current: { col: K; dir: SortDir };
  onToggle: (col: K) => void;
  className?: string;
  align?: 'left' | 'center' | 'right';
}) {
  const active = current.col === col;
  const justify = align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start';
  const textAlign = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left';
  return (
    <th
      className={`px-3 py-2.5 ${textAlign} cursor-pointer select-none hover:text-white transition-colors ${className}`}
      onClick={() => onToggle(col)}
    >
      <span className={`flex items-center gap-1 ${justify}`}>
        {children}
        <span className={active ? 'text-blue-300' : 'text-blue-600'}>
          {active ? (current.dir === 'asc' ? '↑' : '↓') : '↕'}
        </span>
      </span>
    </th>
  );
}
