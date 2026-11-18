'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AwardBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative z-50 bg-[#06142a] border-b border-[#c9a24b]/30 text-[13px]">
      <div className="max-w-7xl mx-auto pl-3 pr-11 flex items-center justify-center">
        <Link
          href="/blueone#award"
          className="group py-2.5 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap justify-center text-center text-[#e8d6a8] hover:text-white transition-colors"
        >
          <span aria-hidden="true">🏆</span>
          <span className="font-semibold tracking-wide uppercase text-[#d9b864]">Winner — Best Chef</span>
          <span className="text-white/30" aria-hidden="true">·</span>
          <span className="font-medium"><span className="sm:hidden">EMMY&apos;s 2026</span><span className="hidden sm:inline">EMMY&apos;s Charter Show 2026</span></span>
          <span className="hidden sm:inline underline underline-offset-4 decoration-[#c9a24b]/50 group-hover:decoration-white">
            Meet the chef
          </span>
        </Link>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss banner"
          className="absolute right-0 p-3 text-white/50 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
