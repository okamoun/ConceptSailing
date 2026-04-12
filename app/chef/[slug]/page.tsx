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
    <main className="min-h-screen bg-gradient-to-br from-[#101824] to-[#1f2937] py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <Link href="/boats/blueone" className="text-accent hover:text-accent/80 transition-colors inline-flex items-center gap-2">
            <span>Back to BlueOne</span>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="glass p-8 shadow-xl animate-fade-in-up mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-black text-accent drop-shadow-lg mb-4">{chef.name}</h1>
              <h2 className="text-2xl font-semibold text-white mb-6">{chef.title}</h2>
              <p className="text-lg text-gray-100 leading-relaxed mb-6">{chef.description}</p>
              <div className="bg-accent/10 rounded-lg p-4 border border-accent/30">
                <p className="text-gray-200 text-sm">
                  <strong>Experience:</strong> {chef.experience}
                </p>
              </div>
            </div>
            
            <div className="relative">
              <Image 
                src={chef.image} 
                alt={chef.name} 
                width={500} 
                height={500} 
                className="w-full h-96 object-cover rounded-xl border-4 border-accent shadow-lg bg-[#222]" 
                priority 
                draggable={false} 
              />
              <div className="absolute -bottom-4 -right-4 bg-accent text-white px-6 py-3 rounded-lg shadow-lg">
                <div className="text-sm font-semibold">Executive Chef</div>
                <div className="text-xs opacity-90">BlueOne Yacht</div>
              </div>
            </div>
          </div>
        </div>

        {/* Long Description Section */}
        <section className="glass p-8 shadow-xl animate-fade-in-up mb-8">
          <h2 className="text-4xl font-bold text-accent mb-6">About Chef {chef.name}</h2>
          <p className="text-gray-100 leading-relaxed text-lg">{chef.longDescription}</p>
        </section>

        {/* Specialties Section */}
        <section className="glass p-8 shadow-xl animate-fade-in-up mb-8">
          <h2 className="text-4xl font-bold text-accent mb-6">Culinary Specialties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chef.specialties.map((specialty, index) => (
              <div key={index} className="bg-[#1f2937] p-4 rounded-lg border border-accent/30 hover:border-accent/50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{index + 1}</span>
                  </div>
                  <h3 className="text-white font-semibold">{specialty}</h3>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Food Gallery Section */}
        <section className="glass p-8 shadow-xl animate-fade-in-up mb-8">
          <h2 className="text-4xl font-bold text-accent mb-6">Culinary Gallery</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chef.foodImages.map((image, index) => (
              <div 
                key={index}
                className="relative group cursor-pointer"
                onClick={() => setModalImage(image)}
              >
                <Image
                  src={image}
                  alt={`Culinary creation ${index + 1}`}
                  width={400}
                  height={300}
                  className="w-full h-64 object-cover rounded-lg border-2 border-accent/50 group-hover:scale-105 transition-transform"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-lg font-semibold">Click to view</div>
                    <div className="text-sm">Culinary creation {index + 1}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sample Menu Section */}
        <section className="glass p-8 shadow-xl animate-fade-in-up mb-8">
          <h2 className="text-4xl font-bold text-accent mb-8 text-center">Sample Mediterranean Menu</h2>
          <p className="text-center text-gray-300 mb-8 max-w-3xl mx-auto">
            Chef {chef.name} creates a daily menu inspired by fresh, seasonal ingredients and modern Mediterranean cuisine. Below is a sample of what you might experience during your BlueOne journey.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Appetizers */}
            <div className="bg-[#1f2937] p-6 rounded-lg border border-accent/30">
              <h3 className="text-2xl font-semibold text-accent mb-6 text-center">Appetizers</h3>
              <div className="space-y-4">
                {chef.sampleMenus.appetizers.map((item, index) => (
                  <div key={index} className="border-b border-accent/20 pb-3 last:border-b-0">
                    <h4 className="font-semibold text-white mb-1">{item.name}</h4>
                    <p className="text-gray-300 text-sm">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Courses */}
            <div className="bg-[#1f2937] p-6 rounded-lg border border-accent/30">
              <h3 className="text-2xl font-semibold text-accent mb-6 text-center">Main Courses</h3>
              <div className="space-y-4">
                {chef.sampleMenus.mainCourses.map((item, index) => (
                  <div key={index} className="border-b border-accent/20 pb-3 last:border-b-0">
                    <h4 className="font-semibold text-white mb-1">{item.name}</h4>
                    <p className="text-gray-300 text-sm">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Desserts */}
            <div className="bg-[#1f2937] p-6 rounded-lg border border-accent/30">
              <h3 className="text-2xl font-semibold text-accent mb-6 text-center">Desserts</h3>
              <div className="space-y-4">
                {chef.sampleMenus.desserts.map((item, index) => (
                  <div key={index} className="border-b border-accent/20 pb-3 last:border-b-0">
                    <h4 className="font-semibold text-white mb-1">{item.name}</h4>
                    <p className="text-gray-300 text-sm">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Wine Selection */}
            <div className="bg-[#1f2937] p-6 rounded-lg border border-accent/30">
              <h3 className="text-2xl font-semibold text-accent mb-6 text-center">Wine Selection</h3>
              <div className="space-y-4">
                {chef.sampleMenus.wines.map((item, index) => (
                  <div key={index} className="border-b border-accent/20 pb-3 last:border-b-0">
                    <h4 className="font-semibold text-white mb-1">{item.name}</h4>
                    <p className="text-gray-300 text-sm">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-accent/10 rounded-lg border border-accent/30 text-center">
            <p className="text-gray-200 mb-2">
              <strong>Chef&apos;s Note:</strong> All menus are customized based on fresh daily catch, seasonal availability, and guest preferences.
            </p>
            <p className="text-gray-300 text-sm">
              Dietary restrictions and special requests are accommodated with advance notice.
            </p>
          </div>
        </section>

        {/* Booking CTA */}
        <div className="text-center mt-12">
          <a 
            href="/booking"
            className="inline-block bg-accent text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-accent/90 transition-colors shadow-lg"
          >
            Book Your Culinary Journey
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
