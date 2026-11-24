'use client';

import { usePathname } from 'next/navigation';
import AwardBanner from './AwardBanner';
import Navigation from './Navigation';
import Footer from './Footer';

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bare = (pathname?.startsWith('/proposal/') || pathname?.startsWith('/client-space/')) ?? false;

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-blue-900 focus:shadow-lg"
      >
        Skip to content
      </a>
      {!bare && <AwardBanner />}
      {!bare && <Navigation />}
      <main id="main-content">{children}</main>
      {!bare && <Footer />}
    </>
  );
}
