'use client';

import Image from 'next/image';
import Link from "next/link";
import { useEffect, useState } from 'react';
import { useBlueOneMode } from './contexts/BlueOneContext';
import { LocalBusinessStructuredData, TouristTripStructuredData } from './components/StructuredData';
import { getConfirmedReviews } from '../lib/reviews';
import type { Review } from '../lib/reviews';
import ReviewCard from './components/ReviewCard';
import { CONTACT } from './config/contact';

function GoldDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <div className="h-px w-10 opacity-50" style={{ background: 'var(--gold)' }} />
      <div className="w-1 h-1 rounded-full opacity-70" style={{ background: 'var(--gold)' }} />
      <div className="h-px w-10 opacity-50" style={{ background: 'var(--gold)' }} />
    </div>
  );
}

export default function HomeClient() {
  const { resetTheme } = useBlueOneMode();
  const [topReviews, setTopReviews] = useState<Review[]>([]);

  useEffect(() => {
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
        telephone="+30 210 1234567"
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

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <Image
          src="/images/boats/blueone/External_sailing.jpg"
          alt="BlueOne Sailing Experience"
          fill
          className="object-cover scale-105"
          priority
          style={{ objectPosition: 'center 40%' }}
        />
        {/* Gradient overlay — more image visible at top, deeper at bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/75" />
        {/* Subtle vignette on sides */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto animate-fade-in-up">
          {/* Eyebrow */}
          <p
            className="text-xs tracking-[0.4em] uppercase font-medium mb-7"
            style={{ color: 'var(--gold)' }}
          >
            Luxury Sailing · Greek Islands
          </p>

          {/* Display heading — single h1 preserves accessible name "BlueOne Experiences" */}
          <h1 className="font-display font-bold text-white leading-none mb-8">
            <span className="block text-6xl md:text-8xl lg:text-9xl">BlueOne</span>
            <span
              className="block text-3xl md:text-5xl lg:text-6xl font-normal tracking-wide mt-2"
              style={{ color: 'var(--gold-light)' }}
            >
              Experiences
            </span>
          </h1>

          <GoldDivider className="mb-8" />

          <p
            className="text-lg md:text-xl font-light mb-12 max-w-xl mx-auto leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.78)' }}
          >
            Sail the Aegean aboard our Fountaine Pajot Aura 51 catamaran.
            Curated adventures, exceptional crew, electric engines in complete silence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/experiences" className="btn-primary text-sm px-8 py-4">
              Explore Experiences
            </Link>
            <Link href="/blueone" className="btn-secondary text-sm px-8 py-4">
              Discover The Yacht
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── Why BlueOne ── */}
      <section className="py-32 px-6" style={{ background: 'var(--ocean-mid)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p
              className="text-xs tracking-[0.35em] uppercase font-medium mb-4"
              style={{ color: 'var(--gold)' }}
            >
              The BlueOne Difference
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-white mb-5">
              Why Choose BlueOne?
            </h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>
              The perfect blend of luxury, silence, and adventure — tailored around you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2v1a2 2 0 002 2 2.5 2.5 0 012.5 2.5v.5M21 12.5A9.5 9.5 0 1111.5 3a9.5 9.5 0 019.5 9.5z" />
                ),
                title: 'Premium Comfort',
                desc: 'Spacious cabins, luxurious furnishings, and a professional crew dedicated to your every need.',
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                ),
                title: 'Silent Electric',
                desc: 'Solar-powered hybrid engines deliver the Greek islands in complete silence — a truly immersive experience.',
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                ),
                title: 'All-Inclusive',
                desc: 'Professional crew, gourmet meals, water toys, and curated adventures — everything included.',
              },
            ].map(({ icon, title, desc }, i) => (
              <div key={i} className="card-dark p-8 text-center">
                <div
                  className="w-14 h-14 mx-auto mb-6 rounded-full flex items-center justify-center"
                  style={{ border: '1px solid var(--gold-dim)', background: 'rgba(201,169,110,0.06)' }}
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--gold)' }}>
                    {icon}
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.58)' }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="py-14 px-6" style={{ background: 'var(--ocean-surface)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '51 ft', label: 'Catamaran' },
            { value: '8', label: 'Guests Max' },
            { value: '100%', label: 'Electric Ready' },
            { value: 'All-in', label: 'Inclusive' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="font-display text-3xl md:text-4xl font-bold mb-1" style={{ color: 'var(--gold)' }}>
                {value}
              </p>
              <p className="text-xs tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Guest Reviews ── */}
      {topReviews.length > 0 && (
        <section className="py-28 px-6 relative overflow-hidden" style={{ background: 'var(--ocean-deep)' }}>
          {/* Subtle background texture */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `url('/images/boats/blueone/External_sailing.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="relative max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p
                className="text-xs tracking-[0.35em] uppercase font-medium mb-4"
                style={{ color: 'var(--gold)' }}
              >
                Testimonials
              </p>
              <h2 className="font-display text-4xl md:text-5xl text-white mb-3">
                What Our Guests Say
              </h2>
              <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Real experiences from real sailors
              </p>
              <GoldDivider />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
              {topReviews.map(r => (
                <ReviewCard key={r.id} review={r} compact />
              ))}
            </div>

            <div className="text-center">
              <Link
                href="/reviews"
                className="inline-flex items-center gap-2 text-sm font-medium transition-all"
                style={{ color: 'var(--gold)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold-light)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--gold)')}
              >
                See All Reviews
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Call to Action ── */}
      <section className="relative py-32 px-6 overflow-hidden" style={{ background: 'var(--ocean-mid)' }}>
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(ellipse at center, rgba(201,169,110,0.12) 0%, transparent 65%)',
          }}
        />
        <div className="relative max-w-2xl mx-auto text-center">
          <p
            className="text-xs tracking-[0.35em] uppercase font-medium mb-5"
            style={{ color: 'var(--gold)' }}
          >
            Begin Your Journey
          </p>
          <h2 className="font-display text-4xl md:text-5xl text-white mb-6 leading-tight">
            Ready for Your BlueOne Adventure?
          </h2>
          <GoldDivider className="mb-8" />
          <p className="text-lg mb-12 leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Request a quote and we&apos;ll craft a sailing experience perfectly suited to you and your guests.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/booking" className="btn-primary px-10 py-4">
              Booking Request
            </Link>
            <Link href="/contact" className="btn-secondary px-10 py-4">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
