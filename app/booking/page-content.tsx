'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { CONTACT } from '../config/contact';
import { useSearchParams } from 'next/navigation';
import Image from "next/image";
import Link from 'next/link';
import { sendBookingEmail, BookingEmailData } from '../../lib/emailjs';
import adventures from '../adventures-data';
import { marinasByRegion, getMarinaById, DEFAULT_MARINA_ID } from '../marinas-data';
import MiniCalendar from '../components/MiniCalendar';
import { getAllCharters, type Charter } from '../../lib/availability';

const MarinaMap = dynamic(() => import('../components/MarinaMap'), { ssr: false });

type PassengerEntry = { kind: 'adult' } | { kind: 'child'; age: number };

function passengerSummary(list: PassengerEntry[]): string {
  const adults = list.filter(p => p.kind === 'adult').length;
  const children = list.filter((p): p is { kind: 'child'; age: number } => p.kind === 'child');
  const parts: string[] = [];
  if (adults > 0) parts.push(`${adults} adult${adults !== 1 ? 's' : ''}`);
  if (children.length > 0) {
    const ages = children.map(c => `age ${c.age}`).join(', ');
    parts.push(`${children.length} child${children.length !== 1 ? 'ren' : ''} (${ages})`);
  }
  return parts.join(', ');
}

