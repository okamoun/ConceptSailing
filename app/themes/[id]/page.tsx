import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import adventures from '../../adventures-data';
import { featureIconMap } from '../../feature-icons';
import type { AdventureItineraryDay } from '../../adventures-data';
import MapLoader from './MapLoader.client';

interface ThemePageProps {
  params: Promise<{ id: string }>;
}

export default async function ThemePage({ params }: ThemePageProps) {
  const { id } = await params;
  const adventure = adventures.find((a) => a.id === id);
  if (!adventure) notFound();

  const itineraryPoints = (adventure.itinerary as AdventureItineraryDay[])
    .filter(day => day.lat !== undefined && day.lng !== undefined)
    .map(day => ({
      title: day.title,
      description: day.description,
      lat: day.lat as number,
      lng: day.lng as number,
    }));

  return (
    <main className="min-h-screen relative" style={{
      backgroundImage: `linear-gradient(rgba(30, 58, 138, 0.4), rgba(59, 130, 246, 0.5)), url('/images/boats/blueone/External_sailing.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>

      {/* Hero Banner — compact */}
      <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 py-10">
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: `url('${adventure.image}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/70 to-blue-900/95" />
        <div className="relative max-w-5xl mx-auto px-4">
          <Link href="/experiences" className="inline-flex items-center gap-1.5 text-blue-200 hover:text-white transition-colors mb-4 text-xs">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Experiences
          </Link>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
            <div className="lg:col-span-3">
              <p className="text-blue-300 uppercase tracking-widest text-xs font-semibold mb-1">BlueOne Experience</p>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{adventure.name}</h1>
              <p className="text-blue-100 text-sm leading-relaxed mb-4">{adventure.description}</p>
              {adventure.features && adventure.features.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {adventure.features.map((f, i) => (
                    <span key={i} className="bg-white/15 border border-white/25 text-white text-xs font-medium px-2.5 py-1 rounded-full">{f}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="lg:col-span-2 relative rounded-xl overflow-hidden shadow-xl border-2 border-white/20 h-44 lg:h-52">
              <Image src={adventure.image} alt={adventure.name} fill className="object-cover" priority />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* Overview */}
        <section className="bg-white/15 backdrop-blur-sm rounded-xl border border-white/25 p-6">
          <h2 className="text-xl font-bold text-white mb-3">About This Experience</h2>
          <p className="text-blue-50 leading-relaxed text-sm">{adventure.experience}</p>
        </section>

        {/* Map + Itinerary side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

          {/* Google Map */}
          {itineraryPoints.length > 0 && (
            <section className="bg-white/15 backdrop-blur-sm rounded-xl border border-white/25 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Itinerary Map</h3>
              <MapLoader points={itineraryPoints} />
            </section>
          )}

          {/* Day-by-Day Itinerary */}
          {adventure.itinerary && adventure.itinerary.length > 0 && (
            <section className="bg-white/15 backdrop-blur-sm rounded-xl border border-white/25 p-6">
              <h3 className="text-base font-bold text-white mb-3">Day-by-Day Itinerary</h3>
              <div className="space-y-2 overflow-y-auto max-h-[400px] pr-1">
                {adventure.itinerary.map((day, i) => (
                  <div key={i} className="rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 flex gap-3 items-start">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs mt-0.5">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xs font-semibold text-white mb-0.5">Day {i + 1}: {day.title}</h4>
                      <p className="text-blue-100 text-xs leading-relaxed mb-1.5">{day.description}</p>
                      {day.features && day.features.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {day.features.map((f, fi) => (
                            <span key={fi} className="inline-flex items-center gap-1 bg-white/20 border border-white/30 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                              {featureIconMap[f] && <span>{featureIconMap[f]}</span>}
                              {f}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>

        {/* Disclaimer + CTA */}
        <div className="text-center space-y-4 pb-6">
          <p className="text-xs text-blue-200 italic">
            <strong>Note:</strong> Itineraries are for inspiration only and will be tailored to your preferences and weather conditions.
          </p>
          <a
            href={`/booking?theme=${adventure.id}`}
            className="btn-primary inline-flex items-center gap-2 px-8 py-3"
          >
            Book This Experience
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>

      </div>
    </main>
  );
}
