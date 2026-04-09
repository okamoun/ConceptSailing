'use client';

import Link from 'next/link';
import { boats } from '../boats-data';
import Image from "next/image";

export default function BoatsPage() {
  const handleBookingClick = (e: React.MouseEvent, boatName: string, boatBrand: string, boatLength: string, boatDescription: string, boatImage: string) => {
    e.stopPropagation();
    window.location.href = `/booking?boat=${encodeURIComponent(boatName)}&brand=${encodeURIComponent(boatBrand)}&length=${encodeURIComponent(boatLength)}&description=${encodeURIComponent(boatDescription)}&image=${encodeURIComponent(boatImage)}`;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#101824] to-[#1f2937] py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-6xl font-black text-accent drop-shadow-lg mb-10 text-center animate-fade-in-up">Eco-friendly Luxury Catamarans</h1>
        <p className="text-2xl text-gray-200 mb-12 text-center animate-fade-in-up" style={{animationDelay:'0.12s',animationFillMode:'both'}}>Sail aboard the finest eco-friendly catamarans (48-60ft) from Fountaine Pajot and Lagoon. 
                        Each yacht is equipped with advanced safety systems, solar panels, watermakers, and a full range of 
                        leisure gear for your comfort and enjoyment.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {boats.map((boat, i) => (
            <Link 
              key={boat.name} 
              href={`/boats/${boat.name.toLowerCase().replace(/\s+/g, '-')}`}
              className="glass flex flex-col md:flex-row items-center p-6 gap-8 shadow-xl animate-fade-in-up hover:scale-[1.02] transition-transform cursor-pointer border-2 border-transparent hover:border-accent/50" 
              style={{animationDelay:`${0.14 + i*0.08}s`,animationFillMode:'both'}}
            >
              <Image src={boat.image} alt={boat.name} width={400} height={224} className="w-full md:w-64 h-56 object-cover rounded-xl border-4 border-accent shadow-lg bg-[#222]" priority draggable={false} tabIndex={-1} />
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-accent mb-2">{boat.name}</h2>
                <p className="text-lg text-gray-300 mb-1"><span className="font-semibold">Brand:</span> {boat.brand}</p>
                <p className="text-lg text-gray-300 mb-1"><span className="font-semibold">Length:</span> {boat.length}</p>
                <p className="text-lg text-gray-100 mt-2">{boat.description}</p>
                <div className="mt-4 flex gap-4">
                  <div className="text-accent font-semibold flex items-center gap-2">
                    View Details
                  </div>
                  <button
                    onClick={(e) => handleBookingClick(e, boat.name, boat.brand, boat.length, boat.description, boat.image)}
                    className="bg-accent text-white px-4 py-2 rounded-lg font-semibold hover:bg-accent/90 transition-colors"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
