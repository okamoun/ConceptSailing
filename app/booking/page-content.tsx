'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { CONTACT } from '../config/contact';
import { useSearchParams } from 'next/navigation';
import Image from "next/image";
import Link from 'next/link';
import { sendBookingEmail, BookingEmailData } from '../../lib/emailjs';
import adventures from '../adventures-data';
import { marinasByRegion, getMarinaById, DEFAULT_MARINA_ID } from '../marinas-data';

const MarinaMap = dynamic(() => import('../components/MarinaMap'), { ssr: false });

interface Boat {
  name: string;
  brand: string;
  length: string;
  description: string;
  image: string;
}

export default function BookingPageContent() {
  const searchParams = useSearchParams();
  const blueOneBoat: Boat = {
    name: "BlueOne",
    brand: "Fountaine Pajot",
    length: "51 ft",
    description: "A new-generation catamaran with a focus on eco-responsibility, solar panels, and hybrid systems. Elegant design with full safety and entertainment options for guests.",
    image: "/images/boats/fp-aura51.jpg"
  };

  const [selectedDate, setSelectedDate] = useState('');
  const [passengers, setPassengers] = useState(8);
  const [deliveryPoint, setDeliveryPoint] = useState(DEFAULT_MARINA_ID);
  const [redeliveryPoint, setRedeliveryPoint] = useState(DEFAULT_MARINA_ID);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [holidayDescription, setHolidayDescription] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const regionGroups = marinasByRegion();

  useEffect(() => {
    if (searchParams) {
      const themeParam = searchParams.get('theme');
      if (themeParam) setSelectedTheme(themeParam);
    }
  }, [searchParams]);

  const getTodayDate = () => new Date().toISOString().split('T')[0];
  const getMaxDate = () => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  };

  const capacity = { min: 1, max: 10 };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !phone || !selectedDate || !deliveryPoint || !redeliveryPoint) {
      alert('Please fill in all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    if (passengers < capacity.min || passengers > capacity.max) {
      alert(`Number of passengers must be between ${capacity.min} and ${capacity.max}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const deliveryMarina = getMarinaById(deliveryPoint);
      const redeliveryMarina = getMarinaById(redeliveryPoint);

      const bookingData: BookingEmailData = {
        name,
        email,
        phone,
        boat: blueOneBoat.name,
        date: selectedDate,
        passengers,
        embarkationPoint: deliveryMarina?.name || deliveryPoint,
        deliveryPoint: deliveryMarina?.name || deliveryPoint,
        redeliveryPoint: redeliveryMarina?.name || redeliveryPoint,
        holidayDescription: holidayDescription || undefined,
        selectedTheme: selectedTheme ? adventures.find(a => a.id === selectedTheme)?.name : undefined,
        timestamp: new Date().toISOString()
      };

      const emailResponse = await sendBookingEmail(bookingData);

      if (emailResponse.status === 'success') {
        localStorage.setItem('pendingBooking', JSON.stringify(bookingData));
        localStorage.setItem('emailStatus', JSON.stringify({ status: emailResponse.status, message: emailResponse.message }));
        window.location.href = '/booking-confirmation';
      } else {
        alert(`There was an error sending your request: ${emailResponse.message}. Please try again or contact us directly.`);
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('An unexpected error occurred. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deliveryMarina = getMarinaById(deliveryPoint);
  const redeliveryMarina = getMarinaById(redeliveryPoint);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-16">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Link href="/blueone" className="text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-2">
            &larr; Back to BlueOne
          </Link>
        </div>

        <div className="glass p-8 shadow-xl">
          <h1 className="text-4xl font-bold text-blue-900 mb-8 text-center">Contact us to prepare your next dream experience</h1>

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
                  <label className="block text-lg font-semibold text-blue-900 mb-3">Full Name *</label>
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
                  <label className="block text-lg font-semibold text-blue-900 mb-3">Email Address *</label>
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
                <label className="block text-lg font-semibold text-blue-900 mb-3">Phone Number *</label>
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
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-blue-900">Charter Details</h3>

              {/* Date */}
              <div>
                <label className="block text-lg font-semibold text-blue-900 mb-3">Charter Date *</label>
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

              {/* Passengers */}
              <div>
                <label className="block text-lg font-semibold text-blue-900 mb-3">Number of Passengers *</label>
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
                  <span className="text-gray-700">(Capacity: {capacity.min}–{capacity.max} guests)</span>
                </div>
              </div>

              {/* Place of Delivery */}
              <div>
                <label className="block text-lg font-semibold text-blue-900 mb-3">Place of Delivery *</label>
                <p className="text-gray-600 text-sm mb-3">Where you will board the yacht at the start of your charter.</p>
                <select
                  value={deliveryPoint}
                  onChange={(e) => setDeliveryPoint(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg bg-white border border-blue-300 text-gray-900 focus:border-blue-500 focus:outline-none mb-4"
                >
                  {Object.entries(regionGroups).map(([region, ms]) => (
                    <optgroup key={region} label={region}>
                      {ms.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {deliveryMarina && (
                  <div className="rounded-lg overflow-hidden border border-blue-200">
                    <div className="px-3 py-2 bg-blue-50 border-b border-blue-200">
                      <p className="text-blue-800 text-sm font-medium">
                        {deliveryMarina.name}
                        <span className="text-blue-500 font-normal ml-2">— {deliveryMarina.region}</span>
                      </p>
                    </div>
                    <MarinaMap marina={deliveryMarina} />
                  </div>
                )}
              </div>

              {/* Place of Redelivery */}
              <div>
                <label className="block text-lg font-semibold text-blue-900 mb-3">Place of Redelivery *</label>
                <p className="text-gray-600 text-sm mb-3">Where you will return the yacht at the end of your charter.</p>
                <select
                  value={redeliveryPoint}
                  onChange={(e) => setRedeliveryPoint(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg bg-white border border-blue-300 text-gray-900 focus:border-blue-500 focus:outline-none mb-4"
                >
                  {Object.entries(regionGroups).map(([region, ms]) => (
                    <optgroup key={region} label={region}>
                      {ms.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {redeliveryMarina && (
                  <div className="rounded-lg overflow-hidden border border-blue-200">
                    <div className="px-3 py-2 bg-blue-50 border-b border-blue-200">
                      <p className="text-blue-800 text-sm font-medium">
                        {redeliveryMarina.name}
                        <span className="text-blue-500 font-normal ml-2">— {redeliveryMarina.region}</span>
                      </p>
                    </div>
                    <MarinaMap marina={redeliveryMarina} />
                  </div>
                )}
              </div>
            </div>

            {/* Holiday Preferences */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-blue-900">Holiday Preferences</h3>

              <div>
                <label className="block text-lg font-semibold text-blue-900 mb-3">Describe Your Ideal Holiday</label>
                <textarea
                  value={holidayDescription}
                  onChange={(e) => setHolidayDescription(e.target.value)}
                  rows={4}
                  className="w-full p-3 rounded-lg bg-white border border-blue-300 text-gray-900 focus:border-blue-500 focus:outline-none resize-none"
                  placeholder="Tell us about your ideal sailing holiday — activities you enjoy, places you'd like to visit, special occasions, etc..."
                />
                <p className="text-gray-600 text-sm mt-2">Help us customize your perfect sailing experience (optional)</p>
              </div>

              <div>
                <label className="block text-lg font-semibold text-blue-900 mb-3">Preferred Adventure Theme</label>
                <select
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(e.target.value)}
                  className="w-full p-3 rounded-lg bg-white border border-blue-300 text-gray-900 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select a theme (optional)</option>
                  {adventures.map((adventure) => (
                    <option key={adventure.id} value={adventure.id}>{adventure.name}</option>
                  ))}
                </select>
                <p className="text-gray-600 text-sm mt-2">
                  Choose from our curated adventure themes or leave blank for a custom experience
                </p>
              </div>

              {selectedTheme && (
                <div className="p-4 bg-blue-100 rounded-lg border border-blue-200">
                  <h4 className="text-lg font-semibold text-blue-900 mb-2">
                    {adventures.find(a => a.id === selectedTheme)?.name}
                  </h4>
                  <p className="text-gray-700 text-sm">
                    {adventures.find(a => a.id === selectedTheme)?.description}
                  </p>
                </div>
              )}
            </div>

            {/* Booking Summary */}
            <div className="p-6 bg-blue-100 rounded-lg border border-blue-200">
              <h3 className="text-xl font-semibold text-blue-900 mb-4">Information Request Summary</h3>

              <div className="mb-4">
                <h4 className="text-lg font-semibold text-blue-900 mb-2">Contact Information</h4>
                <div className="space-y-2 text-gray-700">
                  <SummaryRow label="Name" value={name || 'Not provided'} />
                  <SummaryRow label="Email" value={email || 'Not provided'} />
                  <SummaryRow label="Phone" value={phone || 'Not provided'} />
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-lg font-semibold text-blue-900 mb-2">Charter Details</h4>
                <div className="space-y-2 text-gray-700">
                  <SummaryRow label="Boat" value={blueOneBoat.name} />
                  <SummaryRow label="Date" value={selectedDate || 'Not selected'} />
                  <SummaryRow label="Passengers" value={String(passengers)} />
                  <SummaryRow label="Delivery" value={deliveryMarina?.name || 'Not selected'} />
                  <SummaryRow label="Redelivery" value={redeliveryMarina?.name || 'Not selected'} />
                </div>
              </div>

              {(holidayDescription || selectedTheme) && (
                <div>
                  <h4 className="text-lg font-semibold text-blue-900 mb-2">Holiday Preferences</h4>
                  <div className="space-y-2 text-gray-700">
                    {holidayDescription && (
                      <div>
                        <span className="font-medium text-blue-900">Ideal Holiday:</span>
                        <p className="text-gray-900 mt-1 text-sm">{holidayDescription}</p>
                      </div>
                    )}
                    {selectedTheme && (
                      <SummaryRow
                        label="Preferred Theme"
                        value={adventures.find(a => a.id === selectedTheme)?.name || ''}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-accent text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-accent/90 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-accent"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span>{label}:</span>
      <span className="text-gray-900 font-medium">{value}</span>
    </div>
  );
}
