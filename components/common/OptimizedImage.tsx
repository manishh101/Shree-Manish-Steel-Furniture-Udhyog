'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { FaImage } from 'react-icons/fa';
import ImageService from '../../services/imageService';

// Light grey SVG placeholder — prevents black/dark flash while images load
const BLUR_DATA_URL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PC9zdmc+';

const PLACEHOLDER_IMAGE = '/images/placeholder-product.png';

interface OptimizedImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
  imageClassName?: string;
  containerClassName?: string;
  style?: React.CSSProperties;
  size?: 'small' | 'medium' | 'large' | 'thumbnail';
  category?: string;
  lazy?: boolean;
  aspectRatio?: 'square' | 'wide' | 'tall' | 'auto';
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
  fill?: boolean;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
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
  imageClassName = '',
  containerClassName = '',
  style = {},
  size = 'medium',
  category = '',
  lazy = true,
  aspectRatio = 'auto', // Default to auto - inherits from parent
  onLoad,
  onError,
  priority = false,
  fill = true,
  objectFit = 'contain', // Default to contain to ensure full image is visible
}) => {
  const [imageState, setImageState] = useState<ImageState>({
    loaded: true,
    error: false,
    currentSrc: null
  });
  const imgRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(!lazy || priority);

  // Get optimized image source - prioritize Cloudinary URLs
  // Use useMemo to ensure stability across renders
  const optimizedSrc = React.useMemo(() => {
    // No src provided - use placeholder
    if (!src) {
      return ImageService.getCloudinaryPlaceholder(category) || PLACEHOLDER_IMAGE;
    }

    // Add Cloudinary optimizations for Cloudinary URLs
    if (src.includes('res.cloudinary.com')) {
      // If it already has transformations, don't double-transform
      if (src.includes('/upload/w_') || src.includes('/upload/f_auto')) {
        return src;
      }

      const { width } = sizeConfig[size] || sizeConfig.medium;
      // Ensure we replace correctly
      return src.replace('/upload/', `/upload/f_auto,q_auto,w_${width},c_limit/`);
    }

    return src;
  }, [src, category, size]);

  // Backwards compatibility for getOptimizedSrc calls in effects
  const getOptimizedSrc = () => optimizedSrc;

  // Get fallback source - use local placeholder
  const getFallbackSrc = (): string => {
    return PLACEHOLDER_IMAGE;
  };

  // Reset loaded state when src changes (for image sliding functionality)
  useEffect(() => {
    const newSrc = getOptimizedSrc();
    // Only reset if the src actually changed to avoid unnecessary flickers
    if (newSrc !== imageState.currentSrc) {
      setImageState(prev => ({
        ...prev,
        loaded: false,
        error: false,
        currentSrc: newSrc
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

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
  }, [size, lazy, category, priority]);

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
      failedSrc === PLACEHOLDER_IMAGE
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

  // Check if caller provided explicit sizing classes (h-*, w-*)
  // We check for classes starting with h- or w-, but NOT max-h, min-h, etc.
  const hasExplicitSize = className && className.split(/\s+/).some(cls => /^[hw]-/.test(cls));

  const combinedClassName = `
    relative overflow-hidden
    ${aspectRatioClasses[aspectRatio] || ''}
    ${aspectRatio === 'auto' && !hasExplicitSize ? 'w-full h-full' : ''}
  `.trim();

  // Merge container-specific classes so caller sizing (h/w/rounded) applies to wrapper
  // Put className AFTER combinedClassName so caller's explicit sizes take precedence
  const wrapperClassName = [combinedClassName, className, containerClassName]
    .filter(Boolean)
    .join(' ');

  const imageSrc = imageState.currentSrc || getOptimizedSrc();
  const isRemote = imageSrc.startsWith('http');
  const isCloudinary = imageSrc.includes('res.cloudinary.com');

  // Only unoptimize if it's a remote URL that is NOT Cloudinary
  // This allows Next.js to optimize Cloudinary images since they are whitelisted in next.config.js
  const shouldUnoptimize = isRemote && !isCloudinary;

  return (
    <div
      ref={imgRef}
      className={wrapperClassName}
      style={{ backgroundColor: '#ffffff', ...style }}
    >
      {/* Main image using Next.js Image component */}
      {imageSrc && imageSrc.trim() !== '' ? (
        <Image
          src={imageSrc}
          alt={alt || ImageService.getImageAlt({ name: alt, category })}
          fill={fill}
          sizes={getSizes(size)}
          priority={priority}
          quality={85}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? undefined : 'lazy'}
          className={`
            ${objectFit === 'contain' ? 'object-contain' : objectFit === 'fill' ? 'object-fill' : objectFit === 'none' ? 'object-none' : 'object-cover'}
            transition-opacity duration-150 ease-out
            ${imageState.loaded ? 'opacity-100' : 'opacity-40'}
            ${imageClassName || ''}
          `.trim().replace(/\s+/g, ' ')}
          unoptimized={shouldUnoptimize}
        />
      ) : (
        /* Visible placeholder when no valid src is available */
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ backgroundColor: '#f5f5f5' }}>
          <FaImage className="text-gray-300 text-4xl mb-2" />
          <span className="text-gray-400 text-xs">Image not available</span>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
