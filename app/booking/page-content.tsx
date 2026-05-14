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

function passengerSummary(total: number, childAges: number[]): string {
  if (childAges.length === 0) return `${total} passenger${total !== 1 ? 's' : ''}`;
  const ages = childAges.map(a => `age ${a}`).join(', ');
  return `${total} passenger${total !== 1 ? 's' : ''} (${childAges.length} child${childAges.length !== 1 ? 'ren' : ''}: ${ages})`;
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
  const [endDate, setEndDate] = useState('');
  const [startCalOpen, setStartCalOpen] = useState(false);
  const [endCalOpen, setEndCalOpen] = useState(false);
  const [calMonth, setCalMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const startCalRef = useRef<HTMLDivElement>(null);
  const endCalRef = useRef<HTMLDivElement>(null);
  const [charters, setCharters] = useState<Charter[]>([]);

  // Passenger state
  const [passengers, setPassengers] = useState(2);
  const [childAges, setChildAges] = useState<number[]>([]);

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

  // Close calendars on outside click
  useEffect(() => {
    if (!startCalOpen && !endCalOpen) return;
    const handler = (e: MouseEvent) => {
      if (startCalOpen && startCalRef.current && !startCalRef.current.contains(e.target as Node))
        setStartCalOpen(false);
      if (endCalOpen && endCalRef.current && !endCalRef.current.contains(e.target as Node))
        setEndCalOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [startCalOpen, endCalOpen]);

  const getTodayDate = () => new Date().toISOString().split('T')[0];
  const capacity = { min: 1, max: 10 };
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

    if (passengers < capacity.min || passengers > capacity.max) {
      alert(`Number of passengers must be between ${capacity.min} and ${capacity.max}`);
      return;
    }

    if (childAges.length > passengers) {
      alert('Number of children cannot exceed total passengers');
      return;
    }

    if (childAges.some(a => a < 1 || a > 17)) {
      alert('Please enter a valid age (1–17) for all children');
      return;
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
        endDate: endDate || undefined,
        passengers,
        passengerDetails: passengerSummary(passengers, childAges),
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

              {/* Dates — start + end popup pickers */}
              <div>
                <label className="block text-lg font-semibold text-blue-900 mb-3">Charter Dates *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  {/* Start date */}
                  <div className="relative" ref={startCalRef}>
                    <p className="text-sm text-gray-600 mb-1.5">Start date</p>
                    <button
                      type="button"
                      onClick={() => { setStartCalOpen(o => !o); setEndCalOpen(false); }}
                      className="w-full p-3 rounded-lg bg-white border border-blue-300 text-gray-900 text-left flex items-center justify-between hover:border-blue-400 transition-colors"
                    >
                      <span className={selectedDate ? 'text-gray-900 text-sm' : 'text-gray-400 text-sm'}>
                        {selectedDate
                          ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                          : 'Select start…'}
                      </span>
                      <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                    {startCalOpen && (
                      <div className="absolute top-full left-0 z-50 mt-1 bg-white border border-blue-200 rounded-xl shadow-2xl p-4 w-72">
                        <CalNavRow onPrev={() => setCalMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))} onNext={() => setCalMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))} />
                        <MiniCalendar
                          entries={charters}
                          month={calMonth}
                          selectedDate={selectedDate}
                          rangeStart={selectedDate}
                          rangeEnd={endDate}
                          onDayClick={(date) => {
                            setSelectedDate(date);
                            if (endDate && endDate <= date) setEndDate('');
                            const [y, mo] = date.split('-').map(Number);
                            setCalMonth(new Date(y, mo - 1, 1));
                            setStartCalOpen(false);
                          }}
                          variant="light"
                        />
                        <CalLegend />
                      </div>
                    )}
                  </div>

                  {/* End date */}
                  <div className="relative" ref={endCalRef}>
                    <p className="text-sm text-gray-600 mb-1.5">End date <span className="text-gray-400">(optional)</span></p>
                    <button
                      type="button"
                      onClick={() => { setEndCalOpen(o => !o); setStartCalOpen(false); }}
                      className="w-full p-3 rounded-lg bg-white border border-blue-300 text-gray-900 text-left flex items-center justify-between hover:border-blue-400 transition-colors"
                    >
                      <span className={endDate ? 'text-gray-900 text-sm' : 'text-gray-400 text-sm'}>
                        {endDate
                          ? new Date(endDate + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                          : 'Select end…'}
                      </span>
                      <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                    {endCalOpen && (
                      <div className="absolute top-full left-0 z-50 mt-1 bg-white border border-blue-200 rounded-xl shadow-2xl p-4 w-72">
                        <CalNavRow onPrev={() => setCalMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))} onNext={() => setCalMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))} />
                        <MiniCalendar
                          entries={charters}
                          month={calMonth}
                          selectedDate={endDate}
                          rangeStart={selectedDate}
                          rangeEnd={endDate}
                          minDate={selectedDate || getTodayDate()}
                          onDayClick={(date) => {
                            setEndDate(date);
                            const [y, mo] = date.split('-').map(Number);
                            setCalMonth(new Date(y, mo - 1, 1));
                            setEndCalOpen(false);
                          }}
                          variant="light"
                        />
                        <CalLegend />
                      </div>
                    )}
                  </div>
                </div>
                {selectedDate && endDate && (
                  <p className="text-blue-700 text-sm mt-2 font-medium">
                    {Math.round((new Date(endDate).getTime() - new Date(selectedDate).getTime()) / 86400000)} night{Math.round((new Date(endDate).getTime() - new Date(selectedDate).getTime()) / 86400000) !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {/* Passengers */}
              <div className="space-y-4">
                <div>
                  <label className="block text-lg font-semibold text-blue-900 mb-3">
                    Number of Passengers * <span className="text-gray-500 font-normal text-sm">(max {capacity.max})</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        const next = Math.max(capacity.min, passengers - 1);
                        setPassengers(next);
                        if (childAges.length > next) setChildAges(a => a.slice(0, next));
                      }}
                      className="w-9 h-9 rounded-lg border border-blue-300 text-blue-700 font-bold text-lg hover:bg-blue-50 transition-colors flex items-center justify-center"
                    >−</button>
                    <span className="w-8 text-center text-xl font-semibold text-blue-900">{passengers}</span>
                    <button
                      type="button"
                      onClick={() => setPassengers(p => Math.min(capacity.max, p + 1))}
                      className="w-9 h-9 rounded-lg border border-blue-300 text-blue-700 font-bold text-lg hover:bg-blue-50 transition-colors flex items-center justify-center"
                    >+</button>
                    <span className="text-gray-500 text-sm">guest{passengers !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                {/* Children detail */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-base font-medium text-blue-800">
                      Of which children under 18
                      {childAges.length > 0 && <span className="ml-1 text-gray-500 font-normal text-sm">({childAges.length})</span>}
                    </span>
                    <button
                      type="button"
                      onClick={() => setChildAges(a => [...a, 10])}
                      disabled={childAges.length >= passengers}
                      className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed px-3 py-1 rounded-lg border border-blue-200 hover:bg-blue-50 disabled:border-gray-200 transition-colors"
                    >
                      + Add child
                    </button>
                  </div>
                  {childAges.length === 0 ? (
                    <p className="text-gray-400 text-sm">No children — click &ldquo;Add child&rdquo; to specify ages</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {childAges.map((age, i) => (
                        <div key={i} className="flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                          <span className="text-sm text-gray-600">Child {i + 1}, age:</span>
                          <input
                            type="number"
                            value={age}
                            min={1}
                            max={17}
                            onChange={(e) => {
                              const v = Math.min(17, Math.max(1, parseInt(e.target.value) || 1));
                              setChildAges(a => a.map((x, idx) => idx === i ? v : x));
                            }}
                            className="w-12 p-1 rounded border border-blue-300 text-gray-900 focus:border-blue-500 focus:outline-none text-sm text-center bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => setChildAges(a => a.filter((_, idx) => idx !== i))}
                            className="text-gray-400 hover:text-red-500 transition-colors ml-1"
                            aria-label="Remove child"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
                    label="Start date"
                    value={selectedDate
                      ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                      : 'Not selected'}
                  />
                  <SummaryRow
                    label="End date"
                    value={endDate
                      ? new Date(endDate + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                      : 'Not specified'}
                  />
                  <SummaryRow label="Passengers" value={passengerSummary(passengers, childAges)} />
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

function CalNavRow({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <button type="button" onClick={onPrev} className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors text-sm font-medium">←</button>
      <button type="button" onClick={onNext} className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors text-sm font-medium">→</button>
    </div>
  );
}

function CalLegend() {
  return (
    <div className="flex gap-4 justify-center mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300 inline-block" /> Available</span>
      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block" /> Not available</span>
      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-100 border border-blue-300 inline-block" /> Selected</span>
    </div>
  );
}
