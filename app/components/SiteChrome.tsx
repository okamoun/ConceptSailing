'use client';

import { usePathname } from 'next/navigation';
import AwardBanner from './AwardBanner';
import Navigation from './Navigation';
import Footer from './Footer';

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const bare = pathname?.startsWith('/proposal/') ?? false;

  return (
    <>
      {!bare && <AwardBanner />}
      {!bare && <Navigation />}
      <main>{children}</main>
      {!bare && <Footer />}
    </>
  );
}
