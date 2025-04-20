import Image from 'next/image';
import Link from "next/link";

export default function Home() {
  const adventureCategories = [
    {
      category: "Active & Sports",
      themes: [
        {
          id: "1",
          name: "Wind Sports Adventure",
          description: "Master the winds with windsurfing, kitesurfing, and sailing in the best spots of Greece",
          image: "/images/wind-sports-adventure.jpg",
          features: ["Windsurfing", "Kitesurfing", "Sailing lessons"]
        },
        {
          id: "2",
          name: "Family Sailing School",
          description: "Learn sailing together as a family with certified instructors in safe, beautiful waters",
          image: "/images/Aura-51-Fountaine-Pajot-Sailing-Catamarans-Exterior-01.jpeg",
          features: ["Basic navigation", "Safety at sea", "Hands-on experience"]
        },
        {
          id: "3",
          name: "Bike Adventure in the Islands",
          description: "Explore the Greek islands by bike, discovering hidden trails and breathtaking coastal views.",
          image: "/images/bike-adventure.jpg",
          features: ["Guided bike tours", "Mountain and road biking", "Scenic routes"]
        },
        {
          id: "4",
          name: "Trekking Adventure",
          description: "Hike through stunning landscapes, from lush hills to dramatic cliffs, across the Greek islands.",
          image: "/images/trekking-adventure.jpg",
          features: ["Guided hikes", "Nature walks", "Wildlife spotting"]
        }
      ]
    },
    {
      category: "Wellness & Relaxation",
      themes: [
        {
          id: "5",
          name: "Yoga & Wellness Retreat",
          description: "Combine sailing with daily yoga, meditation, and wellness activities for mind and body",
          image: "/images/yoga-wellness-retreat.jpg",
          features: ["Daily yoga", "Meditation", "Healthy meals"]
        },
        {
          id: "6",
          name: "Cleansing & Renewal",
          description: "A transformative journey combining sailing, detox programs, and holistic wellness",
          image: "/images/cleansing-renewal.jpg",
          features: ["Detox program", "Spa treatments", "Mindfulness"]
        }
      ]
    },
    {
      category: "Culture & History",
      themes: [
        {
          id: "7",
          name: "Greek Heritage Explorer",
          description: "Journey through time visiting ancient sites and historical landmarks by sea",
          image: "/images/greek-heritage-explorer.jpg",
          features: ["Ancient ruins", "Archaeological sites", "Expert guides"]
        },
        {
          id: "8",
          name: "Culinary Traditions",
          description: "Master Greek cooking while sailing through different regions and their unique flavors",
          image: "/images/culinary-traditions.jpg",
          features: ["Cooking classes", "Market visits", "Wine tasting"]
        }
      ]
    },
    {
      category: "Social & Family",
      themes: [
        {
          id: "9",
          name: "Family Bonding Adventure",
          description: "Create lasting memories with activities designed for the whole family",
          image: "/images/family-bonding-adventure.jpg",
          features: ["Kid-friendly activities", "Beach games", "Family challenges"]
        },
        {
          id: "10",
          name: "Island Nightlife",
          description: "Experience the vibrant nightlife of Greek islands with friends",
          image: "/images/island-nightlife.jpg",
          features: ["Beach parties", "Island hopping", "Sunset events"]
        }
      ]
    },
    {
      category: "Gastronomy",
      themes: [
        {
          id: "11",
          name: "Mediterranean Flavors",
          description: "A gastronomic journey through Greece's finest cuisines and wine regions",
          image: "/images/mediterranean-flavors.jpg",
          features: ["Food tours", "Wine tasting", "Local restaurants"]
        },
        {
          id: "12",
          name: "Greek Cooking Masters",
          description: "Learn authentic Greek recipes from local chefs while sailing the islands",
          image: "/images/greek-cooking-masters.jpg",
          features: ["Cooking workshops", "Local ingredients", "Traditional recipes"]
        }
      ]
    }
  ];

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

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center">
        <div className="absolute inset-0">
          <Image
            src="/images/hero.jpeg"
            alt="Sailing in Greece"
            fill
            className="object-cover"
            priority
            quality={85}
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        <div className="relative text-center text-white z-10 px-4">
          <h1 className="text-5xl font-bold mb-6">Choose Your Perfect Sailing Experience</h1>
          <p className="text-xl mb-8">From active adventures to cultural journeys - find your ideal Greek sailing holiday</p>
          <Link href="/themes" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors">
            Explore Themes
          </Link>
        </div>
      </section>

      {/* Adventure Categories */}
      {adventureCategories.map((category, index) => (
        <section key={index} className={`py-16 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
          <div className="container mx-auto px-4">
            <h2 className={`text-4xl md:text-5xl font-extrabold text-center mb-12 drop-shadow-lg tracking-tight flex items-center justify-center gap-3 animate-fade-in-up ${getCategoryHeadingClass(category.category)}`}>
              <svg className="w-8 h-8 text-blue-400 inline-block animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              {category.category}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {category.themes.map((theme) => (
                <div key={theme.id} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col transform transition-transform duration-300 hover:scale-[1.02]">
                  <div className="relative h-48 overflow-hidden group">
                    <Image
                      src={theme.image}
                      alt={theme.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>
                  </div>
                  <div className="p-6 flex-grow">
                    <h3 className="text-xl font-bold mb-2 text-blue-600">{theme.name}</h3>
                    <p className="text-gray-600 mb-4">{theme.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {theme.features.map((feature, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {feature}
                        </span>
                      ))}
                    </div>
                    <Link href={`/themes/${theme.id}`} className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center">
                      Learn More
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

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

// Add neon-glow utility for nightlife (optional, if not in Tailwind config)
// .neon-glow { text-shadow: 0 0 8px #a5b4fc, 0 0 16px #6366f1; }
