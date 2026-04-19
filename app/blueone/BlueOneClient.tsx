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

            {/* Seabob Feature Video */}
            <div className="mb-12 glass p-4 shadow-lg animate-fade-in-up max-w-2xl mx-auto">
              <div className="flex flex-col items-center">
                <div className="relative w-full rounded-lg overflow-hidden border-2 border-blue-300/50 mb-4">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full object-cover"
                    poster="/images/boats/blueone/Seabob_1.jpeg"
                  >
                    <source src="https://seabob.com/media/SEABOB_F9_Loop.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Premium Seabob Experience</h3>
                <p className="text-blue-200 text-center text-sm">
                  Explore underwater worlds with our state-of-the-art Seabob underwater scooters
                </p>
              </div>
            </div>

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(boat.features ?? []).map((feature, index) => (
                <div key={index} className="bg-white/20 backdrop-blur-md rounded-xl px-5 py-4 border border-white/30 flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-blue-300 flex-shrink-0"></span>
                  <span className="text-white text-sm font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Professional Crew Section */}
        <section className="py-20 bg-black/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4">
            {/* Header */}
            <div className="text-center mb-14">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Professional Crew</h2>
              <p className="text-blue-100 text-lg max-w-2xl mx-auto">
                Our experienced crew is dedicated to providing exceptional service and ensuring your safety throughout your journey.
              </p>
            </div>

            {/* Captain + Chef cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">

              {/* Captain Card */}
              <div className="bg-white/20 backdrop-blur-md rounded-2xl overflow-hidden border border-white/30 shadow-xl">
                {/* Card header bar */}
                <div className="bg-blue-600/80 px-6 py-4 flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-white font-bold text-lg">Captain</span>
                </div>
                {/* Card body */}
                <div className="p-6">
                  {/* Profile row */}
                  <div className="flex items-start gap-5 mb-6">
                    <div className="flex-shrink-0 cursor-pointer" onClick={() => setModalImage(blueOneCaptainImages[0])}>
                      <Image
                        src={blueOneCaptainImages[0]}
                        alt="Captain Ioannis Aliferis"
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-full object-cover border-3 border-white/30 shadow-lg"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">Ioannis Aliferis</h3>
                      <p className="text-blue-200 text-sm font-medium mb-3">Professional Captain</p>
                      <p className="text-blue-50 text-sm leading-relaxed">
                        With over 6 years of maritime experience, Captain Ioannis brings expertise in Greek waters and ensures safe, memorable journeys for all guests.
                      </p>
                    </div>
                  </div>
                  {/* Qualifications box */}
                  <div className="bg-blue-900/60 rounded-xl p-5">
                    <h4 className="text-white font-bold mb-4">Expertise &amp; Qualifications</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        '6+ years maritime experience',
                        'Greek islands specialist',
                        'Advanced navigation skills',
                        'Safety certified',
                        'Multilingual (English, Greek)',
                        'Local knowledge expert',
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-blue-300 mt-0.5 flex-shrink-0">•</span>
                          <span className="text-white text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Chef Card */}
              <div className="bg-white/20 backdrop-blur-md rounded-2xl overflow-hidden border border-white/30 shadow-xl">
                {/* Card header bar */}
                <div className="bg-blue-600/80 px-6 py-4 flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <span className="text-white font-bold text-lg">Chef</span>
                </div>
                {/* Card body */}
                <div className="p-6">
                  {/* Profile row */}
                  <div className="flex items-start gap-5 mb-5">
                    <div className="flex-shrink-0 cursor-pointer" onClick={() => setModalImage(blueOneChefImages[0])}>
                      <Image
                        src={blueOneChefImages[0]}
                        alt="Chef Andreas Tsitsilianis"
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-full object-cover border-3 border-white/30 shadow-lg"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">Andreas Tsitsilianis</h3>
                      <p className="text-blue-200 text-sm font-medium mb-3">Professional Chef</p>
                      <p className="text-blue-50 text-sm leading-relaxed">
                        Chef Andreas brings culinary excellence to your sailing experience, specializing in Mediterranean cuisine with fresh, local ingredients.
                      </p>
                    </div>
                  </div>
                  {/* View Full Profile button */}
                  <Link
                    href="/chef/andreas-tsitsilianis"
                    className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-lg border border-white/30 transition-colors mb-5"
                  >
                    View Full Profile
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  {/* Culinary excellence box */}
                  <div className="bg-blue-900/60 rounded-xl p-5">
                    <h4 className="text-white font-bold mb-4">Culinary Excellence</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        'Mediterranean specialist',
                        'Fresh local ingredients',
                        'Custom menu creation',
                        'Dietary accommodations',
                        'Greek cuisine expert',
                        'Wine pairing knowledge',
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-blue-300 mt-0.5 flex-shrink-0">•</span>
                          <span className="text-white text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Complete Crew Services */}
            <div className="text-center mb-10">
              <h3 className="text-2xl font-bold text-white">Complete Crew Services</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  ),
                  label: 'Full Service',
                  desc: 'Complete crew service for all your needs',
                },
                {
                  icon: (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ),
                  label: 'Safety First',
                  desc: 'Experienced crew ensuring your safety',
                },
                {
                  icon: (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                  ),
                  label: 'Premium Dining',
                  desc: 'Gourmet meals prepared by professional chef',
                },
              ].map((item, i) => (
                <div key={i} className="bg-white/20 backdrop-blur-md rounded-2xl p-8 border border-white/30 text-center hover:bg-white/25 transition-colors">
                  <div className="w-16 h-16 bg-blue-600/70 rounded-full flex items-center justify-center mx-auto mb-4">
                    {item.icon}
                  </div>
                  <h4 className="text-white font-bold text-lg mb-2">{item.label}</h4>
                  <p className="text-white text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Floor Plan Section */}
        <section className="py-20 bg-black/40 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-6">Yacht Layout</h2>
            <p className="text-blue-100 text-center text-lg max-w-2xl mx-auto mb-16">
              Designed for those who refuse to compromise between performance and comfort at sea.
            </p>

            {/* Layout Description */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 items-start">
              {/* Left — prose description */}
              <div className="bg-blue-100 rounded-2xl p-8 border border-blue-200 shadow-lg">
                <h3 className="text-2xl font-bold text-blue-900 mb-4">A Home on the Water</h3>
                <p className="text-blue-900 leading-relaxed mb-5">
                  The <strong>Fountaine Pajot Aura 51</strong> redefines what it means to live aboard. Her wide-open saloon floods with natural light through floor-to-ceiling windows, seamlessly connecting the interior living space to the expansive cockpit — creating one continuous, breathable living environment.
                </p>
                <p className="text-blue-900 leading-relaxed mb-5">
                  Below deck, four generous en-suite cabins offer hotel-grade comfort. Each cabin features a full-size double bed, generous storage, individual climate control, and a private bathroom — so every guest has their own sanctuary, regardless of how long the voyage lasts.
                </p>
                <p className="text-blue-900 leading-relaxed">
                  The galley is positioned for the chef to remain part of the conversation — open, modern, and fully equipped for gourmet cooking. Upstairs, the flybridge offers panoramic 360° views, a second helm station, and a shaded lounge for sunset cocktails above the world.
                </p>
              </div>

              {/* Right — space cards */}
              <div className="space-y-4">
                {[
                  { icon: '🛏️', label: '5 Generous Guest Cabins', desc: 'Four spacious double-bed cabins and one master cabin, each with a private en-suite bathroom, individual climate control, and generous storage.' },
                  { icon: '🍽️', label: 'Open Saloon & Galley', desc: 'A light-filled social hub with panoramic sea views, a fully equipped professional kitchen, and a large dining table.' },
                  { icon: '☀️', label: 'Cockpit & Flybridge', desc: 'Shaded outdoor dining aft, plus a flybridge lounge for open-air relaxation and 360° horizon views.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 bg-blue-100 rounded-xl p-5 shadow-lg border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
                    <span className="text-3xl flex-shrink-0">{item.icon}</span>
                    <div>
                      <h4 className="text-blue-900 font-bold mb-1">{item.label}</h4>
                      <p className="text-blue-800 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floor Plan Image */}
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

        {/* Rates Teaser */}
        <section className="py-16 bg-black/30 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-gradient-to-br from-blue-700/40 to-blue-900/50 border border-blue-400/30 rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <p className="text-blue-300 uppercase tracking-widest text-xs font-semibold mb-2">Summer 2026</p>
                <h2 className="text-3xl font-bold text-white mb-3">Charter Rates</h2>
                <p className="text-blue-100 text-sm leading-relaxed mb-2">
                  Weekly rates from <strong className="text-white">€18,000</strong> to <strong className="text-white">€24,000</strong> depending on season, plus expenses (MYBA terms).
                </p>
                <p className="text-blue-200 text-sm">All-inclusive experience packages also available on request.</p>
              </div>
              <div className="flex flex-col gap-3 flex-shrink-0">
                <Link href="/rates" className="btn-primary px-8 py-3 inline-flex items-center gap-2 whitespace-nowrap">
                  View Full Rates
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link href="/booking?boat=BlueOne" className="btn-secondary border-white/40 text-white hover:bg-white/10 px-8 py-3 inline-flex items-center justify-center gap-2 whitespace-nowrap">
                  Request a Quote
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready for Your BlueOne Adventure?
            </h2>
            <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
              Book your luxury sailing experience today and create memories that will last a lifetime
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`/booking?boat=${encodeURIComponent(boat.name)}&brand=${encodeURIComponent(boat.brand)}&length=${encodeURIComponent(boat.length)}&description=${encodeURIComponent(boat.description)}&image=${encodeURIComponent(boat.image)}`}
                className="btn-primary bg-white text-blue-600 hover:bg-gray-50"
              >
                Booking Request
              </a>
              <Link href="/specifications" className="btn-secondary border-white text-white hover:bg-white hover:text-blue-600">
                View Specifications
              </Link>
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
