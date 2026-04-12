import Image from 'next/image';
import Link from "next/link";
import adventures from "../adventures-data";
import { featureIconMap } from "../feature-icons";

export default function ExperiencesPage() {
  // Map adventure categories and themes using the correct IDs and names from adventures-data.ts
  const adventureCategories = [
    {
      category: "Active & Sports",
      themes: [
        adventures.find(a => a.id === "1"), // Wind Sports  Adventure
        adventures.find(a => a.id === "2"), // Family Sailing School
        adventures.find(a => a.id === "11"), // Greek Islands Family Bike Adventure
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
        adventures.find(a => a.id === "9"), // Mediterranean Natural Flavors
        adventures.find(a => a.id === "10"), // Greek Cooking Masters
      ].filter((adv): adv is typeof adventures[number] => Boolean(adv))
    },
    {
      category: "Social & Family",
      themes: [
        adventures.find(a => a.id === "7"), // Family Bonding Adventure
        adventures.find(a => a.id === "8"), // Island Nightlife
      ].filter((adv): adv is typeof adventures[number] => Boolean(adv))
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      {/* Hero Section for Experiences */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-indigo-900/80 to-blue-900/70"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-16 shadow-2xl border border-white/20">
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 animate-fade-in-up">
              Greek Sailing Adventures
            </h1>
            <p className="text-2xl md:text-3xl text-purple-200 mb-8 animate-fade-in-up" style={{animationDelay:'0.1s',animationFillMode:'both'}}>
              Curated themed experiences across the Greek islands
            </p>
            <p className="text-lg md:text-xl text-purple-100 mb-12 max-w-3xl mx-auto animate-fade-in-up" style={{animationDelay:'0.2s',animationFillMode:'both'}}>
              From culinary journeys to wellness retreats, discover the perfect sailing adventure tailored to your interests. 
              Each theme offers unique experiences crafted by local experts.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up" style={{animationDelay:'0.3s',animationFillMode:'both'}}>
              <Link 
                href="/destinations" 
                className="bg-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-purple-700 transition-colors shadow-lg"
              >
                View Destinations
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
              <h2 className={`text-4xl md:text-5xl font-extrabold text-center mb-16 tracking-tight animate-fade-in-up text-white`}>
                {category.category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {category.themes.map((adv) => (
                  <div key={adv.id} className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden flex flex-col animate-fade-in-up hover:bg-white/15 transition-all duration-300 border border-white/20" style={{animationDelay:`${0.1 + Number(adv.id) * 0.07}s`,animationFillMode:'both'}}>
                    <div className="relative h-56 w-full">
                      <Image
                        src={adv.image}
                        alt={adv.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority={true}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent"></div>
                    </div>
                    <div className="p-8 flex flex-col flex-grow">
                      <h3 className="text-2xl font-bold mb-3 text-white animate-fade-in-up" style={{animationDelay:'0.2s',animationFillMode:'both'}}>{adv.name}</h3>
                      <p className="mb-6 text-purple-100 text-lg animate-fade-in-up" style={{animationDelay:'0.28s',animationFillMode:'both'}}>{adv.description}</p>
                      {adv.features && adv.features.length > 0 && (
                        <ul className="mb-6 flex flex-wrap gap-2 animate-fade-in-up" style={{animationDelay:'0.32s',animationFillMode:'both'}}>
                          {adv.features.map((feature: string, idx: number) => (
                            <li
                              key={idx}
                              className="inline-flex items-center gap-2 bg-purple-600/30 text-purple-100 rounded-full px-3 py-1 text-sm font-semibold border border-purple-400/30 backdrop-blur-sm"
                            >
                              <span>{featureIconMap[feature]}</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      <Link href={`/themes/${adv.id}`} className="mt-auto bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold text-center hover:bg-purple-700 transition-colors animate-fade-in-up" style={{animationDelay:'0.35s',animationFillMode:'both'}}>View Experience</Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Destinations Preview */}
      <section className="py-20 bg-white/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Discover Greek Destinations</h2>
            <p className="text-xl text-purple-200 max-w-3xl mx-auto">
              From hidden coves to vibrant harbors, each Greek island offers unique beauty and authentic experiences
            </p>
          </div>
          <div className="text-center">
            <Link 
              href="/destinations" 
              className="inline-block bg-white text-purple-900 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-purple-50 transition-colors shadow-lg"
            >
              Explore All Destinations
            </Link>
          </div>
        </div>
      </section>

      {/* Alternative Entry Point */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-6">Prefer a Luxury Yacht Experience?</h2>
            <p className="text-xl text-purple-200 mb-8">
              Discover our flagship BlueOne catamaran - the ultimate in luxury sailing
            </p>
            <Link 
              href="/" 
              className="inline-block bg-white text-purple-900 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-purple-50 transition-colors"
            >
              Explore BlueOne Yacht
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
