"use client";

import adventures from '../adventures-data';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function ThemesPage() {
  const [search, setSearch] = useState('');
  const filteredAdventures = adventures.filter(
    adv =>
      adv.name.toLowerCase().includes(search.toLowerCase()) ||
      adv.description.toLowerCase().includes(search.toLowerCase()) ||
      (adv.features && adv.features.some(f => f.toLowerCase().includes(search.toLowerCase())))
  );
  return (
    <div className="max-w-5xl mx-auto py-16 px-4">
      <h1 className="text-5xl font-extrabold mb-12 text-center text-accent drop-shadow-lg tracking-tight animate-fade-in-up">Exclusive Adventure Themes</h1>
      <div className="mb-10 flex justify-center">
        <input
          type="text"
          placeholder="Search adventures..."
          className="w-full max-w-md px-4 py-3 rounded-xl border border-accent bg-[#181f2d] text-lg text-white focus:outline-none focus:ring-2 focus:ring-accent shadow"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {filteredAdventures.length === 0 ? (
          <div className="col-span-2 text-center text-gray-300 text-xl py-8">No adventures match your search.</div>
        ) : (
          filteredAdventures.map((adv, i) => (
            <div key={adv.id} className="card-premium overflow-hidden flex flex-col animate-fade-in-up" style={{animationDelay:`${0.12 + i * 0.08}s`,animationFillMode:'both'}}>
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
              <div className="p-8 flex flex-col flex-grow">
                <h2 className="text-2xl font-bold mb-3 text-accent drop-shadow animate-fade-in-up" style={{animationDelay:'0.18s',animationFillMode:'both'}}>{adv.name}</h2>
                <p className="mb-6 text-gray-200 text-lg animate-fade-in-up" style={{animationDelay:'0.25s',animationFillMode:'both'}}>{adv.description}</p>
                <Link href={`/themes/${adv.id}`} className="mt-auto button-premium text-center animate-fade-in-up" style={{animationDelay:'0.32s',animationFillMode:'both'}}>View 7-Day Experience</Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
