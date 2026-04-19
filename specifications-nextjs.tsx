/**
 * BlueOne Yacht Specifications Page
 * Next.js 14 App Router Component
 * 
 * Installation Instructions:
 * 1. Save this file as: app/specifications/page.tsx
 * 2. Update the navigation menu in your layout to include a link to /specifications
 * 3. Add to the navigation: <Link href="/specifications">Specifications</Link>
 */

'use client';

import React from 'react';
import Link from 'next/link';

export default function SpecificationsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">BlueOne Specifications</h1>
          <p className="text-lg opacity-95">Complete Technical Details - Fountaine Pajot Aura 51</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Intro */}
        <div className="bg-blue-50 border-l-4 border-blue-700 p-6 rounded mb-12">
          <p className="text-gray-700">
            <strong>BlueOne</strong> is the first hybrid commercial catamaran operating in Greek waters, 
            combining luxury, sustainability, and exceptional performance. Explore our comprehensive specifications below.
          </p>
        </div>

        {/* Quick Facts Grid */}
        <h2 className="text-3xl font-bold text-blue-900 mb-2 pb-3 border-b-4 border-blue-700">Quick Facts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
          {/* Vessel Info Card */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg hover:translate-y-[-5px] transition-all">
            <h3 className="text-xl font-bold text-blue-900 mb-4 pb-2 border-b-2 border-blue-700">🚤 Vessel Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-semibold text-blue-900">Vessel Name:</span>
                <span className="text-gray-700">BlueOne</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-blue-900">Manufacturer:</span>
                <span className="text-gray-700">Fountaine Pajot</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-blue-900">Model:</span>
                <span className="text-gray-700">Aura 51</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-blue-900">Year Built:</span>
                <span className="text-gray-700">2025</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-blue-900">Type:</span>
                <span className="text-gray-700">Luxury Catamaran</span>
              </div>
            </div>
          </div>

          {/* Dimensions Card */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg hover:translate-y-[-5px] transition-all">
            <h3 className="text-xl font-bold text-blue-900 mb-4 pb-2 border-b-2 border-blue-700">📏 Dimensions</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-semibold text-blue-900">Length:</span>
                <span className="text-gray-700">51 Feet</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-blue-900">Beam (Width):</span>
                <span className="text-gray-700">26.70 Feet</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-blue-900">Draft:</span>
                <span className="text-gray-700">4.70 Feet</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-blue-900">Max Capacity:</span>
                <span className="text-gray-700">10 Persons</span>
              </div>
            </div>
          </div>

          {/* Performance Card */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg hover:translate-y-[-5px] transition-all">
            <h3 className="text-xl font-bold text-blue-900 mb-4 pb-2 border-b-2 border-blue-700">⚡ Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-semibold text-blue-900">Cruising Speed:</span>
                <span className="text-gray-700">7 Knots</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-blue-900">Max Speed:</span>
                <span className="text-gray-700">10 Knots</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-blue-900">Engines:</span>
                <span className="text-gray-700">2 x 70A</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-blue-900">Generator:</span>
                <span className="text-gray-700">Kohler 32 kVA</span>
              </div>
            </div>
          </div>

          {/* Accommodations Card */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg hover:translate-y-[-5px] transition-all">
            <h3 className="text-xl font-bold text-blue-900 mb-4 pb-2 border-b-2 border-blue-700">🛏️ Accommodations</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-semibold text-blue-900">Total Cabins:</span>
                <span className="text-gray-700">7 (5 Guest + 2 Crew)</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-blue-900">Configuration:</span>
                <span className="text-gray-700">5 Double + 2 Crew</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-blue-900">Heads:</span>
                <span className="text-gray-700">5</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-blue-900">Showers:</span>
                <span className="text-gray-700">5</span>
              </div>
            </div>
          </div>

          {/* Sustainability Card */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg hover:translate-y-[-5px] transition-all">
            <h3 className="text-xl font-bold text-blue-900 mb-4 pb-2 border-b-2 border-blue-700">🌍 Sustainability</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-semibold text-blue-900">Power System:</span>
                <span className="text-gray-700">Solar + Hybrid</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-blue-900">Water Maker:</span>
                <span className="text-gray-700">Yes</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-blue-900">Internet:</span>
                <span className="text-gray-700">Starlink</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-blue-900">Emissions:</span>
                <span className="text-gray-700">Zero Noise/Air</span>
              </div>
            </div>
          </div>

          {/* Crew Card */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg hover:translate-y-[-5px] transition-all">
            <h3 className="text-xl font-bold text-blue-900 mb-4 pb-2 border-b-2 border-blue-700">👥 Crew</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-semibold text-blue-900">Captain:</span>
                <span className="text-gray-700">Professional</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-blue-900">Chef:</span>
                <span className="text-gray-700">Professional</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-blue-900">Experience:</span>
                <span className="text-gray-700">6+ years</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-blue-900">Cuisine:</span>
                <span className="text-gray-700">Mediterranean</span>
              </div>
            </div>
          </div>
        </div>

        {/* Complete Specifications Table */}
        <h2 className="text-3xl font-bold text-blue-900 mb-2 pb-3 border-b-4 border-blue-700 mt-12">Complete Specifications</h2>
        
        <div className="overflow-x-auto my-8 bg-white rounded-lg shadow-md">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Category</th>
                <th className="px-6 py-4 text-left font-semibold">Specification</th>
                <th className="px-6 py-4 text-left font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {/* Onboard Systems */}
              <tr className="bg-blue-50">
                <td colSpan={3} className="px-6 py-4 font-bold text-blue-900">ONBOARD SYSTEMS & POWER</td>
              </tr>
              <tr className="hover:bg-gray-50"><td className="px-6 py-4">Systems</td><td className="px-6 py-4">Air Conditioning</td><td className="px-6 py-4">Full - Throughout vessel</td></tr>
              <tr className="hover:bg-gray-50"><td className="px-6 py-4">Systems</td><td className="px-6 py-4">Engines</td><td className="px-6 py-4">2 x 70A</td></tr>
              <tr className="hover:bg-gray-50"><td className="px-6 py-4">Systems</td><td className="px-6 py-4">Generator</td><td className="px-6 py-4">Kohler 32 kVA</td></tr>
              <tr className="hover:bg-gray-50"><td className="px-6 py-4">Systems</td><td className="px-6 py-4">Water Maker</td><td className="px-6 py-4">Yes</td></tr>
              <tr className="hover:bg-gray-50"><td className="px-6 py-4">Systems</td><td className="px-6 py-4">Ice Maker</td><td className="px-6 py-4">No</td></tr>
              <tr className="hover:bg-gray-50"><td className="px-6 py-4">Systems</td><td className="px-6 py-4">Power System</td><td className="px-6 py-4">Solar Panels & Hybrid Systems</td></tr>
              <tr className="hover:bg-gray-50"><td className="px-6 py-4">Systems</td><td className="px-6 py-4">Internet</td><td className="px-6 py-4">Starlink High-Speed Internet</td></tr>

              {/* Amenities */}
              <tr className="bg-blue-50">
                <td colSpan={3} className="px-6 py-4 font-bold text-blue-900">AMENITIES</td>
              </tr>
              <tr className="hover:bg-gray-50"><td className="px-6 py-4">Amenities</td><td className="px-6 py-4">Entertainment</td><td className="px-6 py-4">Smart TV & Entertainment System</td></tr>
              <tr className="hover:bg-gray-50"><td className="px-6 py-4">Amenities</td><td className="px-6 py-4">Audio</td><td className="px-6 py-4">Premium Sound System & Outdoor Speakers</td></tr>
              <tr className="hover:bg-gray-50"><td className="px-6 py-4">Amenities</td><td className="px-6 py-4">Kitchen</td><td className="px-6 py-4">Full Kitchen Equipment with Professional Chef</td></tr>
              <tr className="hover:bg-gray-50"><td className="px-6 py-4">Amenities</td><td className="px-6 py-4">Dining</td><td className="px-6 py-4">Open Saloon with panoramic views</td></tr>
              <tr className="hover:bg-gray-50"><td className="px-6 py-4">Amenities</td><td className="px-6 py-4">Outdoor</td><td className="px-6 py-4">BBQ Grill, Deck Shower, Bimini Shade</td></tr>

              {/* Water Sports */}
              <tr className="bg-blue-50">
                <td colSpan={3} className="px-6 py-4 font-bold text-blue-900">WATER SPORTS & ACTIVITIES</td>
              </tr>
              <tr className="hover:bg-gray-50"><td className="px-6 py-4">Water Sports</td><td className="px-6 py-4">Tender</td><td className="px-6 py-4">Highfield 380 + Honda 30 HP (4 person)</td></tr>
              <tr className="hover:bg-gray-50"><td className="px-6 py-4">Water Sports</td><td className="px-6 py-4">Seabobs</td><td className="px-6 py-4">1 x Premium underwater scooter</td></tr>
              <tr className="hover:bg-gray-50"><td className="px-6 py-4">Water Sports</td><td className="px-6 py-4">Equipment</td><td className="px-6 py-4">SUP, Wakeboard, Kayak, Snorkel Gear</td></tr>
              <tr className="hover:bg-gray-50"><td className="px-6 py-4">Water Sports</td><td className="px-6 py-4">Platform</td><td className="px-6 py-4">Swim Platform with Boarding Ladder</td></tr>
            </tbody>
          </table>
        </div>

        {/* Highlight Box */}
        <div className="bg-blue-50 border-l-4 border-blue-700 p-8 rounded-lg my-12">
          <h3 className="text-2xl font-bold text-blue-900 mb-4">Why Choose BlueOne?</h3>
          <ul className="space-y-3 text-gray-700">
            <li><strong className="text-blue-900">Eco-Conscious Luxury:</strong> The first hybrid commercial catamaran in Greek waters, combining cutting-edge sustainability with premium comfort.</li>
            <li><strong className="text-blue-900">Expert Crew:</strong> Professional Captain and Chef with Mediterranean expertise and 6+ years of maritime experience.</li>
            <li><strong className="text-blue-900">Modern Amenities:</strong> Complete with Starlink internet, solar power, advanced entertainment systems, and full kitchen facilities.</li>
          </ul>
        </div>

        {/* Call to Action */}
        <div className="text-center py-12">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">Ready for Your BlueOne Adventure?</h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link 
              href="/contact"
              className="bg-blue-700 hover:bg-blue-900 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Book Your Charter
            </Link>
            <Link 
              href="/blueone"
              className="bg-white hover:bg-blue-700 text-blue-900 hover:text-white border-2 border-blue-700 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              View More
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="bg-gray-100 py-8 mt-12 text-center text-gray-600">
        <p>&copy; 2025 BlueOne Luxury Yacht Charters. All rights reserved.</p>
        <p>Athens, Greece | contact@nj3cruises.com | +33 6 75 60 45 32</p>
      </div>
    </div>
  );
}
