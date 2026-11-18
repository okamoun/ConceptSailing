'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AwardBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative z-50 bg-[#06142a] border-b border-[#c9a24b]/30 text-[13px]">
      <div className="max-w-7xl mx-auto pl-4 pr-10 py-2 flex items-center justify-center">
        <Link
          href="/blueone#award"
          className="group flex items-center gap-2 flex-wrap justify-center text-center text-[#e8d6a8] hover:text-white transition-colors"
        >
          <span aria-hidden="true">🏆</span>
          <span className="font-semibold tracking-wide uppercase text-[#d9b864]">Winner — Best Chef</span>
          <span className="hidden sm:inline text-white/30" aria-hidden="true">·</span>
          <span className="font-medium">EMMY&apos;s Charter Show 2026</span>
          <span className="hidden sm:inline underline underline-offset-4 decoration-[#c9a24b]/50 group-hover:decoration-white">
            Meet the chef
          </span>
        </Link>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss banner"
          className="absolute right-2 p-2 text-white/40 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
