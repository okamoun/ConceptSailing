'use client';

import { useState, useEffect } from 'react';
import { CONTACT } from '../config/contact';
import { useSearchParams } from 'next/navigation';
import Image from "next/image";
import Link from 'next/link';
import { sendBookingEmail, BookingEmailData } from '../../lib/emailjs';
import adventures from '../adventures-data';

interface Boat {
  name: string;
  brand: string;
  length: string;
  description: string;
  image: string;
}

interface EmbarkationPoint {
  id: string;
  name: string;
  location: string;
  description: string;
}

export default function BookingPageContent() {
  const searchParams = useSearchParams();
  // BlueOne is the only boat now, so we set it directly
  const blueOneBoat: Boat = {
    name: "BlueOne",
    brand: "Fountaine Pajot",
    length: "51 ft",
    description: "A new-generation catamaran with a focus on eco-responsibility, solar panels, and hybrid systems. Elegant design with full safety and entertainment options for guests.",
    image: "/images/boats/fp-aura51.jpg"
  };
  
  const [selectedDate, setSelectedDate] = useState('');
  const [passengers, setPassengers] = useState(8);
  const [embarkationPoint, setEmbarkationPoint] = useState('nea-peramos');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [holidayDescription, setHolidayDescription] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Embarkation points around Athens
  const embarkationPoints: EmbarkationPoint[] = [
    {
      id: 'nea-peramos',
      name: 'Nea Peramos Marina',
      location: 'Athens Coast',
      description: 'Beautiful coastal marina with easy access to Saronic Gulf islands'
    },
    {
      id: 'piraeus',
      name: 'Piraeus Marina',
      location: 'Athens',
      description: 'Main port of Athens with excellent facilities and transport links'
    },
    {
      id: 'flisvos',
      name: 'Flisvos Marina',
      location: 'Athens',
      description: 'Premium marina near the city center with modern amenities'
    },
    {
      id: 'alimos',
      name: 'Alimos Marina',
      location: 'Athens',
      description: 'Largest marina in Greece with full services and easy access'
    },
    {
      id: 'glyfada',
      name: 'Glyfada Marina',
      location: 'Athens Riviera',
      description: 'Upscale marina in the prestigious Athens Riviera area'
    },
    {
      id: 'vouliagmeni',
      name: 'Lake Vouliagmeni',
      location: 'Athens Coast',
      description: 'Scenic coastal location with natural beauty and calm waters'
    }
  ];

  // Boat capacity mapping
  const boatCapacities: { [key: string]: { min: number; max: number } } = {
    'fountaine-pajot-saba-50': { min: 1, max: 10 },
    'blueone': { min: 1, max: 10 },
    'lagoon-55': { min: 1, max: 10 }
  };

  useEffect(() => {
    // BlueOne is the only boat, so we don't need URL parameter logic
    // We could still check for theme or other parameters if needed
    if (searchParams) {
      const themeParam = searchParams.get('theme');
      if (themeParam) {
        setSelectedTheme(themeParam);
      }
    }
  }, [searchParams]);

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    return maxDate.toISOString().split('T')[0];
  };

  const getBoatCapacity = () => {
    return boatCapacities['blueone'];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!name || !email || !phone || !selectedDate || !embarkationPoint) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    const capacity = getBoatCapacity();
    if (passengers < capacity.min || passengers > capacity.max) {
      alert(`Number of passengers must be between ${capacity.min} and ${capacity.max}`);
      return;
    }

    // Start submission
    setIsSubmitting(true);

    try {
      // Create booking data
      const bookingData: BookingEmailData = {
        name: name,
        email: email,
        phone: phone,
        boat: blueOneBoat.name,
        date: selectedDate,
        passengers: passengers,
        embarkationPoint: embarkationPoints.find(point => point.id === embarkationPoint)?.name || '',
        holidayDescription: holidayDescription || undefined,
        selectedTheme: selectedTheme ? adventures.find(a => a.id === selectedTheme)?.name : undefined,
        timestamp: new Date().toISOString()
      };

      // Send email via EmailJS
      const emailResponse = await sendBookingEmail(bookingData);

      // Check if email was sent successfully
      if (emailResponse.status === 'success') {
        // Store booking data for confirmation page
        localStorage.setItem('pendingBooking', JSON.stringify(bookingData));
        localStorage.setItem('emailStatus', JSON.stringify({
          status: emailResponse.status,
          message: emailResponse.message
        }));
        
        // Redirect to confirmation page
        window.location.href = '/booking-confirmation';
      } else {
        // Handle email sending error
        alert(`There was an error sending your request: ${emailResponse.message}. Please try again or contact us directly.`);
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('An unexpected error occurred. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  
  const capacity = getBoatCapacity();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Link href="/blueone" className="text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-2">
            &larr; Back to BlueOne
          </Link>
        </div>

        <div className="glass p-8 shadow-xl">
          <h1 className="text-4xl font-bold text-blue-900 mb-8 text-center">Book Your BlueOne Experience</h1>
          
          {/* Boat Summary */}
          <div className="mb-8 p-6 bg-blue-100 rounded-lg border border-blue-200">
            <div className="flex items-center gap-6">
              <Image
                src={blueOneBoat.image}
                alt={blueOneBoat.name}
                width={120}
                height={80}
                className="w-32 h-20 object-cover rounded-lg border-2 border-blue-300"
                draggable={false}
              />
              <div>
                <h2 className="text-2xl font-bold text-blue-900">{blueOneBoat.name}</h2>
                <p className="text-gray-700">{blueOneBoat.brand} - {blueOneBoat.length}</p>
                <p className="text-gray-600 text-sm mt-1">{blueOneBoat.description}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Contact Information */}
            <div>
              <h3 className="text-xl font-semibold text-blue-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-semibold text-blue-900 mb-3">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full p-3 rounded-lg bg-white border border-blue-300 text-gray-900 focus:border-blue-500 focus:outline-none"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-lg font-semibold text-blue-900 mb-3">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-3 rounded-lg bg-white border border-blue-300 text-gray-900 focus:border-blue-500 focus:outline-none"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-lg font-semibold text-blue-900 mb-3">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg bg-white border border-blue-300 text-gray-900 focus:border-blue-500 focus:outline-none"
                  placeholder={CONTACT.phone.formatted}
                />
              </div>
            </div>

            {/* Charter Details */}
            <div>
              <h3 className="text-xl font-semibold text-blue-900 mb-4">Charter Details</h3>
            {/* Date Selection */}
            <div>
              <label className="block text-lg font-semibold text-blue-900 mb-3">
                Charter Date *
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={getTodayDate()}
                max={getMaxDate()}
                required
                className="w-full p-3 rounded-lg bg-white border border-blue-300 text-gray-900 focus:border-blue-500 focus:outline-none"
              />
              <p className="text-gray-600 text-sm mt-2">
                Select your preferred charter date (bookings available up to 1 year in advance)
              </p>
            </div>

            {/* Passenger Selection */}
            <div>
              <label className="block text-lg font-semibold text-blue-900 mb-3">
                Number of Passengers *
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={passengers}
                  onChange={(e) => setPassengers(parseInt(e.target.value) || 1)}
                  min={capacity.min}
                  max={capacity.max}
                  required
                  className="w-32 p-3 rounded-lg bg-white border border-blue-300 text-gray-900 focus:border-blue-500 focus:outline-none"
                />
                <span className="text-gray-700">
                  (Capacity: {capacity.min} - {capacity.max} guests)
                </span>
              </div>
              <p className="text-gray-600 text-sm mt-2">
                This {blueOneBoat.name.toLowerCase()} can accommodate up to {capacity.max} guests comfortably
              </p>
            </div>

            {/* Embarkation Point Selection */}
            <div>
              <label className="block text-lg font-semibold text-blue-900 mb-3">
                Embarkation Point *
              </label>
              <select
                value={embarkationPoint}
                onChange={(e) => setEmbarkationPoint(e.target.value)}
                required
                className="w-full p-3 rounded-lg bg-white border border-blue-300 text-gray-900 focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select embarkation point</option>
                {embarkationPoints.map((point) => (
                  <option key={point.id} value={point.id}>
                    {point.name} - {point.location}
                  </option>
                ))}
              </select>
              <p className="text-gray-600 text-sm mt-2">
                Choose your preferred starting location for your Greek sailing adventure
              </p>
            </div>

            {/* Embarkation Point Details */}
            {embarkationPoint && (
              <div className="p-4 bg-blue-100 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  {embarkationPoints.find(p => p.id === embarkationPoint)?.name}
                </h3>
                <p className="text-gray-700">
                  {embarkationPoints.find(p => p.id === embarkationPoint)?.description}
                </p>
              </div>
            )}

            {/* Holiday Preferences */}
            <div>
              <h3 className="text-xl font-semibold text-blue-900 mb-4">Holiday Preferences</h3>
              
              {/* Holiday Description */}
              <div className="mb-6">
                <label className="block text-lg font-semibold text-blue-900 mb-3">
                  Describe Your Ideal Holiday
                </label>
                <textarea
                  value={holidayDescription}
                  onChange={(e) => setHolidayDescription(e.target.value)}
                  rows={4}
                  className="w-full p-3 rounded-lg bg-white border border-blue-300 text-gray-900 focus:border-blue-500 focus:outline-none resize-none"
                  placeholder="Tell us about your ideal sailing holiday - activities you enjoy, places you'd like to visit, special occasions, etc..."
                />
                <p className="text-gray-600 text-sm mt-2">
                  Help us customize your perfect sailing experience (optional)
                </p>
              </div>

              {/* Adventure Theme Selection */}
              <div>
                <label className="block text-lg font-semibold text-blue-900 mb-3">
                  Preferred Adventure Theme
                </label>
                <select
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(e.target.value)}
                  className="w-full p-3 rounded-lg bg-white border border-blue-300 text-gray-900 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select a theme (optional)</option>
                  {adventures.map((adventure) => (
                    <option key={adventure.id} value={adventure.id}>
                      {adventure.name}
                    </option>
                  ))}
                </select>
                <p className="text-gray-600 text-sm mt-2">
                  Choose from our curated adventure themes or leave blank for a custom experience
                </p>
              </div>

              {/* Selected Theme Description */}
              {selectedTheme && (
                <div className="mt-4 p-4 bg-blue-100 rounded-lg border border-blue-200">
                  <h4 className="text-lg font-semibold text-blue-900 mb-2">
                    {adventures.find(a => a.id === selectedTheme)?.name}
                  </h4>
                  <p className="text-gray-700 text-sm">
                    {adventures.find(a => a.id === selectedTheme)?.description}
                  </p>
                </div>
              )}
            </div>

            </div>

            {/* Booking Summary */}
            <div className="p-6 bg-blue-100 rounded-lg border border-blue-200">
              <h3 className="text-xl font-semibold text-blue-900 mb-4">Information Request Summary</h3>
              
              {/* Contact Information */}
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-blue-900 mb-2">Contact Information</h4>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span>Name:</span>
                    <span className="text-gray-900 font-medium">{name || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span className="text-gray-900 font-medium">{email || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phone:</span>
                    <span className="text-gray-900 font-medium">{phone || 'Not provided'}</span>
                  </div>
                </div>
              </div>
              
              {/* Charter Details */}
              <div>
                <h4 className="text-lg font-semibold text-blue-900 mb-2">Charter Details</h4>
                <div className="space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span>Boat:</span>
                    <span className="text-gray-900 font-medium">{blueOneBoat.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span className="text-gray-900 font-medium">{selectedDate || 'Not selected'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Passengers:</span>
                    <span className="text-gray-900 font-medium">{passengers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Embarkation:</span>
                    <span className="text-gray-900 font-medium">
                      {embarkationPoints.find(p => p.id === embarkationPoint)?.name || 'Not selected'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Holiday Preferences */}
              {(holidayDescription || selectedTheme) && (
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-blue-900 mb-2">Holiday Preferences</h4>
                  <div className="space-y-2 text-gray-700">
                    {holidayDescription && (
                      <div>
                        <span className="font-medium text-blue-900">Ideal Holiday:</span>
                        <p className="text-gray-900 mt-1 text-sm">{holidayDescription}</p>
                      </div>
                    )}
                    {selectedTheme && (
                      <div className="flex justify-between">
                        <span>Preferred Theme:</span>
                        <span className="text-gray-900 font-medium">
                          {adventures.find(a => a.id === selectedTheme)?.name || 'Not selected'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-accent text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-accent/90 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-accent"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending Request...</span>
                  </div>
                ) : (
                  'Send Information Request'
                )}
              </button>
              {isSubmitting && (
                <p className="text-gray-400 text-sm mt-2">
                  Please wait while we send your request and confirmation emails...
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
