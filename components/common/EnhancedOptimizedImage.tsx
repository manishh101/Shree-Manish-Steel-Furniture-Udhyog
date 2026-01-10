'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { PhotoIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import ImageService from '../../services/imageService';
import CloudinaryImageService from '../../services/cloudinaryImageService';
import ImageAvailabilityService from '../../services/imageAvailabilityService';

interface EnhancedOptimizedImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  size?: 'small' | 'medium' | 'large' | 'thumbnail';
  category?: string;
  lazy?: boolean;
  aspectRatio?: 'square' | 'wide' | 'tall' | 'auto';
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  showFallbackIndicator?: boolean;
  priority?: boolean;
  fill?: boolean;
  enableAvailabilityCheck?: boolean;
}

interface ImageState {
  loaded: boolean;
  error: boolean;
  currentSrc: string | null;
  attemptedUrls: string[];
  usingFallback: boolean;
}

const sizeConfig: Record<string, { width: number; height: number }> = {
  small: { width: 300, height: 300 },
  medium: { width: 600, height: 600 },
  large: { width: 1200, height: 1200 },
  thumbnail: { width: 150, height: 150 },
};

const aspectRatioClasses: Record<string, string> = {
  square: 'aspect-square',
  wide: 'aspect-video',
  tall: 'aspect-[3/4]',
  auto: '',
};

/**
 * EnhancedOptimizedImage - Advanced image component with robust error handling
 * 
 * Features:
 * - Multiple fallback sources
 * - Lazy loading with Intersection Observer
 * - Loading states and placeholders
 * - Error recovery
 * - Responsive image sizes
 * - Next.js Image optimization
 */
const EnhancedOptimizedImage: React.FC<EnhancedOptimizedImageProps> = ({
  src,
  alt = 'Image',
  className = '',
  style = {},
  size = 'medium',
  category = '',
  lazy = true,
  aspectRatio = 'square',
  onLoad,
  onError,
  showFallbackIndicator = true,
  priority = false,
  fill = true,
  enableAvailabilityCheck = false,
}) => {
  const [imageState, setImageState] = useState<ImageState>({
    loaded: false,
    error: false,
    currentSrc: null,
    attemptedUrls: [],
    usingFallback: false,
  });
  const imgRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(!lazy);

  // Get all possible image sources in priority order
  const getImageSources = (): string[] => {
    const sources: string[] = [];

    if (!src) {
      return [ImageService.getPlaceholderImage(category)];
    }

    // Primary source - optimized version
    const primaryUrl = ImageService.getOptimizedImageUrl(src, {
      ...sizeConfig[size],
      category,
    });
    sources.push(primaryUrl);

    // If it's a Cloudinary URL, try different optimization levels
    if (CloudinaryImageService.isCloudinaryUrl(src)) {
      // Try with different quality settings
      const qualityVariants = ['auto:good', 'auto:low', '80'];
      qualityVariants.forEach(quality => {
        const variant = CloudinaryImageService.optimizeCloudinaryUrl(src, {
          ...sizeConfig[size],
          quality
        });
        if (variant !== primaryUrl && !sources.includes(variant)) {
          sources.push(variant);
        }
      });
    }

    // Original source as fallback
    if (src !== primaryUrl && !sources.includes(src)) {
      sources.push(src);
    }

    // Final fallback - placeholder
    const placeholder = ImageService.getPlaceholderImage(category);
    if (!sources.includes(placeholder)) {
      sources.push(placeholder);
    }

    return sources;
  };

  // Try loading the next available image source
  const tryNextImageSource = async () => {
    const sources = getImageSources();
    const { attemptedUrls } = imageState;

    // Find the next URL to try
    const nextUrl = sources.find((url) => !attemptedUrls.includes(url));

    if (!nextUrl) {
      console.error('All image sources failed for:', src);
      setImageState((prev) => ({
        ...prev,
        error: true,
        loaded: true,
        usingFallback: true,
      }));
      return;
    }

    // Check availability if enabled
    if (enableAvailabilityCheck) {
      const isAvailable = await ImageAvailabilityService.checkImageAvailability(nextUrl);
      if (!isAvailable) {
        setImageState(prev => ({
          ...prev,
          attemptedUrls: [...prev.attemptedUrls, nextUrl]
        }));
        // Try the next one
        setTimeout(tryNextImageSource, 0);
        return;
      }
    }

    const isPlaceholder = ImageService.isPlaceholder(nextUrl);
    setImageState((prev) => ({
      ...prev,
      currentSrc: nextUrl,
      attemptedUrls: [...prev.attemptedUrls, nextUrl],
      usingFallback: isPlaceholder,
    }));
  };

  // Initialize image loading
  useEffect(() => {
    if (!isInView) return;

    setImageState({
      loaded: false,
      error: false,
      currentSrc: null,
      attemptedUrls: [],
      usingFallback: false,
    });

    tryNextImageSource();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, size, category, isInView]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, isInView]);

  const handleLoad = () => {
    setImageState((prev) => ({ ...prev, loaded: true }));
    onLoad?.({} as React.SyntheticEvent<HTMLImageElement>);
  };

  const handleError = () => {
    console.warn('Image failed to load:', imageState.currentSrc);

    // Mark this URL as failed and try the next one
    setImageState((prev) => ({ ...prev, error: true }));

    // Try the next source after a short delay
    setTimeout(tryNextImageSource, 100);

    onError?.({} as React.SyntheticEvent<HTMLImageElement>);
  };

  const combinedClassName = `
    relative overflow-hidden bg-gray-100
    ${aspectRatioClasses[aspectRatio] || 'aspect-square'}
    ${className}
  `.trim();

  const dimensions = sizeConfig[size] || sizeConfig.medium;

  return (
    <div ref={imgRef} className={combinedClassName} style={style}>
      {/* Loading placeholder */}
      {!imageState.loaded && isInView && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
          <PhotoIcon className="w-8 h-8 text-gray-400" />
          <span className="sr-only">Loading image...</span>
        </div>
      )}

      {/* Lazy loading placeholder */}
      {!isInView && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <PhotoIcon className="w-6 h-6 text-gray-300" />
        </div>
      )}

      {/* Main image */}
      {imageState.currentSrc && isInView && (
        <Image
          src={imageState.currentSrc}
          alt={alt || ImageService.getImageAlt({ name: alt, category })}
          fill={fill}
          width={!fill ? dimensions.width : undefined}
          height={!fill ? dimensions.height : undefined}
          sizes={ImageService.getImageSizes()}
          priority={priority}
          onLoad={handleLoad}
          onError={handleError}
          className={`
            object-contain transition-opacity duration-300
            ${imageState.loaded ? 'opacity-100' : 'opacity-0'}
          `}
          unoptimized={imageState.currentSrc.startsWith('http') && !imageState.currentSrc.includes('res.cloudinary.com')}
        />
      )}

      {/* Fallback indicator */}
      {showFallbackIndicator && imageState.usingFallback && imageState.loaded && (
        <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-600 px-2 py-1 rounded text-xs flex items-center gap-1">
          <ExclamationTriangleIcon className="w-3 h-3" />
          <span>Placeholder</span>
        </div>
      )}

      {/* Error indicator for complete failures */}
      {imageState.error && !imageState.currentSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 text-red-500">
          <div className="text-center">
            <ExclamationTriangleIcon className="w-8 h-8 mx-auto mb-2" />
            <span className="text-sm">Image unavailable</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedOptimizedImage;
