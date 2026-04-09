'use client';

import Link from 'next/link';
import { boats } from '../boats-data';
import Image from "next/image";
import { useState } from 'react';

export default function BoatsPage() {
  const [sortBy, setSortBy] = useState<'name' | 'length' | 'brand'>('name');
  const [selectedBrand, setSelectedBrand] = useState<'all' | 'Fountaine Pajot' | 'Lagoon'>('all');

  const handleBookingClick = (e: React.MouseEvent, boatName: string, boatBrand: string, boatLength: string, boatDescription: string, boatImage: string) => {
    e.stopPropagation();
    window.location.href = `/booking?boat=${encodeURIComponent(boatName)}&brand=${encodeURIComponent(boatBrand)}&length=${encodeURIComponent(boatLength)}&description=${encodeURIComponent(boatDescription)}&image=${encodeURIComponent(boatImage)}`;
  };

  // Filter and sort boats
  const filteredBoats = boats
    .filter(boat => selectedBrand === 'all' || boat.brand === selectedBrand)
    .sort((a, b) => {
      if (sortBy === 'length') {
        const aLength = parseInt(a.length);
        const bLength = parseInt(b.length);
        return bLength - aLength;
      }
      return a[sortBy].localeCompare(b[sortBy]);
    });

  const brands = ['all', ...Array.from(new Set(boats.map(boat => boat.brand)))];

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#101824] to-[#1f2937] py-16">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 mb-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-accent drop-shadow-lg mb-6 animate-fade-in-up">
            Premium Catamaran Fleet
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto animate-fade-in-up" style={{animationDelay:'0.12s',animationFillMode:'both'}}>
            Experience luxury sailing aboard our eco-friendly catamarans (48-60ft) from Fountaine Pajot and Lagoon. 
            Each yacht features advanced safety systems, solar panels, watermakers, and premium leisure equipment.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="glass p-6 text-center animate-fade-in-up" style={{animationDelay:'0.2s',animationFillMode:'both'}}>
            <div className="text-3xl font-bold text-accent mb-2">{boats.length}</div>
            <div className="text-gray-300">Premium Yachts</div>
          </div>
          <div className="glass p-6 text-center animate-fade-in-up" style={{animationDelay:'0.24s',animationFillMode:'both'}}>
            <div className="text-3xl font-bold text-accent mb-2">48-60ft</div>
            <div className="text-gray-300">Size Range</div>
          </div>
          <div className="glass p-6 text-center animate-fade-in-up" style={{animationDelay:'0.28s',animationFillMode:'both'}}>
            <div className="text-3xl font-bold text-accent mb-2">2</div>
            <div className="text-gray-300">Premium Brands</div>
          </div>
          <div className="glass p-6 text-center animate-fade-in-up" style={{animationDelay:'0.32s',animationFillMode:'both'}}>
            <div className="text-3xl font-bold text-accent mb-2">Eco</div>
            <div className="text-gray-300">Sustainable</div>
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="glass p-6 mb-12 animate-fade-in-up" style={{animationDelay:'0.36s',animationFillMode:'both'}}>
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Filter by Brand</label>
                <select 
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value as any)}
                  className="bg-[#1f2937] border border-accent/50 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  {brands.map(brand => (
                    <option key={brand} value={brand}>
                      {brand === 'all' ? 'All Brands' : brand}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Sort by</label>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-[#1f2937] border border-accent/50 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="name">Name</option>
                  <option value="length">Length</option>
                  <option value="brand">Brand</option>
                </select>
              </div>
            </div>
            <div className="text-gray-300">
              Showing {filteredBoats.length} of {boats.length} yachts
            </div>
          </div>
        </div>

        {/* Boat Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredBoats.map((boat, i) => (
            <Link 
              key={boat.name} 
              href={`/boats/${boat.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="group glass rounded-2xl overflow-hidden shadow-xl animate-fade-in-up hover:shadow-2xl transition-all duration-300 border border-accent/20 hover:border-accent/40" 
              style={{animationDelay:`${0.4 + i*0.1}s`,animationFillMode:'both'}}
            >
              {/* Image Section */}
              <div className="relative h-64 overflow-hidden">
                <Image 
                  src={boat.image} 
                  alt={boat.name} 
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  priority 
                  draggable={false} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                
                {/* Floating Badge */}
                <div className="absolute top-4 right-4 bg-accent text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {boat.length}
                </div>
                
                {/* Brand Badge */}
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm">
                  {boat.brand}
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-accent transition-colors">
                      {boat.name}
                    </h2>
                    <div className="flex items-center gap-4 text-gray-300 text-sm">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 12a1 1 0 11-2 0V8a1 1 0 112 0v4zm1-5a1 1 0 100-2 1 1 0 000 2z"/>
                        </svg>
                        {boat.length}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 2L2 7v11a1 1 0 001 1h14a1 1 0 001-1V7l-8-5z"/>
                        </svg>
                        {boat.brand}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-300 leading-relaxed mb-6 line-clamp-3">
                  {boat.description}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <div className="flex-1 flex items-center justify-center bg-accent/10 border border-accent/30 text-accent px-4 py-2 rounded-lg font-semibold hover:bg-accent/20 transition-colors">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Details
                  </div>
                  <button
                    onClick={(e) => handleBookingClick(e, boat.name, boat.brand, boat.length, boat.description, boat.image)}
                    className="flex-1 bg-accent text-white px-4 py-2 rounded-lg font-semibold hover:bg-accent/90 transition-colors flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Book Now
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* No Results Message */}
        {filteredBoats.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg">No boats found matching your criteria.</div>
            <button 
              onClick={() => setSelectedBrand('all')}
              className="mt-4 text-accent hover:text-accent/80 underline"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="glass p-8 animate-fade-in-up" style={{animationDelay:'0.8s',animationFillMode:'both'}}>
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Set Sail?</h3>
            <p className="text-gray-300 mb-6">Contact our team to discuss your perfect sailing adventure</p>
            <Link 
              href="/contact"
              className="inline-block bg-accent text-white px-8 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
