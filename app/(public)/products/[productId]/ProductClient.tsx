'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaChevronLeft, FaChevronRight, FaExpand, FaTimes, FaShare, FaHeart } from 'react-icons/fa';
import { productAPI, Product as BaseProduct } from '@/services/api';
import imageService from '@/services/imageService';
import ProductCard from '@/components/common/ProductCard';
import QuickView from '@/components/QuickView';
import useQuickView from '@/hooks/useQuickView';
import { defaultProductImages } from '@/utils/productPlaceholders';

// Only used as last-resort fallbacks when database images are not available
const defaultImages = defaultProductImages;

// Extended Product interface with additional fields
interface Product extends BaseProduct {
  originalPrice?: number;
  stock?: number;
  sku?: string;
  isFeatured?: boolean;
  isBestSeller?: boolean;
}

interface ProductClientProps {
  initialProduct: Product;
  productId: string;
}

/**
 * ProductClient Component - Client-side interactive features
 * Separated from server component for better SEO
 */
export default function ProductClient({ initialProduct, productId }: ProductClientProps) {
  const router = useRouter();
  const [product, setProduct] = useState<Product>(initialProduct);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [touchPosition, setTouchPosition] = useState<{ x: number; y: number } | null>(null);
  const [fullScreenView, setFullScreenView] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  
  // Related products state
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const relatedProductsRef = useRef<HTMLDivElement>(null);
  
  // Quick view functionality
  const { quickViewProduct, isQuickViewOpen, openQuickView, closeQuickView } = useQuickView();

  // Get all available images with priority on database Cloudinary URLs
  const allImages = useMemo(() => {
    let images: string[] = [];
    
    // PRIORITY 1: Product images array from database
    if (product?.images?.length) {
      const validImages = product.images
        .filter(img => img && typeof img === 'string' && img.trim() !== '');
      
      if (validImages.length > 0) {
        images = [...validImages];
      }
    }
    
    // PRIORITY 2: Main product image if not already included
    if (product?.image && typeof product.image === 'string' && product.image.trim() !== '') {
      const mainImage = product.image.trim();
      
      const isDuplicate = images.some(img => {
        const normalizedImg = img.split('?')[0];
        const normalizedMain = mainImage.split('?')[0];
        return normalizedImg === normalizedMain;
      });
      
      if (!isDuplicate) {
        images.unshift(mainImage);
      }
    }
    
    // Only use placeholders if absolutely needed
    if (images.length === 0) {
      images.push('/images/furniture-1.jpg');
    }
    
    return images;
  }, [product]);
  
  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        const newIndex = selectedImageIndex > 0 
          ? selectedImageIndex - 1 
          : allImages.length - 1;
        setSelectedImageIndex(newIndex);
      } else if (e.key === 'ArrowRight') {
        const newIndex = selectedImageIndex < allImages.length - 1 
          ? selectedImageIndex + 1 
          : 0;
        setSelectedImageIndex(newIndex);
      } else if (e.key === 'Escape') {
        if (fullScreenView) {
          setFullScreenView(false);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImageIndex, allImages.length, fullScreenView]);

  // Handle thumbnail click
  const handleThumbnailClick = (index: number) => {
    const safeIndex = Math.min(Math.max(0, index), allImages.length - 1);
    
    if (safeIndex !== selectedImageIndex) {
      setSelectedImageIndex(safeIndex);
    }
  };
  
  // Navigate to previous image
  const handlePrevImage = () => {
    const newIndex = selectedImageIndex > 0 
      ? selectedImageIndex - 1 
      : allImages.length - 1;
    setSelectedImageIndex(newIndex);
  };
  
  // Navigate to next image
  const handleNextImage = () => {
    const newIndex = selectedImageIndex < allImages.length - 1 
      ? selectedImageIndex + 1 
      : 0;
    setSelectedImageIndex(newIndex);
  };
  
  // Handle image zoom
  const handleImageZoom = () => {
    setFullScreenView(true);
  };

  // Handle full screen close
  const handleFullScreenClose = () => {
    setFullScreenView(false);
  };
  
  // Handle touch events for mobile swipe
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

  // Carousel navigation functions for related products
  const getProductsPerView = () => {
    if (typeof window === 'undefined') return 4;
    if (window.innerWidth >= 1024) return 4;
    if (window.innerWidth >= 768) return 3;
    return 2;
  };

  const getTotalSlides = () => {
    const productsPerView = getProductsPerView();
    return Math.max(0, Math.ceil(relatedProducts.length - productsPerView) + 1);
  };

  const nextSlide = () => {
    const totalSlides = getTotalSlides();
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(prev => prev + 1);
      scrollToSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
      scrollToSlide(currentSlide - 1);
    }
  };

  const scrollToSlide = (slideIndex: number) => {
    if (relatedProductsRef.current && relatedProductsRef.current.children[0]) {
      const firstChild = relatedProductsRef.current.children[0] as HTMLElement;
      const cardWidth = firstChild.offsetWidth || 0;
      const gap = 16;
      const scrollDistance = slideIndex * (cardWidth + gap);
      
      relatedProductsRef.current.scrollTo({
        left: scrollDistance,
        behavior: 'smooth'
      });
    }
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setCurrentSlide(0);
      if (relatedProductsRef.current) {
        relatedProductsRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch related products
  const fetchRelatedProducts = async (currentProduct: Product) => {
    try {
      setRelatedLoading(true);
      let products: Product[] = [];
      
      // Get products from the same category
      if (currentProduct?.category) {
        try {
          const categoryResponse = await productAPI.getByCategory(currentProduct.category, { limit: 24 });
          
          if (categoryResponse?.products) {
            products = categoryResponse.products;
          }
        } catch (categoryError) {
          console.warn('Category fetch failed:', categoryError);
        }
      }
      
      // Filter out current product and limit results
      const filteredProducts = products
        .filter(p => p._id !== currentProduct._id)
        .slice(0, 12);
      
      setRelatedProducts(filteredProducts);
    } catch (error) {
      console.error('Error fetching related products:', error);
    } finally {
      setRelatedLoading(false);
    }
  };

  // Fetch related products when product changes
  useEffect(() => {
    if (product) {
      fetchRelatedProducts(product);
    }
  }, [product._id]);

  // WhatsApp integration
  const handleWhatsAppInquiry = () => {
    const phoneNumber = '9779800000000'; // Replace with actual number
    const message = `I'm interested in: ${product.name}\nLink: https://manishsteel.com.np/products/${productId}`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Share product
  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} from Shree Manish Steel Furniture`,
      url: `https://manishsteel.com.np/products/${productId}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareData.url);
      alert('Link copied to clipboard!');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Product</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/products"
            className="inline-block px-6 py-3 bg-[#1a365d] text-white rounded-lg hover:bg-[#2c5282] transition-colors"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Link
            href="/products"
            className="inline-block px-6 py-3 bg-[#1a365d] text-white rounded-lg hover:bg-[#2c5282] transition-colors"
          >
            Browse All Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Product Detail Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center space-x-2 text-gray-600">
            <li><Link href="/" className="hover:text-[#1a365d]">Home</Link></li>
            <li>/</li>
            <li><Link href="/products" className="hover:text-[#1a365d]">Products</Link></li>
            <li>/</li>
            <li className="text-gray-900 font-medium truncate">{product.name}</li>
          </ol>
        </nav>

        {/* Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div 
              className="relative bg-white rounded-lg overflow-hidden shadow-lg group"
              style={{ aspectRatio: '4/3' }}
              ref={imageContainerRef}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                src={imageService.getOptimizedImageUrl(allImages[selectedImageIndex], { width: 800, quality: '90' })}
                alt={`${product.name} - Image ${selectedImageIndex + 1}`}
                className="w-full h-full object-cover"
                loading="eager"
              />
              
              {/* Navigation Arrows */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Previous image"
                  >
                    <FaChevronLeft className="text-gray-800" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Next image"
                  >
                    <FaChevronRight className="text-gray-800" />
                  </button>
                </>
              )}

              {/* Zoom Button */}
              <button
                onClick={handleImageZoom}
                className="absolute top-4 right-4 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                aria-label="View full screen"
              >
                <FaExpand className="text-gray-800" />
              </button>

              {/* Image Counter */}
              {allImages.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                  {selectedImageIndex + 1} / {allImages.length}
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => handleThumbnailClick(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? 'border-[#1a365d] ring-2 ring-[#1a365d] ring-offset-2'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={imageService.getOptimizedImageUrl(image, { width: 100, quality: '75' })}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              {product.category && (
                <p className="text-lg text-gray-600">
                  {product.subcategory || product.category}
                </p>
              )}
            </div>

            {/* Price */}
            {product.price && (
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-[#1a365d]">
                  Rs. {product.price.toLocaleString()}
                </span>
                {product.originalPrice && typeof product.originalPrice === 'number' && typeof product.price === 'number' && product.originalPrice > product.price && (
                  <span className="text-xl text-gray-400 line-through">
                    Rs. {product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Description</h2>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Features</h2>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <span className="text-[#1a365d] mt-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Specifications</h2>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <React.Fragment key={key}>
                      <dt className="text-gray-600 capitalize">{key}:</dt>
                      <dd className="text-gray-900 font-medium">{value}</dd>
                    </React.Fragment>
                  ))}
                </dl>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                onClick={handleWhatsAppInquiry}
                className="flex-1 bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <span>📱</span>
                <span>Inquire on WhatsApp</span>
              </button>
              <button
                onClick={handleShare}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                aria-label="Share product"
              >
                <FaShare />
              </button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Related Products</h2>
            
            <div className="relative">
              {/* Navigation Buttons */}
              {relatedProducts.length > getProductsPerView() && (
                <>
                  <button
                    onClick={prevSlide}
                    disabled={currentSlide === 0}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed p-3 rounded-full shadow-lg transition-all"
                    aria-label="Previous products"
                  >
                    <FaChevronLeft className="text-gray-800" />
                  </button>
                  <button
                    onClick={nextSlide}
                    disabled={currentSlide >= getTotalSlides() - 1}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed p-3 rounded-full shadow-lg transition-all"
                    aria-label="Next products"
                  >
                    <FaChevronRight className="text-gray-800" />
                  </button>
                </>
              )}

              {/* Products Grid */}
              <div 
                ref={relatedProductsRef}
                className="overflow-x-auto scrollbar-hide scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <div className="grid grid-flow-col auto-cols-[calc(50%-8px)] md:auto-cols-[calc(33.333%-11px)] lg:auto-cols-[calc(25%-12px)] gap-4">
                  {relatedProducts.map((relatedProduct) => (
                    <ProductCard
                      key={relatedProduct._id}
                      product={relatedProduct}
                      onQuickView={openQuickView}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Full Screen Image View */}
      {fullScreenView && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={handleFullScreenClose}
        >
          <button
            onClick={handleFullScreenClose}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors"
            aria-label="Close full screen"
          >
            <FaTimes className="text-white text-xl" />
          </button>

          <img
            src={imageService.getOptimizedImageUrl(allImages[selectedImageIndex], { width: 1920, quality: '95' })}
            alt={`${product.name} - Full screen`}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevImage();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-4 rounded-full transition-colors"
                aria-label="Previous image"
              >
                <FaChevronLeft className="text-white text-xl" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-4 rounded-full transition-colors"
                aria-label="Next image"
              >
                <FaChevronRight className="text-white text-xl" />
              </button>

              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/10 text-white px-4 py-2 rounded-full">
                {selectedImageIndex + 1} / {allImages.length}
              </div>
            </>
          )}
        </div>
      )}

      {/* Quick View Modal */}
      {isQuickViewOpen && quickViewProduct && (
        <QuickView
          product={quickViewProduct}
          isOpen={isQuickViewOpen}
          onClose={closeQuickView}
        />
      )}
    </div>
  );
}
