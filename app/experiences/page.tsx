import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import ThemeSections from './ThemeSections';
import PageHero from '../components/PageHero';

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
    <div className="bg-white">
      <PageHero
        size="lg"
        eyebrow="Curated themed experiences across the Greek islands"
        title="Greek Sailing Adventures"
        imageAlt="BlueOne sailing past Greek islands"
        subtitle={
          <p className="mb-0">
            From culinary journeys to wellness retreats, discover the perfect sailing adventure tailored to your interests.
            Each theme offers unique experiences crafted by local experts.
          </p>
        }
      >
        <a href="#themes" className="btn-primary">
          Browse Themes
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </a>
        <Link href="/destinations" className="btn-ghost-light">
          View Destinations
        </Link>
      </PageHero>

      {/* Adventure Categories — client component reads Firestore in the browser */}
      <ThemeSections />

      {/* Destinations Preview */}
      <section className="section-pad bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 overflow-hidden rounded-3xl border border-slate-200 bg-[#f6f3ee]">
            <div className="relative min-h-[260px]">
              <Image
                src="/images/boat/DJI_20260512133237_0013_D.JPG"
                alt="Aerial view of BlueOne anchored in a Greek bay"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <p className="eyebrow mb-3">Where we sail</p>
              <h2 className="text-[#0a1f3c] mb-4">Discover Greek Destinations</h2>
              <p className="text-lg text-slate-600 mb-8">
                From hidden coves to vibrant harbors, each Greek island offers unique beauty and authentic experiences
              </p>
              <div>
                <Link href="/destinations" className="btn-primary">
                  Explore All Destinations
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Yacht CTA */}
      <section className="bg-[#0a1f3c]">
        <div className="section-pad max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-white mb-5">Prefer a Luxury Yacht Experience?</h2>
          <p className="text-lg md:text-xl text-white/75 mb-10 max-w-2xl mx-auto">
            Discover our flagship BlueOne catamaran - the ultimate in luxury sailing
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/blueone" className="btn-primary bg-white text-[#0a1f3c] hover:bg-sky-50">
              Explore BlueOne Yacht
            </Link>
            <Link href="/booking" className="btn-ghost-light">
              Request a Quote
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
