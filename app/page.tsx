import Image from 'next/image';
import Link from "next/link";
import adventures from "./adventures-data";
import { boats } from "./boats-data";

export default function Home() {
  // Map category names to custom heading styles
  const categoryHeadingStyles: Record<string, string> = {
    "Active & Sports": "text-cyan-700 drop-shadow-md font-extrabold italic", // energetic blue
    "Wellness & Relaxation": "text-purple-600 font-bold italic", // calming
    "Culture & History": "text-yellow-700 font-serif font-bold drop-shadow", // classic
    "Social & Family": "text-blue-700 font-bold rounded bg-blue-50 px-2 py-1", // family
    "Gastronomy": "text-red-700 font-serif font-bold", // gastronomy
  };

  function getCategoryHeadingClass(categoryName: string): string {
    return categoryHeadingStyles[categoryName] || "text-blue-800 font-bold";
  }

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
    <div>
      {/* Hero Section */}
      <section className="relative h-[75vh] flex items-center justify-center mb-16">
        <div className="glass px-12 py-16 flex flex-col items-center text-center shadow-xl border border-accent hero-glass-animate">
          <h1 className="text-6xl font-black text-accent drop-shadow-lg mb-6 tracking-tight animate-fade-in-up" style={{letterSpacing:'0.03em'}}>Exclusive Greek Sailing Experiences</h1>
          <p className="text-2xl text-gray-200 max-w-2xl mb-8 animate-fade-in-up" style={{animationDelay:'0.15s',animationFillMode:'both'}}>Sail the Aegean in style. Discover curated adventures, luxury yachts, and unforgettable moments on the water.</p>
          <Link href="/themes" className="button-premium text-xl animate-fade-in-up" style={{animationDelay:'0.3s',animationFillMode:'both'}}>Explore Themes</Link>
        </div>
        <div className="absolute inset-0 z-[-1] bg-gradient-to-br from-[#101824] to-[#1f2937] opacity-80"></div>
      </section>

      {/* Introductory Text Section */}
      <section className="w-full flex justify-center py-12 bg-white">
        <div className="max-w-4xl mx-auto bg-white/80 rounded-lg p-10 shadow text-gray-900">
          <h2 className="text-4xl font-extrabold mb-4 text-center">Discover Greece Like Never Before — With Concept Sailing</h2>
          <p className="mb-3">Embark on a private luxury sailing experience tailored just for you. Concept Sailing offers exclusive catamaran cruises around the Greek islands, each designed around a unique theme — from culinary adventures and wellness retreats to cultural explorations and family fun.</p>
          <p className="mb-3">Set sail with your loved ones and explore hidden coves, crystal-clear waters, and authentic Greek charm, all from the comfort of a premium catamaran. Whether you&apos;re dreaming of tranquil relaxation or active discovery, our themed journeys create unforgettable memories under the Aegean sun.</p>
          <p className="font-semibold text-center">Your adventure starts here we take care of everything.</p>
        </div>
      </section>

      {/* Adventure Categories */}
      <div className="max-w-6xl mx-auto">
        {adventureCategories.map((category, index) => (
          <section key={index} className={`py-16 ${index % 2 === 0 ? 'bg-transparent' : 'bg-[#151e2c]'}`}> 
            <div className="container mx-auto px-4">
              <h2 className={`text-4xl md:text-5xl font-extrabold text-center mb-12 drop-shadow-lg tracking-tight flex items-center justify-center gap-3 animate-fade-in-up text-accent`}>
                {category.category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {category.themes.map((adv) => (
                  <div key={adv.id} className="card-premium overflow-hidden flex flex-col animate-fade-in-up" style={{animationDelay:`${0.1 + Number(adv.id) * 0.07}s`,animationFillMode:'both'}}>
                    <div className="relative h-56 w-full">
                      <Image
                        src={adv.image}
                        alt={adv.name}
                        fill
                        className="object-cover rounded-t-xl"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority={true}
                      />
                    </div>
                    <div className="p-8 flex flex-col flex-grow">
                      <h3 className="text-2xl font-bold mb-3 text-accent drop-shadow animate-fade-in-up" style={{animationDelay:'0.2s',animationFillMode:'both'}}>{adv.name}</h3>
                      <p className="mb-6 text-gray-200 text-lg animate-fade-in-up" style={{animationDelay:'0.28s',animationFillMode:'both'}}>{adv.description}</p>
                      <Link href={`/themes/${adv.id}`} className="mt-auto button-premium text-center animate-fade-in-up" style={{animationDelay:'0.35s',animationFillMode:'both'}}>View Experience</Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Why Choose Us */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-blue-600">Why Choose Our Themed Adventures?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-blue-600">Tailored Experience</h3>
              <p className="text-gray-600">Choose the adventure that perfectly matches your interests</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-blue-600">Expert Guides</h3>
              <p className="text-gray-600">Skilled skippers and specialized activity instructors</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-blue-600">Unique Experiences</h3>
              <p className="text-gray-600">Carefully curated activities for each theme</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-blue-600">Ready to Start Your Greek Adventure?</h2>
          <p className="text-xl mb-8">Choose your perfect themed sailing experience today</p>
          <Link href="/themes" className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg text-lg transition-colors">
            View All Themes
          </Link>
        </div>
      </section>
    </div>
  );
}
