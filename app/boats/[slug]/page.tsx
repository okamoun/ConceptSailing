'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { boats } from '../../boats-data';
import Image from "next/image";
import { useState, useEffect } from 'react';

interface BoatPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function BoatPage({ params }: BoatPageProps) {
  const [slug, setSlug] = useState<string>('');
  const [boat, setBoat] = useState(boats.find(b => b.name.toLowerCase().replace(/\s+/g, '-') === slug));
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state for crew image popup
  const [modalImage, setModalImage] = useState<string | null>(null);

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setSlug(resolvedParams.slug);
      const foundBoat = boats.find(b => b.name.toLowerCase().replace(/\s+/g, '-') === resolvedParams.slug);
      setBoat(foundBoat);
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
            <p className="text-gray-300">Loading boat details...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!boat) {
    notFound();
  }

  // BlueOne specific images from the blueone folder - organized by content
  const blueOneExteriorImages = boat.name === "BlueOne" ? [
    "/images/boats/blueone/IMG_7667.jpeg", // Main exterior shot
    "/images/boats/blueone/External_reading.jpg", // Exterior reading area
    "/images/boats/blueone/External_sailing.jpg", // Sailing exterior view
    "/images/boats/blueone/IMG_8914.jpeg", // Exterior view
    "/images/boats/blueone/IMG_8917.jpeg", // Another exterior view
    "/images/boats/blueone/277080815_7549724425052761_8631137394407809070_n.jpeg", // Exterior photo
  ] : [];

  const blueOneInteriorImages = boat.name === "BlueOne" ? [
    "/images/boats/blueone/Interior_table.jpg", // Interior dining table area
    "/images/boats/blueone/kitchen.jpg", // Kitchen/galley area
    "/images/boats/blueone/Actu-3-Aura51-Maestro-Bed.jpg.avif", // Master bedroom
    "/images/boats/blueone/Actu-4-Aura51-Cabine-Bed.jpg.avif", // Cabin bedroom
  ] : [];

  const blueOneCockpitImages = boat.name === "BlueOne" ? [
    "/images/boats/blueone/Actu-2-Aura51-Cockpit-Table.avif", // Cockpit dining table
    "/images/boats/blueone/Actu-8-Aura51-Front-Cockpit.avif", // Front cockpit seating
    "/images/boats/blueone/IMG_8677.jpeg", // Cockpit or deck area
  ] : [];

  // Food and dining images - using available images that showcase dining experience
  const blueOneFoodImages = boat.name === "BlueOne" ? [
    "/images/boats/blueone/food_1.jpeg", 
    "/images/boats/blueone/food_2.jpeg", 
    "/images/boats/blueone/Actu-2-Aura51-Cockpit-Table.avif", // Cockpit dining table
  ] : [];

  const blueOneChefImages = boat.name === "BlueOne" ? [
    "/images/boats/blueone/profile_andrea_chef.jpg", // Chef Andreas Tsitsilianis
  ] : [];

  // Captain images for the crew section
  const blueOneCaptainImages = boat.name === "BlueOne" ? [
    "/images/boats/blueone/Cap_alif.jpg", // Captain Alif
  ] : [];

  // Activity images showing water toys and deck activities
  const blueOneActivityImages = boat.name === "BlueOne" ? [
    "/images/boats/blueone/Seabob_1.jpeg", // Seabob water toy
    "/images/boats/blueone/seabob-f5s-pic-1-1.jpg", // Additional Seabob/water toy image
    "/images/boats/blueone/snorkeling.png", // Snorkeling activity
    "/images/boats/blueone/SUP_Relax.png", // SUP relaxation activity
    "/images/boats/blueone/SUP_Yoga.png", // SUP yoga activity
  ] : [];

  // Floor plan image - using the floorplan file
  const blueOneFloorplanImages = boat.name === "BlueOne" ? [
    "/images/boats/blueone/floorplan.jpg", // Floor plan image
  ] : [];

  return (
    <>
    <main className="min-h-screen relative" style={{
      backgroundImage: boat.name === "BlueOne" 
        ? `linear-gradient(rgba(16, 24, 36, 0.85), rgba(31, 41, 55, 0.9)), url('/images/boats/blueone/External_sailing.jpg')`
        : 'linear-gradient(to bottom right, #101824, #1f2937)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <div className="min-h-screen bg-gradient-to-br from-[#101824]/50 to-[#1f2937]/50 py-16">
        <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <Link href="/boats" className="text-accent hover:text-accent/80 transition-colors inline-flex items-center gap-2">
            ← Back to All Boats
          </Link>
        </div>

        <div className="glass p-8 shadow-xl animate-fade-in-up">
          {/* Header with Logo */}
          <div className="text-center mb-8">
            {boat.name === "BlueOne" && (
              <div className="mb-6">
                <Image
                  src="/images/boats/blueone/logo_blueone.png"
                  alt="BlueOne Logo"
                  width={200}
                  height={100}
                  className="mx-auto h-20 w-auto object-contain"
                  draggable={false}
                />
              </div>
            )}
            <h1 className="text-5xl font-black text-accent drop-shadow-lg mb-4">{boat.name}</h1>
            <div className="flex justify-center gap-8 text-lg text-gray-300">
              <span><span className="font-semibold text-accent">Brand:</span> {boat.brand}</span>
              <span><span className="font-semibold text-accent">Length:</span> {boat.length}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <p className="text-lg text-gray-100 leading-relaxed">{boat.description}</p>
              
              {/* Enhanced BlueOne Description */}
              {boat.name === "BlueOne" && (
                <div className="mt-6 p-6 bg-accent/10 rounded-lg border border-accent/30">
                  <h3 className="text-xl font-semibold text-accent mb-4">Yacht Details & Specifications</h3>
                  <div className="text-gray-100 leading-relaxed space-y-3">
                    <p>
                      <strong>BLUEONE</strong> is a brand-new Fountaine Pajot Aura 51, built in 2025, designed to offer comfort, efficiency, and a modern sailing experience. She accommodates up to 10 guests in five spacious double cabins, all with private en-suite facilities.
                    </p>
                    <p>
                      Equipped with electric propulsion, BLUEONE cruises quietly at 5 knots with zero fuel consumption, offering an eco-friendly and peaceful experience at sea. With the hybrid mode generator in use, she cruises at 8 knots with a fuel consumption of 8 liters per hour, ensuring efficient performance.
                    </p>
                    <p>
                      The extensive battery system provides 220V electricity in full comfort throughout your journey.
                    </p>
                  </div>
                  
                  {/* Key Specifications */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#1f2937] p-4 rounded-lg">
                      <h4 className="text-accent font-semibold mb-2">Performance</h4>
                      <ul className="text-gray-300 text-sm space-y-1">
                        <li>Electric propulsion: 5 knots (0 fuel)</li>
                        <li>Hybrid mode: 8 knots (8L/hour)</li>
                        <li>Battery-powered 220V system</li>
                      </ul>
                    </div>
                    <div className="bg-[#1f2937] p-4 rounded-lg">
                      <h4 className="text-accent font-semibold mb-2">Accommodation</h4>
                      <ul className="text-gray-300 text-sm space-y-1">
                        <li>5 spacious double cabins</li>
                        <li>Private en-suite facilities</li>
                        <li>Up to 10 guests</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <Image 
                src={boat.image} 
                alt={boat.name} 
                width={600} 
                height={400} 
                className="w-full h-96 object-cover rounded-xl border-4 border-accent shadow-lg bg-[#222]" 
                priority 
                draggable={false} 
              />
            </div>
          </div>
        </div>

        {boat.name === "BlueOne" && (
          <>
            {/* General Presentation Section */}
            <section className="mt-16 glass p-8 shadow-xl animate-fade-in-up">
              <h2 className="text-4xl font-bold text-accent mb-6">General Presentation</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <p className="text-gray-100 leading-relaxed mb-4">
                    BlueOne represents the pinnacle of modern catamaran design, combining cutting-edge technology with environmental responsibility. 
                    This 51-foot Fountaine Pajot vessel offers an unparalleled sailing experience with its innovative hybrid propulsion system 
                    and state-of-the-art amenities.
                  </p>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-semibold text-accent">Key Specifications</h3>
                    <ul className="space-y-2 text-gray-200">
                      <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>Length: 51 ft (15.54 m)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>Beam: 26 ft (7.92 m)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>Draft: 4.2 ft (1.28 m)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>Engines: 2 x 27 KWh</span>
                      </li>

                      <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>Cruise Speed: Hybride : 8Kn , Zero Emission: 6Kn</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>Sail Area: 1,394 sq ft</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>Fuel Capacity: 2 x 158 gal</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>Water Capacity: 2 x 211 gal</span>
                      </li>
                        <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>Water maker and drinking water</span>
                      </li>
                    </ul>
                  </div>
                </div>
                <div>
                  <div className="grid grid-cols-2 gap-4">
                    {blueOneExteriorImages.map((image: string, index: number) => (
                      <Image
                        key={index}
                        src={image}
                        alt={`BlueOne Exterior ${index + 1}`}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover rounded-lg border-2 border-accent/50 hover:scale-105 transition-transform"
                        draggable={false}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Interior & Floor Plan Section */}
            <section className="mt-16 glass p-8 shadow-xl animate-fade-in-up">
              <h2 className="text-4xl font-bold text-accent mb-6">Interior & Floor Plan</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <p className="text-gray-100 leading-relaxed mb-4">
                    Step aboard BlueOne and discover a world of luxury and comfort. The interior design maximizes space and natural light, 
                    creating an open and inviting atmosphere throughout the vessel.
                  </p>
                  <h3 className="text-2xl font-semibold text-accent mb-4">Accommodation</h3>
                  <ul className="space-y-2 text-gray-200 mb-6">
                    <li className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>4 Double Cabins with en-suite bathrooms</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>Master suite with office space</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>Spacious saloon with dining area</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>Fully equipped galley</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>Air conditioning throughout</span>
                    </li>
                  </ul>
                  <h3 className="text-2xl font-semibold text-accent mb-4">Living Areas</h3>
                  <ul className="space-y-2 text-gray-200">
                    <li className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>Expansive cockpit with dining table</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>Flybridge with helm station</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>Foredeck lounge area</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent">•</span>
                      <span>Swim platform with shower</span>
                    </li>
                  </ul>
                  
                  {/* Floor Plan Subsection */}
                  <div className="mt-8 p-6 bg-accent/10 rounded-lg border border-accent/30">
                    <h3 className="text-2xl font-semibold text-accent mb-4">Yacht Layout & Floor Plan</h3>
                    
                    {/* Display floorplan image if available */}
                    {blueOneFloorplanImages.length > 0 ? (
                      <div className="mb-4">
                        {blueOneFloorplanImages.map((image: string, index: number) => (
                          <div key={index} className="mb-4">
                            <Image
                              src={image}
                              alt="BlueOne Floor Plan"
                              width={800}
                              height={600}
                              className="w-full h-auto object-contain rounded-lg border-2 border-accent/50"
                              draggable={false}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Placeholder layout when floorplan image not available */
                      <div className="mb-4">
                        <div className="bg-gradient-to-r from-[#1f2937] to-[#101824] p-8 rounded-lg border-2 border-accent/50">
                          <div className="text-center">
                            <div className="text-accent text-6xl mb-4">Lagoon 52F</div>
                            <div className="text-gray-300 text-xl mb-6">Luxury Catamaran Layout</div>
                            
                            {/* Simplified Floor Plan Layout */}
                            <div className="grid grid-cols-3 gap-2 max-w-md mx-auto mb-6">
                              <div className="bg-accent/20 p-4 rounded border border-accent/50">
                                <div className="text-xs text-accent font-semibold">MASTER</div>
                                <div className="text-xs text-gray-300">Suite</div>
                              </div>
                              <div className="bg-accent/20 p-4 rounded border border-accent/50">
                                <div className="text-xs text-accent font-semibold">SALOON</div>
                                <div className="text-xs text-gray-300">Dining</div>
                              </div>
                              <div className="bg-accent/20 p-4 rounded border border-accent/50">
                                <div className="text-xs text-accent font-semibold">GALLEY</div>
                                <div className="text-xs text-gray-300">Kitchen</div>
                              </div>
                              <div className="bg-accent/20 p-4 rounded border border-accent/50">
                                <div className="text-xs text-accent font-semibold">CABIN 1</div>
                                <div className="text-xs text-gray-300">Double</div>
                              </div>
                              <div className="bg-accent/20 p-4 rounded border border-accent/50">
                                <div className="text-xs text-accent font-semibold">CABIN 2</div>
                                <div className="text-xs text-gray-300">Double</div>
                              </div>
                              <div className="bg-accent/20 p-4 rounded border border-accent/50">
                                <div className="text-xs text-accent font-semibold">CABIN 3</div>
                                <div className="text-xs text-gray-300">Double</div>
                              </div>
                            </div>
                            
                            <div className="text-gray-300 text-sm">
                              <p className="mb-2">Length: 52 ft | Beam: 29.5 ft | Draft: 4.9 ft</p>
                              <p>4 Cabins | 4 Bathrooms | 8 Guests + 2 Crew</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <ul className="space-y-2 text-gray-200 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-accent"></span>
                        <span>Starboard hull: Master suite forward, galley mid, crew cabin aft</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent"></span>
                        <span>Port hull: 3 double cabins with en-suite bathrooms</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent"></span>
                        <span>Central deck: Spacious saloon with dining and navigation</span>
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
                        className="w-full h-48 object-cover rounded-lg border-2 border-accent/50 hover:scale-105 transition-transform"
                        draggable={false}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Cockpit & Deck Areas Section */}
            <section className="mt-16 glass p-8 shadow-xl animate-fade-in-up">
              <h2 className="text-4xl font-bold text-accent mb-6">Cockpit & Deck Areas</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <p className="text-gray-100 leading-relaxed mb-6">
                    The BlueOne features exceptional outdoor living spaces designed for relaxation, dining, and entertainment. 
                    The cockpit and deck areas provide the perfect setting for enjoying the Caribbean climate and stunning ocean views.
                  </p>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-semibold text-accent">Outdoor Features</h3>
                    <ul className="space-y-2 text-gray-200">
                      <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>Spacious cockpit with elegant dining table</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>Front cockpit with comfortable seating</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>Large deck areas for sunbathing</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>Flybridge with panoramic views</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>Swim platform with easy water access</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
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
                        className="w-full h-48 object-cover rounded-lg border-2 border-accent/50 hover:scale-105 transition-transform"
                        draggable={false}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-400 mt-4 text-center">
                    *Cockpit dining and seating areas perfect for entertaining
                  </p>
                </div>
              </div>
            </section>

            {/* Activities & Sea Toys Section */}
            <section className="mt-16 glass p-8 shadow-xl animate-fade-in-up">
              <h2 className="text-4xl font-bold text-accent mb-6">Activities & Sea Toys</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <p className="text-gray-100 leading-relaxed mb-6">
                    BlueOne comes fully equipped with an extensive range of water toys and recreational equipment, 
                    ensuring endless entertainment and adventure during your charter.
                  </p>
                  
                  {/* Seabob Feature Image */}
                  <div className="mb-8 glass p-4 shadow-lg animate-fade-in-up">
                    <div className="flex flex-col items-center">
                      <Image
                        src="/images/boats/blueone/Seabob_1.jpeg"
                        alt="F9s Seabob Underwater Scooter"
                        width={600}
                        height={400}
                        className="w-full h-64 object-cover rounded-lg border-2 border-accent/50 mb-4"
                        draggable={false}
                      />
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-accent mb-2">Latest F9s Seabob Underwater Scooter</h3>
                        <p className="text-gray-200 text-sm">
                          Experience the ultimate underwater adventure with our top-of-the-line Seabob F9s, 
                          offering exceptional maneuverability and speed for exploring the Mediterranean waters.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-xl font-semibold text-accent mb-3">Water Sports</h3>
                      <ul className="space-y-2 text-gray-200">
                        <li className="flex items-start gap-2">
                          <span className="text-accent">•</span>
                          <span>2 Stand-Up Paddleboards (SUP)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-accent">•</span>
                          <span>Latest top end F9s Seabob underwater scooter</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-accent">•</span>
                          <span>Sea scooters</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-accent">•</span>
                          <span>Professional snorkeling gear</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-accent">•</span>
                          <span>Scuba diving equipment</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-accent mb-3">Fishing & Leisure</h3>
                      <ul className="space-y-2 text-gray-200">
                        <li className="flex items-start gap-2">
                          <span className="text-accent">•</span>
                          <span>Professional fishing gear</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-accent">•</span>
                          <span>Trolling equipment</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-accent">•</span>
                          <span>Beach games and toys</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-accent">•</span>
                          <span>Inflatable dinghy with outboard</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-accent">•</span>
                          <span>Kayak for coastal exploration</span>
                        </li>
                      </ul>
                    </div>
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
                        className="w-full h-48 object-cover rounded-lg border-2 border-accent/50 hover:scale-105 transition-transform"
                        draggable={false}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-400 mt-4 text-center">
                    *Deck areas perfect for water activities, outdoor dining, and relaxation
                  </p>
                </div>
              </div>
            </section>

            {/* Culinary Experience Section */}
            <section className="mt-16 glass p-8 shadow-xl animate-fade-in-up">
              <h2 className="text-4xl font-bold text-accent mb-6">Culinary Experience</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <p className="text-gray-100 leading-relaxed mb-6">
                    Indulge in a gastronomic journey aboard BlueOne, where our chef creates memorable dining experiences 
                    using the freshest local ingredients and international culinary techniques.
                  </p>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-semibold text-accent">Menu Highlights</h3>
                    <ul className="space-y-2 text-gray-200">
                      <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>Fresh Fish caught by you or from local fisherman</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>Locally sourced organic produce</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>International fusion cuisine</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>Custom dietary accommodations (Vegetarian, Vegan, Gluten-Free, Kosher, Halla, etc.)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>Signature  cocktails</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>Al fresco dining under the stars</span>
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
                        alt={`Gourmet Meal ${index + 1}`}
                        width={400}
                        height={300}
                        className="w-full h-64 object-cover rounded-lg border-2 border-accent/50 hover:scale-105 transition-transform"
                        draggable={false}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Crew Section */}
            <section className="mt-16 glass p-8 shadow-xl animate-fade-in-up">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-accent mb-4">Meet Your Professional Crew</h2>
                <p className="text-gray-300 text-lg max-w-3xl mx-auto">
                  BlueOne is operated by a first-class professional crew dedicated to providing exceptional service 
                  and ensuring your safety and comfort throughout your journey.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Captain Card */}
                <div className="bg-gradient-to-br from-accent/5 to-accent/10 rounded-2xl border border-accent/30 overflow-hidden hover:shadow-2xl transition-all duration-300">
                  <div className="bg-accent/20 p-4 border-b border-accent/30">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5h9" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-white">Captain</h3>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row gap-6 mb-6">
                      <div className="flex-shrink-0">
                        {blueOneCaptainImages.map((image: string, index: number) => (
                          <div 
                            key={index}
                            className="cursor-pointer group relative"
                            onClick={() => setModalImage(image)}
                          >
                            <div className="absolute inset-0 bg-accent/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                            <Image
                              src={image}
                              alt="Captain Ioannis Aliferis"
                              width={120}
                              height={120}
                              className="w-28 h-28 object-cover rounded-full border-3 border-accent/50 group-hover:border-accent transition-all duration-300 shadow-lg"
                              draggable={false}
                            />
                            <div className="absolute bottom-0 right-0 bg-accent text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                              Click to view
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-white mb-2">Ioannis Aliferis</h4>
                        <p className="text-accent font-medium mb-3">Professional Captain</p>
                        <p className="text-gray-300 leading-relaxed text-sm">
                          Ioannis&apos;s connection with the sea is very special - it started from a very young age and has eventually become his profession. Through his technical background and 6+ years of maritime experience, he ensures exceptional comfort and safety for all guests.
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-[#1f2937]/50 rounded-lg p-4">
                      <h5 className="text-accent font-semibold mb-3">Expertise & Qualifications</h5>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-300 text-sm">
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-accent rounded-full"></span>
                          6+ years maritime experience
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-accent rounded-full"></span>
                          Technical systems design
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-accent rounded-full"></span>
                          Expert boat management
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-accent rounded-full"></span>
                          Advanced safety skills
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Chef Card */}
                <div className="bg-gradient-to-br from-accent/5 to-accent/10 rounded-2xl border border-accent/30 overflow-hidden hover:shadow-2xl transition-all duration-300">
                  <div className="bg-accent/20 p-4 border-b border-accent/30">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-white">Executive Chef</h3>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row gap-6 mb-6">
                      <div className="flex-shrink-0">
                        {blueOneChefImages.map((image: string, index: number) => (
                          <div 
                            key={index}
                            className="cursor-pointer group relative"
                            onClick={() => setModalImage(image)}
                          >
                            <div className="absolute inset-0 bg-accent/20 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                            <Image
                              src={image}
                              alt="Chef Andreas Tsitsilianis"
                              width={120}
                              height={120}
                              className="w-28 h-28 object-cover rounded-full border-3 border-accent/50 group-hover:border-accent transition-all duration-300 shadow-lg"
                              draggable={false}
                            />
                            <div className="absolute bottom-0 right-0 bg-accent text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                              Click to view
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-white mb-2">Andreas Tsitsilianis</h4>
                        <p className="text-accent font-medium mb-3">Executive Chef</p>
                        <p className="text-gray-300 leading-relaxed text-sm">
                          Andreas brings Michelin-level precision and authentic Mediterranean soul to the sea. With 12+ years of experience across Greece, Italy, and France, he creates exceptional culinary experiences tailored to each guest.
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-[#1f2937]/50 rounded-lg p-4">
                      <h5 className="text-accent font-semibold mb-3">Culinary Excellence</h5>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-300 text-sm">
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-accent rounded-full"></span>
                          Modern Mediterranean
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-accent rounded-full"></span>
                          Luxury hotel experience
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-accent rounded-full"></span>
                          Seasonal ingredients
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-accent rounded-full"></span>
                          Custom menus
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Crew Services Section */}
              <div className="mt-12 bg-gradient-to-r from-accent/10 to-accent/5 rounded-2xl border border-accent/30 p-8">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">Complete Crew Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-accent/30 transition-colors">
                      <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="text-white font-semibold mb-2">24/7 Service</h4>
                    <p className="text-gray-400 text-sm">Round-the-clock professional assistance</p>
                  </div>
                  
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-accent/30 transition-colors">
                      <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <h4 className="text-white font-semibold mb-2">Daily Housekeeping</h4>
                    <p className="text-gray-400 text-sm">Maintained luxury living spaces</p>
                  </div>
                  
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-accent/30 transition-colors">
                      <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h4 className="text-white font-semibold mb-2">Gourmet Dining</h4>
                    <p className="text-gray-400 text-sm">Exquisite meals prepared daily</p>
                  </div>
                  
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-accent/30 transition-colors">
                      <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 7c0 5.5-3.5 8-8 8s-8-2.5-8-8c0-1.5.5-3 1.5-4.5S7 1 10 1s5.5 1.5 6.5 3S18 5.5 18 7z" />
                      </svg>
                    </div>
                    <h4 className="text-white font-semibold mb-2">Bar Service</h4>
                    <p className="text-gray-400 text-sm">Premium cocktails & beverages</p>
                  </div>
                  
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-accent/30 transition-colors">
                      <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h4 className="text-white font-semibold mb-2">Water Sports</h4>
                    <p className="text-gray-400 text-sm">Professional instruction & guidance</p>
                  </div>
                  
                  <div className="text-center group">
                    <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-accent/30 transition-colors">
                      <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </div>
                    <h4 className="text-white font-semibold mb-2">Local Excursions</h4>
                    <p className="text-gray-400 text-sm">Curated destination experiences</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Sample Menu Section - BlueOne Only */}
            {boat.name === "BlueOne" && (
              <section className="mt-16 glass p-8 shadow-xl animate-fade-in-up">
                <h2 className="text-4xl font-bold text-accent mb-8 text-center">Sample Mediterranean Menu</h2>
                <p className="text-center text-gray-300 mb-8 max-w-3xl mx-auto">
                  Chef Andreas creates a daily menu inspired by fresh, seasonal ingredients and modern Mediterranean cuisine. Below is a sample of what you might experience during your BlueOne journey.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Appetizers */}
                  <div className="bg-[#1f2937] p-6 rounded-lg border border-accent/30">
                    <h3 className="text-2xl font-semibold text-accent mb-6 text-center">Appetizers</h3>
                    <div className="space-y-4">
                      <div className="border-b border-accent/20 pb-3">
                        <h4 className="font-semibold text-white mb-1">Greek Mezze Platter</h4>
                        <p className="text-gray-300 text-sm">Tzatziki, hummus, taramasalata, olives, fresh vegetables</p>
                      </div>
                      <div className="border-b border-accent/20 pb-3">
                        <h4 className="font-semibold text-white mb-1">Grilled Calamari</h4>
                        <p className="text-gray-300 text-sm">Fresh squid with lemon, olive oil, and herbs</p>
                      </div>
                      <div className="border-b border-accent/20 pb-3">
                        <h4 className="font-semibold text-white mb-1">Seafood Ceviche</h4>
                        <p className="text-gray-300 text-sm">Fresh fish marinated in citrus with Mediterranean herbs</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">Greek Salad</h4>
                        <p className="text-gray-300 text-sm">Tomatoes, cucumber, feta, olives, red onion</p>
                      </div>
                    </div>
                  </div>

                  {/* Main Courses */}
                  <div className="bg-[#1f2937] p-6 rounded-lg border border-accent/30">
                    <h3 className="text-2xl font-semibold text-accent mb-6 text-center">Main Courses</h3>
                    <div className="space-y-4">
                      <div className="border-b border-accent/20 pb-3">
                        <h4 className="font-semibold text-white mb-1">Fresh Fish of the Day</h4>
                        <p className="text-gray-300 text-sm">Grilled local catch with lemon butter sauce</p>
                      </div>
                      <div className="border-b border-accent/20 pb-3">
                        <h4 className="font-semibold text-white mb-1">Lobster Pasta</h4>
                        <p className="text-gray-300 text-sm">Homemade pasta with fresh lobster, cherry tomatoes</p>
                      </div>
                      <div className="border-b border-accent/20 pb-3">
                        <h4 className="font-semibold text-white mb-1">Moussaka</h4>
                        <p className="text-gray-300 text-sm">Traditional layers with eggplant, meat sauce, béchamel</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">Grilled Lamb Chops</h4>
                        <p className="text-gray-300 text-sm">Herb-crusted with roasted vegetables</p>
                      </div>
                    </div>
                  </div>

                  {/* Desserts & Beverages */}
                  <div className="bg-[#1f2937] p-6 rounded-lg border border-accent/30">
                    <h3 className="text-2xl font-semibold text-accent mb-6 text-center">Desserts & Wine</h3>
                    <div className="space-y-4">
                      <div className="border-b border-accent/20 pb-3">
                        <h4 className="font-semibold text-white mb-1">Baklava</h4>
                        <p className="text-gray-300 text-sm">Honey-soaked phyllo with pistachios and walnuts</p>
                      </div>
                      <div className="border-b border-accent/20 pb-3">
                        <h4 className="font-semibold text-white mb-1">Greek Yogurt Parfait</h4>
                        <p className="text-gray-300 text-sm">Local honey, fresh berries, granola</p>
                      </div>
                      <div className="border-b border-accent/20 pb-3">
                        <h4 className="font-semibold text-white mb-1">Wine Selection</h4>
                        <p className="text-gray-300 text-sm">Greek wines: Assyrtiko, Agiorgitiko, Xinomavro</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">Fresh Fruit Platter</h4>
                        <p className="text-gray-300 text-sm">Seasonal Mediterranean fruits</p>
                      </div>
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
            )}

            {/* Complete Gallery Section */}
            <section className="mt-16 glass p-8 shadow-xl animate-fade-in-up">
              <h2 className="text-4xl font-bold text-accent mb-8 text-center">Complete BlueOne Gallery</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...blueOneExteriorImages, ...blueOneInteriorImages, ...blueOneCockpitImages].map((image: string, index: number) => (
                  <div key={index} className="glass p-2 shadow-lg animate-fade-in-up hover:scale-105 transition-transform" style={{animationDelay: `${index * 0.1}s`, animationFillMode: 'both'}}>
                    <Image
                      src={image}
                      alt={`BlueOne Gallery ${index + 1}`}
                      width={400}
                      height={300}
                      className="w-full h-64 object-cover rounded-lg border-2 border-accent/50"
                      draggable={false}
                    />
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        <div className="mt-16 text-center">
          <a 
            href={`/booking?boat=${encodeURIComponent(boat.name)}&brand=${encodeURIComponent(boat.brand)}&length=${encodeURIComponent(boat.length)}&description=${encodeURIComponent(boat.description)}&image=${encodeURIComponent(boat.image)}`}
            className="inline-block bg-accent text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-accent/90 transition-colors shadow-lg"
          >
            Request information
          </a>
        </div>
      </div>
    </div>
    </main>

    {/* Image Modal for Crew Profiles */}
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
              alt="Crew Member Profile"
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
