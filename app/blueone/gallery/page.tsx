import BoatGalleryGrid from '@/app/components/BoatGalleryGrid';
import Link from 'next/link';

export const metadata = {
  title: 'BlueOne Yacht Gallery | Luxury Sailing Photos',
  description: 'Browse our complete photo gallery of the BlueOne Fountaine Pajot Aura 51 catamaran. Exterior, interior, dining, drone aerial views and more.',
};

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 py-16">
        <div className="absolute inset-0 opacity-20" style={{backgroundImage: `url('/images/boat/DJI_20260512133237_0013_D.JPG')`, backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 to-blue-900/95"></div>

        <div className="relative max-w-6xl mx-auto px-4">
          {/* Back Link */}
          <Link
            href="/blueone"
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white transition-colors mb-8 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to BlueOne
          </Link>

          {/* Header */}
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">BlueOne Gallery</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Explore our complete collection of luxury yacht photography featuring exterior views, luxurious interiors, dining experiences, and aerial perspectives.
            </p>
          </div>
        </div>
      </div>

      {/* Gallery Component */}
      <BoatGalleryGrid
        showFeaturedSection={true}
        initialCategory="exterior"
        categories={['exterior', 'interior', 'cockpit', 'drone', 'food']}
        enableFiltering={true}
        columns={4}
      />

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Experience BlueOne?
          </h2>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
            Request a quote for your luxury sailing adventure in the Greek islands
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/booking?boat=BlueOne"
              className="btn-primary bg-white text-blue-600 hover:bg-gray-50"
            >
              Booking Request
            </a>
            <Link
              href="/blueone"
              className="btn-secondary border-white text-white hover:bg-white hover:text-blue-600"
            >
              Back to BlueOne
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
