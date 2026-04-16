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

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-16">
      <div className="max-w-3xl mx-auto px-4">
        <div className="glass p-10 shadow-xl border border-blue-200 animate-fade-in-up">
          <div className="flex flex-col items-center mb-8">
            <Image
              src="/images/boats/blueone/logo_blueone.png"
              alt="BlueOne Logo"
              width={140}
              height={70}
              className="mb-4 drop-shadow-lg"
            />
            <span className="text-blue-600 font-semibold mb-2">Premium Yacht Experiences</span>
            <h1 className="text-4xl font-extrabold text-blue-900 mb-2 text-center">About BlueOne</h1>
          </div>
          <section className="text-lg text-gray-700 space-y-6 leading-relaxed">
            <p>
              <strong className="text-blue-900">BlueOne</strong> is redefining the way families experience sailing holidays in Greece. Traditionally, yacht charters have focused on the boat: its size, its luxury, its speed. But we believe the heart of a truly memorable holiday lies elsewhere.
            </p>
            <p>
              Our approach puts <span className="text-blue-600 font-bold">families</span> and <span className="text-blue-600 font-bold">experiences</span> at the center. We start by getting to know you—your family&apos;s passions, your dreams, your idea of the perfect getaway. Then, we design a journey tailored around unique activities, inspiring destinations, and the connections you make along the way.
            </p>
            <p>
              Whether you crave adventure, wellness, culture, or family bonding, our curated sailing themes ensure every moment is meaningful. The BlueOne catamaran is your floating home, but the real story is written by the people on board and the experiences you share.
            </p>
            <p>
              Join us to discover a new kind of Greek sailing holiday—one where the memories you create are as important as the places you visit. Welcome aboard a journey that&apos;s truly yours.
            </p>
          </section>

          {/* Values Section */}
          <div className="mt-12 pt-8 border-t border-blue-200">
            <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-blue-900 mb-2">Sustainable</h3>
                <p className="text-sm text-gray-600">Solar panels and eco-friendly practices for responsible travel</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-blue-900 mb-2">Family-First</h3>
                <p className="text-sm text-gray-600">Designed for families to connect and create memories</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <h3 className="font-bold text-blue-900 mb-2">Premium</h3>
                <p className="text-sm text-gray-600">Luxury amenities with professional crew service</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
