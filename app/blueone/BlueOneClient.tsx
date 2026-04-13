'use client';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useBlueOneMode } from '../contexts/BlueOneContext';
import BlueOneGallerySlideshow from '../components/BlueOneGallerySlideshow';
import { boats } from '../boats-data';

export default function BlueOneClient() {
  const [boat, setBoat] = useState<typeof boats[0] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const { setIsBlueOneMode } = useBlueOneMode();

  useEffect(() => {
    // Find the BlueOne boat
    const blueOneBoat = boats.find((b) => b.name === "BlueOne");
    if (blueOneBoat) {
      setBoat(blueOneBoat);
    }
    setIsLoading(false);
    
    // Activate BlueOne mode (will persist across navigation)
    setIsBlueOneMode(true);
  }, [setIsBlueOneMode]);

  // BlueOne specific images from the blueone folder - organized by content
  const blueOneExteriorImages = [
    "/images/boats/blueone/IMG_7667.jpeg", // Main exterior shot
    "/images/boats/blueone/External_reading.jpg", // Exterior reading area
    "/images/boats/blueone/External_sailing.jpg", // Sailing exterior view
    "/images/boats/blueone/IMG_8914.jpeg", // Exterior view
    "/images/boats/blueone/IMG_8917.jpeg", // Another exterior view
    "/images/boats/blueone/277080815_7549724425052761_8631137394407809070_n.jpeg", // Exterior photo
  ];

  const blueOneInteriorImages = [
    "/images/boats/blueone/Interior_table.jpg", // Interior dining table area
    "/images/boats/blueone/kitchen.jpg", // Kitchen/galley area
    "/images/boats/blueone/Actu-3-Aura51-Maestro-Bed.jpg.avif", // Master bedroom
    "/images/boats/blueone/Actu-4-Aura51-Cabine-Bed.jpg.avif", // Cabin bedroom
  ];

  const blueOneCockpitImages = [
    "/images/boats/blueone/Actu-2-Aura51-Cockpit-Table.avif", // Cockpit dining table
    "/images/boats/blueone/Actu-8-Aura51-Front-Cockpit.avif", // Front cockpit seating
    "/images/boats/blueone/IMG_8677.jpeg", // Cockpit or deck area
  ];

  const blueOneFoodImages = [
    "/images/boats/blueone/food_1.jpeg", 
    "/images/boats/blueone/food_2.jpeg", 
    "/images/boats/blueone/Actu-2-Aura51-Cockpit-Table.avif", // Cockpit dining table
  ];

  const blueOneChefImages = [
    "/images/boats/blueone/profile_andrea_chef.jpg", // Chef Andreas Tsitsilianis
  ];

  const blueOneCaptainImages = [
    "/images/boats/blueone/Cap_alif.jpg", // Captain Alif
  ];

  const blueOneActivityImages = [
    "/images/boats/blueone/Seabob_1.jpeg", // Seabob water toy
    "/images/boats/blueone/seabob-f5s-pic-1-1.jpg", // Additional Seabob/water toy image
    "/images/boats/blueone/snorkeling.png", // Snorkeling activity
    "/images/boats/blueone/SUP_Relax.png", // SUP relaxation
    "/images/boats/blueone/SUP_Yoga.png", // SUP yoga activity
  ];

  const blueOneFloorplanImages = [
    "/images/boats/blueone/floorplan.jpg", // Floor plan image
  ];

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">
            <h1 className="text-4xl font-bold text-blue-900 mb-4">Loading BlueOne...</h1>
            <p className="text-gray-600">Preparing your luxury sailing experience</p>
          </div>
        </div>
      </main>
    );
  }

  if (!boat) {
    notFound();
  }

  return (
    <>
      <main className="min-h-screen relative" style={{
        backgroundImage: `linear-gradient(rgba(30, 58, 138, 0.4), rgba(59, 130, 246, 0.5)), url('/images/boats/blueone/External_sailing.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        {/* Hero Section - Enhanced Readability */}
        <div className="relative min-h-screen flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/20 to-blue-900/40"></div>
          
          <div className="relative z-20 text-center px-4 max-w-5xl mx-auto">
            {/* BlueOne Logo */}
            <div className="mb-12">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-blue-400/20 blur-3xl rounded-full"></div>
                <Image 
                  src="/images/boats/blueone/logo_blueone.png" 
                  alt="BlueOne Logo" 
                  width={200} 
                  height={100} 
                  className="relative z-10 mx-auto drop-shadow-2xl transform hover:scale-105 transition-transform duration-300"
                  priority
                />
              </div>
            </div>

            {/* Enhanced Typography Hierarchy */}
            <div className="space-y-6 mb-16">
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in-up">
                {boat.name}
              </h1>
              <h2 className="text-2xl md:text-3xl text-blue-200 font-semibold mb-4 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                {boat.brand} {boat.length}
              </h2>
              <p className="text-lg md:text-xl text-on-dark-gradient-muted max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{animationDelay: '0.3s'}}>
                {boat.description}
              </p>
            </div>

            {/* Enhanced Call-to-Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up" style={{animationDelay: '0.5s'}}>
              <a 
                href={`/booking?boat=${encodeURIComponent(boat.name)}&brand=${encodeURIComponent(boat.brand)}&length=${encodeURIComponent(boat.length)}&description=${encodeURIComponent(boat.description)}&image=${encodeURIComponent(boat.image)}`}
                className="btn-primary text-lg px-8 py-4 shadow-2xl"
              >
                Book Your Adventure
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              <Link 
                href="/contact" 
                className="btn-secondary border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4 shadow-2xl"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        {/* Exterior Gallery Section */}
        <section className="py-20 bg-black/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-16">Exterior Excellence</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blueOneExteriorImages.map((image, index) => (
                <div key={index} className="relative group cursor-pointer" onClick={() => setModalImage(image)}>
                  <Image
                    src={image}
                    alt={`BlueOne exterior view ${index + 1}`}
                    width={400}
                    height={300}
                    className="w-full h-64 object-cover rounded-lg shadow-xl transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Interior Gallery Section */}
        <section className="py-20 bg-black/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-16">Luxurious Interiors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {blueOneInteriorImages.map((image, index) => (
                <div key={index} className="relative group cursor-pointer" onClick={() => setModalImage(image)}>
                  <Image
                    src={image}
                    alt={`BlueOne interior view ${index + 1}`}
                    width={600}
                    height={400}
                    className="w-full h-96 object-cover rounded-lg shadow-xl transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cockpit Section */}
        <section className="py-20 bg-black/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-16">Cockpit & Dining</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {blueOneCockpitImages.map((image, index) => (
                <div key={index} className="relative group cursor-pointer" onClick={() => setModalImage(image)}>
                  <Image
                    src={image}
                    alt={`BlueOne cockpit view ${index + 1}`}
                    width={400}
                    height={300}
                    className="w-full h-64 object-cover rounded-lg shadow-xl transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Water Activities Section */}
        <section className="py-20 bg-black/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-16">Water Activities & Toys</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blueOneActivityImages.map((image, index) => (
                <div key={index} className="relative group cursor-pointer" onClick={() => setModalImage(image)}>
                  <Image
                    src={image}
                    alt={`BlueOne water activity ${index + 1}`}
                    width={400}
                    height={300}
                    className="w-full h-64 object-cover rounded-lg shadow-xl transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Culinary Experience Section */}
        <section className="py-20 bg-black/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-16">Culinary Excellence</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {blueOneFoodImages.map((image, index) => (
                <div key={index} className="relative group cursor-pointer" onClick={() => setModalImage(image)}>
                  <Image
                    src={image}
                    alt={`BlueOne dining experience ${index + 1}`}
                    width={400}
                    height={300}
                    className="w-full h-64 object-cover rounded-lg shadow-xl transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-black/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-16">Yacht Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(boat.features ?? []).map((feature, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-3">{feature}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Captain Section */}
        <section className="py-20 bg-black/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-16">Your Captain</h2>
            <div className="flex flex-wrap justify-center gap-8">
              {blueOneCaptainImages.map((image, index) => (
                <div key={index} className="relative group cursor-pointer" onClick={() => setModalImage(image)}>
                  <Image
                    src={image}
                    alt="BlueOne Captain"
                    width={300}
                    height={400}
                    className="w-72 h-96 object-cover rounded-lg shadow-xl transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/contact" className="btn-primary border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4">
                Meet Your Captain
              </Link>
            </div>
          </div>
        </section>

        {/* Chef Section */}
        <section className="py-20 bg-black/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-16">Executive Chef</h2>
            <div className="flex flex-wrap justify-center gap-8">
              {blueOneChefImages.map((image, index) => (
                <div key={index} className="relative group cursor-pointer" onClick={() => setModalImage(image)}>
                  <Image
                    src={image}
                    alt="BlueOne Executive Chef"
                    width={300}
                    height={400}
                    className="w-72 h-96 object-cover rounded-lg shadow-xl transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/contact" className="btn-primary border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4">
                Discuss Your Culinary Preferences
              </Link>
            </div>
          </div>
        </section>

        {/* Floor Plan Section */}
        <section className="py-20 bg-black/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-16">Yacht Layout</h2>
            <div className="flex justify-center">
              {blueOneFloorplanImages.map((image, index) => (
                <div key={index} className="relative group cursor-pointer" onClick={() => setModalImage(image)}>
                  <Image
                    src={image}
                    alt="BlueOne Floor Plan"
                    width={800}
                    height={600}
                    className="w-full max-w-4xl object-contain rounded-lg shadow-xl transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery Slideshow */}
        <section className="py-20 bg-black/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-16">Complete Gallery</h2>
            <BlueOneGallerySlideshow 
              images={[...blueOneExteriorImages, ...blueOneInteriorImages, ...blueOneCockpitImages]}
            />
          </div>
        </section>

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
              <a 
                href={`/booking?boat=${encodeURIComponent(boat.name)}&brand=${encodeURIComponent(boat.brand)}&length=${encodeURIComponent(boat.length)}&description=${encodeURIComponent(boat.description)}&image=${encodeURIComponent(boat.image)}`}
                className="btn-primary bg-white text-blue-600 hover:bg-gray-50"
              >
                Booking Request
              </a>
              <Link href="/contact" className="btn-secondary border-white text-white hover:bg-white hover:text-blue-600">
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Modal for enlarged images */}
      {modalImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setModalImage(null)}
        >
          <div className="relative max-w-6xl max-h-full">
            <Image
              src={modalImage}
              alt="Enlarged view"
              width={1200}
              height={800}
              className="max-w-full max-h-full object-contain"
            />
            <button
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70"
              onClick={(e) => {
                e.stopPropagation();
                setModalImage(null);
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
