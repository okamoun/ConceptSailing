'use client';

import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { destinations } from '../destinations-data';

const CustomGoogleMap = dynamic(() => import('./GoogleMap.client'), { ssr: false });

export default function DestinationsClient() {
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">

      {/* Hero */}
      <section className="py-20 px-4 flex items-center justify-center">
        <div className="max-w-4xl mx-auto w-full">
          <div className="glass p-8 md:p-16 text-center animate-fade-in-up">
            <div className="mb-6">
              <Image
                src="/images/boats/blueone/logo_blueone.png"
                alt="BlueOne Logo"
                width={120}
                height={60}
                className="mx-auto drop-shadow-lg"
                priority
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gradient mb-6">
              Sailing Destinations
            </h1>
            <p
              className="text-xl md:text-2xl text-gray-700 font-medium mb-4 animate-fade-in-up"
              style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
            >
              Greek Islands await you aboard BlueOne
            </p>
            <p
              className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed animate-fade-in-up"
              style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
            >
              Explore the stunning destinations you can visit aboard BlueOne. Each
              location offers unique highlights and easy access to beautiful island
              groups.
            </p>
          </div>
        </div>
      </section>

      {/* Map + Cards */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 items-start">

            {/* Map */}
            <div
              className="w-full md:w-1/2 animate-fade-in-up"
              style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
            >
              <div
                className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-3"
              >
                <div
                  className="relative w-full rounded-xl overflow-hidden"
                  style={{ aspectRatio: '4/3' }}
                >
                  <CustomGoogleMap
                    destinations={destinations}
                    selectedId={selectedId}
                    onMarkerClick={setSelectedId}
                  />
                </div>
              </div>
            </div>

            {/* Destination cards */}
            <div className="w-full md:w-1/2">
              <div className="relative w-full flex flex-col items-center">
                {destinations.map((dest, idx) => {
                  const selectedIdx = destinations.findIndex(d => d.id === selectedId);
                  const extraMargin =
                    selectedId && selectedIdx !== -1 && idx === selectedIdx + 1 ? 56 : 0;

                  return (
                    <motion.div
                      key={dest.id}
                      layout
                      initial={{ opacity: 0, y: 40 }}
                      animate={{
                        opacity: 1,
                        scale: selectedId === dest.id ? 1.04 : 0.97,
                        filter:
                          selectedId && selectedId !== dest.id
                            ? 'brightness(0.75)'
                            : 'none',
                        zIndex: selectedId === dest.id ? 20 : 10,
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 30,
                        delay: idx * 0.07,
                      }}
                      whileHover={{ scale: selectedId === dest.id ? 1.04 : 1.01 }}
                      className={`cursor-pointer w-full sm:w-11/12 mx-auto group ${
                        selectedId === dest.id ? 'ring-2 ring-blue-400' : ''
                      }`}
                      style={{
                        marginTop: idx === 0 ? 0 : -20 + extraMargin,
                        position: 'relative',
                        zIndex: selectedId === dest.id ? 20 : 10,
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '1.5rem',
                        boxShadow:
                          selectedId === dest.id
                            ? '0 8px 32px rgba(0,102,204,0.25)'
                            : '0 4px 24px rgba(0,0,0,0.08)',
                        overflow: 'hidden',
                      }}
                      onClick={() =>
                        setSelectedId(selectedId === dest.id ? undefined : dest.id)
                      }
                      tabIndex={0}
                      aria-label={`Select destination ${dest.name}`}
                    >
                      <div className="flex flex-col sm:flex-row gap-3 items-center p-3">
                        <div className="relative flex-shrink-0 w-full sm:w-28 h-28 sm:h-20 rounded-xl overflow-hidden border-2 border-blue-100 group-hover:border-blue-400 transition-colors duration-300">
                          <Image
                            src={dest.image}
                            alt={dest.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, 112px"
                          />
                        </div>
                        <div className="flex-1 min-w-0 px-1">
                          <h3 className="text-base font-bold text-blue-900 mb-1">
                            {dest.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
                            {dest.description}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {dest.highlights.slice(0, 2).map((hl, i) => (
                              <span
                                key={i}
                                className="text-xs bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 border border-blue-200"
                              >
                                {hl}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass p-8 md:p-16 text-center animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold text-gradient mb-6">
              Ready to Set Sail?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Book your BlueOne sailing adventure and explore the Greek islands in
              luxury.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/booking" className="btn-primary text-lg px-8 py-4">
                Book Your Voyage
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
              <Link href="/experiences" className="btn-secondary text-lg px-8 py-4">
                View Experiences
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
