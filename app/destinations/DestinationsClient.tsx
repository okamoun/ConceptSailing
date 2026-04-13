'use client';

import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { destinations } from '../destinations-data';

// Dynamically import GoogleMap to avoid SSR issues
const CustomGoogleMap = dynamic(() => import('./GoogleMap.client'), { ssr: false });

export default function DestinationsClient() {
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  return (
    <main className="min-h-screen relative py-16" style={{
      backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.6)), url('/destinations/Rhodes.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50/30 to-white/40 py-16">
        <div className="max-w-6xl mx-auto px-2 sm:px-4 p-4 sm:p-10 shadow-xl border animate-fade-in-up backdrop-blur-sm bg-blue/60 border-blue-200">
        <div className="text-center mb-8">
          <div className="mb-6">
            <Image 
              src="/images/boats/blueone/logo_blueone.png" 
                alt="BlueOne Logo" 
                width={120} 
                height={60} 
                className="mx-auto drop-shadow-lg animate-pulse"
                priority
              />
            </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-6 text-center drop-shadow-2xl animate-fade-in-up text-blue-900" style={{
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}>
            BlueOne Sailing Destinations
          </h1>
          <p className="text-lg sm:text-xl mb-10 text-center max-w-3xl mx-auto leading-relaxed animate-fade-in-up text-gray-700" style={{
            textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
          }}>
            Explore the stunning destinations you can visit aboard BlueOne. Each location offers unique highlights and easy access to beautiful island groups.
          </p>
          <div className="animate-fade-in-up" style={{animationDelay: '0.3s'}}>
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <span className="font-medium">Dream Destinations Await</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start w-full">
          {/* Map on the left */}
          <div className="w-full md:w-1/2 mb-6 md:mb-0" style={{ minWidth: 0 }}>
            <div className="relative w-full" style={{ aspectRatio: '16/10', minHeight: 220, height: 'auto', maxHeight: 320 }}>
              <CustomGoogleMap
                destinations={destinations}
                selectedId={selectedId}
                onMarkerClick={setSelectedId}
              />
            </div>
          </div>
          {/* List on the right */}
          <div className="w-full md:w-1/2 flex flex-col gap-4 sm:gap-6">
            <div className="relative w-full flex flex-col items-center" style={{ minHeight: 200, height: '100%' }}>
              {/* Stackable cards container, but contained within its column */}
              <div className="w-full flex flex-col items-center gap-0 relative" style={{ minHeight: 100, height: '100%' }}>
                {destinations.map((dest, idx) => {
                  const selectedIdx = destinations.findIndex(d => d.id === selectedId);
                  // Only the card immediately below the selected card is translated
                  let extraMargin = 0;
                  if (
                    selectedId &&
                    selectedIdx !== -1 &&
                    idx === selectedIdx + 1
                  ) {
                    extraMargin = 56;
                  }
                  return (
                    <motion.div
                      key={dest.id}
                      layout
                      initial={{ opacity: 0, y: 40 }}
                      animate={{
                        opacity: 1,
                        scale: selectedId === dest.id ? 1.05 : 0.97,
                        filter: selectedId && selectedId !== dest.id ? 'brightness(0.85)' : 'none',
                        zIndex: selectedId === dest.id ? 20 : 10
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30, delay: idx * 0.07 }}
                      className={`rounded-xl shadow-2xl border flex flex-col sm:flex-row gap-2 sm:gap-4 items-center cursor-pointer w-full sm:w-11/12 mx-auto transition-all duration-500 group backdrop-blur-sm bg-white/70 border-blue-200 hover:bg-white/80 ${selectedId === dest.id ? 'ring-4 ring-blue-400/60 shadow-blue-400/30' : ''}`}
                      style={{
                        marginTop: (idx === 0 ? 0 : -24) + extraMargin,
                        boxShadow: selectedId === dest.id ? '0 8px 32px 0 rgba(0,0,0,0.35)' : '0 4px 16px 0 rgba(0,0,0,0.15)',
                        position: 'relative',
                        top: 'unset',
                        left: 'unset',
                        transition: 'box-shadow 0.3s',
                        zIndex: selectedId === dest.id ? 20 : 10
                      }}
                      onClick={() => setSelectedId(dest.id)}
                      tabIndex={0}
                      aria-label={`Select destination ${dest.name}`}
                      whileHover={{ scale: 1.07, boxShadow: '0 12px 40px 0 rgba(0,0,0,0.45)' }}
                    >
                      <Image 
                      src={dest.image} 
                      alt={dest.name} 
                      width={100} 
                      height={70} 
                      className="rounded-lg object-cover border-2 w-full sm:w-24 h-24 sm:h-16 group-hover:transition-all duration-300 border-blue-300 group-hover:border-blue-500 shadow-lg group-hover:shadow-xl" 
                      style={{
                        filter: 'none',
                        transition: 'all 0.3s ease'
                      }}
                    />
                      <div className="flex-1 w-full">
                        <h3 className="text-base sm:text-md font-bold ">{dest.name}</h3>
                        <p className="mb-1 text-xs sm:text-sm text-gray-700">{dest.description}</p>
                        <ul className="list-disc list-inside text-xs text-blue-700">
                          {dest.highlights.slice(0, 2).map((hl, i) => (
                            <li key={i}>{hl}</li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </main>
  );
}
