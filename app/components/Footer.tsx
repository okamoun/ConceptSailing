'use client';

import Link from "next/link";
import Image from "next/image";

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
              <Link href="/booking" className="text-section-description hover:text-white transition-colors duration-200">Get a Quote</Link>
              <Link href="/about" className="text-section-description hover:text-white transition-colors duration-200">About</Link>
              <Link href="/contact" className="text-section-description hover:text-white transition-colors duration-200">Contact</Link>
            </div>
          </div>
          
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-section-title">Get in Touch</h3>
            <div className="space-y-3">
              <a href="mailto:contact@blueoneyacht.com" className="flex items-center gap-3 text-section-description hover:text-white transition-colors duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                contact
              </a>
              <a href="https://wa.me/message/FFC4UTH5AZZEC1" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-section-description hover:text-white transition-colors duration-200">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.862L.057 23.213a.75.75 0 00.93.93l5.351-1.475A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.694-.499-5.243-1.374l-.376-.217-3.896 1.073 1.073-3.896-.217-.376A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                </svg>
                WhatsApp
              </a>
            </div>
            <div className="pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-400">Athens, Greece</p>
              <p className="text-sm text-blue-200 mt-1">Central Agent : Athenian Yachts</p>
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
