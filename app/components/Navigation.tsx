'use client';

import { useState } from 'react';
import Link from "next/link";
import Image from "next/image";

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: "/experiences", label: "Experiences", bold: true },
    { href: "/destinations", label: "Destinations", bold: false },
    { href: "/blueone", label: "The Yacht", bold: true },
    { href: "/about", label: "About", bold: false },
    { href: "/reviews", label: "Reviews", bold: false },
    { href: "/contact", label: "Contact", bold: false },
  ];

  return (
    <nav className="sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex flex-col items-center gap-2 group" onClick={() => setMobileOpen(false)}>
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

        {/* Desktop links */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map(({ href, label, bold }) => (
            <Link
              key={href}
              href={href}
              className={`text-white ${bold ? 'font-bold' : 'font-medium text-white/90'} hover:text-blue-200 transition-colors duration-200`}
            >
              {label}
            </Link>
          ))}
        </div>
        
        {/* Mobile menu button */}
        <button
          className="md:hidden text-white p-1"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-blue-900/95 backdrop-blur-sm">
          {navLinks.map(({ href, label, bold }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`block px-6 py-3 text-white ${bold ? 'font-bold' : 'font-medium text-white/90'} hover:bg-white/10 transition-colors duration-200 border-b border-white/5 last:border-b-0`}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
