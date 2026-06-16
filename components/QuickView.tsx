'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaTimes, FaEye, FaChevronLeft, FaChevronRight, FaExpand } from 'react-icons/fa';
import imageService from '@/services/imageService';
import OptimizedImage from '@/components/common/OptimizedImage';

interface Product {
  _id?: string;
  id?: string;
  slug?: string;
  name: string;
  category?: string;
  subcategory?: string;
  description?: string;
  image?: string | null;
  images?: string[];
  features?: string[];
  specifications?: Record<string, string> | Array<{ label: string; value: string }>;
  salesCount?: number | null;
  inStock?: boolean;
  deliveryInformation?: {
    estimatedDelivery?: string;
    shippingCost?: string;
    availableLocations?: string[];
    specialInstructions?: string;
  };
  // Allow additional properties
  [key: string]: unknown;
}

interface QuickViewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  variant?: 'standard' | 'featured' | 'bestseller' | 'gallery';
}

const QuickView: React.FC<QuickViewProps> = ({ product, isOpen, onClose, variant = 'standard' }) => {

  const [fullScreenView, setFullScreenView] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [touchPosition, setTouchPosition] = useState<{ x: number; y: number } | null>(null);
  const [imageLoaded, setImageLoaded] = useState(true);

  // Reset state when product changes
  useEffect(() => {
    if (product) {
      setSelectedImageIndex(0);
      setFullScreenView(false);
    }
  }, [product]);

  // Handle modal background click
  const handleModalBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle view details click
  const handleViewDetails = () => {
    onClose();
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle navigation functions
  const handlePrevImage = () => {
    if (!product) return;
    setSelectedImageIndex(prev => prev > 0 ? prev - 1 : (product.images?.length || 1) - 1);
  };

  const handleNextImage = () => {
    if (!product) return;
    setSelectedImageIndex(prev => prev < (product.images?.length || 1) - 1 ? prev + 1 : 0);
  };

  // Handle touch events for better mobile support
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchPosition({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchPosition) return;

    const touch = e.touches[0];
    const diffX = touchPosition.x - touch.clientX;
    const diffY = touchPosition.y - touch.clientY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 30) {
      if (diffX > 0) {
        handleNextImage();
      } else {
        handlePrevImage();
      }
      setTouchPosition(null);
    }
  };

  const handleTouchEnd = () => {
    setTouchPosition(null);
  };

  if (!isOpen || !product) {
    return null;
  }

  // Get variant-specific styling and content
  const getVariantConfig = () => {
    switch (variant) {
      case 'featured':
        return {
          badgeClass: 'bg-yellow-100 text-yellow-800',
          badgeText: '⭐ Featured Product',
          buttonClass: 'bg-primary text-white hover:bg-primary/90'
        };
      case 'bestseller':
        return {
          badgeClass: 'bg-orange-100 text-orange-800',
          badgeText: product.salesCount ? `🔥 ${product.salesCount}+ sold` : '🔥 Best Seller',
          buttonClass: 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
        };
      case 'gallery':
        return {
          badgeClass: 'bg-purple-100 text-purple-800',
          badgeText: '📸 Gallery Item',
          buttonClass: 'bg-purple-600 text-white hover:bg-purple-700'
        };
      default:
        return {
          badgeClass: 'bg-primary/10 text-primary',
          badgeText: product.subcategory || product.category,
          buttonClass: 'bg-primary text-white hover:bg-primary/90'
        };
    }
  };

  const config = getVariantConfig();

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
      onClick={handleModalBackgroundClick}
    >
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b bg-gray-50">
          <h3 className="text-xl md:text-2xl font-semibold text-gray-900">Quick View</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-200 rounded-full"
            aria-label="Close quick view"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-8 overflow-y-auto max-h-[calc(95vh-80px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Enhanced Image Section */}
            <div className="space-y-4">
              <div className="relative group">
                <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-xl shadow-md overflow-hidden bg-gray-100 flex items-center justify-center">
                  <div
                    className="w-full h-full cursor-pointer"
                    onClick={() => setFullScreenView(true)}
                  >
                    <img
                      src={product.images && product.images.length > 0 ? product.images[selectedImageIndex] : (product.image || '/images/placeholder-product.png')}
                      alt={imageService.getImageAlt(product) || "Product Image"}
                      className="w-full h-full object-contain transition-transform group-hover:scale-105"
                      onLoad={() => setImageLoaded(true)}
                      style={{
                        opacity: imageLoaded ? 1 : 0,
                        transition: 'opacity 0.15s ease-in-out',
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/placeholder-product.png';
                        setImageLoaded(true);
                      }}
                    />
                  </div>
                </div>

                {/* Full Screen View Button */}
                <button
                  onClick={() => setFullScreenView(true)}
                  className="absolute top-3 right-3 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 p-2 rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100 z-10"
                  title="View Full Screen"
                >
                  <FaExpand className="h-4 w-4" />
                </button>
              </div>

              {/* Additional Images Preview (if available) */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
                  {product.images.slice(0, 4).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (selectedImageIndex !== index) {
                          setSelectedImageIndex(index);
                        }
                      }}
                      className={`relative w-16 h-16 rounded-lg border-2 cursor-pointer transition-colors flex-shrink-0 overflow-hidden ${selectedImageIndex === index ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200 hover:border-primary'}`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/placeholder-product.png';
                          (e.target as HTMLImageElement).style.opacity = '0.4';
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Enhanced Product Details */}
            <div className="flex flex-col justify-between">
              <div>
                <h4 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  {product.name}
                </h4>

                {(product.subcategory || product.category) && (
                  <div className="mb-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${config.badgeClass}`}>
                      {config.badgeText || product.subcategory || product.category}
                    </span>
                  </div>
                )}

                <p className="text-gray-600 mb-6 leading-relaxed">
                  {product.description || "High-quality furniture crafted with precision and care."}
                </p>

                {/* Features */}
                {product.features && product.features.length > 0 && (
                  <div className="mb-6">
                    <h5 className="font-semibold text-gray-900 mb-2">Features:</h5>
                    <ul className="text-gray-600 space-y-1">
                      {product.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Variant-specific information */}
                {variant === 'bestseller' && product.salesCount && product.salesCount > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Sales:</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                        {product.salesCount}+ sold
                      </span>
                    </div>
                  </div>
                )}

                {/* Specifications */}
                {product.specifications && Array.isArray(product.specifications) && product.specifications.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Specifications</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {(product.specifications as Array<{ label: string; value: string }>).slice(0, 3).map((spec: { label: string; value: string }, index: number) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">{spec.label}:</span>
                          <span className="font-medium text-gray-900">{spec.value}</span>
                        </div>
                      ))}
                      {product.specifications.length > 3 && (
                        <div className="text-xs text-gray-500 mt-1">
                          +{product.specifications.length - 3} more specifications
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Delivery Information */}
                {product.deliveryInformation && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Delivery Info</h4>
                    <div className="space-y-1 text-sm">
                      {product.deliveryInformation.estimatedDelivery && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Delivery:</span>
                          <span className="font-medium text-gray-900">{product.deliveryInformation.estimatedDelivery}</span>
                        </div>
                      )}
                      {product.deliveryInformation.shippingCost && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shipping:</span>
                          <span className="font-medium text-gray-900">{product.deliveryInformation.shippingCost}</span>
                        </div>
                      )}
                      {product.deliveryInformation.availableLocations && product.deliveryInformation.availableLocations.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Locations:</span>
                          <span className="font-medium text-gray-900">{product.deliveryInformation.availableLocations.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Stock status */}
                {product.inStock !== undefined && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">Availability:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${product.inStock
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={`/products/${product.slug || product._id || product.id}`}
                  onClick={handleViewDetails}
                  className={`flex-1 text-center py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 font-medium ${config.buttonClass}`}
                >
                  View Full Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Screen Overlay */}
      {fullScreenView && (
        <div
          className="fixed inset-0 z-[60] bg-black bg-opacity-95 flex items-center justify-center p-4 md:p-10"
          onClick={() => setFullScreenView(false)}
        >
          <button
            onClick={() => setFullScreenView(false)}
            className="absolute top-4 right-4 text-white bg-white/20 hover:bg-white/40 rounded-full p-2 transition-colors z-70"
          >
            <FaTimes className="h-6 w-6" />
          </button>

          <div
            className="relative w-full h-[80vh] md:h-full max-w-[1400px] max-h-[90vh] flex items-center justify-center touch-manipulation"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={product.images && product.images.length > 0 ? product.images[selectedImageIndex] : (product.image || '/images/placeholder-product.png')}
              alt={product.name || "Product Image"}
              className="w-full h-full object-contain"
              onLoad={() => setImageLoaded(true)}
              style={{
                opacity: imageLoaded ? 1 : 0,
                transition: 'opacity 0.15s ease-in-out',
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/placeholder-product.png';
                setImageLoaded(true);
              }}
            />
          </div>

          {product.images && product.images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevImage();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/20 hover:bg-white/40 rounded-full p-3 transition-colors z-70"
              >
                <FaChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/20 hover:bg-white/40 rounded-full p-3 transition-colors z-70"
              >
                <FaChevronRight className="h-6 w-6" />
              </button>

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full text-sm font-medium z-70">
                {selectedImageIndex + 1} / {product.images.length}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default QuickView;
