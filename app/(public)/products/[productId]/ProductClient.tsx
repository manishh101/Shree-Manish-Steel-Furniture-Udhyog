'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FaChevronLeft,
  FaChevronRight,
  FaExpand,
  FaTimes,
  FaShare,
  FaHeart
} from 'react-icons/fa';

import { productAPI, Product as APIProduct } from '@/services/api';
import { scrollToTop } from '@/utils/scrollUtils';
import imageService from '@/services/imageService';
import OptimizedImage from '@/components/common/OptimizedImage';
import ProductCard from '@/components/common/ProductCard';
import QuickView from '@/components/QuickView';
import useQuickView from '@/hooks/useQuickView';
import { defaultProductImages } from '@/utils/productPlaceholders';

// Only used as last-resort fallbacks when database images are not available
const defaultImages = defaultProductImages;

interface Product extends APIProduct {
  stock?: number;
  sku?: string;
  deliveryInformation?: {
    estimatedDelivery?: string;
    shippingCost?: string;
    availableLocations?: string[];
    specialInstructions?: string;
  };
  isActive?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  originalPrice?: number;
  rating?: number;
  reviewCount?: number;
}

interface ProductClientProps {
  initialProduct: Product;
  productId: string;
}

/**
 * ProductDetailPage Component
 * 
 * A comprehensive product detail page with the following features:
 * - Image gallery with swipe/keyboard navigation
 * - Full-screen image viewing
 * - Product specifications and information
 * - Related products carousel
 * - WhatsApp integration for inquiries
 * - Responsive design (mobile-first)
 * - Accessible keyboard navigation
 * 
 * @returns {JSX.Element} The product detail page component
 */
