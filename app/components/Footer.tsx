'use client';

import Link from "next/link";
import Image from "next/image";
import { CONTACT } from '../config/contact';

export default function Footer() {
  return (
    <footer className="mt-20">
      {/* Gold top line accent */}
      <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />

      <div className="container mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-14">
          {/* Brand */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Image
                src="/images/boats/blueone/logo_blueone.png"
                alt="BlueOne Logo"
                width={72}
                height={36}
                className="object-contain opacity-90"
              />
              <div>
                <h3 className="text-base font-bold text-white">BlueOne</h3>
                <p className="text-xs tracking-widest uppercase" style={{ color: 'var(--gold)' }}>
                  Luxury Yacht Charters
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.52)' }}>
              Experience the ultimate Greek sailing adventure aboard our
              premium catamaran. Luxury, comfort, and unforgettable moments.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-5">
            <h3
              className="text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: 'var(--gold)' }}
            >
              Quick Links
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {[
                { href: '/experiences',  label: 'Experiences' },
                { href: '/destinations', label: 'Destinations' },
                { href: '/blueone',      label: 'The Yacht' },
                { href: '/booking',      label: 'Get a Quote' },
                { href: '/rates',        label: 'Rates' },
                { href: '/about',        label: 'About' },
                { href: '/reviews',      label: 'Reviews' },
                { href: '/contact',      label: 'Contact' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm transition-colors duration-200"
                  style={{ color: 'rgba(255,255,255,0.48)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.48)')}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-5">
            <h3
              className="text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: 'var(--gold)' }}
            >
              Get in Touch
            </h3>
            <div className="space-y-4">
              <a
                href={`mailto:${CONTACT.email}`}
                className="flex items-center gap-3 text-sm transition-colors duration-200"
                style={{ color: 'rgba(255,255,255,0.55)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {CONTACT.email}
              </a>

              <a
                href="https://wa.me/message/FFC4UTH5AZZEC1"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm transition-colors duration-200"
                style={{ color: 'rgba(255,255,255,0.55)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.532 5.862L.057 23.213a.75.75 0 00.93.93l5.351-1.475A11.943 11.943 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.694-.499-5.243-1.374l-.376-.217-3.896 1.073 1.073-3.896-.217-.376A9.956 9.956 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                </svg>
                WhatsApp
              </a>

              <a
                href="https://www.facebook.com/share/1LhPdDZXd1/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm transition-colors duration-200"
                style={{ color: 'rgba(255,255,255,0.55)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
                </svg>
                Facebook
              </a>
            </div>

            <div
              className="pt-4 space-y-1"
              style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
            >
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>Athens, Greece</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Central Agent:{' '}
                <a
                  href="https://athenian-yachts.gr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors underline"
                  style={{ color: 'var(--gold)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold-light)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--gold)')}
                >
                  Athenian Yachts
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            © 2026 BlueOne Luxury Yacht. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-xs transition-colors duration-200"
              style={{ color: 'rgba(255,255,255,0.3)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs transition-colors duration-200"
              style={{ color: 'rgba(255,255,255,0.3)' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
