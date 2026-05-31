import type { Metadata } from 'next';
import Image from 'next/image';

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

const values = [
  {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
    title: 'Sustainable',
    desc: 'Solar panels and eco-friendly practices for responsible travel',
  },
  {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    ),
    title: 'Family-First',
    desc: 'Designed for families to connect and create memories',
  },
  {
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    ),
    title: 'Premium',
    desc: 'Luxury amenities with professional crew service',
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen py-20 px-6" style={{ background: 'var(--ocean-deep)' }}>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex flex-col items-center mb-14 text-center animate-fade-in-up">
          <Image
            src="/images/boats/blueone/logo_blueone.png"
            alt="BlueOne Logo"
            width={120}
            height={60}
            className="mb-6 drop-shadow-lg opacity-90"
          />
          <p
            className="text-xs tracking-[0.35em] uppercase font-medium mb-4"
            style={{ color: 'var(--gold)' }}
          >
            Premium Yacht Experiences
          </p>
          <h1 className="font-display text-5xl md:text-6xl text-white font-bold mb-4">
            About BlueOne
          </h1>
          <div className="flex items-center gap-3">
            <div className="h-px w-10 opacity-40" style={{ background: 'var(--gold)' }} />
            <div className="w-1 h-1 rounded-full opacity-60" style={{ background: 'var(--gold)' }} />
            <div className="h-px w-10 opacity-40" style={{ background: 'var(--gold)' }} />
          </div>
        </div>

        {/* Story */}
        <div
          className="rounded-xl p-8 md:p-10 mb-10 animate-fade-in-up space-y-5 text-base leading-relaxed"
          style={{ background: 'var(--ocean-surface)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <p style={{ color: 'rgba(255,255,255,0.8)' }}>
            <strong className="text-white">BlueOne</strong> is redefining the way families experience sailing
            holidays in Greece. Traditionally, yacht charters have focused on the boat: its size, its luxury,
            its speed. But we believe the heart of a truly memorable holiday lies elsewhere.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.8)' }}>
            Our approach puts{' '}
            <span className="font-semibold" style={{ color: 'var(--gold)' }}>families</span> and{' '}
            <span className="font-semibold" style={{ color: 'var(--gold)' }}>experiences</span> at the center.
            We start by getting to know you — your family&apos;s passions, your dreams, your idea of the perfect getaway.
            Then, we design a journey tailored around unique activities, inspiring destinations, and the connections
            you make along the way.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.8)' }}>
            Whether you crave adventure, wellness, culture, or family bonding, our curated sailing themes ensure
            every moment is meaningful. The BlueOne catamaran is your floating home, but the real story is written
            by the people on board and the experiences you share.
          </p>
          <p style={{ color: 'rgba(255,255,255,0.8)' }}>
            Join us to discover a new kind of Greek sailing holiday — one where the memories you create are
            as important as the places you visit. Welcome aboard a journey that&apos;s truly yours.
          </p>
        </div>

        {/* Values */}
        <div className="animate-fade-in-up">
          <h2
            className="text-xs tracking-[0.35em] uppercase font-medium text-center mb-8"
            style={{ color: 'var(--gold)', fontSize: '0.7rem' }}
          >
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {values.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="text-center p-6 rounded-xl"
                style={{
                  background: 'var(--ocean-surface)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderTop: '2px solid var(--gold)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'rgba(201,169,110,0.08)', border: '1px solid var(--gold-dim)' }}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--gold)' }}>
                    {icon}
                  </svg>
                </div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.52)' }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
