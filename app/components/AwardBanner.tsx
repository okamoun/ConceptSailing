'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function AwardBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="relative z-50 bg-gradient-to-r from-yellow-900 via-amber-800 to-yellow-900 border-b-2 border-yellow-500/60">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-3">
        <div className="flex items-center gap-3">
          <Image
            src="/price_chef.jpg"
            alt="EMMY's Charter Show 2026 Best Chef Award"
            width={36}
            height={36}
            className="rounded-full object-cover border-2 border-yellow-400 shadow-lg flex-shrink-0"
          />
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="text-yellow-300 text-lg">🏆</span>
            <span className="text-yellow-100 font-bold text-sm tracking-wide uppercase">
              Winner — Best Chef
            </span>
            <span className="text-yellow-400 text-sm hidden sm:inline">·</span>
            <span className="text-yellow-200 text-sm font-medium">
              EMMY&apos;s Charter Show 2026
            </span>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss banner"
          className="absolute right-4 text-yellow-400 hover:text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
