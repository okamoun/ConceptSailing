'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useBlueOneMode } from '../../contexts/BlueOneContext';

// BlueOne gallery images
const blueOneExteriorImages = [
  '/images/boats/blueone/External_sailing.jpg',
  '/images/boats/blueone/External_side.jpg',
  '/images/boats/blueone/External_rear.jpg',
  '/images/boats/blueone/External_front.jpg',
  '/images/boats/blueone/External_deck.jpg',
  '/images/boats/blueone/External_cockpit.jpg',
];

const blueOneInteriorImages = [
  '/images/boats/blueone/Interior_saloon.jpg',
  '/images/boats/blueone/Interior_kitchen.jpg',
  '/images/boats/blueone/Interior_cabin1.jpg',
  '/images/boats/blueone/Interior_cabin2.jpg',
  '/images/boats/blueone/Interior_bathroom.jpg',
  '/images/boats/blueone/Interior_navigation.jpg',
];

const blueOneCockpitImages = [
  '/images/boats/blueone/Cockpit_dining.jpg',
  '/images/boats/blueone/Cockpit_relax.jpg',
  '/images/boats/blueone/Cockpit_sunset.jpg',
  '/images/boats/blueone/Cockpit_view.jpg',
];

const allImages = [...blueOneExteriorImages, ...blueOneInteriorImages, ...blueOneCockpitImages];

export default function BlueOneGalleryPage() {
  const { setIsBlueOneMode } = useBlueOneMode();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setIsBlueOneMode(true);
  }, [setIsBlueOneMode]);

  const goToPrevious = () => {
    setSelectedImageIndex((prevIndex) => 
      prevIndex === 0 ? allImages.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setSelectedImageIndex((prevIndex) => (prevIndex + 1) % allImages.length);
  };

  const selectImage = (index: number) => {
    setSelectedImageIndex(index);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getImageCategory = (index: number) => {
    if (index < blueOneExteriorImages.length) return 'Exterior';
    if (index < blueOneExteriorImages.length + blueOneInteriorImages.length) return 'Interior';
    return 'Cockpit';
  };

  const getImageNumber = (index: number) => {
    if (index < blueOneExteriorImages.length) return index + 1;
    if (index < blueOneExteriorImages.length + blueOneInteriorImages.length) return index - blueOneExteriorImages.length + 1;
    return index - blueOneExteriorImages.length - blueOneInteriorImages.length + 1;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <Link 
            href="/blueone" 
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            Back to BlueOne
          </Link>
          <h1 className="text-4xl font-bold text-blue-900 mb-4">Complete BlueOne Gallery</h1>
          <p className="text-blue-700 text-lg">
            Explore every detail of the BlueOne catamaran in our comprehensive gallery
          </p>
        </div>

        {/* Main Image Viewer */}
        <div className="glass p-6 shadow-xl mb-8">
          <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
            <Image
              src={allImages[selectedImageIndex]}
              alt={`BlueOne ${getImageCategory(selectedImageIndex)} ${getImageNumber(selectedImageIndex)}`}
              fill
              className="object-contain"
              priority
            />
            
            {/* Image Overlay Info */}
            <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-full px-4 py-2 text-white">
              <span className="font-semibold">{getImageCategory(selectedImageIndex)}</span>
              <span className="mx-2">|</span>
              <span>{getImageNumber(selectedImageIndex)}</span>
            </div>

            {/* Controls */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={toggleFullscreen}
                className="bg-black/70 backdrop-blur-sm rounded-full p-2 text-white hover:bg-black/90 transition-colors"
                aria-label="Toggle fullscreen"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                </svg>
              </button>
            </div>

            {/* Navigation */}
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 backdrop-blur-sm rounded-full p-3 text-white hover:bg-black/90 transition-all transform hover:scale-110"
              aria-label="Previous image"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 backdrop-blur-sm rounded-full p-3 text-white hover:bg-black/90 transition-all transform hover:scale-110"
              aria-label="Next image"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </button>

            {/* Progress Indicator */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-black/70 backdrop-blur-sm rounded-full p-2">
                <div className="flex items-center justify-between text-white text-sm">
                  <span>{selectedImageIndex + 1} / {allImages.length}</span>
                  <span>BlueOne Gallery</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Thumbnail Grid */}
        <div className="glass p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-blue-900 mb-6">All Images</h2>
          
          {/* Exterior Images */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Exterior Views</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {blueOneExteriorImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => selectImage(index)}
                  className={`relative aspect-square rounded-lg overflow-hidden transition-all ${
                    selectedImageIndex === index 
                      ? 'ring-2 ring-blue-500 scale-105' 
                      : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`Exterior ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-2 left-2 right-2 text-white text-xs text-center">
                      Exterior {index + 1}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Interior Images */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Interior Views</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {blueOneInteriorImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => selectImage(blueOneExteriorImages.length + index)}
                  className={`relative aspect-square rounded-lg overflow-hidden transition-all ${
                    selectedImageIndex === blueOneExteriorImages.length + index 
                      ? 'ring-2 ring-blue-500 scale-105' 
                      : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`Interior ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-2 left-2 right-2 text-white text-xs text-center">
                      Interior {index + 1}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Cockpit Images */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-blue-800 mb-4">Cockpit Views</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {blueOneCockpitImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => selectImage(blueOneExteriorImages.length + blueOneInteriorImages.length + index)}
                  className={`relative aspect-square rounded-lg overflow-hidden transition-all ${
                    selectedImageIndex === blueOneExteriorImages.length + blueOneInteriorImages.length + index 
                      ? 'ring-2 ring-blue-500 scale-105' 
                      : 'hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`Cockpit ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-2 left-2 right-2 text-white text-xs text-center">
                      Cockpit {index + 1}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="glass p-8 shadow-xl">
            <h2 className="text-3xl font-bold text-blue-900 mb-4">Ready to Experience BlueOne?</h2>
            <p className="text-blue-700 mb-6">
              See these beautiful spaces in person on your next sailing adventure
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/booking?boat=BlueOne&brand=Fountaine%20Pajot&length=51%20ft&description=A%20new-generation%20catamaran%20with%20a%20focus%20on%20eco-responsibility,%20solar%20panels,%20and%20hybrid%20systems.&image=/images/boats/blueone/External_sailing.jpg"
                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg"
              >
                Book BlueOne Now
              </Link>
              <Link
                href="/blueone/contact"
                className="bg-blue-100 text-blue-900 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-200 transition-colors"
              >
                Contact for Details
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <div className="relative w-full h-full">
            <Image
              src={allImages[selectedImageIndex]}
              alt={`BlueOne ${getImageCategory(selectedImageIndex)} ${getImageNumber(selectedImageIndex)}`}
              fill
              className="object-contain"
            />
            
            {/* Close Button */}
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-full p-3 text-white hover:bg-black/90 transition-colors"
              aria-label="Close fullscreen"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>

            {/* Navigation */}
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 backdrop-blur-sm rounded-full p-4 text-white hover:bg-black/90 transition-all transform hover:scale-110"
              aria-label="Previous image"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 backdrop-blur-sm rounded-full p-4 text-white hover:bg-black/90 transition-all transform hover:scale-110"
              aria-label="Next image"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </button>

            {/* Image Info */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-black/70 backdrop-blur-sm rounded-full p-4">
                <div className="flex items-center justify-between text-white">
                  <span className="font-semibold">{getImageCategory(selectedImageIndex)} {getImageNumber(selectedImageIndex)}</span>
                  <span>{selectedImageIndex + 1} / {allImages.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
