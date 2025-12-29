'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import OptimizedImage from './common/OptimizedImage';
import { FaTimes, FaChevronLeft, FaChevronRight, FaTh } from 'react-icons/fa';

interface ProfessionalGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  productName?: string;
}

const ProfessionalGalleryModal: React.FC<ProfessionalGalleryModalProps> = ({ 
  isOpen, 
  onClose, 
  images = [], 
  initialIndex = 0, 
  productName = 'Product Gallery' 
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<number>>(new Set());
  const [showThumbnails, setShowThumbnails] = useState(true);
  const thumbnailsContainerRef = useRef<HTMLDivElement>(null);
  
  // Touch gesture handling
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const minSwipeDistance = 50;
  
  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setImageLoadErrors(new Set());
      setIsLoading(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          navigatePrevious();
          break;
        case 'ArrowRight':
          navigateNext();
          break;
        default:
          break;
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [isOpen, images.length, onClose]);

  const scrollToThumbnail = (index: number) => {
    if (thumbnailsContainerRef.current) {
      const container = thumbnailsContainerRef.current;
      const thumbnails = container.querySelectorAll('.thumbnail-item');
      
      if (thumbnails[index]) {
        const thumbnail = thumbnails[index] as HTMLElement;
        const containerWidth = container.offsetWidth;
        const thumbnailWidth = thumbnail.offsetWidth;
        const thumbnailLeft = thumbnail.offsetLeft;
        
        const targetScrollLeft = thumbnailLeft - (containerWidth / 2) + (thumbnailWidth / 2);
        
        container.scrollTo({
          left: targetScrollLeft,
          behavior: 'smooth'
        });
      }
    }
  };

  const navigateNext = useCallback(() => {
    if (images.length <= 1) return;
    
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsLoading(true);
    
    if (thumbnailsContainerRef.current) {
      const nextIndex = (currentIndex + 1) % images.length;
      scrollToThumbnail(nextIndex);
    }
  }, [images.length, currentIndex]);

  const navigatePrevious = useCallback(() => {
    if (images.length <= 1) return;
    
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsLoading(true);
    
    if (thumbnailsContainerRef.current) {
      const prevIndex = (currentIndex - 1 + images.length) % images.length;
      scrollToThumbnail(prevIndex);
    }
  }, [images.length, currentIndex]);

  const handleImageLoad = () => {
    setIsLoading(false);
    if (thumbnailsContainerRef.current) {
      scrollToThumbnail(currentIndex);
    }
  };

  const handleImageError = (index: number) => {
    setImageLoadErrors(prev => new Set(prev).add(index));
    setIsLoading(false);
  };
  
  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartX.current) return;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      navigateNext();
    } else if (isRightSwipe) {
      navigatePrevious();
    }
    
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleThumbnailClick = (index: number) => {
    if (currentIndex !== index) {
      setCurrentIndex(index);
      setIsLoading(true);
    }
  };

  if (!isOpen || images.length === 0) return null;

  const currentImageUrl = images[currentIndex] || '';
  const hasError = imageLoadErrors.has(currentIndex);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 flex flex-col"
      onClick={onClose}
    >
      <div 
        className="flex flex-col h-full w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black/50 border-b border-white/10">
          <div className="flex items-center gap-4">
            <h2 className="text-white font-semibold text-lg truncate max-w-[200px] sm:max-w-none">
              {productName}
            </h2>
            <span className="text-white/70 text-sm">
              {currentIndex + 1} / {images.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              onClick={() => setShowThumbnails(!showThumbnails)}
              title={`${showThumbnails ? 'Hide' : 'Show'} thumbnails`}
            >
              <FaTh className="w-5 h-5" />
            </button>
            <button 
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              onClick={onClose}
              title="Close gallery (ESC)"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Main Image Display */}
        <div 
          className="flex-1 relative flex items-center justify-center p-4"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white"></div>
            </div>
          )}
          
          {hasError ? (
            <div className="text-center text-white/70">
              <svg className="w-16 h-16 mx-auto mb-4 text-white/40" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
              <p>Unable to load this image</p>
            </div>
          ) : (
            <OptimizedImage
              src={currentImageUrl}
              alt={`${productName} - Image ${currentIndex + 1}`}
              onLoad={handleImageLoad}
              onError={() => handleImageError(currentIndex)}
              className={`max-h-[70vh] max-w-full object-contain transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
              size="large"
              category={productName}
              lazy={false}
            />
          )}
          
          {/* Navigation buttons */}
          {images.length > 1 && (
            <>
              <button 
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  navigatePrevious();
                }}
                title="Previous image"
              >
                <FaChevronLeft className="w-6 h-6" />
              </button>
              <button 
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateNext();
                }}
                title="Next image"
              >
                <FaChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
        
        {/* Thumbnails */}
        {showThumbnails && images.length > 1 && (
          <div className="bg-black/50 border-t border-white/10 p-4">
            <div 
              className="flex gap-2 overflow-x-auto scrollbar-hide justify-center"
              ref={thumbnailsContainerRef}
            >
              {images.map((image, index) => (
                <button 
                  key={index}
                  className={`thumbnail-item flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    index === currentIndex 
                      ? 'border-primary ring-2 ring-primary/50' 
                      : 'border-transparent hover:border-white/30'
                  }`}
                  onClick={() => handleThumbnailClick(index)}
                >
                  <OptimizedImage
                    src={image}
                    alt={`Thumbnail ${index + 1}`} 
                    className="w-full h-full object-cover"
                    size="thumbnail"
                    category={productName}
                    lazy={false}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalGalleryModal;