export default function BookingPageContent() {
  const searchParams = useSearchParams();
  const blueOneBoat = {
    name: "BlueOne",
    brand: "Fountaine Pajot",
    length: "51 ft",
    description: "A new-generation catamaran with a focus on eco-responsibility, solar panels, and hybrid systems. Elegant design with full safety and entertainment options for guests.",
    image: "/images/boats/fp-aura51.jpg"
  };

  // Date picker state
  const [selectedDate, setSelectedDate] = useState('');
  const [calOpen, setCalOpen] = useState(false);
  const [calMonth, setCalMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const calRef = useRef<HTMLDivElement>(null);
  const [charters, setCharters] = useState<Charter[]>([]);

  // Passenger state
  const [passengerList, setPassengerList] = useState<PassengerEntry[]>([{ kind: 'adult' }, { kind: 'adult' }]);

  // Location state
  const [deliveryPoint, setDeliveryPoint] = useState(DEFAULT_MARINA_ID);
  const [sameRedelivery, setSameRedelivery] = useState(true);
  const [redeliveryPoint, setRedeliveryPoint] = useState(DEFAULT_MARINA_ID);

  // Contact state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Preferences state
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

  useEffect(() => {
    getAllCharters().then(setCharters).catch(() => {});
  }, []);

  // Close calendar on outside click
  useEffect(() => {
    if (!calOpen) return;
    const handler = (e: MouseEvent) => {
      if (calRef.current && !calRef.current.contains(e.target as Node)) {
        setCalOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [calOpen]);

  const getTodayDate = () => new Date().toISOString().split('T')[0];
  const capacity = { min: 1, max: 10 };

  const addPassenger = () => {
    if (passengerList.length < capacity.max) {
      setPassengerList(p => [...p, { kind: 'adult' }]);
    }
  };

  const removePassenger = (i: number) => {
    if (passengerList.length > 1) {
      setPassengerList(p => p.filter((_, idx) => idx !== i));
    }
  };

  const updatePassenger = (i: number, entry: PassengerEntry) => {
    setPassengerList(p => p.map((e, idx) => idx === i ? entry : e));
  };

  const actualRedelivery = sameRedelivery ? deliveryPoint : redeliveryPoint;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !phone || !selectedDate || !deliveryPoint) {
      alert('Please fill in all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    if (passengerList.length < capacity.min || passengerList.length > capacity.max) {
      alert(`Number of passengers must be between ${capacity.min} and ${capacity.max}`);
      return;
    }

    // Validate child ages
    for (const p of passengerList) {
      if (p.kind === 'child' && (p.age < 1 || p.age > 17)) {
        alert('Please enter a valid age (1–17) for all children');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const deliveryMarina = getMarinaById(deliveryPoint);
      const redeliveryMarina = getMarinaById(actualRedelivery);

      const bookingData: BookingEmailData = {
        name,
        email,
        phone,
        boat: blueOneBoat.name,
        date: selectedDate,
        passengers: passengerList.length,
        passengerDetails: passengerSummary(passengerList),
        embarkationPoint: deliveryMarina?.name || deliveryPoint,
        deliveryPoint: deliveryMarina?.name || deliveryPoint,
        redeliveryPoint: redeliveryMarina?.name || actualRedelivery,
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
  const redeliveryMarina = getMarinaById(actualRedelivery);

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

              {/* Date — popup calendar picker */}
              <div>
                <label className="block text-lg font-semibold text-blue-900 mb-3">Charter Date *</label>
                <div className="relative" ref={calRef}>
                  <button
                    type="button"
                    onClick={() => setCalOpen(o => !o)}
                    className="w-full p-3 rounded-lg bg-white border border-blue-300 text-gray-900 focus:border-blue-500 focus:outline-none text-left flex items-center justify-between hover:border-blue-400 transition-colors"
                  >
                    <span className={selectedDate ? 'text-gray-900' : 'text-gray-400'}>
                      {selectedDate
                        ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                        : 'Click to select a date…'}
                    </span>
                    <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>

                  {calOpen && (
                    <div className="absolute top-full left-0 z-50 mt-1 bg-white border border-blue-200 rounded-xl shadow-2xl p-4 w-72">
                      <div className="flex items-center justify-between mb-3">
                        <button
                          type="button"
                          onClick={() => setCalMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
                          className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors text-sm font-medium"
                        >
                          ←
                        </button>
                        <button
                          type="button"
                          onClick={() => setCalMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
                          className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors text-sm font-medium"
                        >
                          →
                        </button>
                      </div>
                      <MiniCalendar
                        entries={charters}
                        month={calMonth}
                        selectedDate={selectedDate}
                        onDayClick={(date) => {
                          if (date < getTodayDate()) return;
                          setSelectedDate(date);
                          const [y, m] = date.split('-').map(Number);
                          setCalMonth(new Date(y, m - 1, 1));
                          setCalOpen(false);
                        }}
                        variant="light"
                      />
                      <div className="flex gap-4 justify-center mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300 inline-block" /> Available
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block" /> Not available
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-gray-600 text-sm mt-2">
                  Click the field above to open the availability calendar
                </p>
              </div>

              {/* Passengers */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-lg font-semibold text-blue-900">
                    Passengers * <span className="text-gray-500 font-normal text-sm">({passengerList.length}/{capacity.max})</span>
                  </label>
                  <button
                    type="button"
                    onClick={addPassenger}
                    disabled={passengerList.length >= capacity.max}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-1 px-3 py-1.5 rounded-lg border border-blue-300 hover:bg-blue-50 disabled:border-gray-200 transition-colors"
                  >
                    + Add passenger
                  </button>
                </div>
                <div className="space-y-2">
                  {passengerList.map((p, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white border border-blue-200 rounded-lg">
                      <span className="text-sm text-gray-500 w-6 text-center flex-shrink-0">{i + 1}</span>
                      <select
                        value={p.kind}
                        onChange={(e) => {
                          if (e.target.value === 'adult') updatePassenger(i, { kind: 'adult' });
                          else updatePassenger(i, { kind: 'child', age: 10 });
                        }}
                        className="flex-1 p-2 rounded-lg bg-blue-50 border border-blue-200 text-gray-900 focus:border-blue-500 focus:outline-none text-sm"
                      >
                        <option value="adult">Adult</option>
                        <option value="child">Child (under 18)</option>
                      </select>
                      {p.kind === 'child' && (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <label className="text-sm text-gray-600 whitespace-nowrap">Age:</label>
                          <input
                            type="number"
                            value={p.age}
                            min={1}
                            max={17}
                            onChange={(e) => updatePassenger(i, { kind: 'child', age: Math.min(17, Math.max(1, parseInt(e.target.value) || 1)) })}
                            className="w-14 p-2 rounded-lg bg-blue-50 border border-blue-200 text-gray-900 focus:border-blue-500 focus:outline-none text-sm text-center"
                          />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removePassenger(i)}
                        disabled={passengerList.length <= 1}
                        className="text-gray-400 hover:text-red-500 disabled:opacity-0 transition-colors flex-shrink-0"
                        aria-label="Remove passenger"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-gray-500 text-sm mt-2">{passengerSummary(passengerList)}</p>
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

              {/* Place of Redelivery — optional */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-lg font-semibold text-blue-900">Place of Redelivery</label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={sameRedelivery}
                      onChange={(e) => setSameRedelivery(e.target.checked)}
                      className="w-4 h-4 accent-blue-600"
                    />
                    <span className="text-sm text-gray-600">Same as delivery</span>
                  </label>
                </div>
                {sameRedelivery ? (
                  <p className="text-gray-500 text-sm py-2 px-3 bg-gray-50 rounded-lg border border-gray-200">
                    Redelivery at <span className="font-medium text-blue-700">{deliveryMarina?.name || 'same marina'}</span>
                  </p>
                ) : (
                  <>
                    <p className="text-gray-600 text-sm mb-3">Where you will return the yacht at the end of your charter.</p>
                    <select
                      value={redeliveryPoint}
                      onChange={(e) => setRedeliveryPoint(e.target.value)}
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
                    {redeliveryMarina && redeliveryMarina.id !== deliveryMarina?.id && (
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
                  </>
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
                  <SummaryRow
                    label="Date"
                    value={selectedDate
                      ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                      : 'Not selected'}
                  />
                  <SummaryRow label="Passengers" value={`${passengerList.length} (${passengerSummary(passengerList)})`} />
                  <SummaryRow label="Delivery" value={deliveryMarina?.name || 'Not selected'} />
                  <SummaryRow
                    label="Redelivery"
                    value={sameRedelivery ? `Same as delivery (${deliveryMarina?.name || '—'})` : redeliveryMarina?.name || 'Not selected'}
                  />
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
