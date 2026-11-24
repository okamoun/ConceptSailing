import type { Metadata } from 'next';
import Link from 'next/link';
import PageHero from '../components/PageHero';

export const metadata: Metadata = {
  title: 'About BlueOne | Family Sailing Holidays in Greece',
  description: 'Discover BlueOne\'s philosophy — luxury family sailing holidays in Greece built around experiences, not just the boat. Meet our crew and learn what makes us different.',
  keywords: ['about BlueOne', 'family sailing holidays Greece', 'luxury catamaran crew', 'sustainable sailing Greece', 'Greek island sailing company', 'BlueOne story'],
  openGraph: {
    title: 'About BlueOne | Family Sailing Holidays in Greece',
    description: 'BlueOne puts families and experiences at the heart of every sailing holiday. Discover our story, values, and crew.',
    type: 'website',
    url: 'https://www.blueoneyacht.com/about',
    images: [
      {
        url: '/images/boats/blueone/External_sailing.jpg',
        width: 1200,
        height: 630,
        alt: 'BlueOne Luxury Catamaran - About Us',
      },
    ],
  },
};

const VALUES = [
  {
    title: 'Sustainable',
    body: 'Solar panels and eco-friendly practices for responsible travel',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
  },
  {
    title: 'Family-First',
    body: 'Designed for families to connect and create memories',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  },
  {
    title: 'Premium',
    body: 'Luxury amenities with professional crew service',
    icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
  },
];

export default function AboutPage() {
  return (
    <div className="bg-white">
      <PageHero
        eyebrow="Premium Yacht Experiences"
        title="About BlueOne"
        subtitle="Family sailing holidays in Greece, built around experiences — not just the boat."
      />

      <section className="section-pad">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-lg text-slate-700 space-y-6 leading-relaxed [&_p]:mb-0">
            <p className="text-xl md:text-2xl text-[#0a1f3c] leading-snug font-[family-name:var(--font-display)]">
              <strong className="font-semibold">BlueOne</strong> is redefining the way families experience sailing holidays in Greece. Traditionally, yacht charters have focused on the boat: its size, its luxury, its speed. But we believe the heart of a truly memorable holiday lies elsewhere.
            </p>
            <p>
              Our approach puts <span className="text-blue-700 font-semibold">families</span> and <span className="text-blue-700 font-semibold">experiences</span> at the center. We start by getting to know you—your family&apos;s passions, your dreams, your idea of the perfect getaway. Then, we design a journey tailored around unique activities, inspiring destinations, and the connections you make along the way.
            </p>
            <p>
              Whether you crave adventure, wellness, culture, or family bonding, our curated sailing themes ensure every moment is meaningful. The BlueOne catamaran is your floating home, but the real story is written by the people on board and the experiences you share.
            </p>
            <p>
              Join us to discover a new kind of Greek sailing holiday—one where the memories you create are as important as the places you visit. Welcome aboard a journey that&apos;s truly yours.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="section-pad bg-[#f6f3ee]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-[#0a1f3c] mb-12 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VALUES.map(v => (
              <div key={v.title} className="card-modern p-8">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mb-5">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={v.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[#0a1f3c] mb-2">{v.title}</h3>
                <p className="text-slate-600 mb-0">{v.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/experiences" className="btn-primary">Explore Experiences</Link>
            <Link href="/contact" className="btn-secondary">Contact Us</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
