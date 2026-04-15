'use client';

import Image from 'next/image';
import Link from "next/link";
import { useEffect, useState } from 'react';
import { useBlueOneMode } from './contexts/BlueOneContext';
import { LocalBusinessStructuredData, TouristTripStructuredData } from './components/StructuredData';
import { getConfirmedReviews } from '../lib/reviews';
import type { Review } from '../lib/reviews';
import ReviewCard from './components/ReviewCard';

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
        url="https://blueone-yacht.com"
        telephone="+30 210 1234567"
        email="contact@nj3cruises.com"
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

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Hero Section - Modern BlueOne Experience */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/boats/blueone/External_sailing.jpg"
            alt="BlueOne Sailing Experience"
            fill
            className="object-cover"
            priority
            style={{ objectPosition: 'center' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/30 via-blue-900/50 to-blue-900/70"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="glass p-8 md:p-16 max-w-4xl mx-auto animate-fade-in-up">
            <div className="mb-8">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gradient mb-6">
                BlueOne Experiences
              </h1>
              <p className="text-xl md:text-2xl lg:text-3xl text-gray-700 font-medium mb-6">
                Luxury Sailing Adventures in Greece
              </p>
            </div>
            
            <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Discover extraordinary sailing experiences aboard the BlueOne electric catamaran. 
              From island hopping to sunset cruises, create your perfect Greek adventure with premium comfort and service and silence of electric engines.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link 
                href="/experiences" 
                className="btn-primary text-lg px-8 py-4"
              >
                Explore Experiences
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link 
                href="/blueone" 
                className="btn-secondary text-lg px-8 py-4"
              >
                Discover The Yacht
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-6">Why Choose BlueOne?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the perfect blend of luxury, comfort, and adventure aboard our premium catamaran
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-modern p-8 text-center animate-slide-in-left">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2v1a2 2 0 002 2 2.5 2.5 0 012.5 2.5v.5M21 12.5A9.5 9.5 0 1111.5 3a9.5 9.5 0 019.5 9.5z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Premium Comfort</h3>
              <p className="text-gray-600 leading-relaxed">
                Spacious cabins, modern amenities, and luxurious furnishings ensure your comfort throughout the journey
              </p>
            </div>
            
            <div className="card-modern p-8 text-center animate-fade-in-up">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Eco-Friendly</h3>
              <p className="text-gray-600 leading-relaxed">
                Solar panels, hybrid systems, and sustainable practices make your adventure environmentally responsible
              </p>
            </div>
            
            <div className="card-modern p-8 text-center animate-slide-in-right">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">All-Inclusive</h3>
              <p className="text-gray-600 leading-relaxed">
                Professional crew, gourmet meals, water toys, and equipment included for a complete luxury experience
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Guest Reviews Preview */}
      {topReviews.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 relative overflow-hidden">
          <div className="absolute inset-0 opacity-15" style={{ backgroundImage: `url('/images/boats/blueone/External_sailing.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div className="relative max-w-5xl mx-auto px-4">
            <div className="text-center mb-8">
              <p className="text-blue-300 uppercase tracking-widest text-xs font-semibold mb-2">Testimonials</p>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">What Our Guests Say</h2>
              <p className="text-blue-200 text-sm">Real experiences from real sailors</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              {topReviews.map(r => (
                <ReviewCard key={r.id} review={r} compact />
              ))}
            </div>
            <div className="text-center">
              <Link href="/reviews" className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm font-medium transition-colors border border-white/25 px-5 py-2.5 rounded-xl hover:bg-white/10">
                See All Reviews
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready for Your BlueOne Adventure?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Book your luxury sailing experience today and create memories that will last a lifetime
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/booking" className="btn-primary bg-white text-blue-600 hover:bg-gray-50">
              Booking Request
            </Link>
            <Link href="/contact" className="btn-secondary border-white text-white hover:bg-white hover:text-blue-600">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
