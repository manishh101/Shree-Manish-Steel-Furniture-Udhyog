'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaImages } from 'react-icons/fa';
import { scrollToTop } from '../../utils/scrollUtils';
import ImageService from '../../services/imageService';
import OptimizedImage from './OptimizedImage';

interface ProductImage {
  url?: string;
  src?: string;
}

interface Product {
  _id?: string;
  id?: string;
  name?: string;
  title?: string;
  image?: string | null;
  src?: string | null;
  images?: (string | ProductImage)[];
  thumbnail?: string;
  mainImage?: string;
  category?: string;
  subcategory?: string;
  productType?: string;
  description?: string;
  inStock?: boolean;
  isNew?: boolean;
  discount?: number | null;
  featured?: boolean;
  salesCount?: number | null;
}

interface SafeProduct {
  _id: string;
  id: string;
  name: string;
  title?: string;
  image: string | null;
  category: string;
  subcategory?: string;
  productType?: string;
  description: string;
  inStock: boolean;
  isNew: boolean;
  discount: number | null;
  featured: boolean;
  salesCount: number | null;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  // Allow additional properties for flexibility
  [key: string]: unknown;
}

interface VariantConfig {
  cardClass: string;
  buttonClass?: string;
  buttonText?: string;
  hideCategory?: boolean;
  simpleLayout?: boolean;
}

interface ProductCardProps {
  product?: Product | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onQuickView?: (product: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onProductView?: (idOrProduct: string | any) => void;
  onProductLike?: (id: string) => void;
  showCategory?: boolean;
  withActions?: boolean;
  variant?: 'standard' | 'featured' | 'bestseller' | 'gallery';
  rank?: number | null;
  salesCount?: number | null;
  className?: string;
}

// Memoize ProductCard to prevent unnecessary re-renders in product grids.
const ProductCard: React.FC<ProductCardProps> = React.memo(({
  product,
  onQuickView,
  onProductView,
  onProductLike,
  showCategory = true,
  withActions = true,
  variant = 'standard',
  rank = null,
  salesCount = null,
  className = ''
}) => {
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Handle image loading
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  // Safety check for product data
  if (!product) {
    console.warn('ProductCard: No product data provided');
    return null;
  }

  // Get the main product image
  const getMainProductImage = (): string | null => {
    const potentialImages: (string | ProductImage | null | undefined)[] = [
      product.src,
      product.image,
      product.images?.[0],
      product.thumbnail,
      product.mainImage
    ].filter(Boolean);

    for (const img of potentialImages) {
      if (typeof img === 'string' && img.trim()) {
        return img.trim();
      } else if (typeof img === 'object' && img && (img.url || img.src)) {
        return img.url || img.src || null;
      }
    }

    return null;
  };

  // Ensure required product properties exist
  const safeProduct: SafeProduct = {
    _id: product._id || product.id || 'unknown',
    id: product.id || product._id || 'unknown',
    name: product.name || product.title || 'Unnamed Product',
    image: getMainProductImage(),
    category: product.category || 'Furniture',
    description: product.description || '',
    inStock: product.inStock !== undefined ? product.inStock : true,
    isNew: product.isNew || false,
    discount: product.discount || null,
    featured: product.featured || false,
    salesCount: product.salesCount || salesCount || null,
    ...product
  };

  // Handle product link click
  const handleProductClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onProductView) {
      if (variant === 'gallery') {
        onProductView(safeProduct);
      } else {
        onProductView(safeProduct._id || safeProduct.id);
      }
    } else {
      router.push(`/products/${safeProduct._id || safeProduct.id}`);
      scrollToTop({ instant: true });
    }
  };

  // Get variant-specific classes
  const getVariantConfig = (): VariantConfig => {
    switch (variant) {
      case 'gallery':
        return {
          cardClass: 'hover:shadow-lg hover:border-primary/20 cursor-pointer',
          simpleLayout: true
        };
      default:
        return {
          cardClass: 'hover:shadow-md hover:-translate-y-1',
          buttonClass: '',
          buttonText: 'View Details'
        };
    }
  };

  const config = getVariantConfig();

  return (
    <div className={`product-card bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 border border-gray-100 group h-full flex flex-col ${config.cardClass} ${className}`}>
      {/* Image container - taller aspect ratio like reference */}
      <div className="relative w-full overflow-hidden bg-gray-50" style={{ aspectRatio: '3/4' }}>
        {/* Loading skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          </div>
        )}

        <Link href={`/products/${safeProduct._id || safeProduct.id}`} onClick={handleProductClick} className="block w-full h-full">
          <OptimizedImage
            src={safeProduct.image}
            alt={ImageService.getImageAlt(safeProduct)}
            category={safeProduct.category}
            size="medium"
            className={`w-full h-full object-contain p-4 transition-all duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            lazy={variant !== 'featured' && variant !== 'bestseller'}
            priority={variant === 'featured' || variant === 'bestseller'}
          />
        </Link>

        {/* Wishlist Heart Icon */}
        <div className="absolute top-3 right-3 z-20">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onProductLike) onProductLike(safeProduct._id || safeProduct.id);
            }}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-50 text-gray-400 hover:text-red-500 transition-all duration-300 group/wishlist"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover/wishlist:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {/* Badge Overlay */}
        {safeProduct.isNew && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">New</span>
          </div>
        )}
      </div>

      {/* Product info */}
      {config.simpleLayout ? (
        /* Simple layout for gallery */
        <div className="p-4 text-center">
          <h4 className="font-semibold text-gray-900 line-clamp-1 leading-tight">
            {safeProduct.name}
          </h4>
          {(safeProduct.subcategory || safeProduct.category) && (
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
              {safeProduct.subcategory || safeProduct.category}
            </p>
          )}
        </div>
      ) : (
        /* Full layout - centered text like Triveni */
        <div className="p-4 flex-1 flex flex-col items-center justify-center text-center bg-white border-t border-gray-50">
          <div className="mb-1.5">
            <h3 className="text-xs md:text-sm font-bold text-gray-800 uppercase tracking-tight line-clamp-2 leading-tight group-hover:text-primary transition-colors px-1">
              {safeProduct.name || safeProduct.title}
            </h3>
          </div>

          <div className="flex flex-col items-center gap-1.5">
            {/* Dimensions with ruler icon */}
            <div className="flex items-center gap-1.5 text-gray-400">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-50">
                <path d="M21 16H3V8H21V16ZM3 16V18M21 16V18M7 16V14M11 16V12M15 16V14M19 16V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[10px] font-medium">
                {safeProduct.dimensions && (safeProduct.dimensions.length || safeProduct.dimensions.width || safeProduct.dimensions.height) 
                  ? `${safeProduct.dimensions.length || 0}x${safeProduct.dimensions.width || 0}x${safeProduct.dimensions.height || 0} mm`
                  : 'Standard Size'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default React.memo(ProductCard);
