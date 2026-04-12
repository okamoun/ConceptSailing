'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface BlueOneGallerySlideshowProps {
  images: string[];
  className?: string;
}

export default function BlueOneGallerySlideshow({ images, className = '' }: BlueOneGallerySlideshowProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Auto-advance slideshow
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [isPlaying, images.length]);

  const goToPrevious = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  if (images.length === 0) return null;

  return (
    <div className={`relative ${className}`}>
      {/* Main Slideshow Container */}
      <div className="relative glass p-4 shadow-xl animate-fade-in-up">
        <div className="relative aspect-video rounded-lg overflow-hidden group">
          {/* Current Image */}
          <Image
            src={images[currentImageIndex]}
            alt={`BlueOne Gallery Image ${currentImageIndex + 1}`}
            fill
            className="object-cover transition-opacity duration-500"
            priority={currentImageIndex === 0}
          />
          
          {/* Overlay Controls */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {/* Top Controls */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
              <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm">
                {currentImageIndex + 1} / {images.length}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={togglePlayPause}
                  className="bg-black/50 backdrop-blur-sm rounded-full p-2 text-white hover:bg-black/70 transition-colors"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>
                <Link
                  href="/blueone/gallery"
                  className="bg-black/50 backdrop-blur-sm rounded-full p-2 text-white hover:bg-black/70 transition-colors"
                  aria-label="View full gallery"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                  </svg>
                </Link>
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm rounded-full p-3 text-white hover:bg-black/70 transition-all transform hover:scale-110"
              aria-label="Previous image"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm rounded-full p-3 text-white hover:bg-black/70 transition-all transform hover:scale-110"
              aria-label="Next image"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
              </svg>
            </button>

            {/* Bottom Thumbnail Strip */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-black/50 backdrop-blur-sm rounded-full p-2">
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => goToImage(index)}
                      className={`relative flex-shrink-0 w-16 h-12 rounded overflow-hidden transition-all ${
                        index === currentImageIndex 
                          ? 'ring-2 ring-blue-400 scale-110' 
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Click to expand hint */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Click to view full gallery
            </div>
          </div>
        </div>

        {/* Image Caption */}
        <div className="mt-4 text-center">
          <p className="text-blue-200 text-sm">
            BlueOne Gallery - Image {currentImageIndex + 1} of {images.length}
          </p>
        </div>
      </div>
    </div>
  );
}
