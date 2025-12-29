'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  aspectRatio?: 'square' | 'wide' | 'tall';
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
  priority?: string;
  [key: string]: unknown;
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
  tall: 'aspect-[3/4]'
};

const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src,
  alt,
  className = '',
  style = {},
  size = 'medium',
  category = '',
  lazy = true,
  aspectRatio = 'square',
  onLoad,
  onError,
  ...props
}) => {
  const [imageState, setImageState] = useState<ImageState>({
    loaded: false,
    error: false,
    currentSrc: null
  });
  const imgRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(!lazy);

  // Get optimized image source - prioritize Cloudinary URLs
  const getOptimizedSrc = () => {
    // No src provided - use Cloudinary placeholder
    if (!src) {
      return ImageService.getCloudinaryPlaceholder(category);
    }
    
    // Use ImageService to get the optimized URL
    const optimizedUrl = ImageService.getOptimizedImageUrl(src, {
      ...sizeConfig[size],
      category
    });
    
    return optimizedUrl;
  };

  // Get fallback source - use Cloudinary placeholder for production
  const getFallbackSrc = () => {
    return ImageService.getCloudinaryPlaceholder(category);
  };

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) {
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
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, size, lazy, category]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setImageState(prev => ({ ...prev, loaded: true }));
    onLoad?.(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const failedSrc = imageState.currentSrc;
    
    // Check if this was already a local placeholder - if so, don't try another fallback
    const wasAlreadyLocalPlaceholder = failedSrc && (
      failedSrc.startsWith('/images/furniture') ||
      failedSrc.includes('placeholder-thumbnail') ||
      failedSrc.includes('/images/')
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
        error: false, // Reset error since we're trying a new image
        currentSrc: fallbackSrc,
        loaded: false // Reset loaded to show loading state for placeholder
      }));
    }
    
    onError?.(e);
  };

  const combinedClassName = `
    relative overflow-hidden bg-gray-100
    ${aspectRatioClasses[aspectRatio] || 'aspect-square'}
    ${className}
  `.trim();

  // Filter out custom props that shouldn't be passed to img
  const { priority, ...restProps } = props;

  return (
    <div 
      ref={imgRef}
      className={combinedClassName}
      style={style}
    >
      {/* Loading placeholder - with smoother transition */}
      {!imageState.loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 transition-opacity duration-500">
          <FaImage className="w-8 h-8 text-gray-300" />
        </div>
      )}

      {/* Main image */}
      {imageState.currentSrc && imageState.currentSrc.trim() !== '' && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageState.currentSrc}
          srcSet={lazy ? undefined : ImageService.generateSrcSet(src, { category })}
          sizes={lazy ? undefined : ImageService.getImageSizes()}
          alt={alt || ImageService.getImageAlt({ name: alt, category })}
          loading={lazy ? 'lazy' : 'eager'}
          onLoad={handleLoad}
          onError={handleError}
          className={`
            w-full h-full object-cover transition-all duration-700 ease-in-out
            ${imageState.loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}
          `}
          {...restProps}
        />
      )}
    </div>
  );
};

export default OptimizedImage;
