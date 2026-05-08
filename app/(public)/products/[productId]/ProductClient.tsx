'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  FaChevronLeft,
  FaChevronRight,
  FaChevronUp,
  FaChevronDown,
  FaExpand,
  FaTimes,
  FaShare,
  FaHeart,
  FaRegHeart,
  FaWhatsapp
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

const defaultManufacturerDetails = {
  name: 'Shree Manish Steel Furniture Udhyog',
  address: 'Biratnagar, Morang',
  email: 'shreemanishfurniture@gmail.com',
  countryOfOrigin: 'Nepal'
};

const normalizeManufacturerDetails = (details: APIProduct['manufacturerDetails']) => {
  if (!details) {
    return defaultManufacturerDetails;
  }

  if (typeof details === 'string') {
    const trimmed = details.trim();

    if (!trimmed) {
      return defaultManufacturerDetails;
    }

    try {
      return {
        ...defaultManufacturerDetails,
        ...(JSON.parse(trimmed) as Partial<typeof defaultManufacturerDetails>)
      };
    } catch {
      return {
        ...defaultManufacturerDetails,
        name: trimmed
      };
    }
  }

  return {
    ...defaultManufacturerDetails,
    ...details
  };
};

const colorFallbacks: Record<string, string> = {
  black: '#111827',
  blue: '#2563eb',
  brown: '#7c2d12',
  coffee: '#6f4e37',
  cream: '#f5f5dc',
  gold: '#d4af37',
  gray: '#6b7280',
  green: '#16a34a',
  grey: '#6b7280',
  maroon: '#7f1d1d',
  orange: '#ea580c',
  pink: '#db2777',
  red: '#dc2626',
  silver: '#c0c0c0',
  white: '#f8fafc',
  yellow: '#facc15'
};

const normalizeColorKey = (value: string) => value.trim().toLowerCase().replace(/\s+/g, '-');
const getColorSwatch = (label: string, hex?: string) => hex || colorFallbacks[label.trim().toLowerCase()] || '#e5e7eb';

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

interface ColorChoice {
  label: string;
  hex?: string;
  productId?: string;
  image?: string;
  href: string;
  isCurrent: boolean;
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
  const searchParams = useSearchParams();
  const urlColorParam = searchParams?.get('color') || '';

  const [linkedProductsMap, setLinkedProductsMap] = useState<Record<string, Product | null>>({});

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
        .filter((img): img is string => !!img && typeof img === 'string');

