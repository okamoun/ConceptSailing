'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { BoatImage, ImageCategory, getFeaturedImages, getImagesByCategory } from '@/app/constants/boat-images';

interface BoatGalleryGridProps {
  showFeaturedSection?: boolean;
  initialCategory?: ImageCategory;
  categories?: ImageCategory[];
  enableFiltering?: boolean;
  columns?: 2 | 3 | 4;
  height?: number;
}

const categoryLabels: Record<ImageCategory, string> = {
  exterior: '🌊 Exterior',
  interior: '🛏️ Interior',
  cockpit: '🍽️ Cockpit & Dining',
  drone: '🛩️ Aerial Views',
  activities: '🏄 Activities',
  food: '🍽️ Culinary',
};

const categoryColors: Record<ImageCategory, string> = {
  exterior: 'from-blue-600 to-blue-500',
  interior: 'from-amber-600 to-amber-500',
  cockpit: 'from-orange-600 to-orange-500',
  drone: 'from-purple-600 to-purple-500',
  activities: 'from-green-600 to-green-500',
  food: 'from-red-600 to-red-500',
};

export default function BoatGalleryGrid({
  showFeaturedSection = true,
  initialCategory = 'exterior',
  categories = ['exterior', 'interior', 'cockpit', 'drone'],
  enableFiltering = true,
  columns = 4,
}: BoatGalleryGridProps) {
  const [activeCategory, setActiveCategory] = useState<ImageCategory>(initialCategory);
  const [selectedImage, setSelectedImage] = useState<BoatImage | null>(null);
  const [imageLoadError, setImageLoadError] = useState<string | null>(null);

  const activeImages = getImagesByCategory(activeCategory);
  const featuredImages = getFeaturedImages();

  const gridColsClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  const handleImageError = useCallback((error: Error, imageSrc: string) => {
    console.error(`Failed to load image: ${imageSrc}`, error);
    setImageLoadError(imageSrc);
  }, []);

  const handlePrevImage = useCallback(() => {
    if (!selectedImage) return;
    const currentIndex = activeImages.findIndex(img => img.id === selectedImage.id);
    if (currentIndex > 0) {
      setSelectedImage(activeImages[currentIndex - 1]);
    }
  }, [selectedImage, activeImages]);

  const handleNextImage = useCallback(() => {
    if (!selectedImage) return;
    const currentIndex = activeImages.findIndex(img => img.id === selectedImage.id);
    if (currentIndex < activeImages.length - 1) {
      setSelectedImage(activeImages[currentIndex + 1]);
    }
  }, [selectedImage, activeImages]);

  // Featured images section
  const FeaturedSection = () => (
    <section className="mb-16">
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Featured Gallery</h2>
        <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"></div>
      </div>

      {/* Featured images grid - all categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {featuredImages.map((image) => (
          <div
            key={image.id}
            className="relative group cursor-pointer rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
            onClick={() => {
              setActiveCategory(image.category);
              setSelectedImage(image);
            }}
          >
            <div className="relative w-full h-64 bg-gray-200">
              {imageLoadError !== image.src && (
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => handleImageError(e as unknown as Error, image.src)}
                  priority={false}
                  loading="lazy"
                />
              )}
            </div>

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
              {image.title && <p className="text-white font-semibold text-sm">{image.title}</p>}
              <p className="text-white/80 text-xs">{categoryLabels[image.category]}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  // Category tabs
  const CategoryTabs = () => (
    <div className="mb-8 flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => setActiveCategory(category)}
          className={`px-6 py-2 rounded-full font-semibold transition-all ${
            activeCategory === category
              ? `bg-gradient-to-r ${categoryColors[category]} text-white shadow-lg scale-105`
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {categoryLabels[category]}
        </button>
      ))}
    </div>
  );

  // Main gallery grid
  const GalleryGrid = () => (
    <div className={`grid ${gridColsClass[columns]} gap-4`}>
      {activeImages.map((image) => (
        <div
          key={image.id}
          className="relative group cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
          onClick={() => setSelectedImage(image)}
        >
          <div className="relative w-full bg-gray-200" style={{ paddingBottom: '75%' }}>
            {imageLoadError !== image.src && (
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => handleImageError(e as unknown as Error, image.src)}
                loading="lazy"
              />
            )}
          </div>

          {/* Featured badge */}
          {image.featured && (
            <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              ⭐ Featured
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-white font-semibold text-sm bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              View
            </span>
          </div>
        </div>
      ))}
    </div>
  );

  // Lightbox modal
  const Lightbox = () => {
    if (!selectedImage) return null;

    const currentIndex = activeImages.findIndex(img => img.id === selectedImage.id);
    const hasNext = currentIndex < activeImages.length - 1;
    const hasPrev = currentIndex > 0;

    return (
      <div
        className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
        onClick={() => setSelectedImage(null)}
      >
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 transition-colors z-60"
          onClick={() => setSelectedImage(null)}
          aria-label="Close lightbox"
        >
          ×
        </button>

        {/* Image container */}
        <div className="relative max-w-4xl max-h-[85vh] w-full" onClick={(e) => e.stopPropagation()}>
          {imageLoadError !== selectedImage.src && (
            <Image
              src={selectedImage.src}
              alt={selectedImage.alt}
              width={1200}
              height={900}
              className="w-full h-full object-contain rounded-lg"
              priority
            />
          )}

          {/* Image info */}
          {(selectedImage.title || selectedImage.description) && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg text-white">
              {selectedImage.title && <h3 className="text-xl font-bold mb-2">{selectedImage.title}</h3>}
              {selectedImage.description && <p className="text-sm text-gray-200">{selectedImage.description}</p>}
            </div>
          )}

          {/* Navigation arrows */}
          {hasPrev && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevImage();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-3 transition-all"
              aria-label="Previous image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {hasNext && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNextImage();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white rounded-full p-3 transition-all"
              aria-label="Next image"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Image counter */}
          <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold">
            {currentIndex + 1} / {activeImages.length}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full bg-gray-50 py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Featured section */}
        {showFeaturedSection && <FeaturedSection />}

        {/* Gallery section title */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Complete Gallery
          </h2>
          <p className="text-gray-600 mb-6">
            Browse all images from the {categoryLabels[activeCategory].toLowerCase()}
          </p>

          {/* Category filters */}
          {enableFiltering && categories.length > 1 && <CategoryTabs />}
        </div>

        {/* Gallery grid */}
        <GalleryGrid />

        {/* Image count */}
        <p className="text-sm text-gray-500 mt-8 text-center">
          Showing {activeImages.length} image{activeImages.length !== 1 ? 's' : ''} in {categoryLabels[activeCategory].toLowerCase()}
        </p>

        {/* Lightbox */}
        <Lightbox />
      </div>
    </div>
  );
}
