'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { chefs } from '../../adventures-data';
import Image from "next/image";
import { useState, useEffect } from 'react';

interface ChefPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function ChefPage({ params }: ChefPageProps) {
  const [slug, setSlug] = useState<string>('');
  const [chef, setChef] = useState(chefs.find(c => c.id === slug));
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state for food images
  const [modalImage, setModalImage] = useState<string | null>(null);

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setSlug(resolvedParams.slug);
      const foundChef = chefs.find(c => c.id === resolvedParams.slug);
      setChef(foundChef);
      setIsLoading(false);
    };
    getParams();
  }, [params]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#101824] to-[#1f2937] py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="animate-pulse">
            <h1 className="text-4xl font-bold text-accent mb-4">Loading...</h1>
            <p className="text-gray-300">Loading chef details...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!chef) {
    notFound();
  }

  return (
    <>
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white">

      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 py-20">
        <div className="absolute inset-0 opacity-20" style={{backgroundImage: `url('${chef.image}')`, backgroundSize: 'cover', backgroundPosition: 'center top'}}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 to-blue-900/95"></div>
        <div className="relative max-w-6xl mx-auto px-4">
          <Link href="/blueone" className="inline-flex items-center gap-2 text-blue-200 hover:text-white transition-colors mb-8 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to BlueOne
          </Link>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <p className="text-blue-300 uppercase tracking-widest text-xs font-semibold mb-3">Executive Chef · BlueOne Yacht</p>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">{chef.name}</h1>
              <p className="text-xl text-white font-semibold mb-6">{chef.title}</p>
              <p className="text-white text-lg leading-relaxed mb-6">{chef.description}</p>
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 border border-white/20">
                <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-blue-100 text-sm">{chef.experience}</span>
              </div>
            </div>
            <div className="relative animate-fade-in-up flex justify-center lg:justify-end" style={{animationDelay:'0.2s'}}>
              <div className="relative">
                <Image
                  src={chef.image}
                  alt={chef.name}
                  width={380}
                  height={420}
                  className="w-72 md:w-80 h-96 object-cover rounded-2xl shadow-2xl border-4 border-white/20"
                  priority
                  draggable={false}
                />
                <div className="absolute -bottom-4 -left-4 bg-blue-600 text-white px-5 py-3 rounded-xl shadow-lg">
                  <div className="text-sm font-bold">Executive Chef</div>
                  <div className="text-xs text-blue-200">BlueOne Yacht</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-16 space-y-12">

        {/* About Section */}
        <section className="bg-white rounded-2xl shadow-md p-8 md:p-12 animate-fade-in-up">
          <h2 className="text-3xl font-bold text-blue-900 mb-2">About Chef {chef.name}</h2>
          <div className="w-12 h-1 bg-blue-500 rounded mb-8"></div>
          <div className="space-y-4">
            {chef.longDescription.split('\n\n').map((paragraph, i) => (
              <p key={i} className="text-gray-700 leading-relaxed text-lg">{paragraph}</p>
            ))}
          </div>
        </section>

        {/* Specialties Section */}
        <section className="animate-fade-in-up">
          <h2 className="text-3xl font-bold text-blue-900 mb-2">Culinary Specialties</h2>
          <div className="w-12 h-1 bg-blue-500 rounded mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chef.specialties.map((specialty, index) => (
              <div key={index} className="bg-white rounded-xl p-5 shadow-sm border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all flex items-center gap-4">
                <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">{index + 1}</span>
                </div>
                <span className="text-gray-800 font-medium">{specialty}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Food Gallery */}
        <section className="animate-fade-in-up">
          <h2 className="text-3xl font-bold text-blue-900 mb-2">Culinary Gallery</h2>
          <div className="w-12 h-1 bg-blue-500 rounded mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {chef.foodImages.map((image, index) => (
              <div key={index} className="relative group cursor-pointer rounded-xl overflow-hidden shadow-md" onClick={() => setModalImage(image)}>
                <Image
                  src={image}
                  alt={`Culinary creation ${index + 1}`}
                  width={400}
                  height={300}
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-blue-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white font-semibold text-sm bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">View</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sample Menu */}
        <section className="animate-fade-in-up">
          <h2 className="text-3xl font-bold text-blue-900 mb-2">Sample Mediterranean Menu</h2>
          <div className="w-12 h-1 bg-blue-500 rounded mb-3"></div>
          <p className="text-gray-500 mb-8">
            Chef {chef.name} creates a daily menu inspired by fresh, seasonal ingredients and modern Mediterranean cuisine.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Appetizers */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-blue-50">
              <div className="bg-blue-600 px-6 py-4 flex items-center gap-3">
                <span className="text-2xl">🫒</span>
                <h3 className="text-white font-bold text-lg tracking-wide">Appetizers</h3>
              </div>
              <div className="p-6 divide-y divide-gray-100">
                {chef.sampleMenus.appetizers.map((item, index) => (
                  <div key={index} className="py-4 first:pt-0 last:pb-0">
                    <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Courses */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-blue-50">
              <div className="bg-blue-700 px-6 py-4 flex items-center gap-3">
                <span className="text-2xl">🐟</span>
                <h3 className="text-white font-bold text-lg tracking-wide">Main Courses</h3>
              </div>
              <div className="p-6 divide-y divide-gray-100">
                {chef.sampleMenus.mainCourses.map((item, index) => (
                  <div key={index} className="py-4 first:pt-0 last:pb-0">
                    <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Desserts */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-blue-50">
              <div className="bg-blue-500 px-6 py-4 flex items-center gap-3">
                <span className="text-2xl">🍯</span>
                <h3 className="text-white font-bold text-lg tracking-wide">Desserts</h3>
              </div>
              <div className="p-6 divide-y divide-gray-100">
                {chef.sampleMenus.desserts.map((item, index) => (
                  <div key={index} className="py-4 first:pt-0 last:pb-0">
                    <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Wine Selection */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-blue-50">
              <div className="bg-blue-800 px-6 py-4 flex items-center gap-3">
                <span className="text-2xl">🍷</span>
                <h3 className="text-white font-bold text-lg tracking-wide">Wine Selection</h3>
              </div>
              <div className="p-6 divide-y divide-gray-100">
                {chef.sampleMenus.wines.map((item, index) => (
                  <div key={index} className="py-4 first:pt-0 last:pb-0">
                    <h4 className="font-semibold text-gray-900 mb-1">{item.name}</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chef's Note */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
            <p className="text-blue-800 text-sm font-semibold mb-1">Chef&apos;s Note</p>
            <p className="text-gray-600 text-sm">All menus are customized based on fresh daily catch, seasonal availability, and guest preferences. Dietary restrictions and special requests are accommodated with advance notice.</p>
          </div>
        </section>

        {/* CTA */}
        <div className="text-center pb-4">
          <a href="/booking" className="btn-primary text-lg px-10 py-4 inline-flex">
            Book Your Culinary Journey
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>

      </div>
    </main>

    {/* Image Modal */}
    {modalImage && (
      <div 
        className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
        onClick={() => setModalImage(null)}
      >
        <div className="relative max-w-4xl max-h-full">
          <button
            className="absolute -top-12 right-0 text-white text-2xl hover:text-accent transition-colors"
            onClick={() => setModalImage(null)}
          >
            × Close
          </button>
          {modalImage && (
            <Image
              src={modalImage}
              alt="Culinary creation"
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain rounded-lg"
              draggable={false}
            />
          )}
          <div className="text-center mt-4 text-white">
            <p className="text-sm">Click anywhere to close</p>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
