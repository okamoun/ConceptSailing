'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useBlueOneMode } from '../../contexts/BlueOneContext';
import Image from 'next/image';
import Link from 'next/link';
import { CONTACT } from '../../config/contact';

function BookingContent() {
  const searchParams = useSearchParams();
  const { setIsBlueOneMode } = useBlueOneMode();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dates: '',
    guests: '',
    message: ''
  });

  const boat = {
    name: searchParams?.get('boat') || 'BlueOne',
    brand: searchParams?.get('brand') || 'Fountaine Pajot',
    length: searchParams?.get('length') || '51 ft',
    description: searchParams?.get('description') || 'A new-generation catamaran with a focus on eco-responsibility, solar panels, and hybrid systems.',
    image: searchParams?.get('image') || '/images/boats/blueone/External_sailing.jpg'
  };

  useEffect(() => {
    // Activate BlueOne mode (will persist across navigation)
    setIsBlueOneMode(true);
  }, [setIsBlueOneMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Booking submitted:', { ...formData, boat });
    // Redirect to confirmation page
    window.location.href = '/booking-confirmation';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <Image 
              src="/images/boats/blueone/logo_blueone.png" 
              alt="BlueOne Logo" 
              width={150} 
              height={75} 
              className="mx-auto drop-shadow-lg"
              priority
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">Book BlueOne Experience</h1>
          <p className="text-xl text-blue-700 max-w-3xl mx-auto">
            Reserve your luxury sailing adventure aboard the BlueOne catamaran
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Boat Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-blue-200">
              <div className="relative h-48 mb-6">
                <Image
                  src={boat.image}
                  alt={boat.name}
                  fill
                  className="object-cover rounded-xl"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <h2 className="text-2xl font-bold text-blue-900 mb-2">{boat.name}</h2>
              <p className="text-blue-700 font-medium mb-2">{boat.brand} {boat.length}</p>
              <p className="text-gray-600 text-sm mb-4">{boat.description}</p>
              
              <div className="border-t border-blue-200 pt-4">
                <h3 className="font-semibold text-blue-900 mb-3">Included in Your Charter:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Professional Captain & Chef</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>All Meals & Beverages</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Starlink High-Speed Internet</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Water Toys & Equipment</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Fuel & Marina Fees</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Insurance & Safety Equipment</span>
                  </li>
                </ul>
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                    </svg>
                    <span className="font-semibold text-blue-900">Stay Connected at Sea</span>
                  </div>
                  <p className="text-xs text-blue-700">
                    Enjoy Starlink high-speed internet to work remotely, stream entertainment, and share your adventures in real-time.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-200">
              <h2 className="text-3xl font-bold text-blue-900 mb-6">Booking Information</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-blue-900 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-blue-900 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-blue-900 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      placeholder={CONTACT.phone.formatted}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="guests" className="block text-sm font-medium text-blue-900 mb-2">
                      Number of Guests *
                    </label>
                    <select
                      id="guests"
                      name="guests"
                      value={formData.guests}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    >
                      <option value="">Select guests</option>
                      <option value="2">2 Guests</option>
                      <option value="4">4 Guests</option>
                      <option value="6">6 Guests</option>
                      <option value="8">8 Guests</option>
                      <option value="10">10 Guests</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="dates" className="block text-sm font-medium text-blue-900 mb-2">
                    Preferred Dates *
                  </label>
                  <input
                    type="text"
                    id="dates"
                    name="dates"
                    value={formData.dates}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    placeholder="June 15-22, 2024"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-blue-900 mb-2">
                    Special Requests or Questions
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                    placeholder="Tell us about your dream sailing experience..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg"
                  >
                    Submit Booking Request
                  </button>
                  <Link
                    href="/blueone"
                    className="flex-1 bg-gray-200 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-300 transition-colors text-center"
                  >
                    Back to BlueOne
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BlueOneBookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">
            <h1 className="text-4xl font-bold text-blue-900 mb-4">Loading Booking...</h1>
            <p className="text-gray-600">Preparing your BlueOne booking experience</p>
          </div>
        </div>
      </div>
    }>
      <BookingContent />
    </Suspense>
  );
}
