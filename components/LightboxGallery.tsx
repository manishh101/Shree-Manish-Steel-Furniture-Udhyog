'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import 'yet-another-react-lightbox/styles.css';
import { PhotoIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
import GalleryCard from './GalleryCard';
import GalleryListItem from './GalleryListItem';

interface GalleryImage {
  id?: string;
  src: string;
  alt?: string;
  title?: string;
  description?: string;
  category?: string;
  featured?: boolean;
  tags?: string[];
}

interface LightboxSlide {
  src: string;
  alt?: string;
}

interface LightboxGalleryProps {
  images?: GalleryImage[];
  title?: string;
  layout?: 'grid' | 'masonry' | 'slider' | 'list';
  columns?: {
    mobile: number;
    tablet: number;
    desktop: number;
    large: number;
  };
  spacing?: 'sm' | 'md' | 'lg';
  showTitles?: boolean;
  showDescriptions?: boolean;
  aspectRatio?: 'square' | 'landscape' | 'portrait' | 'auto';
  className?: string;
  sectionClassName?: string;
  onProductClick?: (product: GalleryImage) => Promise<void> | void;
}

declare global {
  interface Window {
    galleryProductImages?: LightboxSlide[];
  }
}

/**
 * LightboxGallery - Professional gallery component with lightbox functionality
 * 
 * Features:
 * - Multiple layout options (grid, list, masonry, slider)
 * - Configurable columns and spacing
 * - Lightbox with zoom and fullscreen
 * - Image preloading
 * - Responsive design
 * - Accessibility support
 */
const LightboxGallery: React.FC<LightboxGalleryProps> = ({
  images = [],
  title,
  layout = 'grid',
  columns = { mobile: 1, tablet: 2, desktop: 3, large: 4 },
  spacing = 'md',
  showTitles = false,
  showDescriptions = false,
  aspectRatio = 'square',
  className = '',
  sectionClassName = '',
  onProductClick = null,
}) => {
  const [open, setOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<GalleryImage | null>(null);
  const [productImages, setProductImages] = useState<LightboxSlide[]>([]);

  // Preload images for better performance
  useEffect(() => {
    const preloadImages = () => {
      if (!Array.isArray(images)) {
        console.error('Images prop is not an array:', images);
        return;
      }

      images.forEach((image, index) => {
        if (image && image.src && !loadedImages.has(index)) {
          const img = new Image();
          img.onload = () => {
            setLoadedImages(prev => new Set([...prev, index]));
          };
          img.onerror = () => {
            console.warn(`Failed to load image: ${image.src}`);
          };
          img.src = image.src;
        }
      });
    };

    if (Array.isArray(images) && images.length > 0) {
      preloadImages();
    }
  }, [images, loadedImages]);

  // Listen for global events that should open the gallery
  useEffect(() => {
    const handleOpenGallery = (event: CustomEvent<{ images?: LightboxSlide[] }>) => {
      if (event.detail && Array.isArray(event.detail.images)) {
        setProductImages(event.detail.images);
        setOpen(true);
      } else if (window.galleryProductImages && window.galleryProductImages.length > 0) {
        setProductImages(window.galleryProductImages);
        setOpen(true);
      }
    };

    const handleImagesUpdated = () => {
      if (window.galleryProductImages && window.galleryProductImages.length > 0) {
        setProductImages(window.galleryProductImages);
      }
    };

    window.addEventListener('openGalleryLightbox', handleOpenGallery as EventListener);
    window.addEventListener('galleryImagesUpdated', handleImagesUpdated);

    return () => {
      window.removeEventListener('openGalleryLightbox', handleOpenGallery as EventListener);
      window.removeEventListener('galleryImagesUpdated', handleImagesUpdated);
    };
  }, []);

  const openLightbox = useCallback(async (index: number) => {
    if (!Array.isArray(images) || images.length === 0 || !images[index]) {
      if (window.galleryProductImages && window.galleryProductImages.length > 0) {
        setProductImages(window.galleryProductImages);
        setPhotoIndex(0);
        setOpen(true);
        return;
      }
      console.error('Cannot open lightbox without valid images');
      return;
    }

    const product = images[index];
    setPhotoIndex(0);

    const defaultImage: LightboxSlide = {
      src: product.src,
      alt: product.alt || product.title || 'Product Image',
    };

    setSelectedProduct(product);
    setProductImages([defaultImage]);

    if (onProductClick) {
      try {
        await onProductClick(product);

        if (window.galleryProductImages && window.galleryProductImages.length > 0) {
          setProductImages(window.galleryProductImages);
        }
      } catch (error) {
        console.error('Error handling product click:', error);
      }
    }

    setTimeout(() => {
      if (window.galleryProductImages && window.galleryProductImages.length > 0) {
        setProductImages(window.galleryProductImages);
      }
      setOpen(true);
    }, 300);
  }, [images, onProductClick]);

  // Get responsive column classes
  const getColumnClasses = (): string => {
    const { mobile, tablet, desktop, large } = columns;
    return `grid-cols-1 
            sm:grid-cols-${Math.max(mobile, 2)} 
            md:grid-cols-${Math.min(tablet + 1, desktop)} 
            lg:grid-cols-${large}
            xl:grid-cols-${Math.min(large + 1, 6)}`;
  };

  // Get spacing classes
  const getSpacingClasses = (): string => {
    const spacingMap: Record<string, string> = {
      sm: 'gap-1 sm:gap-2',
      md: 'gap-2 sm:gap-4',
      lg: 'gap-3 sm:gap-6',
    };
    return spacingMap[spacing] || spacingMap.md;
  };

  // Render grid layout
  const renderGridLayout = () => (
    <div className={`grid ${getColumnClasses()} ${getSpacingClasses()}`}>
      {images.map((image, index) => (
        <div
          key={`gallery-image-${image.id || index}`}
          className="group h-full"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <GalleryCard
            product={image}
            isHovered={hoveredIndex === index}
            aspectRatio={aspectRatio}
            showDescription={showDescriptions}
            onClick={() => openLightbox(index)}
          />
        </div>
      ))}
    </div>
  );

  // Render list layout
  const renderListLayout = () => (
    <div className="flex flex-col space-y-4 sm:space-y-6">
      {images.map((image, index) => (
        <div
          key={`gallery-list-item-${image.id || index}`}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <GalleryListItem
            product={image}
            showDescription={showDescriptions}
            onClick={() => openLightbox(index)}
          />
        </div>
      ))}
    </div>
  );

  // Choose layout renderer
  const renderLayout = () => {
    switch (layout) {
      case 'list':
        return renderListLayout();
      case 'masonry':
      case 'slider':
      default:
        return renderGridLayout();
    }
  };

  // Get safe slides for lightbox
  const getSafeSlides = (): LightboxSlide[] => {
    try {
      if (selectedProduct && productImages.length > 0) {
        const uniqueUrls = new Set<string>();
        const uniqueImages: LightboxSlide[] = [];

        productImages.forEach((img) => {
          const imgSrc = typeof img === 'string' ? img : img.src;
          if (imgSrc && !uniqueUrls.has(imgSrc)) {
            uniqueUrls.add(imgSrc);
            uniqueImages.push({
              src: imgSrc,
              alt: (typeof img === 'object' && img.alt) || selectedProduct?.title || 'Product image',
            });
          }
        });

        return uniqueImages;
      }

      if (!Array.isArray(images) || images.length === 0) {
        return [];
      }

      return images.map((img, index) => ({
        src: img.src,
        alt: img.alt || img.title || `Gallery image ${index + 1}`,
      }));
    } catch (error) {
      console.error('Error preparing slides:', error);
      return [];
    }
  };

  if (!images || images.length === 0) {
    return (
      <div className="py-12 text-center">
        <PhotoIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No images available</p>
      </div>
    );
  }

  return (
    <div className={`py-6 ${className}`}>
      {title && (
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full"></div>
        </div>
      )}

      <div className={sectionClassName}>{renderLayout()}</div>

      {/* Professional Lightbox */}
      <Lightbox
        open={open}
        close={() => setOpen(false)}
        index={photoIndex}
        slides={getSafeSlides()}
        plugins={[Zoom, Fullscreen]}
        carousel={{
          preload: 5,
          imageFit: 'contain',
          finite: false,
        }}
        animation={{
          swipe: 200,
          fade: 150,
        }}
        zoom={{
          maxZoomPixelRatio: 3,
          scrollToZoom: true,
        }}
        controller={{
          closeOnPullDown: true,
          closeOnBackdropClick: true,
        }}
        render={{
          iconZoomIn: () => <ArrowsPointingOutIcon className="w-6 h-6" />,
          slideFooter: () => {
            const totalSlides = getSafeSlides().length;
            return (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white 
                  text-xs sm:text-sm px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
                <span className="font-medium">{photoIndex + 1}</span>
                <span className="mx-1">/</span>
                <span>{totalSlides}</span>
              </div>
            );
          },
        }}
        on={{
          view: ({ index }) => setPhotoIndex(index),
        }}
      />
    </div>
  );
};

export default LightboxGallery;
