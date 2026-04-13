'use client';

import Link from "next/link";
import Image from "next/image";

export default function Navigation() {
  return (
    <nav className="sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex flex-col items-center gap-2 group">
          <Image 
            src="/images/boats/blueone/logo_blueone.png" 
            alt="BlueOne Logo" 
            width={120} 
            height={60} 
            className="h-16 w-auto transition-transform duration-300 group-hover:scale-105 object-contain drop-shadow-lg" 
            priority 
          />
          <span className="text-white/90 font-medium text-sm tracking-wide">
            BlueOne Luxury Yacht
          </span>
        </Link>
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/experiences" className="text-white font-semibold hover:text-blue-200 transition-colors duration-200">Experiences</Link>
          <Link href="/destinations" className="text-white/90 font-medium hover:text-blue-200 transition-colors duration-200">Destinations</Link>
          <Link href="/blueone" className="text-white font-bold hover:text-blue-200 transition-colors duration-200">The Yacht</Link>
          <Link href="/about" className="text-white/90 font-medium hover:text-blue-200 transition-colors duration-200">About</Link>
          <Link href="/contact" className="text-white/90 font-medium hover:text-blue-200 transition-colors duration-200">Contact</Link>
        </div>
        
        {/* Mobile menu button */}
        <button className="md:hidden text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
