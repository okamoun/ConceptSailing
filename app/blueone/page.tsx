'use client';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { boats } from '../boats-data';
import { useBlueOneMode } from '../contexts/BlueOneContext';

// This is a dedicated page for BlueOne that bypasses the boats listing
export default function BlueOnePage() {
  const [boat, setBoat] = useState<typeof boats[0] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const { setIsBlueOneMode } = useBlueOneMode();

  useEffect(() => {
    // Find the BlueOne boat
    const blueOneBoat = boats.find(b => b.name === "BlueOne");
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
        {/* Hero Section with Attractive Header */}
        <div className="relative min-h-screen flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/20 to-blue-900/40"></div>
          
          {/* Attractive Header Picture */}
          <div className="absolute top-0 left-0 right-0 h-32 overflow-hidden">
            <div className="relative w-full h-full bg-gradient-to-r from-blue-600 to-blue-800">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative z-10 h-full flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-wide">BlueOne Luxury Catamaran</h1>
                  <p className="text-lg md:text-xl text-blue-100">Premium Sailing Adventures in Greece</p>
                </div>
              </div>
              {/* Decorative waves */}
              <div className="absolute bottom-0 left-0 right-0">
                <svg className="w-full h-8 text-blue-50" fill="currentColor" viewBox="0 0 1200 120" preserveAspectRatio="none">
                  <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div className="relative z-20 text-center px-4 pt-20">
            {/* BlueOne Logo */}
            <div className="mb-8">
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

            <p className="text-2xl md:text-3xl text-blue-100 mb-4 drop-shadow-lg animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              {boat.brand} {boat.length}
            </p>
            <p className="text-lg md:text-xl text-blue-200 max-w-3xl mx-auto mb-12 drop-shadow-md animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              {boat.description}
            </p>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
              <a 
                href={`/booking?boat=${encodeURIComponent(boat.name)}&brand=${encodeURIComponent(boat.brand)}&length=${encodeURIComponent(boat.length)}&description=${encodeURIComponent(boat.description)}&image=${encodeURIComponent(boat.image)}`}
                className="bg-white text-blue-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 text-center"
              >
                Book BlueOne Now
              </a>
              <Link 
                href="/blueone/contact" 
                className="bg-blue-800/80 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700/80 transition-all duration-300 border-2 border-blue-400/50 hover:border-blue-300 text-center shadow-2xl hover:shadow-blue-400/25 transform hover:scale-105"
              >
                Contact BlueOne Team
              </Link>
            </div>
          </div>
        </div>

        {/* Content Sections with Enhanced Background */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 via-blue-800/30 to-blue-900/60"></div>
          <div className="relative z-10 max-w-6xl mx-auto px-4 py-16">

            {/* Exterior Gallery */}
            <div className="glass p-8 shadow-xl animate-fade-in-up mb-12">
              <h2 className="text-4xl font-bold text-white mb-8 text-center">Exterior Elegance</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blueOneExteriorImages.map((image: string, index: number) => (
                  <div key={index} className="relative group">
                    <Image
                      src={image}
                      alt={`BlueOne Exterior ${index + 1}`}
                      width={400}
                      height={300}
                      className="w-full h-64 object-cover rounded-xl border-2 border-blue-300/50 group-hover:border-blue-400 transition-all duration-300 shadow-lg"
                      draggable={false}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interior Comfort */}
            <div className="glass p-8 shadow-xl animate-fade-in-up mb-12">
              <h2 className="text-4xl font-bold text-white mb-8 text-center">Interior Luxury</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <p className="text-blue-100 leading-relaxed mb-6">
                    Step inside BlueOne and discover a world of refined elegance and comfort. 
                    The interior spaces are thoughtfully designed to provide the ultimate sailing experience 
                    with premium materials, modern amenities, and sophisticated styling throughout.
                  </p>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-semibold text-blue-300">Interior Features</h3>
                    <ul className="space-y-2 text-blue-100">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">â¢</span>
                        <span>Spacious saloon with panoramic windows</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">â¢</span>
                        <span>Fully equipped gourmet galley</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">â¢</span>
                        <span>Luxurious master cabin with en-suite</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">â¢</span>
                        <span>Additional guest cabins with premium amenities</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">â¢</span>
                        <span>Climate control and entertainment systems</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">â¢</span>
                        <span>Elegant dining area for all guests</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {blueOneInteriorImages.map((image: string, index: number) => (
                      <Image
                        key={index}
                        src={image}
                        alt={`BlueOne Interior ${index + 1}`}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover rounded-lg border-2 border-blue-300/50 hover:scale-105 transition-transform"
                        draggable={false}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Cockpit & Deck Areas Section */}
            <div className="glass p-8 shadow-xl animate-fade-in-up mb-12">
              <h2 className="text-4xl font-bold text-white mb-8 text-center">Cockpit & Deck Areas</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <p className="text-blue-100 leading-relaxed mb-6">
                    The BlueOne features exceptional outdoor living spaces designed for relaxation, dining, and entertainment. 
                    The cockpit and deck areas provide the perfect setting for enjoying the Mediterranean climate and stunning ocean views.
                  </p>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-semibold text-blue-300">Outdoor Features</h3>
                    <ul className="space-y-2 text-blue-100">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">â¢</span>
                        <span>Spacious cockpit with elegant dining table</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">â¢</span>
                        <span>Front cockpit with comfortable seating</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">â¢</span>
                        <span>Large deck areas for sunbathing</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">â¢</span>
                        <span>Flybridge with panoramic views</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">â¢</span>
                        <span>Swim platform with easy water access</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">â¢</span>
                        <span>Outdoor shower and bar area</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div>
                  <div className="grid grid-cols-2 gap-4">
                    {blueOneCockpitImages.map((image: string, index: number) => (
                      <Image
                        key={index}
                        src={image}
                        alt={`Cockpit Area ${index + 1}`}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover rounded-lg border-2 border-blue-300/50 hover:scale-105 transition-transform"
                        draggable={false}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-blue-200 mt-4 text-center">
                    *Cockpit dining and seating areas perfect for entertaining
                  </p>
                </div>
              </div>
            </div>

            {/* Activities & Sea Toys Section */}
            <div className="glass p-8 shadow-xl animate-fade-in-up mb-12">
              <h2 className="text-4xl font-bold text-white mb-8 text-center">Activities & Sea Toys</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <p className="text-blue-100 leading-relaxed mb-6">
                    BlueOne comes fully equipped with an extensive range of water toys and recreational equipment, 
                    ensuring endless entertainment and adventure during your charter.
                  </p>
                  
                  {/* Seabob Feature Video */}
                  <div className="mb-8 glass p-4 shadow-lg animate-fade-in-up">
                    <div className="flex flex-col items-center">
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-blue-300/50 mb-4">
                        <video
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover"
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
                  
                  <div className="space-y-4">
                    <h3 className="text-2xl font-semibold text-blue-300">Water Activities</h3>
                    <ul className="space-y-2 text-blue-100">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">â¢</span>
                        <span>Seabob underwater scooters for marine exploration</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">â¢</span>
                        <span>Professional snorkeling equipment and guidance</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">â¢</span>
                        <span>Stand-up paddleboards for fitness and relaxation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">â¢</span>
                        <span>SUP yoga sessions on calm Mediterranean waters</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">â¢</span>
                        <span>Fishing gear for deep-sea fishing adventures</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">â¢</span>
                        <span>Beach games and water sports equipment</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div>
                  <div className="grid grid-cols-2 gap-4">
                    {blueOneActivityImages.map((image: string, index: number) => (
                      <Image
                        key={index}
                        src={image}
                        alt={`BlueOne Activity ${index + 1}`}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover rounded-lg border-2 border-blue-300/50 hover:scale-105 transition-transform"
                        draggable={false}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-blue-200 mt-4 text-center">
                    *All water toys and safety equipment included
                  </p>
                </div>
              </div>
            </div>

            {/* Culinary Experience Section */}
            <div className="glass p-8 shadow-xl animate-fade-in-up mb-12">
              <h2 className="text-4xl font-bold text-white mb-8 text-center">Culinary Excellence</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <p className="text-blue-100 leading-relaxed mb-6">
                    Indulge in exceptional dining experiences aboard BlueOne, where our professional chef 
                    creates memorable meals using the freshest local ingredients and Mediterranean culinary traditions.
                  </p>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-semibold text-blue-300">Dining Features</h3>
                    <ul className="space-y-2 text-blue-100">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">â¢</span>
                        <span>Professional chef specializing in Mediterranean cuisine</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">â¢</span>
                        <span>Fresh, locally sourced ingredients</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">â¢</span>
                        <span>Customizable menus to suit dietary preferences</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">â¢</span>
                        <span>Al fresco dining in cockpit and deck areas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">â¢</span>
                        <span>Extensive wine selection and cocktail service</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">â¢</span>
                        <span>Cooking demonstrations and culinary workshops</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div>
                  <div className="grid grid-cols-1 gap-4">
                    {blueOneFoodImages.map((image: string, index: number) => (
                      <Image
                        key={index}
                        src={image}
                        alt={`Gourmet Dining ${index + 1}`}
                        width={400}
                        height={250}
                        className="w-full h-56 object-cover rounded-lg border-2 border-blue-300/50 hover:scale-105 transition-transform"
                        draggable={false}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-blue-200 mt-4 text-center">
                    *Gourmet meals prepared by our professional chef
                  </p>
                </div>
              </div>
            </div>

            {/* Premium Features & Amenities */}
            <div className="glass p-8 shadow-xl animate-fade-in-up mb-12">
              <h2 className="text-4xl font-bold text-white mb-8 text-center">Premium Features & Amenities</h2>
              
              <div className="mb-8 text-center">
                <div className="inline-flex items-center gap-3 bg-blue-800/50 rounded-full px-6 py-3 border border-blue-400/30 backdrop-blur-sm">
                  <svg className="w-6 h-6 text-blue-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span className="text-blue-200 font-semibold">Starlink High-Speed Internet Available</span>
                </div>
              </div>

              {/* Condensed Features Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {boat.features?.map((feature, index) => (
                  <div key={index} className={`text-center p-3 rounded-lg border transition-all duration-300 hover:scale-105 ${
                    feature.includes('Starlink') 
                      ? 'bg-blue-600/30 border-blue-400 shadow-lg shadow-blue-500/25' 
                      : 'bg-blue-800/20 border-blue-500/30 hover:bg-blue-800/40'
                  }`}>
                    <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
                      feature.includes('Starlink') 
                        ? 'bg-blue-500/30 border border-blue-400' 
                        : 'bg-blue-600/20 border border-blue-500'
                    }`}>
                      {feature.includes('Starlink') ? (
                        <svg className="w-4 h-4 text-blue-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                        </svg>
                      )}
                    </div>
                    <span className={`text-xs font-medium ${
                      feature.includes('Starlink') ? 'text-blue-200' : 'text-blue-100'
                    }`}>
                      {feature.length > 20 ? feature.substring(0, 20) + '...' : feature}
                    </span>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <div className="bg-gradient-to-r from-blue-600/20 to-blue-400/20 rounded-xl p-6 border border-blue-400/30">
                  <h3 className="text-2xl font-bold text-blue-200 mb-3">Stay Connected at Sea</h3>
                  <p className="text-blue-100 leading-relaxed max-w-2xl mx-auto">
                    With Starlink high-speed internet, you can stay connected with family, work remotely, 
                    stream entertainment, and share your sailing adventures in real-time. Enjoy reliable, 
                    fast WiFi connectivity even in the most remote Greek island locations.
                  </p>
                </div>
              </div>
            </div>

            {/* Professional Crew */}
            <div className="glass p-8 shadow-xl animate-fade-in-up mb-12">
              <h2 className="text-4xl font-bold text-white mb-8 text-center">Professional Crew</h2>
              <p className="text-xl text-blue-100 text-center mb-8 max-w-3xl mx-auto">
                Our experienced crew is dedicated to providing exceptional service and ensuring your safety throughout your journey.
              </p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Captain Card */}
                <div className="bg-gradient-to-br from-blue-800/30 to-blue-600/30 rounded-2xl border border-blue-400/30 overflow-hidden backdrop-blur-sm">
                  <div className="bg-blue-700/40 p-4 border-b border-blue-400/30">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-white">Captain</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row gap-6 mb-6">
                      <div className="flex-shrink-0">
                        {blueOneCaptainImages.map((image, index) => (
                          <div key={index} className="cursor-pointer group relative" onClick={() => setModalImage(image)}>
                            <Image src={image} alt="Captain Ioannis Aliferis" width={120} height={120} className="w-28 h-28 object-cover rounded-full border-4 border-blue-400/50 group-hover:border-blue-400 transition-all duration-300 shadow-lg" draggable={false} />
                            <div className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">Click to view</div>
                          </div>
                        ))}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-white mb-2">Ioannis Aliferis</h4>
                        <p className="text-blue-300 font-medium mb-3">Professional Captain</p>
                        <p className="text-blue-100 leading-relaxed text-sm">With over 6 years of maritime experience, Captain Ioannis brings expertise in Greek waters and ensures safe, memorable journeys for all guests.</p>
                        <div className="mt-4 bg-blue-800/50 rounded-lg p-3">
                          <h5 className="text-blue-300 font-semibold mb-2">Expertise & Qualifications</h5>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-blue-100 text-sm">
                            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-400 rounded-full"></span>6+ years maritime experience</li>
                            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-400 rounded-full"></span>Greek islands specialist</li>
                            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-400 rounded-full"></span>Advanced navigation skills</li>
                            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-400 rounded-full"></span>Safety certified</li>
                            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-400 rounded-full"></span>Multilingual (English, Greek)</li>
                            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-400 rounded-full"></span>Local knowledge expert</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chef Card */}
                <div className="bg-gradient-to-br from-blue-800/30 to-blue-600/30 rounded-2xl border border-blue-400/30 overflow-hidden backdrop-blur-sm">
                  <div className="bg-blue-700/40 p-4 border-b border-blue-400/30">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-white">Chef</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row gap-6 mb-6">
                      <div className="flex-shrink-0">
                        {blueOneChefImages.map((image, index) => (
                          <div key={index} className="cursor-pointer group relative" onClick={() => setModalImage(image)}>
                            <Image src={image} alt="Chef Andreas Tsitsilianis" width={120} height={120} className="w-28 h-28 object-cover rounded-full border-4 border-blue-400/50 group-hover:border-blue-400 transition-all duration-300 shadow-lg" draggable={false} />
                            <div className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">Click to view</div>
                          </div>
                        ))}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-white mb-2">Andreas Tsitsilianis</h4>
                        <p className="text-blue-300 font-medium mb-3">Professional Chef</p>
                        <p className="text-blue-100 leading-relaxed text-sm">Chef Andreas brings culinary excellence to your sailing experience, specializing in Mediterranean cuisine with fresh, local ingredients.</p>
                        <div className="mt-4">
                          <Link 
                            href="/chef/andreas-tsitsilianis" 
                            className="inline-flex items-center gap-2 bg-blue-600/30 hover:bg-blue-600/50 text-white px-4 py-2 rounded-lg transition-colors text-sm border border-blue-400/30"
                          >
                            <span>View Full Profile</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                        <div className="mt-4 bg-blue-800/50 rounded-lg p-3">
                          <h5 className="text-blue-300 font-semibold mb-2">Culinary Excellence</h5>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-blue-100 text-sm">
                            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-400 rounded-full"></span>Mediterranean specialist</li>
                            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-400 rounded-full"></span>Fresh local ingredients</li>
                            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-400 rounded-full"></span>Custom menu creation</li>
                            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-400 rounded-full"></span>Dietary accommodations</li>
                            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-400 rounded-full"></span>Greek cuisine expert</li>
                            <li className="flex items-center gap-2"><span className="w-2 h-2 bg-blue-400 rounded-full"></span>Wine pairing knowledge</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Crew Services Section */}
              <div className="mt-12">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">Complete Crew Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-blue-800/30 rounded-lg p-4 text-center backdrop-blur-sm border border-blue-400/20">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">Full Service</h4>
                    <p className="text-blue-200 text-sm">Complete crew service for all your needs</p>
                  </div>
                  <div className="bg-blue-800/30 rounded-lg p-4 text-center backdrop-blur-sm border border-blue-400/20">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">Safety First</h4>
                    <p className="text-blue-200 text-sm">Experienced crew ensuring your safety</p>
                  </div>
                  <div className="bg-blue-800/30 rounded-lg p-4 text-center backdrop-blur-sm border border-blue-400/20">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-white mb-2">Premium Dining</h4>
                    <p className="text-blue-200 text-sm">Gourmet meals prepared by professional chef</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floor Plan Section */}
            <div className="glass p-8 shadow-xl animate-fade-in-up mb-12">
              <h2 className="text-4xl font-bold text-white mb-8 text-center">Yacht Layout</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <p className="text-blue-100 leading-relaxed mb-6">
                    The BlueOne features intelligent space utilization with 4 spacious cabins, 
                    modern amenities, and elegant living areas designed for comfort and functionality.
                  </p>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-semibold text-blue-300">Layout Features</h3>
                    <ul className="space-y-2 text-blue-100">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">â¢</span>
                        <span>4 double cabins with en-suite facilities</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">â¢</span>
                        <span>Spacious master suite with private bathroom</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">â¢</span>
                        <span>Open-plan saloon and dining area</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">â¢</span>
                        <span>Modern galley with premium appliances</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">â¢</span>
                        <span>Multiple outdoor social areas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-400">â¢</span>
                        <span>Ample storage throughout</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div>
                  <div className="grid grid-cols-1 gap-4">
                    {blueOneFloorplanImages.map((image: string, index: number) => (
                      <Image
                        key={index}
                        src={image}
                        alt={`BlueOne Floor Plan ${index + 1}`}
                        width={400}
                        height={300}
                        className="w-full h-64 object-cover rounded-lg border-2 border-blue-300/50 hover:scale-105 transition-transform"
                        draggable={false}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-blue-200 mt-4 text-center">
                    *Detailed yacht layout showing all living spaces
                  </p>
                </div>
              </div>
            </div>

            {/* Premium Features */}
            <div className="glass p-8 shadow-xl animate-fade-in-up mb-12">
              <h2 className="text-4xl font-bold text-white mb-8 text-center">Premium Features & Amenities</h2>
              
              <div className="mb-8 text-center">
                <div className="inline-flex items-center gap-3 bg-blue-800/50 rounded-full px-6 py-3 border border-blue-400/30 backdrop-blur-sm">
                  <svg className="w-6 h-6 text-blue-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  <span className="text-blue-200 font-semibold">Starlink High-Speed Internet Available</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {boat.features?.map((feature, index) => (
                  <div key={index} className="bg-blue-800/30 rounded-xl p-4 border border-blue-400/20 backdrop-blur-sm hover:bg-blue-800/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        feature.includes('Starlink') 
                          ? 'bg-blue-500/20 border-2 border-blue-400' 
                          : 'bg-blue-600/20 border border-blue-500'
                      }`}>
                        {feature.includes('Starlink') ? (
                          <svg className="w-5 h-5 text-blue-300" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                          </svg>
                        )}
                      </div>
                      <span className={`text-sm ${feature.includes('Starlink') ? 'text-blue-200 font-semibold' : 'text-blue-100'}`}>
                        {feature}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <div className="bg-gradient-to-r from-blue-600/20 to-blue-400/20 rounded-xl p-6 border border-blue-400/30">
                  <h3 className="text-2xl font-bold text-blue-200 mb-3">Stay Connected at Sea</h3>
                  <p className="text-blue-100 leading-relaxed">
                    With Starlink high-speed internet, you can stay connected with family, work remotely, 
                    stream entertainment, and share your sailing adventures in real-time. Enjoy reliable, 
                    fast WiFi connectivity even in the most remote Greek island locations.
                  </p>
                </div>
              </div>
            </div>

            {/* Complete Gallery Section */}
            <div className="glass p-8 shadow-xl animate-fade-in-up mb-12">
              <h2 className="text-4xl font-bold text-white mb-8 text-center">Complete BlueOne Gallery</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...blueOneExteriorImages, ...blueOneInteriorImages, ...blueOneCockpitImages].map((image: string, index: number) => (
                  <div key={index} className="glass p-2 shadow-lg animate-fade-in-up hover:scale-105 transition-transform" style={{animationDelay: `${index * 0.1}s`, animationFillMode: 'both'}}>
                    <Image
                      src={image}
                      alt={`BlueOne Gallery ${index + 1}`}
                      width={400}
                      height={300}
                      className="w-full h-48 object-cover rounded-lg"
                      draggable={false}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Final CTA */}
            <div className="text-center mt-16">
              <div className="glass p-8 animate-fade-in-up">
                <h3 className="text-3xl font-bold text-white mb-6">Ready to Sail BlueOne?</h3>
                <p className="text-xl text-blue-100 mb-8">Experience the ultimate luxury sailing adventure in the Greek islands</p>
                <a 
                  href={`/booking?boat=${encodeURIComponent(boat.name)}&brand=${encodeURIComponent(boat.brand)}&length=${encodeURIComponent(boat.length)}&description=${encodeURIComponent(boat.description)}&image=${encodeURIComponent(boat.image)}`}
                  className="inline-block bg-white text-blue-900 px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-xl"
                >
                  Book Your BlueOne Experience
                </a>
              </div>
            </div>
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
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              onClick={() => setModalImage(null)}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <Image
              src={modalImage}
              alt="Crew member"
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain rounded-lg"
              draggable={false}
            />
          </div>
        </div>
      )}
    </>
  );
}
