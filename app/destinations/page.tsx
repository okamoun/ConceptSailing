'use client';

import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { destinations } from '../destinations-data';
import { useBlueOneMode } from '../contexts/BlueOneContext';

// Dynamically import GoogleMap to avoid SSR issues
const CustomGoogleMap = dynamic(() => import('./GoogleMap.client'), { ssr: false });

export default function DestinationsPage() {
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const { isBlueOneMode } = useBlueOneMode();

  return (
    <main className={`min-h-screen py-16 ${isBlueOneMode ? 'bg-gradient-to-br from-blue-50 to-white' : 'bg-gradient-to-br from-[#101824] to-[#1f2937]'}`}>
      <div className={`max-w-6xl mx-auto px-2 sm:px-4 p-4 sm:p-10 shadow-xl border animate-fade-in-up ${
        isBlueOneMode 
          ? 'bg-white border-blue-200' 
          : 'glass border-accent'
      }`}>
        <div className="text-center mb-8">
          {isBlueOneMode && (
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
          )}
          <h1 className={`text-2xl sm:text-4xl font-extrabold mb-6 text-center ${
            isBlueOneMode ? 'text-blue-900' : 'text-accent'
          }`}>
            {isBlueOneMode ? 'BlueOne Sailing Destinations' : 'Top Sailing Destinations in Greece'}
          </h1>
          <p className={`text-base sm:text-lg mb-10 text-center max-w-2xl mx-auto ${
            isBlueOneMode ? 'text-gray-700' : 'text-gray-200'
          }`}>
            {isBlueOneMode 
              ? 'Explore the stunning destinations you can visit aboard BlueOne. Each location offers unique highlights and easy access to beautiful island groups.'
              : 'Explore the most popular embarkation ports for sailing holidays in Greece. Each destination offers unique highlights and easy access to stunning island groups.'
            }
          </p>
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
              <div className="w-full flex flex-col items-center gap-0 relative" style={{ minHeight: 200, height: '100%' }}>
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
                      className={`rounded-xl shadow-lg border flex flex-col sm:flex-row gap-2 sm:gap-4 items-center cursor-pointer w-full sm:w-11/12 mx-auto transition-all duration-300 group ${
                        isBlueOneMode 
                          ? 'bg-white border-blue-200' 
                          : 'bg-[#172132] border-accent'
                      } ${selectedId === dest.id ? (isBlueOneMode ? 'ring-4 ring-blue-400/50' : 'ring-4 ring-accent/50') : ''}`}
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
                      className={`rounded-lg object-cover border-2 w-full sm:w-24 h-24 sm:h-16 group-hover:transition-all ${
                        isBlueOneMode 
                          ? 'border-blue-300 group-hover:border-blue-500' 
                          : 'border-accent group-hover:border-white'
                      }`} 
                    />
                      <div className="flex-1 w-full">
                        <h2 className={`text-lg sm:text-xl font-bold mb-1 ${
                          isBlueOneMode ? 'text-blue-900' : 'text-accent'
                        }`}>{dest.name}</h2>
                        <p className={`mb-1 text-xs sm:text-sm ${
                          isBlueOneMode ? 'text-gray-700' : 'text-gray-100'
                        }`}>{dest.description}</p>
                        <ul className={`list-disc list-inside text-xs ${
                          isBlueOneMode ? 'text-blue-700' : 'text-accent'
                        }`}>
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
    </main>
  );
}
