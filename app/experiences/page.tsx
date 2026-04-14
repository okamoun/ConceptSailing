import type { Metadata } from 'next';
import Image from 'next/image';
import Link from "next/link";
import adventures from "../adventures-data";
import { featureIconMap } from "../feature-icons";

export const metadata: Metadata = {
  title: 'Greek Sailing Adventures | Themed Yacht Experiences',
  description: 'Discover curated themed sailing adventures in Greece. From culinary journeys to wellness retreats, find the perfect Greek island experience tailored to your interests.',
  keywords: ['Greek sailing adventures', 'themed yacht experiences', 'Greek islands tours', 'sailing holidays Greece', 'cultural sailing trips', 'wellness retreats Greece'],
  openGraph: {
    title: 'Greek Sailing Adventures | Themed Yacht Experiences',
    description: 'Discover curated themed sailing adventures in Greece. From culinary journeys to wellness retreats, find the perfect Greek island experience.',
    type: 'website',
    url: 'https://blueone-yacht.com/experiences',
    images: [
      {
        url: '/images/boats/blueone/External_sailing.jpg',
        width: 1200,
        height: 630,
        alt: 'Greek Sailing Adventures - Luxury Yacht Experiences',
      },
    ],
  },
};

export default function ExperiencesPage() {
  // Map adventure categories and themes using the correct IDs and names from adventures-data.ts
  const adventureCategories = [
    {
      category: "Active & Sports",
      themes: [
        adventures.find(a => a.id === "1"), // Wind Sports  Adventure
        adventures.find(a => a.id === "2"), // Family Sailing School
        adventures.find(a => a.id === "12"), // Greek Islands Family Bike Adventure
      ].filter((adv): adv is typeof adventures[number] => Boolean(adv))
    },
    {
      category: "Wellness & Relaxation",
      themes: [
        adventures.find(a => a.id === "3"), // Yoga & Wellness Retreat
        adventures.find(a => a.id === "4"), // Cleansing & Renewal
      ].filter((adv): adv is typeof adventures[number] => Boolean(adv))
    },
    {
      category: "Culture & History",
      themes: [
        adventures.find(a => a.id === "5"), // Greek Heritage Explorer
        adventures.find(a => a.id === "9"), // Sephardic Heritage Sailing: Thessaloniki & Beyond
      ].filter((adv): adv is typeof adventures[number] => Boolean(adv))
    },
    {
      category: "Food",
      themes: [
        adventures.find(a => a.id === "6"), // Culinary Traditions
        adventures.find(a => a.id === "10"), // Mediterranean Flavors
        adventures.find(a => a.id === "11"), // Greek Cooking Masters
      ].filter((adv): adv is typeof adventures[number] => Boolean(adv))
    },
    {
      category: "Social & Family",
      themes: [
        adventures.find(a => a.id === "7"), // Family Bonding Adventure
        adventures.find(a => a.id === "8"), // Island Nightlife
      ].filter((adv): adv is typeof adventures[number] => Boolean(adv))
    },
    {
      category: "Nature & Sea",
      themes: [
        adventures.find(a => a.id === "13"), // Ionian Fishing & Island Discovery
      ].filter((adv): adv is typeof adventures[number] => Boolean(adv))
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      {/* Hero Section for Experiences */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-800/80 to-blue-900/70"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="glass p-8 md:p-16 max-w-4xl mx-auto animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gradient mb-6">
              Greek Sailing Adventures
            </h1>
            <p className="text-xl md:text-2xl lg:text-3xl text-gray-700 font-medium mb-6 animate-fade-in-up" style={{animationDelay:'0.1s',animationFillMode:'both'}}>
              Curated themed experiences across the Greek islands
            </p>
            <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{animationDelay:'0.2s',animationFillMode:'both'}}>
              From culinary journeys to wellness retreats, discover the perfect sailing adventure tailored to your interests. 
              Each theme offers unique experiences crafted by local experts.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up" style={{animationDelay:'0.3s',animationFillMode:'both'}}>
              <Link 
                href="/destinations" 
                className="btn-primary text-lg px-8 py-4"
              >
                View Destinations
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Adventure Categories */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        {adventureCategories.map((category, index) => (
          <section key={index} className={`py-16 ${index % 2 === 0 ? 'bg-transparent' : 'bg-white/5'}`}> 
            <div className="container mx-auto px-4">
              <h2 className={`text-4xl md:text-5xl font-bold text-gradient mb-16 text-center animate-fade-in-up`}>
                {category.category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {category.themes.map((adv) => (
                  <div key={adv.id} className="card-modern p-8 text-center animate-fade-in-up hover:bg-white/15 transition-all duration-300" style={{animationDelay:`${0.1 + Number(adv.id) * 0.07}s`,animationFillMode:'both'}}>
                    <div className="relative h-56 w-full mb-6">
                      <Image
                        src={adv.image}
                        alt={adv.name}
                        fill
                        className="object-cover rounded-lg"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority={true}
                      />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 animate-fade-in-up" style={{animationDelay:'0.2s',animationFillMode:'both'}}>{adv.name}</h3>
                    <p className="mb-6 text-gray-600 text-lg leading-relaxed animate-fade-in-up" style={{animationDelay:'0.28s',animationFillMode:'both'}}>{adv.description}</p>
                    {adv.features && adv.features.length > 0 && (
                      <ul className="mb-6 flex flex-wrap gap-2 justify-center animate-fade-in-up" style={{animationDelay:'0.32s',animationFillMode:'both'}}>
                        {adv.features.map((feature: string, idx: number) => (
                          <li
                            key={idx}
                            className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm font-semibold border border-blue-200"
                          >
                            <span>{featureIconMap[feature]}</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <Link href={`/themes/${adv.id}`} className="btn-secondary mt-auto animate-fade-in-up" style={{animationDelay:'0.35s',animationFillMode:'both'}}>View Experience</Link>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Destinations Preview */}
      <section className="py-20 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-6">Discover Greek Destinations</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From hidden coves to vibrant harbors, each Greek island offers unique beauty and authentic experiences
            </p>
          </div>
          <div className="text-center">
            <Link 
              href="/destinations" 
              className="btn-primary text-lg px-8 py-4"
            >
              Explore All Destinations
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Alternative Entry Point */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="glass p-8 md:p-16 max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Prefer a Luxury Yacht Experience?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Discover our flagship BlueOne catamaran - the ultimate in luxury sailing
            </p>
            <Link 
              href="/" 
              className="btn-primary bg-white text-blue-600 hover:bg-gray-50"
            >
              Explore BlueOne Yacht
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
