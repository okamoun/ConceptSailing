'use client';

import Image from 'next/image';
import { CONTACT } from '../config/contact';

export default function ContactClient() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-16">
      <div className="max-w-3xl mx-auto px-4">
        <div className="glass p-10 shadow-xl border border-blue-200 animate-fade-in-up">
          <div className="flex flex-col items-center mb-8">
            <Image
              src="/images/boats/blueone/logo_blueone.png"
              alt="BlueOne Logo"
              width={140}
              height={70}
              className="mb-4 drop-shadow-lg"
            />
            <h1 className="text-4xl font-extrabold text-blue-900 mb-2 text-center">Contact Us</h1>
            <p className="text-lg text-gray-600 text-center max-w-xl">
              We&apos;d love to help you plan your perfect Greek sailing adventure. Reach out for bookings, questions, or custom requests!
            </p>
          </div>

          <form className="space-y-6 mt-6">
            <div>
              <label htmlFor="name" className="block text-lg font-semibold text-blue-900 mb-2">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full px-4 py-3 rounded-xl bg-white border-2 border-blue-200 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-lg font-semibold text-blue-900 mb-2">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full px-4 py-3 rounded-xl bg-white border-2 border-blue-200 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                placeholder="your.email@example.com"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-lg font-semibold text-blue-900 mb-2">Phone (Optional)</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="w-full px-4 py-3 rounded-xl bg-white border-2 border-blue-200 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                placeholder={CONTACT.phone.formatted}
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-lg font-semibold text-blue-900 mb-2">Message</label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                className="w-full px-4 py-3 rounded-xl bg-white border-2 border-blue-200 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-none"
                placeholder="Tell us about your ideal sailing holiday..."
              />
            </div>
            <button type="submit" className="btn-primary w-full py-4 text-lg font-bold">
              Send Message
            </button>
          </form>

          {/* Contact Information */}
          <div className="mt-10 pt-8 border-t border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <a href={`mailto:${CONTACT.email}`} className="text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                  {CONTACT.email}
                </a>
              </div>
              <div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 mb-1">Phone</p>
                <a href={CONTACT.phone.href} className="text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                  {CONTACT.phone.formatted}
                </a>
              </div>
              <div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500 mb-1">Location</p>
                <p className="text-blue-600 font-semibold">Athens, Greece</p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-lg font-bold text-blue-900">BlueOne Luxury Yacht Charters</p>
              <p className="text-gray-600">Alimos Marina, Athens</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
