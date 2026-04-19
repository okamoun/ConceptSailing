import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Charter Rates & Pricing | BlueOne Luxury Yacht',
  description: 'BlueOne luxury catamaran charter rates for Summer 2026. Weekly rates from €18,000 to €24,000 plus expenses. All-inclusive experience packages also available.',
};

export default function RatesPage() {
  return (
    <main
      className="min-h-screen relative py-16"
      style={{
        backgroundImage: `linear-gradient(rgba(30, 58, 138, 0.5), rgba(59, 130, 246, 0.6)), url('/images/boats/blueone/External_sailing.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="max-w-5xl mx-auto px-4 space-y-12">

        {/* Back link + Header */}
        <div>
          <Link href="/blueone" className="inline-flex items-center gap-1.5 text-blue-200 hover:text-white transition-colors mb-6 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to The Yacht
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Charter Rates</h1>
          <p className="text-blue-200 text-lg">Summer 2026 weekly rates — all-inclusive of professional crew</p>
        </div>

        {/* Season Rate Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { season: 'High Season', months: 'July & August', rate: '€24,000' },
            { season: 'Mid Season', months: 'June & September', rate: '€21,000' },
            { season: 'Low Season', months: 'All other months', rate: '€18,000' },
          ].map((item) => (
            <div key={item.season} className="rounded-2xl border p-8 text-center bg-blue-600/50 border-blue-300/60 shadow-xl shadow-blue-900/40">
              <p className="text-blue-200 text-sm font-semibold uppercase tracking-widest mb-1">{item.season}</p>
              <p className="text-blue-100 text-sm font-medium mb-4">{item.months}</p>
              <p className="text-5xl font-bold text-white mb-1">{item.rate}</p>
              <p className="text-blue-200 text-sm">per week</p>
            </div>
          ))}
        </div>

        {/* Expenses note */}
        <div className="bg-white/10 border border-white/20 rounded-xl p-6 text-center">
          <p className="text-white font-semibold mb-1">All rates are Plus Expenses (MYBA terms)</p>
          <p className="text-blue-200 text-sm">VAT 13% &amp; APA 25% apply on top of the base rate</p>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Relocation Fees */}
          <div className="bg-white/15 border border-white/25 rounded-xl p-6">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <span>🧭</span> Relocation Fees
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-blue-100">
                <span>Cyclades : </span>
                <span className="font-semibold text-white">€1,000</span>
              </div>
              <div className="flex justify-between text-blue-100">
                <span>Sporades : </span>
                <span className="font-semibold text-white">€1,000</span>
              </div>
              <div className="flex justify-between text-blue-100">
                <span>Ionian : </span>
                <span className="font-semibold text-white">€1,000</span>
              </div>
          
              <p className="text-blue-300 text-xs pt-2">
                * Charters with embarkation/disembarkation in Santorini will be charged one extra day due to logistics.
              </p>
            </div>
          </div>

          {/* Base Port & Operating Area */}
          <div className="bg-white/15 border border-white/25 rounded-xl p-6">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <span>📍</span> Base Port &amp; Area
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-blue-300 text-xs uppercase tracking-wide mb-0.5">Summer Base Port</p>
                <p className="text-white">Nea Peramos, Athens, Greece</p>
              </div>
              <div>
                <p className="text-blue-300 text-xs uppercase tracking-wide mb-0.5">Winter Base Port</p>
                <p className="text-white">Nea Peramos, Athens, Greece</p>
              </div>
              <div>
                <p className="text-blue-300 text-xs uppercase tracking-wide mb-0.5">Operating Area</p>
                <p className="text-white">Greece (Summer &amp; Winter)</p>
              </div>
            </div>
          </div>
        </div>

        {/* VAT disclaimer */}
        <p className="text-blue-300 text-xs text-center leading-relaxed max-w-3xl mx-auto">
          VAT rate is determined by applicable tax legislation and may be subject to change without prior notice. Should any changes in applicable tax legislation occur after the issuance of a charter agreement, the difference will be credited or debited accordingly to the Charterer.
        </p>

        {/* Experience Package */}
        <div className="bg-gradient-to-br from-blue-700/50 to-blue-900/60 border border-blue-400/40 rounded-2xl p-8 md:p-10">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-500/40 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <div>
              <span className="inline-block bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full mb-2 uppercase tracking-wide">All-Inclusive Option</span>
              <h2 className="text-2xl font-bold text-white">Curated Experience Packages</h2>
            </div>
          </div>

          <p className="text-blue-100 leading-relaxed mb-8 text-base">
            Beyond a standard crewed boat charter, we offer <strong className="text-white">fully tailored experience packages</strong> — a single all-inclusive price that covers the yacht, crew, a custom itinerary, hand-picked activities, and premium on-board services. You simply arrive and enjoy.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {[
              {
                icon: '🗺️',
                title: 'Custom Itinerary',
                desc: 'A day-by-day route designed around your interests — hidden coves, iconic landmarks, lively harbors, or a mix of all three.',
              },
              {
                icon: '🏄',
                title: 'Curated Activities',
                desc: "Snorkeling, Seabob sessions, SUP yoga, cooking classes, cultural excursions — each activity selected to match your group's style.",
              },
              {
                icon: '🍽️',
                title: 'Full Board & Beverages',
                desc: 'Gourmet breakfasts, lunches, and dinners prepared by Chef Andreas, with curated wines and drinks included throughout.',
              },
            ].map((item) => (
              <div key={item.title} className="bg-white/10 border border-white/20 rounded-xl p-5">
                <span className="text-2xl mb-3 block">{item.icon}</span>
                <h4 className="text-white font-bold mb-2">{item.title}</h4>
                <p className="text-blue-200 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-blue-200 text-sm leading-relaxed mb-6">
            Experience packages are available across all our themed adventures — from <strong className="text-white">Greek Heritage Explorer</strong> and <strong className="text-white">Culinary Traditions</strong> to <strong className="text-white">Yoga &amp; Wellness Retreats</strong> and <strong className="text-white">Island Nightlife</strong>. Pricing is provided on request and depends on the duration, destination, and activities chosen.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/experiences" className="btn-primary text-sm px-6 py-3 inline-flex items-center gap-2">
              Browse Experiences
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link href="/booking?boat=BlueOne" className="btn-secondary border-white/40 text-white hover:bg-white/10 text-sm px-6 py-3 inline-flex items-center gap-2">
              Request a Custom Package
            </Link>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pb-6">
          <Link
            href={`/booking?boat=BlueOne`}
            className="btn-primary text-lg px-10 py-4 inline-flex items-center gap-2"
          >
            Request a Booking
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

      </div>
    </main>
  );
}
