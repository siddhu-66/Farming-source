'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface ImageGalleryProps {
  images: string[];
  organicCertified?: boolean;
  qualityGrade?: string;
}

export function ImageGallery({ images, organicCertified, qualityGrade }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // If no images provided, use a mock set
  const displayImages = images?.length ? images : [
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80',
    'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&q=80',
    'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80' // Mock duplicates for demo
  ];

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % displayImages.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className={`relative bg-gray-100 dark:bg-gray-800 rounded-3xl overflow-hidden group ${isFullscreen ? 'fixed inset-0 z-50 rounded-none bg-black flex items-center justify-center' : 'aspect-[4/3] shadow-sm'}`}>
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={displayImages[currentIndex]}
            alt={`Crop image ${currentIndex + 1}`}
            className="w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        </AnimatePresence>

        {/* Badges */}
        {!isFullscreen && (
          <div className="absolute top-4 left-4 flex gap-2 z-10">
            {organicCertified && <Badge variant="success" className="bg-green-600 text-sm shadow-md py-1">100% Organic</Badge>}
            <Badge variant="secondary" className="bg-white/90 dark:bg-black/90 backdrop-blur-md text-sm shadow-md py-1">{qualityGrade || 'Grade A'}</Badge>
          </div>
        )}

        {/* Controls */}
        <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button onClick={handlePrev} className="p-2 rounded-full bg-white/50 hover:bg-white backdrop-blur-md text-gray-900 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={handleNext} className="p-2 rounded-full bg-white/50 hover:bg-white backdrop-blur-md text-gray-900 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Fullscreen Toggle */}
        <button 
          onClick={() => setIsFullscreen(!isFullscreen)} 
          className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
        >
          {isFullscreen ? <span className="text-sm font-medium px-2">Close Fullscreen</span> : <Maximize2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Thumbnails */}
      {!isFullscreen && displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative h-20 w-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                currentIndex === idx ? 'border-primary shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
