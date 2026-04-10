"use client";

import adventures from '../adventures-data';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useBlueOneMode } from '../contexts/BlueOneContext';

export default function ThemesPage() {
  const [search, setSearch] = useState('');
  const { isBlueOneMode } = useBlueOneMode();
  
  const filteredAdventures = adventures.filter(
    adv =>
      adv.name.toLowerCase().includes(search.toLowerCase()) ||
      adv.description.toLowerCase().includes(search.toLowerCase()) ||
      (adv.features && adv.features.some(f => f.toLowerCase().includes(search.toLowerCase())))
  );
  
  return (
    <div className="max-w-5xl mx-auto py-16 px-4">
      <div className="text-center mb-12">
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
        <h1 className={`text-5xl font-extrabold mb-4 drop-shadow-lg tracking-tight animate-fade-in-up ${isBlueOneMode ? 'text-blue-900' : 'text-accent'}`}>
          {isBlueOneMode ? 'BlueOne Adventure Themes' : 'Exclusive Adventure Themes'}
        </h1>
        <p className={`text-xl ${isBlueOneMode ? 'text-blue-700' : 'text-gray-300'} max-w-3xl mx-auto`}>
          {isBlueOneMode 
            ? 'Enhance your BlueOne experience with our curated themed adventures across the Greek islands'
            : 'Discover our exclusive themed sailing adventures across the Greek islands'
          }
        </p>
      </div>
      
      <div className="mb-10 flex justify-center">
        <input
          type="text"
          placeholder="Search adventures..."
          className={`w-full max-w-md px-4 py-3 rounded-xl border text-lg focus:outline-none focus:ring-2 shadow ${
            isBlueOneMode 
              ? 'border-blue-300 bg-white text-gray-900 focus:ring-blue-500' 
              : 'border-accent bg-[#181f2d] text-white focus:ring-accent'
          }`}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {filteredAdventures.length === 0 ? (
          <div className={`col-span-2 text-center text-xl py-8 ${isBlueOneMode ? 'text-blue-600' : 'text-gray-300'}`}>
            No adventures match your search.
          </div>
        ) : (
          filteredAdventures.map((adv, i) => (
            <div key={adv.id} className={`overflow-hidden flex flex-col animate-fade-in-up rounded-2xl shadow-xl border ${
              isBlueOneMode 
                ? 'bg-white border-blue-200' 
                : 'card-premium'
            }`} style={{animationDelay:`${0.12 + i * 0.08}s`,animationFillMode:'both'}}>
              <div className="relative h-56 w-full">
                <Image
                  src={adv.image}
                  alt={adv.name}
                  fill
                  className="object-cover rounded-t-xl"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority={true}
                />
              </div>
              <div className={`p-8 flex flex-col flex-grow ${isBlueOneMode ? '' : ''}`}>
                <h2 className={`text-2xl font-bold mb-3 drop-shadow animate-fade-in-up ${
                  isBlueOneMode ? 'text-blue-900' : 'text-accent'
                }`} style={{animationDelay:'0.18s',animationFillMode:'both'}}>{adv.name}</h2>
                <p className={`mb-6 text-lg animate-fade-in-up ${
                  isBlueOneMode ? 'text-gray-700' : 'text-gray-200'
                }`} style={{animationDelay:'0.25s',animationFillMode:'both'}}>{adv.description}</p>
                <Link 
                  href={`/themes/${adv.id}`} 
                  className={`mt-auto text-center animate-fade-in-up px-6 py-3 rounded-xl font-semibold transition-colors ${
                    isBlueOneMode 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'button-premium'
                  }`} 
                  style={{animationDelay:'0.32s',animationFillMode:'both'}}
                >
                  View 7-Day Experience
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
