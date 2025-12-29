'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { HeartIcon, EyeIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

interface Product {
  id?: string;
  _id?: string;
  src?: string;
  image?: string;
  alt?: string;
  title?: string;
  description?: string;
  category?: string;
  featured?: boolean;
  tags?: string[];
}

interface GalleryListItemProps {
  product: Product;
  onClick?: () => void;
  showDescription?: boolean;
}

/**
 * GalleryListItem - Enhanced gallery list item component for displaying products in list view
 * 
 * Features:
 * - Horizontal layout with image and details
 * - Loading skeleton
 * - Hover effects with view overlay
 * - Category and featured badges
 * - Responsive design (vertical on mobile, horizontal on desktop)
 * - Accessibility support
 */
const GalleryListItem: React.FC<GalleryListItemProps> = ({
  product,
  onClick,
  showDescription = true,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!product) return null;

  // Get image source
  const getImageSrc = (): string => {
    return product.src || product.image || '/images/placeholder-product.jpg';
  };

  // Handle item click
  const handleItemClick = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    }
  }, [onClick]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleItemClick(e);
    }
  };

  return (
    <div
      className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg 
        transition-all duration-300 flex flex-col sm:flex-row h-full cursor-pointer group"
      role="button"
      tabIndex={0}
      onClick={handleItemClick}
      onKeyDown={handleKeyDown}
    >
      {/* Product Image */}
      <div className="sm:w-1/3 aspect-video sm:aspect-square relative overflow-hidden">
        {/* Loading skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        )}

        <Image
          src={getImageSrc()}
          alt={product.alt || product.title || 'Product image'}
          fill
          sizes="(max-width: 640px) 100vw, 33vw"
          className={`object-cover transition-all duration-500 ease-out 
            group-hover:scale-105 group-hover:brightness-105 ${!imageLoaded ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setImageLoaded(true)}
        />

        {/* View Gallery overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 
          transition-opacity duration-300 flex items-center justify-center">
          <button
            className="bg-white text-primary hover:bg-primary hover:text-white 
              transition-colors px-4 py-2 rounded-full shadow-md flex items-center z-10"
            onClick={(e) => {
              e.stopPropagation();
              handleItemClick(e);
            }}
            aria-label="View gallery for this product"
          >
            <EyeIcon className="mr-2 w-4 h-4" /> View Gallery
          </button>
        </div>

        {/* Featured indicator */}
        {product.featured && (
          <div className="absolute top-2 right-2 bg-accent text-white px-2 py-1 text-xs font-medium rounded-lg shadow-sm">
            <HeartIconSolid className="inline-block mr-1 w-3 h-3" /> Featured
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between sm:w-2/3">
        {/* Category */}
        {product.category && product.category !== 'uncategorized' && (
          <div className="text-xs text-primary font-medium uppercase mb-1 tracking-wide">
            {product.category}
          </div>
        )}

        {/* Title */}
        <h3 className="font-medium sm:font-semibold text-gray-900 mb-2 sm:text-lg group-hover:text-primary transition-colors">
          {product.title || 'Untitled Product'}
        </h3>

        {/* Description */}
        {showDescription && product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 sm:line-clamp-3">
            {product.description}
          </p>
        )}

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2 mb-4">
            {product.tags.slice(0, 4).map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
            {product.tags.length > 4 && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                +{product.tags.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryListItem;
