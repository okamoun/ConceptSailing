'use client';

import Link from "next/link";
import Image from "next/image";
import { CONTACT } from '../config/contact';

export default function Footer() {
  return (
    <footer className="mt-20 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Image 
                src="/images/boats/blueone/logo_blueone.png" 
                alt="BlueOne Logo" 
                width={80} 
                height={40} 
                className="object-contain"
              />
              <div>
                <h3 className="text-xl font-bold text-section-title">BlueOne</h3>
                <p className="text-section-subtitle text-sm">Luxury Yacht Charters</p>
              </div>
            </div>
            <p className="text-section-description leading-relaxed">
              Experience the ultimate Greek sailing adventure aboard our premium catamaran. Luxury, comfort, and unforgettable moments.
            </p>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-section-title">Quick Links</h3>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/experiences" className="text-section-description hover:text-white transition-colors duration-200">Experiences</Link>
              <Link href="/destinations" className="text-section-description hover:text-white transition-colors duration-200">Destinations</Link>
              <Link href="/blueone" className="text-section-description hover:text-white transition-colors duration-200">The Yacht</Link>
              <Link href="/booking" className="text-section-description hover:text-white transition-colors duration-200">Book Now</Link>
              <Link href="/about" className="text-section-description hover:text-white transition-colors duration-200">About</Link>
              <Link href="/contact" className="text-section-description hover:text-white transition-colors duration-200">Contact</Link>
            </div>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-section-title">Get in Touch</h3>
            <div className="space-y-3">
              <a href="mailto:contact@nj3cruises.com" className="flex items-center gap-3 text-section-description hover:text-white transition-colors duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                contact@nj3cruises.com
              </a>
              <a href={`tel:${CONTACT.phone.href}`} className="flex items-center gap-3 text-section-description hover:text-white transition-colors duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {CONTACT.phone.formatted}
              </a>
            </div>
            <div className="pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-400">Athens, Greece</p>
              <p className="text-sm text-blue-200 mt-1">Premium Yacht Experiences Since 2024</p>
            </div>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">© 2024 BlueOne Luxury Yacht. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">Privacy Policy</Link>
              <Link href="/terms" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
