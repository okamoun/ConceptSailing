'use client';

import { Suspense } from 'react';
import BookingPageContent from './page-content';

export default function BookingClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#101824] to-[#1f2937] flex items-center justify-center">
        <div className="text-white text-xl">Loading booking form...</div>
      </div>
    }>
      <BookingPageContent />
    </Suspense>
  );
}
