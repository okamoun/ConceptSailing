'use client';

import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { destinations } from '../destinations-data';

// Dynamically import GoogleMap to avoid SSR issues
const CustomGoogleMap = dynamic(() => import('./GoogleMap.client'), { ssr: false });

export default function DestinationsPage() {
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#101824] to-[#1f2937] py-16">
      <div className="max-w-6xl mx-auto px-4 glass p-10 shadow-xl border border-accent animate-fade-in-up">
        <h1 className="text-4xl font-extrabold text-accent mb-8 text-center">Top Sailing Destinations in Greece</h1>
        <p className="text-lg text-gray-200 mb-10 text-center max-w-2xl mx-auto">
          Explore the most popular embarkation ports for sailing holidays in Greece. Each destination offers unique highlights and easy access to stunning island groups.
        </p>
        <div className="flex flex-col md:flex-row gap-10 items-start w-full">
          {/* Map on the left */}
          <div className="w-full md:w-1/2 mb-8 md:mb-0" style={{ minWidth: 0 }}>
            <div className="relative w-full" style={{ aspectRatio: '16/10', minHeight: 340 }}>
              <CustomGoogleMap
                destinations={destinations}
                selectedId={selectedId}
                onMarkerClick={setSelectedId}
              />
            </div>
          </div>
          {/* List on the right */}
          <div className="w-full md:w-1/2 flex flex-col gap-6">
            <div className="relative w-full flex flex-col items-center" style={{ minHeight: 400, height: '100%' }}>
              {/* Stackable cards container, but contained within its column */}
              <div className="w-full flex flex-col items-center gap-0 relative" style={{ minHeight: 400, height: '100%' }}>
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
                      className={`bg-[#172132] rounded-xl shadow-lg border border-accent flex flex-row gap-4 items-center cursor-pointer w-11/12 mx-auto transition-all duration-300 ${selectedId === dest.id ? 'ring-4 ring-accent/50' : ''} group`}
                      style={{
                        marginTop: (idx === 0 ? 0 : -40) + extraMargin,
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
                      <Image src={dest.image} alt={dest.name} width={100} height={70} className="rounded-lg object-cover border-2 border-accent w-24 h-16 group-hover:border-white transition-all" />
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-accent mb-1">{dest.name}</h2>
                        <p className="text-gray-100 mb-1 text-sm">{dest.description}</p>
                        <ul className="list-disc list-inside text-accent text-xs">
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
