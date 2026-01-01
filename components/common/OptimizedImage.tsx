'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { FaImage } from 'react-icons/fa';
import ImageService from '../../services/imageService';

interface OptimizedImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  size?: 'small' | 'medium' | 'large' | 'thumbnail';
  category?: string;
  lazy?: boolean;
  aspectRatio?: 'square' | 'wide' | 'tall' | 'auto';
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
  fill?: boolean;
}

interface ImageState {
  loaded: boolean;
  error: boolean;
  currentSrc: string | null;
}

const sizeConfig: Record<string, { width: number; height: number }> = {
  small: { width: 300, height: 300 },
  medium: { width: 600, height: 600 },
  large: { width: 1200, height: 1200 },
  thumbnail: { width: 150, height: 150 }
};

const aspectRatioClasses: Record<string, string> = {
  square: 'aspect-square',
  wide: 'aspect-video',
  tall: 'aspect-[3/4]',
  auto: '' // No aspect ratio class - inherits from parent container
};

// Responsive sizes for Next.js Image
const getSizes = (size: string): string => {
  switch (size) {
    case 'thumbnail':
      return '150px';
    case 'small':
      return '(max-width: 640px) 50vw, (max-width: 768px) 33vw, 300px';
    case 'medium':
      return '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 400px';
    case 'large':
      return '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 800px';
    default:
      return '(max-width: 640px) 100vw, (max-width: 768px) 50vw, 400px';
  }
};

const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src,
  alt = 'Product Image',
  className = '',
  style = {},
  size = 'medium',
  category = '',
  lazy = true,
  aspectRatio = 'auto', // Default to auto - inherits from parent
  onLoad,
  onError,
  priority = false,
  fill = true,
}) => {
  const [imageState, setImageState] = useState<ImageState>({
    loaded: false,
    error: false,
    currentSrc: null
  });
  const imgRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(!lazy || priority);

  // Get optimized image source - prioritize Cloudinary URLs
  const getOptimizedSrc = (): string => {
    // No src provided - use Cloudinary placeholder
    if (!src) {
      return ImageService.getCloudinaryPlaceholder(category) || '/images/furniture-1.jpg';
    }
    
    // Add Cloudinary optimizations for Cloudinary URLs
    if (src.includes('res.cloudinary.com') && !src.includes('f_auto')) {
      return src.replace('/upload/', '/upload/f_auto,q_auto,w_auto,c_limit/');
    }
    
    return src;
  };

  // Get fallback source - use local placeholder
  const getFallbackSrc = (): string => {
    return '/images/furniture-1.jpg';
  };

  // Intersection Observer for lazy loading (only when not using priority)
  useEffect(() => {
    if (priority || !lazy || isInView) {
      setImageState(prev => ({ ...prev, currentSrc: getOptimizedSrc() }));
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          setImageState(prev => ({ ...prev, currentSrc: getOptimizedSrc() }));
          observer.disconnect();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '100px' // Load slightly before coming into view
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, size, lazy, category, priority]);

  const handleLoad = () => {
    setImageState(prev => ({ ...prev, loaded: true }));
    onLoad?.();
  };

  const handleError = () => {
    const failedSrc = imageState.currentSrc;
    
    // Check if this was already a local placeholder - if so, don't try another fallback
    const wasAlreadyLocalPlaceholder = failedSrc && (
      failedSrc.startsWith('/images/furniture') ||
      failedSrc.includes('placeholder') ||
      failedSrc === '/images/furniture-1.jpg'
    );
    
    if (wasAlreadyLocalPlaceholder || imageState.error) {
      // Just mark as loaded with error to avoid infinite error loop
      setImageState(prev => ({ 
        ...prev, 
        error: true,
        loaded: true
      }));
    } else {
      // Try the local fallback placeholder instead
      const fallbackSrc = getFallbackSrc();
      setImageState(prev => ({ 
        ...prev, 
        error: false,
        currentSrc: fallbackSrc,
        loaded: false
      }));
    }
    
    onError?.();
  };

  const combinedClassName = `
    relative overflow-hidden bg-gray-100
    ${aspectRatioClasses[aspectRatio] || ''}
    ${aspectRatio === 'auto' ? 'w-full h-full' : ''}
  `.trim();

  const imageSrc = imageState.currentSrc || getOptimizedSrc();

  return (
    <div 
      ref={imgRef}
      className={combinedClassName}
      style={style}
    >
      {/* Loading placeholder - with smoother transition */}
      {!imageState.loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 transition-opacity duration-300 z-10">
          <FaImage className="w-8 h-8 text-gray-300 animate-pulse" />
        </div>
      )}

      {/* Main image using Next.js Image component */}
      {imageSrc && imageSrc.trim() !== '' && (
        <Image
          src={imageSrc}
          alt={alt || ImageService.getImageAlt({ name: alt, category })}
          fill={fill}
          sizes={getSizes(size)}
          priority={priority}
          quality={85}
          onLoad={handleLoad}
          onError={handleError}
          className={`
            object-cover transition-all duration-500 ease-out
            ${imageState.loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}
            ${className}
          `}
          unoptimized={imageSrc.includes('res.cloudinary.com')} // Cloudinary handles its own optimization
        />
      )}
    </div>
  );
};

export default OptimizedImage;
