import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { boats } from '../../boats-data';
import Image from "next/image";

interface BoatPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BoatPageProps): Promise<Metadata> {
  const { slug } = await params;
  const boat = boats.find(b => b.name.toLowerCase().replace(/\s+/g, '-') === slug);
  
  if (!boat) {
    return {
      title: 'Boat Not Found | Concept Sailing',
      description: 'The requested boat could not be found.'
    };
  }

  return {
    title: `${boat.name} | Concept Sailing`,
    description: boat.description,
  };
}

export async function generateStaticParams() {
  return boats.map((boat) => ({
    slug: boat.name.toLowerCase().replace(/\s+/g, '-'),
  }));
}

export default async function BoatPage({ params }: BoatPageProps) {
  const { slug } = await params;
  const boat = boats.find(b => b.name.toLowerCase().replace(/\s+/g, '-') === slug);

  if (!boat) {
    notFound();
  }

  // BlueOne specific images from the blueone folder - organized by content
  const blueOneExteriorImages = boat.name === "BlueOne" ? [
    "/images/boats/blueone/IMG_7667.jpeg", // Main exterior shot
    "/images/boats/blueone/277080815_7549724425052761_8631137394407809070_n.jpeg", // Sailing exterior
    "/images/boats/blueone/3cb1b5e1-c194-4ae2-bdcd-87d1681d432d.jpg", // Exterior profile
    "/images/boats/blueone/IMG4-FP51-2.jpg.webp", // Another exterior view
    "/images/boats/blueone/WhatsApp Image 2026-03-11 at 18.33.02.jpeg", // Additional exterior
  ] : [];

  const blueOneInteriorImages = boat.name === "BlueOne" ? [
    "/images/boats/blueone/IMG_8670.jpeg", // Interior cabin/saloon
    "/images/boats/blueone/IMG_8671.jpeg", // Interior detail
    "/images/boats/blueone/8cb240ec-16e9-4574-aba4-113b3bbe3e36.jpg", // Interior galley or cabin
    "/images/boats/blueone/WhatsApp Image 2026-03-11 at 19.05.27.jpeg", // Interior view
  ] : [];

  const blueOneCockpitImages = boat.name === "BlueOne" ? [
    "/images/boats/blueone/Actu-2-Aura51-Cockpit-Table.avif", // Cockpit dining table
    "/images/boats/blueone/Actu-8-Aura51-Front-Cockpit.avif", // Front cockpit seating
    "/images/boats/blueone/IMG_8677.jpeg", // Cockpit or deck area
  ] : [];

  // Food and dining images - using available images that showcase dining experience
  const blueOneFoodImages = boat.name === "BlueOne" ? [
    "/images/boats/blueone/0038_451.12.0-Presentation-Maestro-1.png.webp", // Dining presentation
    "/images/boats/blueone/seabob-f5s-pic-1-1.jpg", // Additional lifestyle image
  ] : [];

  const blueOneChefImages = boat.name === "BlueOne" ? [
    "/images/boats/blueone/0038_451.12.0-Presentation-Maestro-1.png.webp", // Chef placeholder using local image
  ] : [];

  // Captain images for the crew section
  const blueOneCaptainImages = boat.name === "BlueOne" ? [
    "/images/boats/blueone/Cap_alif.jpg", // Captain Alif
  ] : [];

  // Activity images showing water toys and deck activities
  const blueOneActivityImages = boat.name === "BlueOne" ? [
    "/images/boats/blueone/Seabob_1.jpeg", // Seabob water toy
    "/images/boats/blueone/images.jpeg", // General activity image
  ] : [];

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#101824] to-[#1f2937] py-16">
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
              <h2 className="text-4xl font-bold text-accent mb-6">Professional Crew</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <p className="text-gray-100 leading-relaxed mb-6">
                    BlueOne is operated by a first-class professional crew dedicated to providing exceptional service 
                    and ensuring your safety and comfort throughout your journey.
                  </p>
                  <div className="space-y-6">
                    <div className="p-6 bg-accent/10 rounded-lg border border-accent/30">
                      <h3 className="text-2xl font-semibold text-accent mb-3">Local Captain</h3>
                      <div className="flex gap-4 mb-3">
                        {blueOneCaptainImages.map((image: string, index: number) => (
                          <Image
                            key={index}
                            src={image}
                            alt="Captain Ioannis Aliferis"
                            width={120}
                            height={120}
                            className="w-24 h-24 object-cover rounded-full border-2 border-accent/50"
                            draggable={false}
                          />
                        ))}
                        <div className="flex-1">
                          <p className="text-gray-200">
                           Ioannis's connection with the sea is very special — it started from a very young age and has eventually become his profession. In the meantime he finished his studies in design and construction of systems and products, gaining technical experience and strong problem-solving skills. His professional career at sea started six years ago. Through this time he has developed excellent nautical skills and in-depth knowledge of boat management, ensuring the comfort and safety of all passengers. In every weather condition, with responsibility and composure, he guarantees every guest a memorable experience.
                          </p>
                        </div>
                      </div>
                      <ul className="space-y-1 text-gray-300 text-sm">
                        <li>Ioannis Aliferis - Professional Captain</li>
                        <li>6+ years professional maritime experience</li>
                        <li>Technical background in systems design</li>
                        <li>Expert boat management and safety skills</li>
                      </ul>
                    </div>
                    <div className="p-6 bg-accent/10 rounded-lg border border-accent/30">
                      <h3 className="text-2xl font-semibold text-accent mb-3">Chef & Crew</h3>
                      <div className="flex gap-4 mb-3">
                        {blueOneChefImages.map((image: string, index: number) => (
                          <Image
                            key={index}
                            src={image}
                            alt="Chef Andreas Tsitsilianis"
                            width={120}
                            height={120}
                            className="w-24 h-24 object-cover rounded-full border-2 border-accent/50"
                            draggable={false}
                          />
                        ))}
                        <div className="flex-1">
                          <p className="text-gray-200">
                            Andreas is a highly skilled chef who brings a blend of Michelin-level precision and authentic Mediterranean soul to the sea. With a career that spans luxury hotels in Mykonos, fine-dining landmarks in Athens, and international experience in Italy and France, he is an expert at tailoring world-class culinary experiences for high-end clientele.
                          </p>
                        </div>
                      </div>
                      <ul className="space-y-1 text-gray-300 text-sm">
                        <li>Andreas Tsitsilianis - Executive Chef</li>
                        <li>Luxury hotel experience in Mykonos</li>
                        <li>Fine-dining expertise in Athens</li>
                        <li>International culinary experience (Italy & France)</li>
                        <li>Michelin-level precision with Mediterranean soul</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="p-6 bg-accent/10 rounded-lg border border-accent/30">
                    <h3 className="text-xl font-semibold text-accent mb-4">Crew Services</h3>
                    <ul className="space-y-2 text-gray-200">
                      <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>24/7 professional service</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>Daily housekeeping</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>Gourmet meal preparation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>Bar service and cocktail mixing</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>Water sports instruction</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>Local excursion planning</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent">•</span>
                        <span>Evening entertainment coordination</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

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
    </main>
  );
}