      if (validImages.length > 0) {
        images = [...validImages];
      }
    }

    // PRIORITY 2: Main product image if not already included in the images array
    if (product?.image && typeof product.image === 'string') {
      const mainImage = product.image;

      // Check if this image is already in the array
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
      const placeholder = imageService.getPlaceholderImage(product?.category);
      if (placeholder) images.push(placeholder);
    }

    return images;
  }, [product]);

  // Prefetch linked products for better variant rendering
  useEffect(() => {
    if (!product || !Array.isArray(product.colorVariants) || product.colorVariants.length === 0) return;

    const ids = product.colorVariants
      .map((v: any) => (typeof v.productId === 'string' ? v.productId : (v.productId && v.productId._id ? v.productId._id : undefined)))
      .filter(Boolean) as string[];

    const toFetch = ids.filter(id => !linkedProductsMap[id]);
    if (toFetch.length === 0) return;

    Promise.all(toFetch.map(id => productAPI.getById(id).then(p => ({ id, p })).catch(() => ({ id, p: null }))))
      .then(results => {
        setLinkedProductsMap(prev => {
          const next = { ...prev };
          results.forEach(r => { next[r.id] = r.p as Product | null; });
          return next;
        });
      });
  }, [product]);

  const colorChoices = useMemo<ColorChoice[]>(() => {
    if (!product) return [];

    const currentProductId = product._id || product.id || productId;
    // Prefer URL color param when present so navigating via ?color= keeps selection
    const activeColorKey = urlColorParam ? String(urlColorParam).trim().toLowerCase() : (product.colorName ? normalizeColorKey(product.colorName) : '');

    const choices: Omit<ColorChoice, 'href' | 'isCurrent'>[] = [];
    const seenLabels = new Set<string>();

    const addChoice = (choice: { label?: string; hex?: string; productId?: string; image?: string }) => {
      const label = choice.label?.trim();
      if (!label) return;

      const key = normalizeColorKey(label);
      if (seenLabels.has(key)) return;

      seenLabels.add(key);
      choices.push({
        label,
        hex: choice.hex,
        productId: choice.productId,
        image: choice.image
      });
    };

    // Add THIS product's own color first (it's part of the variant group)
    if (product.colorName) {
      addChoice({
        label: product.colorName,
        hex: product.colorHex,
        productId: currentProductId,
        image: product.image || allImages[0]
      });
    }

    // Add variants in their stored order (which is now canonical/alphabetical)
    // These are all OTHER products in the group, already sorted
    if (Array.isArray(product.colorVariants)) {
      product.colorVariants.forEach((variant: any) => {
        const linkedId = typeof variant.productId === 'string' ? variant.productId : (variant.productId && variant.productId._id ? variant.productId._id : undefined);
        const linkedProduct = linkedId ? linkedProductsMap[linkedId] : (typeof variant.productId === 'object' ? variant.productId : null);

        const linkedProductImage = linkedProduct?.image || linkedProduct?.images?.[0];
        const linkedProductColor = linkedProduct?.colorName || variant.label;

        addChoice({
          label: linkedProductColor,
          hex: variant.hex || linkedProduct?.colorHex,
          productId: linkedId || (linkedProduct?._id as any) || undefined,
          image: variant.image || linkedProductImage
        });
      });
    }

    // Fallback to simple colors array
    if (choices.length === 0 && Array.isArray(product.colors)) {
      product.colors.forEach((color) => addChoice({ label: color }));
    }

    // Sort by label alphabetically to ensure canonical order across all pages
    const sortedChoices = [...choices].sort((a, b) => {
      const aLabel = a.label.toLowerCase();
      const bLabel = b.label.toLowerCase();
      return aLabel.localeCompare(bLabel);
    });

    return sortedChoices.map((choice, index) => {
      const targetProductId = choice.productId || currentProductId;

      const isCurrent =
        String(targetProductId) === String(currentProductId) ||
        (activeColorKey && normalizeColorKey(choice.label) === normalizeColorKey(activeColorKey)) ||
        (!activeColorKey && index === 0);

      return {
        ...choice,
        href: `/products/${targetProductId}?color=${normalizeColorKey(choice.label)}`,
        isCurrent
      };
    });
  }, [allImages, product, productId, urlColorParam, linkedProductsMap]);

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

    // Only update if index actually changes (prevents stuck loading state on single image)
    if (newIndex !== selectedImageIndex) {
      // Don't set imageLoading(true) here to avoiding flickering/delay
      setSelectedImageIndex(newIndex);
    }
  };

  // Navigate to next image with animation
  const handleNextImage = () => {
    const newIndex = selectedImageIndex < allImages.length - 1
      ? selectedImageIndex + 1
      : 0;

    // Only update if index actually changes (prevents stuck loading state on single image)
    if (newIndex !== selectedImageIndex) {
      // Don't set imageLoading(true) here to avoiding flickering/delay
      setSelectedImageIndex(newIndex);
    }
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
        toast.success('Shared successfully!');
      } catch (error) {
        // Ignore aborts
      }
    } else {
      // Fallback: copy URL to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy link');
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
  const manufacturerDetails = normalizeManufacturerDetails(product.manufacturerDetails);

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
            <FaWhatsapp className="w-4 h-4 mr-2" />
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

      <div className="max-w-[1500px] mx-auto px-6 sm:px-10 md:px-12 lg:px-14 xl:px-16">
        {/* Breadcrumb */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center flex-wrap space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span className="text-gray-400">›</span>
            <Link href="/products" onClick={handleBackToProducts} className="hover:text-primary transition-colors">Product</Link>
            <span className="text-gray-400">›</span>
            <span className="text-primary font-semibold truncate max-w-[250px] sm:max-w-md uppercase">{product.name}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] xl:grid-cols-[0.92fr_1.08fr] gap-6 lg:gap-10">
          {/* LEFT: Image Gallery with Vertical Thumbnails */}
          <div className="flex flex-col lg:flex-row gap-4 lg:items-stretch">
            {/* Vertical Thumbnail Strip (Desktop) */}
            {allImages.length > 1 && (
              <div className="hidden lg:flex flex-col w-20 xl:w-24 shrink-0 h-full">
                {/* Up Arrow */}
                <button
                  onClick={handlePrevImage}
                  className="w-full h-8 xl:h-10 border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center shrink-0 mb-2 transition-colors"
                  aria-label="Previous thumbnail"
                >
                  <FaChevronUp className="text-gray-500 text-sm" />
                </button>
                
                {/* Thumbnails container with hidden overflow to cut off the 5th thumbnail */}
                <div className="flex-1 overflow-hidden relative">
                  <div className="absolute inset-x-0 top-0 flex flex-col gap-2 transition-transform duration-300">
                    {allImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`w-full aspect-[4/5] bg-white border shrink-0 overflow-hidden transition-all duration-200 ${selectedImageIndex === idx ? 'border-primary ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300'}`}
                        aria-label={`View product image ${idx + 1}`}
                      >
                        <OptimizedImage src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" size="thumbnail" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Down Arrow */}
                <button
                  onClick={handleNextImage}
                  className="w-full h-8 xl:h-10 border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center shrink-0 mt-2 transition-colors"
                  aria-label="Next thumbnail"
                >
                  <FaChevronDown className="text-gray-500 text-sm" />
                </button>
              </div>
            )}

            {/* Main Image + Mobile Thumbnails */}
            <div className="flex-1 flex flex-col gap-4">
              {/* Main Product Image */}
              <div className="relative w-full aspect-square lg:aspect-[3/4] bg-[#f8f9fa] border border-gray-200 flex items-center justify-center overflow-hidden" ref={imageContainerRef}>
                <div
                  className="w-full h-full relative flex items-center justify-center touch-manipulation"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {/* Nav arrows on image (mobile only) */}
                  <button onClick={handlePrevImage} className="lg:hidden absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full w-9 h-9 flex items-center justify-center shadow z-10 opacity-70 hover:opacity-100 transition-all" aria-label="Previous image">
                    <FaChevronLeft className="text-gray-600" />
                  </button>
                  <button onClick={handleNextImage} className="lg:hidden absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full w-9 h-9 flex items-center justify-center shadow z-10 opacity-70 hover:opacity-100 transition-all" aria-label="Next image">
                    <FaChevronRight className="text-gray-600" />
                  </button>

                  {imageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#f8f9fa]/80 z-20">
                      <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary/30 border-t-primary"></div>
                    </div>
                  )}

                  <div onClick={handleImageZoom} className="w-full h-full cursor-pointer flex items-center justify-center">
                    <OptimizedImage
                      src={allImages[selectedImageIndex]}
                      alt={product.name || "Product Image"}
                      className="w-full h-full object-cover mix-blend-multiply transition-all duration-300"
                      size="medium"
                      priority={true}
                    />
                  </div>

                  <button onClick={handleImageZoom} className="absolute bottom-4 right-4 bg-white/90 border border-gray-200 hover:bg-white p-2 text-gray-600 transition-all z-10 shadow-sm" aria-label="View full screen">
                    <FaExpand className="text-sm" />
                  </button>
                </div>
              </div>

              {/* Horizontal Thumbnails (Mobile Only) */}
              {allImages.length > 1 && (
                <div className="flex lg:hidden gap-2 overflow-x-auto pb-2">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-16 h-20 shrink-0 border bg-white overflow-hidden ${selectedImageIndex === idx ? 'border-primary ring-1 ring-primary' : 'border-gray-200'}`}
                      aria-label={`View product image ${idx + 1}`}
                    >
                      <OptimizedImage src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" size="thumbnail" />
                    </button>
                  ))}
                </div>
              )}

              {/* Feature Badges Below Image */}
              <div className="bg-white border border-gray-100 p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 bg-primary/5 border border-primary/10 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </div>
                    <span className="text-[10px] sm:text-xs text-gray-600 font-medium leading-tight">Quality Guaranteed</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 bg-primary/5 border border-primary/10 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                    </div>
                    <span className="text-[10px] sm:text-xs text-gray-600 font-medium leading-tight">Premium Paint</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 bg-primary/5 border border-primary/10 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
                    </div>
                    <span className="text-[10px] sm:text-xs text-gray-600 font-medium leading-tight">Free Delivery*</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Product Details */}
          <div className="flex flex-col">
            {/* Product Name & Actions */}
            <div className="flex items-start justify-between mb-6 pb-5 border-b border-gray-100">
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight flex-1 pr-4">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 shrink-0 mt-2">
                <button onClick={handleShare} className="text-gray-400 hover:text-primary transition-colors" title="Share">
                  <FaShare size={20} />
                </button>
                <button className="text-gray-300 hover:text-red-500 transition-colors" aria-label="Wishlist">
                  <FaHeart size={24} />
                </button>
              </div>
            </div>            {/* Product Description */}
            {product.description && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">DESCRIPTION</h3>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  {product.description}
                </p>
              </div>
            )}

            {colorChoices.length > 0 && (
              <div className="mb-6 border-y border-gray-100 py-4">
                <div className="mb-3 flex items-center gap-2">
                  <h3 className="text-base font-bold text-gray-900">Available Color:</h3>
                  <span
                    className="h-6 w-6 rounded-full border border-gray-300 shadow-inner"
                    style={{
                      backgroundColor: getColorSwatch(
                        colorChoices.find((choice) => choice.isCurrent)?.label || colorChoices[0].label,
                        colorChoices.find((choice) => choice.isCurrent)?.hex || colorChoices[0].hex
                      )
                    }}
                    aria-hidden="true"
                  />
                  <span className="text-sm font-semibold uppercase text-gray-900">
                    {colorChoices.find((choice) => choice.isCurrent)?.label || colorChoices[0].label}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {colorChoices.map((choice) => (
                    <Link
                      key={`${choice.label}-${choice.productId || 'current'}`}
                      href={choice.href}
                      className={`group relative flex h-[74px] w-[64px] items-center justify-center rounded-md border bg-white p-1.5 transition hover:border-primary hover:shadow-sm ${choice.isCurrent
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-gray-200'
                        }`}
                      aria-label={`View ${choice.label} color`}
                      title={choice.label}
                    >
                      <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded bg-gray-50">
                        {choice.image ? (
                          <OptimizedImage
                            src={choice.image}
                            alt={`${choice.label} color`}
                            className="h-full w-full object-contain mix-blend-multiply"
                            size="thumbnail"
                          />
                        ) : (
                          <span
                            className="h-8 w-8 rounded-full border border-black/10 shadow-inner"
                            style={{ backgroundColor: getColorSwatch(choice.label, choice.hex) }}
                          />
                        )}
                      </span>
                      <span className="sr-only">{choice.isCurrent ? `${choice.label} selected` : `View ${choice.label}`}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="border-b border-gray-100 mb-6"></div>
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <a
                href={`https://wa.me/9779824336371?text=I'm interested in ${encodeURIComponent(product.name)} (ID: ${product._id}). Please provide more information.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-[1.2] flex items-center justify-center px-4 py-3 rounded-lg text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-all shadow-sm"
              >
                <FaWhatsapp className="w-5 h-5 mr-2" />
                WhatsApp Enquiry
              </a>
              
              <button
                className="flex-1 flex items-center justify-center px-4 py-3 rounded-lg text-sm font-semibold text-white bg-[#5b626e] hover:bg-[#4a4f59] transition-all shadow-sm"
              >
                <FaRegHeart className="w-4 h-4 mr-2" />
                Add Wishlist
              </button>

              <Link
                href="/custom-order"
                className="flex-1 flex items-center justify-center px-4 py-3 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primary-dark transition-all shadow-sm"
              >
                ✉ Enquiry
              </Link>
            </div>

            {/* Additional Details Accordions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
              {/* Specifications */}
              <details className="group" open>
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                  <h3 className="text-base font-semibold text-gray-900">Product Specification</h3>
                  <FaChevronRight className="text-gray-400 rotate-90 group-open:-rotate-90 transition-transform text-xs" />
                </summary>
                <div className="p-4 pt-0 text-gray-600">
                  <div className="grid grid-cols-1 gap-y-3 text-sm">
                    <div className="flex justify-between border-b border-gray-50 pb-2">
                      <span className="text-gray-500 w-1/2">Material:</span>
                      <span className="font-medium text-gray-900 w-1/2 text-left">{product.specifications?.material || "C.R. SHEET"}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-2">
                      <span className="text-gray-500 w-1/2">Dimension (MM):</span>
                      <span className="font-medium text-gray-900 w-1/2 text-left">{product.specifications?.dimensions || "Contact for details"}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-2">
                      <span className="text-gray-500 w-1/2">Guarantee:</span>
                      <span className="font-medium text-gray-900 w-1/2 text-left">{product.specifications?.guarantee || "10 Years"}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-2">
                      <span className="text-gray-500 w-1/2">Model Type:</span>
                      <span className="font-medium text-gray-900 w-1/2 text-left">{product.specifications?.modelType || "Premium"}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-2">
                      <span className="text-gray-500 w-1/2">Model Width:</span>
                      <span className="font-medium text-gray-900 w-1/2 text-left">{product.specifications?.modelWidth || "Standard"}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-2">
                      <span className="text-gray-500 w-1/2">Hangers:</span>
                      <span className="font-medium text-gray-900 w-1/2 text-left">{product.specifications?.hangers || "Available"}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-2">
                      <span className="text-gray-500 w-1/2">No. of Doors:</span>
                      <span className="font-medium text-gray-900 w-1/2 text-left">{product.specifications?.noOfDoors || "Varies"}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-2">
                      <span className="text-gray-500 w-1/2">Type of Paint:</span>
                      <span className="font-medium text-gray-900 w-1/2 text-left">{product.specifications?.typeOfPaint || "Powder Coated"}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-50 pb-2">
                      <span className="text-gray-500 w-1/2">Brand:</span>
                      <span className="font-medium text-gray-900 w-1/2 text-left">{product.specifications?.brand || "Shree Manish Steel"}</span>
                    </div>
                  </div>
                </div>
              </details>

              {/* Key Features */}
              <details className="group">
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                  <h3 className="text-base font-semibold text-gray-900">Key Features</h3>
                  <FaChevronRight className="text-gray-400 rotate-90 group-open:-rotate-90 transition-transform text-xs" />
                </summary>
                <div className="p-4 pt-0 text-gray-600 text-sm">
                  {product.features && product.features.length > 0 ? (
                    <ul className="list-disc list-inside space-y-2">
                      {product.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No key features listed.</p>
                  )}
                </div>
              </details>

              {/* Manufacturer Details */}
              <details className="group">
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                  <h3 className="text-base font-semibold text-gray-900">Manufacturer Details</h3>
                  <FaChevronRight className="text-gray-400 rotate-90 group-open:-rotate-90 transition-transform text-xs" />
                </summary>
                <div className="p-4 pt-0 text-gray-600 text-sm">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="text-gray-500">Name:</span>
                      <span className="font-medium text-gray-900 sm:text-right">{manufacturerDetails.name}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="text-gray-500">Address:</span>
                      <span className="font-medium text-gray-900 sm:text-right">{manufacturerDetails.address}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span className="font-medium text-gray-900 sm:text-right">{manufacturerDetails.email}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <span className="text-gray-500">Country of Origin:</span>
                      <span className="font-medium text-gray-900 sm:text-right">{manufacturerDetails.countryOfOrigin}</span>
                    </div>
                  </div>
                </div>
              </details>
            </div>

            {/* Back to Products link */}
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center text-sm text-gray-500 hover:text-primary transition-colors"
              >
                ← Back to all products
              </Link>
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

          {/* Full screen image container */}
          <div
            className="relative w-full h-[80vh] md:h-full max-w-[1400px] max-h-[90vh] flex items-center justify-center touch-manipulation"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <OptimizedImage
              src={allImages[selectedImageIndex]}
              alt={imageService.getImageAlt(product) || "Product Image"}
              className="w-full h-full"
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