const ProductClient = ({ initialProduct, productId }: ProductClientProps) => {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(initialProduct || null);
  const [loading, setLoading] = useState(!initialProduct);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(false);
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
  // Enhanced to ensure we can handle exactly 4 images from the database
  const allImages = useMemo(() => {
    let images: string[] = [];

    // PRIORITY 1: Product images array from database (typically Cloudinary URLs)
    // The database has 4 images per product
    if (product?.images && product.images.length > 0) {
      // Process all available images from the database
      const validImages = product.images
        .map(img => {
          if (typeof img === 'string') return img;
          // Handle object structure if present (e.g. { url: '...' } or { src: '...' })
          if (typeof img === 'object' && img) return (img as any).url || (img as any).src || null;
          return null;
        })
        .filter((img): img is string => !!img && typeof img === 'string')
        .map(img => imageService.getOptimizedImageUrl(img, {
          width: 800,
          quality: '90'
        }));

      if (validImages.length > 0) {
        images = [...validImages];
      }
    }

    // PRIORITY 2: Main product image if not already included in the images array
    if (product?.image && typeof product.image === 'string') {
      const optimizedMainImage = imageService.getOptimizedImageUrl(product.image, {
        width: 800,
        quality: '90'
      });

      // Check if this image is already in the array
      const isDuplicate = images.some(img => {
        // Simple URL comparison might not catch Cloudinary transformations
        // So we normalize URLs for comparison
        const normalizedImg = img.split('?')[0]; // Remove query parameters
        const normalizedMain = optimizedMainImage.split('?')[0];
        return normalizedImg === normalizedMain;
      });

      if (!isDuplicate) {
        images.unshift(optimizedMainImage);
      }
    }

    // Only use placeholders if absolutely needed
    if (images.length === 0) {
      const placeholder = imageService.getPlaceholderImage(product?.category);
      if (placeholder) images.push(placeholder);
    }

    return images;
  }, [product]);

  // Preload all images when component mounts for smoother experience
  useEffect(() => {
    const preloadImages = async () => {
      if (!allImages || allImages.length === 0) return;

      try {
        const imagePromises = allImages.map(src => {
          return new Promise((resolve) => {
            if (!src) {
              resolve(null);
              return;
            }

            const isPlaceholder = imageService.isPlaceholder(src);
            const img = new Image();

            img.onload = () => resolve(src);

            img.onerror = () => {
              // Only try a placeholder if we're not already loading a placeholder
              if (!isPlaceholder && defaultImages.length > 0) {
                img.src = defaultImages[0];
              }
              resolve(null);
            };

            img.src = src;
          });
        });

        await Promise.all(imagePromises);
      } catch (error) {
        console.error('Error preloading images:', error);
      }
    };

    preloadImages();
  }, [allImages]);

  // Add keyboard navigation and scroll management
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        // Previous image with left arrow key
        const newIndex = selectedImageIndex > 0
          ? selectedImageIndex - 1
          : allImages.length - 1;
        setImageLoading(true);
        setSelectedImageIndex(newIndex);
      } else if (e.key === 'ArrowRight') {
        // Next image with right arrow key
        const newIndex = selectedImageIndex < allImages.length - 1
          ? selectedImageIndex + 1
          : 0;
        setImageLoading(true);
        setSelectedImageIndex(newIndex);
      } else if (e.key === 'Escape') {
        // Exit full screen view with Escape key
        if (fullScreenView) {
          setFullScreenView(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Scroll to top when loading new product
    if (typeof window !== 'undefined') {
      scrollToTop({ instant: true });
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImageIndex, allImages.length, fullScreenView]);

  // Add scroll restoration on image change or zoom
  useEffect(() => {
    // Save scroll position before image change
    const scrollPosition = window.scrollY;

    // Restore scroll position after image loads
    if (!imageLoading) {
      setTimeout(() => {
        window.scrollTo(0, scrollPosition);
      }, 100);
    }
  }, [selectedImageIndex, imageLoading]);

  // Navigate to previous image with animation
  const handlePrevImage = () => {
    const newIndex = selectedImageIndex > 0
      ? selectedImageIndex - 1
      : allImages.length - 1;
    setImageLoading(true);
    setSelectedImageIndex(newIndex);
  };

  // Navigate to next image with animation
  const handleNextImage = () => {
    const newIndex = selectedImageIndex < allImages.length - 1
      ? selectedImageIndex + 1
      : 0;
    setImageLoading(true);
    setSelectedImageIndex(newIndex);
  };

  // Enhanced image full screen functionality
  const handleImageZoom = () => {
    setFullScreenView(true);
  };

  // Handle full screen close
  const handleFullScreenClose = () => {
    setFullScreenView(false);
  };

  // Handle touch events for better mobile support
  const handleTouchStart = (e: React.TouchEvent) => {
    // Store the initial touch position for swipe detection
    const touch = e.touches[0];
    setTouchPosition({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // Skip if no initial position is set
    if (!touchPosition) return;

    const touch = e.touches[0];
    const diffX = touchPosition.x - touch.clientX;
    const diffY = touchPosition.y - touch.clientY;

    // If horizontal swipe is more significant than vertical
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 30) {
      if (diffX > 0) {
        // Swipe left, show next image
        handleNextImage();
      } else {
        // Swipe right, show previous image
        handlePrevImage();
      }
      // Reset touch position after handling swipe
      setTouchPosition(null);
    }
  };

  const handleTouchEnd = () => {
    // Clear the touch position
    setTouchPosition(null);
  };

  // Carousel navigation functions for related products
  const getProductsPerView = () => {
    if (typeof window === 'undefined') return 4;
    if (window.innerWidth >= 1024) return 4; // lg: 4 products
    if (window.innerWidth >= 768) return 3;  // md: 3 products
    return 2; // sm: 2 products
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
    if (relatedProductsRef.current) {
      // Estimate card width roughly or calculate if possible
      const firstChild = relatedProductsRef.current.children[0] as HTMLElement;
      const cardWidth = firstChild?.offsetWidth || 280;

      const gap = 16; // gap-4 = 16px
      const scrollDistance = slideIndex * (cardWidth + gap);

      relatedProductsRef.current.scrollTo({
        left: scrollDistance,
        behavior: 'smooth'
      });
    }
  };

  // Handle window resize for responsive carousel
  useEffect(() => {
    const handleResize = () => {
      // Reset to first slide on resize to avoid layout issues
      setCurrentSlide(0);
      if (relatedProductsRef.current) {
        relatedProductsRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Enhanced function to fetch related products based on category with subcategories
  const fetchRelatedProducts = async (currentProduct: Product) => {
    try {
      setRelatedLoading(true);

      let products: Product[] = [];
      const cat = typeof currentProduct.category === 'string' ? currentProduct.category : (currentProduct.category as any)?.name;

      // Strategy 1: Get products from the same category INCLUDING all its subcategories
      if (cat) {
        try {
          // Use the enhanced getByCategory with includeAllSubcategories flag
          const categoryResponse = await productAPI.getByCategory(cat, {
            limit: 24, // Get more products since we're including subcategories
          });

          if (categoryResponse?.products) {
            products = categoryResponse.products as unknown as Product[];
          }
        } catch (categoryError) {
          // Ignore
        }
      }

      // Strategy 2: If no products found or very few, get general products
      if (products.length < 8) {
        try {
          const generalResponse = await productAPI.getAll(1, 24);
          let allProducts: Product[] = [];

          if (generalResponse?.products) {
            allProducts = generalResponse.products as unknown as Product[];
          }

          // If we have category products, supplement them; otherwise use all general products
          if (products.length > 0) {
            // Add non-duplicate products from general fetch
            const currentIds = products.map(p => p._id || p.id);
            const additionalProducts = allProducts.filter(p =>
              !currentIds.includes(p._id || p.id) &&
              (p._id || p.id) !== (currentProduct._id || currentProduct.id)
            );
            products = [...products, ...additionalProducts];
          } else {
            products = allProducts;
          }
        } catch (generalError) {
          console.warn('General products fetch failed');
        }
      }

      // Filter out the current product and ensure we have valid products
      const validProducts = products
        .filter(p => p && (p._id || p.id) && p.name) // Ensure product has required properties
        .filter(p => (p._id || p.id) !== (currentProduct._id || currentProduct.id)) // Remove current product
        .slice(0, 12); // Limit to 12 products for carousel

      setRelatedProducts(validProducts);

      // Reset carousel position when new products are loaded
      setCurrentSlide(0);

    } catch (error) {
      console.error('Error fetching related products:', error);
      setRelatedProducts([]);
      setCurrentSlide(0);
    } finally {
      setRelatedLoading(false);
    }
  };

  // Fetch product from API if not provided in initial props, or if needed
  useEffect(() => {
    const fetchProduct = async () => {
      // If we already have initialProduct matching the ID, use it (handled by state init). 
      // But if user navigates to another product client-side without full reload, we need to fetch.
      if (initialProduct && (initialProduct._id === productId || initialProduct.id === productId)) {
        // Already have it
        fetchRelatedProducts(initialProduct);
        return;
      }

      try {
        setLoading(true);
        const response = await productAPI.getById(productId);
        const productData = response as unknown as Product; // safe cast

        setProduct(productData);
        setLoading(false);

        fetchRelatedProducts(productData);
        scrollToTop({ instant: true });
      } catch (error) {
        setError('Failed to load product details. Please try again.');
        setLoading(false);
      }
    };

    // Only fetch if productId changes or initialProduct is stale/missing
    fetchProduct();
  }, [productId, initialProduct]);

  // Add a function to handle the "Back to Products" button click
  const handleBackToProducts = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push('/products');
    scrollToTop({ instant: true });
  };

  // Handle share functionality
  const handleShare = async () => {
    if (!product) return;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out this ${product.name} from Shree Manish Steel Furniture`,
          url: window.location.href
        });
      } catch (error) {
        // Ignore aborts
      }
    } else {
      // Fallback: copy URL to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
      } catch (error) {
        // Ignore
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Oops! Something went wrong</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/products"
              className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h1>
          <Link href="/products" className="text-blue-600 hover:text-blue-700">
            Return to Products
          </Link>
        </div>
      </div>
    );
  }

  const categoryName = typeof product.category === 'string' ? product.category : 'Furniture';
  const subcategoryName = typeof product.subcategory === 'string' ? product.subcategory : undefined;

  return (
    <div className="bg-gray-50 min-h-screen mobile-viewport mobile-scroll-smooth py-4 sm:py-6 lg:py-8 pb-20 sm:pb-8">
      {/* Mobile Bottom Action Bar - Visible on small screens only */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 sm:hidden z-40 shadow-lg">
        <div className="flex items-center gap-2">
          <Link
            href="/products"
            className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Back
          </Link>
          <a
            href={`https://wa.me/9779824336371?text=I'm interested in ${encodeURIComponent(product.name)}. Please provide more information.`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-2 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            <FaChevronRight className="w-4 h-4 mr-2" />
            WhatsApp
          </a>
          <Link
            href="/custom-order"
            className="flex-1 flex items-center justify-center px-3 py-2 border border-blue-600 rounded-md text-sm font-medium text-blue-600 hover:bg-blue-50"
          >
            Custom
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Breadcrumb - Enhanced for better visibility */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center flex-wrap space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <span className="text-gray-400">/</span>
            <Link href="/products" onClick={handleBackToProducts} className="hover:text-blue-600 transition-colors">Products</Link>
            <span className="text-gray-400">/</span>
            <span className="text-blue-600 font-medium truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
          </div>
        </div>

        {/* Product category & quick actions */}
        <div className="flex flex-wrap items-center justify-between mb-4 bg-white rounded-lg shadow-sm px-4 py-3 border border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="text-xs sm:text-sm px-2 py-1 bg-gray-100 rounded-full text-gray-700">
              {categoryName}
            </div>
            {product.stock !== 0 && (
              <div className="text-xs sm:text-sm px-2 py-1 bg-green-100 rounded-full text-green-700">
                In Stock
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3 mt-2 sm:mt-0">
            <button
              className="text-gray-500 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Add to wishlist"
            >
              <FaHeart size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Product Images Section - Simplified and more user friendly */}
          <div className="space-y-6">
            {/* Main Product Image Viewer */}
            <div
              className="relative rounded-lg overflow-hidden bg-white shadow-md"
              ref={imageContainerRef}
            >
              {/* Main image display area with touch support */}
              <div
                className="relative w-full aspect-square bg-gray-50 flex items-center justify-center touch-manipulation"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Previous button - always visible on mobile */}
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shadow-md z-10 opacity-75 hover:opacity-100 transition-all duration-200"
                  aria-label="Previous image"
                >
                  <FaChevronLeft className="text-gray-700 text-xl" />
                </button>

                {/* Next button - always visible on mobile */}
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shadow-md z-10 opacity-75 hover:opacity-100 transition-all duration-200"
                  aria-label="Next image"
                >
                  <FaChevronRight className="text-gray-700 text-xl" />
                </button>

                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-80 z-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-opacity-40 border-t-blue-600"></div>
                  </div>
                )}

                {/* Main product image */}
                <div onClick={handleImageZoom} className="w-full h-full cursor-pointer">
                  <OptimizedImage
                    src={allImages[selectedImageIndex]}
                    alt={imageService.getImageAlt(product) || "Product Image"}
                    className={`w-full h-full object-contain transition-all duration-300 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                    onLoad={() => setImageLoading(false)}
                    size="large"
                  />
                </div>

                {/* Enlarge button - positioned in bottom left corner */}
                <button
                  onClick={handleImageZoom}
                  className="absolute bottom-4 left-4 bg-black bg-opacity-60 hover:bg-opacity-80 rounded-full w-10 h-10 flex items-center justify-center shadow-md transition-all duration-200 z-10"
                  aria-label="View full screen"
                >
                  <FaExpand className="text-white text-sm" />
                </button>
              </div>
            </div>
            {/* Enhanced Thumbnail Container - larger, more professional */}
            {allImages.length > 1 && (
              <div className="flex justify-center">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-white rounded-xl shadow-md border border-gray-100 p-2">
                  {allImages.slice(0, 4).map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-32 h-32 rounded-xl border-2 transition-all duration-200 bg-gray-50 shadow-sm hover:shadow-lg ${selectedImageIndex === idx ? 'border-blue-600 ring-2 ring-blue-600' : 'border-gray-200 hover:border-blue-600'}`}
                      aria-label={`View product image ${idx + 1}`}
                    >
                      <div className="w-full h-full overflow-hidden rounded-xl relative bg-white">
                        <OptimizedImage
                          src={img}
                          alt={`Product view ${idx + 1}`}
                          className="w-full h-full object-contain"
                          size="thumbnail"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Details Section - Enhanced for better UX */}
          <div className="space-y-6 flex flex-col">
            {/* Product header - Always first */}
            <div className="order-1">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 leading-tight">
                    {product.name}
                  </h1>

                  {/* Category and subcategory breadcrumb */}
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <span>{categoryName}</span>
                    {subcategoryName && (
                      <>
                        <span className="mx-2">›</span>
                        <span>{subcategoryName}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Share button */}
                <button
                  onClick={handleShare}
                  className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Share this product"
                >
                  <FaShare size={16} />
                </button>
              </div>

              {/* Product description */}
              {product.description && (
                <div className="mb-6">
                  <p className="text-gray-600 leading-relaxed text-base">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Features list */}
              {product.features && product.features.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span className="flex-shrink-0 w-5 h-5 bg-blue-600 bg-opacity-10 rounded-full flex items-center justify-center text-blue-600 mr-3 mt-0.5">
                          ✓
                        </span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Additional Product Information - Accordion Style - Mobile First */}
            <div className="order-2 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="divide-y divide-gray-100">
                {/* Specifications Section */}
                <details className="group">
                  <summary className="flex items-center justify-between p-4 cursor-pointer">
                    <h3 className="text-lg font-medium text-gray-800">Specifications</h3>
                    <span className="ml-2 text-gray-500 group-open:rotate-180 transition-transform">
                      <FaChevronRight className="rotate-90 group-open:-rotate-90 transition-transform" />
                    </span>
                  </summary>
                  <div className="p-4 pt-0 text-gray-600">
                    {(() => {
                      const specs = product.specifications;
                      if (!specs) {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col space-y-1">
                              <span className="text-sm text-gray-500">Material</span>
                              <span className="font-medium">{product.material || "Steel"}</span>
                            </div>
                            <div className="flex flex-col space-y-1">
                              <span className="text-sm text-gray-500">Dimensions</span>
                              <span className="font-medium">
                                {product.dimensions && (product.dimensions.length || product.dimensions.width || product.dimensions.height)
                                  ? `${product.dimensions.length || 'N/A'} × ${product.dimensions.width || 'N/A'} × ${product.dimensions.height || 'N/A'} cm`
                                  : "Contact for details"}
                              </span>
                            </div>
                            <div className="flex flex-col space-y-1">
                              <span className="text-sm text-gray-500">Finish</span>
                              <span className="font-medium">{product.finish || "Premium"}</span>
                            </div>
                            <div className="flex flex-col space-y-1">
                              <span className="text-sm text-gray-500">Weight</span>
                              <span className="font-medium">{product.weight || "Varies by model"}</span>
                            </div>
                          </div>
                        );
                      }

                      if (Array.isArray(specs)) {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {specs.map((item, i) => (
                              <div key={i} className="flex flex-col space-y-1">
                                <span className="text-sm text-gray-500">{item.label}</span>
                                <span className="font-medium">{item.value}</span>
                              </div>
                            ))}
                          </div>
                        );
                      }

                      if (typeof specs === 'object') {
                        return (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Object.entries(specs).map(([key, value]) => (
                              <div key={key} className="flex flex-col space-y-1">
                                <span className="text-sm text-gray-500 capitalize">
                                  {key.replace(/([A-Z])/g, ' $1').trim().replace(/_/g, ' ')}
                                </span>
                                <span className="font-medium">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        );
                      }

                      return <div>{String(specs)}</div>;
                    })()}
                  </div>
                </details>

                {/* Delivery Information Section */}
                <details className="group">
                  <summary className="flex items-center justify-between p-4 cursor-pointer">
                    <h3 className="text-lg font-medium text-gray-800">Delivery Information</h3>
                    <span className="ml-2 text-gray-500 group-open:rotate-180 transition-transform">
                      <FaChevronRight className="rotate-90 group-open:-rotate-90 transition-transform" />
                    </span>
                  </summary>
                  <div className="p-4 pt-0 text-gray-600">
                    {product.deliveryInformation ? (
                      <div className="space-y-3">
                        {product.deliveryInformation.estimatedDelivery && (
                          <div className="flex items-start">
                            <span className="flex-shrink-0 w-5 h-5 bg-blue-600 bg-opacity-10 rounded-full flex items-center justify-center text-blue-600 mr-3 mt-0.5">•</span>
                            <div>
                              <span className="font-medium">Estimated Delivery: </span>
                              <span>{product.deliveryInformation.estimatedDelivery}</span>
                            </div>
                          </div>
                        )}
                        {product.deliveryInformation.shippingCost && (
                          <div className="flex items-start">
                            <span className="flex-shrink-0 w-5 h-5 bg-blue-600 bg-opacity-10 rounded-full flex items-center justify-center text-blue-600 mr-3 mt-0.5">•</span>
                            <div>
                              <span className="font-medium">Shipping Cost: </span>
                              <span>{product.deliveryInformation.shippingCost}</span>
                            </div>
                          </div>
                        )}
                        {product.deliveryInformation.availableLocations && product.deliveryInformation.availableLocations.length > 0 && (
                          <div className="flex items-start">
                            <span className="flex-shrink-0 w-5 h-5 bg-blue-600 bg-opacity-10 rounded-full flex items-center justify-center text-blue-600 mr-3 mt-0.5">•</span>
                            <div>
                              <span className="font-medium">Available Locations: </span>
                              <span>{product.deliveryInformation.availableLocations.join(', ')}</span>
                            </div>
                          </div>
                        )}
                        {product.deliveryInformation.specialInstructions && (
                          <div className="flex items-start">
                            <span className="flex-shrink-0 w-5 h-5 bg-blue-600 bg-opacity-10 rounded-full flex items-center justify-center text-blue-600 mr-3 mt-0.5">•</span>
                            <div>
                              <span className="font-medium">Special Instructions: </span>
                              <span>{product.deliveryInformation.specialInstructions}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p className="mb-3">Delivery options and timeframes may vary based on your location and product availability.</p>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <span className="flex-shrink-0 w-5 h-5 bg-blue-600 bg-opacity-10 rounded-full flex items-center justify-center text-blue-600 mr-3 mt-0.5">•</span>
                            <span>Free delivery within Kathmandu Valley</span>
                          </li>
                          <li className="flex items-start">
                            <span className="flex-shrink-0 w-5 h-5 bg-blue-600 bg-opacity-10 rounded-full flex items-center justify-center text-blue-600 mr-3 mt-0.5">•</span>
                            <span>Installation services available</span>
                          </li>
                          <li className="flex items-start">
                            <span className="flex-shrink-0 w-5 h-5 bg-blue-600 bg-opacity-10 rounded-full flex items-center justify-center text-blue-600 mr-3 mt-0.5">•</span>
                            <span>Contact us for shipping to other locations</span>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            </div>

            {/* Action Buttons - Visible on all devices */}
            <div className="flex flex-col gap-3 pt-6 order-3">
              <a
                href={`https://wa.me/9779824336371?text=I'm interested in ${encodeURIComponent(product.name)} (ID: ${product._id}). Please provide more information.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 border border-transparent rounded-lg shadow-sm text-sm sm:text-base font-medium text-white bg-green-600 hover:bg-green-700 active:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99]"
              >
                <FaChevronRight className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                Inquire on WhatsApp
              </a>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/products"
                  className="flex-1 flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-lg shadow-sm text-sm sm:text-base font-medium text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 transition-all duration-200"
                >
                  Back to Products
                </Link>

                <Link
                  href="/custom-order"
                  className="flex-1 flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border border-blue-600 rounded-lg shadow-sm text-sm sm:text-base font-medium text-blue-600 hover:bg-blue-50 active:bg-blue-100 transition-all duration-200"
                >
                  Request Customization
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* You might also like - Related Products */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">You might also like</h2>
          </div>

          {relatedLoading ? (
            // Loading skeleton for related products
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-200"></div>
                  <div className="p-4">
                    <div className="bg-gray-200 h-4 rounded mb-2"></div>
                    <div className="bg-gray-200 h-3 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : relatedProducts.length > 0 ? (
            <>
              {/* Mobile: Scrollable Grid - Desktop: Carousel */}
              {/* Mobile View: Grid Layout */}
              <div className="lg:hidden">
                <div className="grid grid-cols-2 gap-4">
                  {relatedProducts.slice(0, 8).map((relatedProduct) => (
                    <div key={relatedProduct._id || relatedProduct.id}>
                      <ProductCard
                        product={relatedProduct}
                        onQuickView={openQuickView}
                      />
                    </div>
                  ))}
                </div>

                {/* Show More button if there are more than 8 products */}
                {relatedProducts.length > 8 && (
                  <div className="text-center mt-6">
                    <Link
                      href="/products"
                      className="inline-flex items-center px-6 py-3 border border-blue-600 rounded-lg shadow-sm text-base font-medium text-blue-600 hover:bg-blue-50 active:bg-blue-100 transition-all duration-200"
                    >
                      View All Products
                    </Link>
                  </div>
                )}
              </div>

              {/* Desktop View: Carousel Layout */}
              <div className="hidden lg:block">
                <div className="relative mx-12">
                  {/* Left Navigation Arrow - only show if not at beginning */}
                  {relatedProducts.length > getProductsPerView() && currentSlide > 0 && (
                    <button
                      onClick={prevSlide}
                      className="absolute -left-12 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white shadow-lg border border-gray-200 text-gray-600 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                      aria-label="Previous products"
                    >
                      <FaChevronLeft className="h-5 w-5" />
                    </button>
                  )}

                  {/* Right Navigation Arrow - only show if there are more slides */}
                  {relatedProducts.length > getProductsPerView() && currentSlide < getTotalSlides() - 1 && (
                    <button
                      onClick={nextSlide}
                      className="absolute -right-12 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white shadow-lg border border-gray-200 text-gray-600 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                      aria-label="Next products"
                    >
                      <FaChevronRight className="h-5 w-5" />
                    </button>
                  )}

                  <div
                    ref={relatedProductsRef}
                    className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide"
                  >
                    {relatedProducts.map((relatedProduct) => (
                      <div
                        key={relatedProduct._id || relatedProduct.id}
                        className="flex-none w-[calc(25%-12px)]"
                      >
                        <ProductCard
                          product={relatedProduct}
                          onQuickView={openQuickView}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Slide indicators */}
                  {relatedProducts.length > getProductsPerView() && (
                    <div className="flex justify-center mt-4 gap-2">
                      {Array.from({ length: getTotalSlides() }, (_, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setCurrentSlide(index);
                            scrollToSlide(index);
                          }}
                          className={`w-2 h-2 rounded-full transition-all duration-200 ${currentSlide === index
                            ? 'bg-blue-600 w-6'
                            : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Loading related products...</p>
              <Link
                href="/products"
                className="inline-block mt-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                Browse all products →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* QuickView Modal for related products */}
      {isQuickViewOpen && quickViewProduct && (
        <QuickView
          product={quickViewProduct}
          isOpen={isQuickViewOpen}
          onClose={closeQuickView}
        />
      )}

      {/* Full Screen Image Overlay */}
      {fullScreenView && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
          onClick={handleFullScreenClose}
        >
          {/* Close button */}
          <button
            onClick={handleFullScreenClose}
            className="absolute top-4 right-4 z-60 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full w-12 h-12 flex items-center justify-center text-white transition-all duration-200"
            aria-label="Close full screen"
          >
            <FaTimes className="text-xl" />
          </button>

          {/* Navigation buttons in full screen */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevImage();
                }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full w-12 h-12 flex items-center justify-center text-white transition-all duration-200 z-60"
                aria-label="Previous image"
              >
                <FaChevronLeft className="text-xl" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full w-12 h-12 flex items-center justify-center text-white transition-all duration-200 z-60"
                aria-label="Next image"
              >
                <FaChevronRight className="text-xl" />
              </button>
            </>
          )}

          {/* Full screen image */}
          <div
            className="max-w-full max-h-full p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <OptimizedImage
              src={allImages[selectedImageIndex]}
              alt={imageService.getImageAlt(product) || "Product Image"}
              className="max-w-full max-h-full object-contain"
              size="large"
              objectFit="contain"
            />
          </div>

          {/* Image counter in full screen */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              {selectedImageIndex + 1} / {allImages.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductClient;