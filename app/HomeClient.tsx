'use client';

import Image from 'next/image';
import Link from "next/link";
import { useEffect, useState } from 'react';
import { useBlueOneMode } from './contexts/BlueOneContext';
import { LocalBusinessStructuredData, TouristTripStructuredData } from './components/StructuredData';
import { getConfirmedReviews } from '../lib/reviews';
import type { Review } from '../lib/reviews';
import ReviewCard from './components/ReviewCard';
import VideoEmbed from './components/VideoEmbed';
import { CONTACT } from './config/contact';

const ArrowRight = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
  </svg>
);

const HIGHLIGHTS = [
  { value: '51 ft', label: 'Fountaine Pajot catamaran' },
  { value: 'Up to 10', label: 'guests on board' },
  { value: 'Hybrid', label: 'solar & electric silence' },
  { value: 'Best Chef', label: "EMMY's Charter Show 2026" },
];

const FEATURES = [
  {
    title: 'Premium Comfort',
    body: 'Spacious cabins, modern amenities, and luxurious furnishings ensure your comfort throughout the journey',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  },
  {
    title: 'Eco-Friendly',
    body: 'Solar panels, hybrid systems, and sustainable practices make your adventure environmentally responsible',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
  },
  {
    title: 'All-Inclusive',
    body: 'Professional crew, gourmet meals, water toys, and equipment included for a complete luxury experience',
    icon: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7',
  },
];

export default function HomeClient() {
  const { resetTheme } = useBlueOneMode();
  const [topReviews, setTopReviews] = useState<Review[]>([]);

  useEffect(() => {
    // Reset theme when entering through main entry point
    resetTheme();
  }, [resetTheme]);

  useEffect(() => {
    getConfirmedReviews()
      .then(reviews => setTopReviews(reviews.slice(0, 3)))
      .catch(() => {});
  }, []);

  return (
    <>
      <LocalBusinessStructuredData
        name="BlueOne Luxury Yacht Charters"
        description="Experience luxury sailing adventures in Greece aboard the BlueOne catamaran. Premium yacht charters with island hopping, sunset cruises, and all-inclusive experiences."
        url="https://www.blueoneyacht.com"
        telephone={CONTACT.phone.display}
        email={CONTACT.email}
        address={{
          streetAddress: "Alimos Marina",
          addressLocality: "Athens",
          addressRegion: "Attica",
          postalCode: "17455",
          addressCountry: "Greece",
        }}
        image="/images/boats/blueone/External_sailing.jpg"
        priceRange="$$$"
      />

      <TouristTripStructuredData
        name="Greek Islands Sailing Adventure"
        description="Luxury sailing experience aboard BlueOne catamaran exploring the beautiful Greek islands with premium amenities and professional crew."
        provider="BlueOne Luxury Yacht Charters"
        location="Greek Islands, Greece"
        duration="7 days"
        image="/images/boats/blueone/External_sailing.jpg"
      />

      <div className="bg-white">
        {/* ── Hero ── */}
        <section className="relative min-h-[88svh] flex items-end overflow-hidden bg-[#0a1f3c]">
          <Image
            src="/images/boats/blueone/External_sailing.jpg"
            alt="BlueOne catamaran sailing in turquoise Greek waters"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#06142a]/95 via-[#06142a]/45 to-[#06142a]/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#06142a]/60 to-transparent" />

          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 pb-14 md:pb-20 pt-32">
            <div className="max-w-2xl animate-fade-in-up">
              <p className="eyebrow text-sky-300 mb-4">Luxury Sailing Adventures in Greece</p>
              <h1 className="text-white text-5xl sm:text-6xl lg:text-7xl mb-6">BlueOne Experiences</h1>
              <p className="text-lg md:text-xl text-white/85 leading-relaxed mb-10 max-w-xl">
                Discover extraordinary sailing experiences aboard the BlueOne electric catamaran.
                From island hopping to sunset cruises, create your perfect Greek adventure with premium comfort,
                attentive service and the silence of electric engines.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link href="/experiences" className="btn-primary text-base px-7 py-4">
                  Explore Experiences
                  <ArrowRight />
                </Link>
                <Link href="/blueone" className="btn-ghost-light text-base px-7 py-4">
                  Discover The Yacht
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Highlights strip ── */}
        <section aria-label="Yacht highlights" className="border-b border-slate-200 bg-white">
          <dl className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 lg:grid-cols-4">
            {HIGHLIGHTS.map((h, i) => (
              <div
                key={h.label}
                className={`py-7 px-2 sm:px-6 text-center lg:text-left ${i % 2 === 1 ? 'border-l border-slate-200' : ''} ${i >= 2 ? 'border-t lg:border-t-0 border-slate-200' : ''} ${i === 2 ? 'lg:border-l' : ''}`}
              >
                <dt className="sr-only">{h.label}</dt>
                <dd className="font-[family-name:var(--font-display)] text-2xl md:text-3xl text-[#0a1f3c]">{h.value}</dd>
                <dd className="text-sm text-slate-500 mt-1">{h.label}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ── Why BlueOne ── */}
        <section className="section-pad bg-[#f6f3ee]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mb-14">
              <p className="eyebrow mb-3">The BlueOne difference</p>
              <h2 className="text-[#0a1f3c] mb-5">Why Choose BlueOne?</h2>
              <p className="text-lg text-slate-600">
                Experience the perfect blend of luxury, comfort, and adventure aboard our premium catamaran
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {FEATURES.map(f => (
                <div key={f.title} className="card-modern p-8">
                  <div className="w-12 h-12 mb-6 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d={f.icon} />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-[#0a1f3c] mb-3">{f.title}</h3>
                  <p className="text-slate-600 leading-relaxed mb-0">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Video ── */}
        <section className="section-pad bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="text-center md:text-left">
              <p className="eyebrow mb-3">On the water</p>
              <h2 className="text-[#0a1f3c] mb-5">See BlueOne in Action</h2>
              <p className="text-lg text-slate-600 mb-8">
                Watch the BlueOne catamaran sailing the crystal-clear waters of the Greek islands — quiet,
                spacious and built for long days at anchor.
              </p>
              <Link href="/blueone" className="btn-secondary">
                Tour the yacht
                <ArrowRight />
              </Link>
            </div>
            <div className="w-full max-w-[340px] mx-auto">
              <VideoEmbed title="" description="" />
            </div>
          </div>
        </section>

        {/* ── Guest Reviews Preview ── */}
        {topReviews.length > 0 && (
          <section className="section-pad bg-[#0a1f3c] relative overflow-hidden">
            <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-12">
                <p className="eyebrow text-sky-300 mb-3">Testimonials</p>
                <h2 className="text-white mb-3">What Our Guests Say</h2>
                <p className="text-white/70">Real experiences from real sailors</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                {topReviews.map(r => (
                  <ReviewCard key={r.id} review={r} compact />
                ))}
              </div>
              <div className="text-center">
                <Link href="/reviews" className="btn-ghost-light">
                  See All Reviews
                  <ArrowRight />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── Call to Action ── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#0052a3] via-[#0066cc] to-[#0a1f3c]">
          <div className="section-pad max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-white mb-5">Ready for Your BlueOne Adventure?</h2>
            <p className="text-lg md:text-xl text-white/85 mb-10 max-w-2xl mx-auto">
              Request a quote for your luxury sailing experience and create memories that will last a lifetime
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link href="/booking" className="btn-primary bg-white text-[#0a1f3c] hover:bg-sky-50">
                Request a Quote
              </Link>
              <Link href="/contact" className="btn-ghost-light">
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
