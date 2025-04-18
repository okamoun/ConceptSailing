import Image from 'next/image';

export default function Home() {
  const adventureCategories = [
    {
      category: "Active & Sports",
      themes: [
        {
          id: 1,
          name: "Wind Sports Adventure",
          description: "Master the winds with windsurfing, kitesurfing, and sailing in the best spots of Greece",
          image: "https://images.unsplash.com/photo-1712167959870-0bf3d9cae41a?auto=format&fit=crop&w=800&q=80",
          features: ["Windsurfing", "Kitesurfing", "Sailing lessons"]
        },
        {
          id: 2,
          name: "Family Sailing School",
          description: "Learn sailing together as a family with certified instructors in safe, beautiful waters",
          image: "https://images.unsplash.com/photo-1542397284384-6010376c5337?auto=format&fit=crop&w=800&q=80",
          features: ["Basic navigation", "Safety at sea", "Hands-on experience"]
        }
      ]
    },
    {
      category: "Wellness & Relaxation",
      themes: [
        {
          id: 3,
          name: "Yoga & Wellness Retreat",
          description: "Combine sailing with daily yoga, meditation, and wellness activities for mind and body",
          image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
          features: ["Daily yoga", "Meditation", "Healthy meals"]
        },
        {
          id: 4,
          name: "Cleansing & Renewal",
          description: "A transformative journey combining sailing, detox programs, and holistic wellness",
          image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
          features: ["Detox program", "Spa treatments", "Mindfulness"]
        }
      ]
    },
    {
      category: "Culture & History",
      themes: [
        {
          id: 5,
          name: "Greek Heritage Explorer",
          description: "Journey through time visiting ancient sites and historical landmarks by sea",
          image: "https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?auto=format&fit=crop&w=800&q=80",
          features: ["Ancient ruins", "Archaeological sites", "Expert guides"]
        },
        {
          id: 6,
          name: "Culinary Traditions",
          description: "Master Greek cooking while sailing through different regions and their unique flavors",
          image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
          features: ["Cooking classes", "Market visits", "Wine tasting"]
        }
      ]
    },
    {
      category: "Social & Family",
      themes: [
        {
          id: 7,
          name: "Family Bonding Adventure",
          description: "Create lasting memories with activities designed for the whole family",
          image: "https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?auto=format&fit=crop&w=800&q=80",
          features: ["Kid-friendly activities", "Beach games", "Family challenges"]
        },
        {
          id: 8,
          name: "Island Nightlife",
          description: "Experience the vibrant nightlife of Greek islands with friends",
          image: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=800&q=80",
          features: ["Beach parties", "Island hopping", "Sunset events"]
        }
      ]
    },
    {
      category: "Gastronomy",
      themes: [
        {
          id: 9,
          name: "Mediterranean Flavors",
          description: "A gastronomic journey through Greece's finest cuisines and wine regions",
          image: "https://images.unsplash.com/photo-1523294587484-bae6cc870010?auto=format&fit=crop&w=800&q=80",
          features: ["Food tours", "Wine tasting", "Local restaurants"]
        },
        {
          id: 10,
          name: "Greek Cooking Masters",
          description: "Learn authentic Greek recipes from local chefs while sailing the islands",
          image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80",
          features: ["Cooking workshops", "Local ingredients", "Traditional recipes"]
        }
      ]
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80"
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
          <a href="/themes" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors">
            Explore Themes
          </a>
        </div>
      </section>

      {/* Adventure Categories */}
      {adventureCategories.map((category, index) => (
        <section key={index} className={`py-16 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
          <div className="container mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-12 bg-gradient-to-r from-blue-500 via-cyan-400 to-green-400 bg-clip-text text-transparent drop-shadow-lg tracking-tight flex items-center justify-center gap-3 animate-fade-in-up">
              <svg className="w-8 h-8 text-blue-400 inline-block animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" /></svg>
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
                    <h3 className="text-xl font-bold mb-2">{theme.name}</h3>
                    <p className="text-gray-600 mb-4">{theme.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {theme.features.map((feature, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                          {feature}
                        </span>
                      ))}
                    </div>
                    <a href={`/themes/${theme.id}`} className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center">
                      Discover More <span className="ml-2">→</span>
                    </a>
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
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Themed Adventures?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Tailored Experience</h3>
              <p className="text-gray-600">Choose the adventure that perfectly matches your interests</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Expert Guides</h3>
              <p className="text-gray-600">Skilled skippers and specialized activity instructors</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Unique Experiences</h3>
              <p className="text-gray-600">Carefully curated activities for each theme</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Greek Adventure?</h2>
          <p className="text-xl mb-8">Choose your perfect themed sailing experience today</p>
          <a href="/themes" className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg text-lg transition-colors">
            View All Themes
          </a>
        </div>
      </section>
    </div>
  );
}
