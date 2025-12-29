'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaTimes, FaEye } from 'react-icons/fa';
import imageService from '@/services/imageService';
import OptimizedImage from './common/OptimizedImage';

interface Product {
  _id?: string;
  id?: string;
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
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  // Handle modal background click
  const handleModalBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle view details click
  const handleViewDetails = () => {
    onClose();
    // Navigation will be handled by the Link component
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
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

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
          badgeText: product.category,
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
                <OptimizedImage
                  src={product.image || (product.images && product.images[0])}
                  alt={imageService.getImageAlt(product)}
                  category={product.category}
                  size="large"
                  className="w-full h-64 md:h-80 lg:h-96 rounded-xl shadow-md transition-transform group-hover:scale-105"
                  lazy={false}
                  onLoad={() => setLoadedImages(prev => ({...prev, [product._id || product.id || '']: true}))}
                  onError={() => {}}
                />
                
                {/* Full Screen View Button */}
                <button
                  onClick={() => {
                    const imgSrc = imageService.getOptimizedImageUrl(
                      product.image || (product.images && product.images[0]) || '',
                      { category: product.category, width: 1600, height: 1600 }
                    );
                    const newWindow = window.open('', '_blank');
                    if (newWindow) {
                      newWindow.document.write(`
                        <html>
                          <head><title>${product.name}</title></head>
                          <body style="margin:0; background:#000; display:flex; align-items:center; justify-content:center; min-height:100vh;">
                            <img src="${imgSrc}" style="max-width:100%; max-height:100%; object-fit:contain;" alt="${product.name}">
                          </body>
                        </html>
                      `);
                    }
                  }}
                  className="absolute top-3 right-3 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 p-2 rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100"
                >
                  <FaEye className="h-4 w-4" />
                </button>
              </div>
              
              {/* Additional Images Preview (if available) */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {product.images.slice(0, 4).map((image, index) => (
                    <OptimizedImage
                      key={index}
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      category={product.category}
                      size="thumbnail"
                      className="w-16 h-16 rounded-lg border-2 border-gray-200 hover:border-primary cursor-pointer transition-colors flex-shrink-0"
                      lazy={false}
                    />
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
                
                {product.category && (
                  <div className="mb-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${config.badgeClass}`}>
                      {config.badgeText || product.category}
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
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        product.inStock 
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
                  href={`/products/${product._id || product.id}`}
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
    </div>
  );
};

export default QuickView;
