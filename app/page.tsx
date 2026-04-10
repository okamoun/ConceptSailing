import Image from 'next/image';
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Hero Section with BlueOne Focus */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/boats/blueone/External_sailing.jpg"
            alt="BlueOne Sailing"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-blue-900/40 to-blue-900/60"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-blue-100">
            <h1 className="text-5xl md:text-7xl font-bold text-blue-900 mb-6 animate-fade-in-up">
              BlueOne
            </h1>
            <p className="text-2xl md:text-3xl text-blue-700 mb-4 animate-fade-in-up" style={{animationDelay:'0.1s',animationFillMode:'both'}}>
              Premium Luxury Catamaran
            </p>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto animate-fade-in-up" style={{animationDelay:'0.2s',animationFillMode:'both'}}>
              Experience the ultimate Greek sailing adventure aboard our eco-friendly Fountaine Pajot catamaran. 
              Luxury, comfort, and sustainability in perfect harmony.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{animationDelay:'0.3s',animationFillMode:'both'}}>
              <Link 
                href="/blueone" 
                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg"
              >
                Explore BlueOne
              </Link>
              <Link 
                href="/booking?boat=BlueOne&brand=Fountaine%20Pajot&length=51%20ft&description=A%20new-generation%20catamaran%20with%20a%20focus%20on%20eco-responsibility,%20solar%20panels,%20and%20hybrid%20systems.%20Elegant%20design%20with%20full%20safety%20and%20entertainment%20options%20for%20guests.&image=/images/boats/fp-aura51.jpg"
                className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-colors"
              >
                Book Your Journey
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Features */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-blue-900 mb-16">Why Choose BlueOne?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Eco-Friendly</h3>
              <p className="text-gray-600">Solar panels, hybrid systems, and sustainable sailing technology for minimal environmental impact</p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Premium Comfort</h3>
              <p className="text-gray-600">Spacious cabins, modern amenities, and luxury furnishings for the ultimate sailing experience</p>
            </div>
            <div className="text-center group">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Expert Crew</h3>
              <p className="text-gray-600">Professional captain and gourmet chef dedicated to your safety and exceptional service</p>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Entry Points */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-blue-900 mb-4">More Adventures Await</h2>
          <p className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto">
            Beyond our flagship BlueOne, discover themed experiences and destinations across the Greek islands
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link 
              href="/themes" 
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-blue-300"
            >
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mr-4 group-hover:bg-purple-200 transition-colors">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">Themed Adventures</h3>
                  <p className="text-gray-600">Curated sailing experiences</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                From culinary journeys to wellness retreats, explore our collection of themed sailing adventures designed around your interests.
              </p>
              <div className="text-purple-600 font-semibold flex items-center group-hover:translate-x-2 transition-transform">
                Explore Themes
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </Link>

            <Link 
              href="/destinations" 
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-blue-300"
            >
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mr-4 group-hover:bg-green-200 transition-colors">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">Destinations</h3>
                  <p className="text-gray-600">Greek island paradise</p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Discover the stunning Greek islands, from hidden coves to vibrant harbors. Each destination offers unique beauty and authentic experiences.
              </p>
              <div className="text-green-600 font-semibold flex items-center group-hover:translate-x-2 transition-transform">
                View Destinations
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </Link>
          </div>

          <div className="text-center mt-12">
            <Link 
              href="/boats" 
              className="inline-block bg-gray-800 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-900 transition-colors"
            >
              View All Boats
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready for Your Greek Adventure?</h2>
          <p className="text-xl mb-8">Book BlueOne or explore our themed experiences for an unforgettable journey</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/booking?boat=BlueOne&brand=Fountaine%20Pajot&length=51%20ft&description=A%20new-generation%20catamaran%20with%20a%20focus%20on%20eco-responsibility,%20solar%20panels,%20and%20hybrid%20systems.%20Elegant%20design%20with%20full%20safety%20and%20entertainment%20options%20for%20guests.&image=/images/boats/fp-aura51.jpg"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              Book BlueOne Now
            </Link>
            <Link 
              href="/contact" 
              className="bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-800 transition-colors border-2 border-blue-500"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
