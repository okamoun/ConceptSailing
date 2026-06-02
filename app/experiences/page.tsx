import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import ThemeSections from './ThemeSections';

export const metadata: Metadata = {
  title: 'Greek Sailing Adventures | Themed Yacht Experiences',
  description: 'Discover curated themed sailing adventures in Greece. From culinary journeys to wellness retreats, find the perfect Greek island experience tailored to your interests.',
  keywords: ['Greek sailing adventures', 'themed yacht experiences', 'Greek islands tours', 'sailing holidays Greece', 'cultural sailing trips', 'wellness retreats Greece'],
  openGraph: {
    title: 'Greek Sailing Adventures | Themed Yacht Experiences',
    description: 'Discover curated themed sailing adventures in Greece. From culinary journeys to wellness retreats, find the perfect Greek island experience.',
    type: 'website',
    url: 'https://www.blueoneyacht.com/experiences',
    images: [
      {
        url: '/images/boats/blueone/External_sailing.jpg',
        width: 1200,
        height: 630,
        alt: 'Greek Sailing Adventures - Luxury Yacht Experiences',
      },
    ],
  },
};

export default function ExperiencesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/boats/blueone/External_sailing.jpg"
            alt="Greek Sailing Adventures"
            fill
            className="object-cover"
            priority
            style={{ objectPosition: 'center' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/30 via-blue-900/50 to-blue-900/70"></div>
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="glass p-8 md:p-16 max-w-4xl mx-auto animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gradient mb-6">
              Greek Sailing Adventures
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-gray-700 font-medium mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Curated themed experiences across the Greek islands
            </p>
            <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              From culinary journeys to wellness retreats, discover the perfect sailing adventure tailored to your interests.
              Each theme offers unique experiences crafted by local experts.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Link href="/destinations" className="btn-primary text-lg px-8 py-4">
                View Destinations
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Adventure Categories — client component reads Firestore in the browser */}
      <ThemeSections />

      {/* Destinations Preview */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-6">Discover Greek Destinations</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From hidden coves to vibrant harbors, each Greek island offers unique beauty and authentic experiences
            </p>
          </div>
          <div className="text-center">
            <Link href="/destinations" className="btn-primary text-lg px-8 py-4">
              Explore All Destinations
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Alternative Entry Point */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="glass p-8 md:p-16 max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Prefer a Luxury Yacht Experience?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Discover our flagship BlueOne catamaran - the ultimate in luxury sailing
            </p>
            <Link href="/" className="btn-primary bg-white text-blue-600 hover:bg-gray-50">
              Explore BlueOne Yacht
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
