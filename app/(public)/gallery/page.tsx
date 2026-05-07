'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FaImages, FaEye, FaFilter, FaThLarge, FaList, FaStar, FaHeart, FaAngleRight, FaExclamationTriangle, FaSync } from 'react-icons/fa';
import { scrollToTop } from '@/utils/scrollUtils';
import { productAPI, categoryAPI, Product as APIProduct, Category as APICategory } from '@/services/api';
import imageService from '@/services/imageService';
import ProductCard from '@/components/common/ProductCard';
import QuickView from '@/components/QuickView';
import useQuickView from '@/hooks/useQuickView';
import GalleryHero from '@/components/GalleryHero';
import ProfessionalGalleryModal from '@/components/ProfessionalGalleryModal';
import { testimonials } from '@/data/testimonials';

// Product interface
interface Product {
  _id?: string;
  id?: string;
  name: string;
  title?: string;
  category?: string;
  description?: string;
  image?: string | null;
  images?: string[];
  featured?: boolean;
  inStock?: boolean;
}

// Category interface
interface Category {
  _id?: string;
  id: string;
  name: string;
  description?: string;
  image?: string;
  productCount?: number;
}

// Formatted product for gallery display
interface GalleryProduct {
  id: string;
  name: string;
  title: string;
  description: string;
  category: string;
  src?: string | null;
  alt: string;
  featured: boolean;
  image?: string | null;
  images?: string[];
  _id?: string;
  data?: Product;
}

const GalleryPage = () => {
  // Page configuration
  const [config] = useState({
    title: 'Our Premium Gallery',
    subtitle: 'Discover our master craftsmanship through stunning visuals',
    heroImage: null as string | null
  });
  
  // Main data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<GalleryProduct[]>([]);
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { quickViewProduct, isQuickViewOpen, openQuickView, closeQuickView } = useQuickView();
  
  // Professional Gallery Modal states
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [galleryModalImages, setGalleryModalImages] = useState<string[]>([]);
  const [galleryModalTitle, setGalleryModalTitle] = useState('');
  const [galleryModalInitialIndex, setGalleryModalInitialIndex] = useState(0);
  
  // Testimonial state
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);

  // Format product data consistently
  const formatProduct = (product: Product): GalleryProduct | null => {
    if (!product) return null;
    
    try {
      const categoryInfo = product.category || 'uncategorized';
      const primaryImageSrc = product.image || 
                             (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null);
      
      let optimizedImageUrl: string | null = null;
      if (primaryImageSrc) {
        try {
          optimizedImageUrl = imageService.getOptimizedImageUrl(primaryImageSrc, {
            category: categoryInfo,
            width: 600,
            height: 600
          });
        } catch {
          optimizedImageUrl = primaryImageSrc;
        }
      }
      
      return {
        id: product._id || product.id || `product-${Date.now()}-${Math.random()}`,
        _id: product._id || product.id,
        name: product.name || product.title || 'Unnamed Product',
        title: product.name || product.title || 'Unnamed Product',
        description: product.description || '',
        category: categoryInfo,
        src: optimizedImageUrl,
        alt: `${product.name || 'Product'} image`,
        featured: Boolean(product.featured),
        image: product.image,
        images: product.images,
        data: product
      };
    } catch (error) {
      console.error('Error formatting product:', error, product);
      return null;
    }
  };

  // Load categories and initial data from API
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load categories and products in parallel
        const [categoriesResponse, productsResponse] = await Promise.all([
          categoryAPI.getAll().catch(() => []),
          productAPI.getAll(1, 100).catch(() => ({ products: [] }))
        ]);

        // Process categories from database
        let dbCategories: Category[] = [];
        const categoriesData = Array.isArray(categoriesResponse) ? categoriesResponse : [];
        
        if (Array.isArray(categoriesData)) {
          dbCategories = categoriesData
            .filter((cat: APICategory) => cat && (cat.name))
            .map((cat: APICategory) => ({
              id: cat._id || `cat-${(cat.name || 'unknown').toLowerCase().replace(/\s+/g, '-')}`,
              name: cat.name || 'Unnamed Category',
              description: cat.description || '',
              image: cat.image || undefined,
              _id: cat._id,
              productCount: 0
            }));
        }
        
        // Set up categories
        const allCategories: Category[] = [
          { id: 'all', name: 'All', description: 'All gallery items', productCount: 0 },
          { id: 'featured', name: 'Featured', description: 'Featured items', productCount: 0 },
          ...dbCategories
        ];
        
        setCategories(allCategories);
        
        // Process products
        let productsData = productsResponse?.products || [];
        if (!Array.isArray(productsData)) {
          productsData = [];
        }
        
        const formattedProducts = productsData
          .map((product: APIProduct) => formatProduct(product as Product))
          .filter((p: GalleryProduct | null): p is GalleryProduct => p !== null);
        
        // Calculate product counts for each category
        allCategories.forEach(cat => {
          if (cat.id === 'all') {
            cat.productCount = formattedProducts.length;
          } else if (cat.id === 'featured') {
            cat.productCount = formattedProducts.filter((p: GalleryProduct) => p.featured).length;
          } else {
            cat.productCount = formattedProducts.filter((p: GalleryProduct) => 
              p.category && p.category.toLowerCase() === cat.name.toLowerCase()
            ).length;
          }
        });
        
        setAllProducts(formattedProducts);
        setActiveCategory('all');
        setLoading(false);
        
      } catch (error) {
        console.error('Error loading gallery data:', error);
        setError('Failed to load gallery data');
        setLoading(false);
        setAllProducts([]);
        setCategories([
          { id: 'all', name: 'All', description: 'All gallery items', productCount: 0 }
        ]);
        setActiveCategory('all');
      }
    };

    loadInitialData();
  }, []);

  // Get gallery statistics
  const getGalleryStats = () => {
    const validProducts = Array.isArray(allProducts) ? allProducts.filter(Boolean) : [];
    
    return {
      totalImages: validProducts.length,
      totalCategories: categories.filter(c => c.id !== 'all' && c.id !== 'featured').length,
      featuredProducts: validProducts.filter(product => product.featured).length
    };
  };

  const stats = getGalleryStats();
  
  // Get visible products based on active category
  const getVisibleProducts = useCallback((): GalleryProduct[] => {
    const safeAllProducts = Array.isArray(allProducts) ? allProducts : [];
    
    if (activeCategory === 'all') {
      return safeAllProducts;
    }
    
    if (activeCategory === 'featured') {
      return safeAllProducts.filter(p => p && p.featured);
    }
    
    const categoryDetails = categories.find(cat => cat.id === activeCategory);
    const categoryName = categoryDetails ? categoryDetails.name : '';
    
    return safeAllProducts.filter(p => 
      p && p.category && categoryName &&
      (p.category.toLowerCase() === categoryName.toLowerCase() || 
       p.category.toLowerCase().includes(categoryName.toLowerCase()) ||
       categoryName.toLowerCase().includes(p.category.toLowerCase()))
    );
  }, [allProducts, activeCategory, categories]);

  // Handle category filter selection
  const handleFilterClick = (categoryId: string) => {
    setError(null);
    setActiveCategory(categoryId);
  };

  // Handle product click to open gallery modal
  const handleProductClick = async (product: GalleryProduct) => {
    try {
      if (!product) {
        console.error('No product data provided');
        return;
      }
      
      const productName = product.name || product.title || 'Product Gallery';
      
      // Collect all available images
      const imageCollectors: (string | null | undefined)[] = [
        product.image,
        ...(Array.isArray(product.images) ? product.images : [])
      ];

      let galleryImages = imageCollectors
        .filter((img): img is string => Boolean(img))
        .map(img => {
          if (typeof img === 'string') return img.trim();
          return null;
        })
        .filter((url): url is string => Boolean(url))
        .filter((url, index, arr) => arr.indexOf(url) === index);

      // If we have a product ID, try to fetch fresh data
      const productId = product._id || product.id;
      if (productId && galleryImages.length < 3) {
        try {
          const freshProduct = await productAPI.getById(productId);
          
          if (freshProduct) {
            const freshImages = [
              freshProduct.image,
              ...(Array.isArray(freshProduct.images) ? freshProduct.images : [])
            ].filter((img): img is string => Boolean(img));
            
            freshImages.forEach(img => {
              if (img && !galleryImages.includes(img)) {
                galleryImages.push(img);
              }
            });
          }
        } catch (error) {
          console.warn('Could not fetch fresh product data:', error);
        }
      }

      // Open gallery modal if we have images
      if (galleryImages.length > 0) {
        setGalleryModalImages(galleryImages);
        setGalleryModalTitle(productName);
        setGalleryModalInitialIndex(0);
        setIsGalleryModalOpen(true);
      } else {
        alert(`No images are currently available for "${productName}".`);
      }

    } catch (error) {
      console.error('Error in handleProductClick:', error);
      alert(`Unable to load gallery. Please try again.`);
    }
  };

  // Close gallery modal
  const closeGalleryModal = () => {
    setIsGalleryModalOpen(false);
    setGalleryModalImages([]);
    setGalleryModalTitle('');
    setGalleryModalInitialIndex(0);
  };
  
  // Testimonial navigation functions
  const nextTestimonial = () => {
    setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length);
  };

  // Auto-advance testimonials every 8 seconds
  useEffect(() => {
    const interval = setInterval(nextTestimonial, 8000);
    return () => clearInterval(interval);
  }, []);

  // Handle initial load completion
  useEffect(() => {
    if (allProducts.length > 0 && initialLoad) {
      setInitialLoad(false);
    }
  }, [allProducts, initialLoad]);
  
  // Manual refresh function
  const refreshGalleryData = useCallback(async () => {
    window.location.reload();
  }, []);

  const visibleProducts = getVisibleProducts();
  
  if (loading && initialLoad) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 sm:p-10 rounded-xl shadow-xl max-w-md mx-auto">
          <div className="relative h-20 w-20 mx-auto mb-6">
            <div className="animate-spin rounded-full h-20 w-20 border-[3px] border-primary/20 border-t-primary absolute inset-0"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FaImages className="w-8 h-8 text-primary/70 animate-pulse" />
            </div>
          </div>
          <h3 className="text-gray-800 text-xl sm:text-2xl font-semibold mb-3">Loading Gallery</h3>
          <p className="text-gray-600 mb-4">Preparing high-quality images for your viewing pleasure...</p>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-accent animate-pulse"
              style={{ width: '60%' }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 sm:p-10 rounded-xl shadow-xl max-w-md mx-auto border border-red-100">
          <div className="bg-red-100 rounded-full w-20 h-20 mx-auto flex items-center justify-center mb-6">
            <FaExclamationTriangle className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-gray-800 text-xl sm:text-2xl font-semibold mb-3">Gallery Error</h3>
          <p className="text-gray-600 mb-6">{error || 'There was a problem loading the gallery. Please try again.'}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg shadow-md transition-all duration-300 flex items-center justify-center gap-2 mx-auto"
          >
            <FaSync className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <GalleryHero 
        title={config.title} 
        subtitle={config.subtitle} 
        heroImage={config.heroImage || undefined}
        stats={stats}
      />

      {/* Filters and Controls */}
      <section 
        className="bg-white py-3 sm:py-5 border-b border-gray-200 sticky top-0 z-20 shadow-sm backdrop-blur-sm bg-white/95"
      >
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-5">
            {/* Mobile Filter Label */}
            <div className="w-full flex items-center justify-between mb-2 md:hidden">
              <div className="flex items-center">
                <button 
                  className="flex items-center px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 
                    transition-colors text-sm font-medium text-gray-700"
                >
                  <FaFilter className="mr-2 w-3 h-3 text-primary" /> 
                  <span className="tracking-wide">Browse Gallery</span>
                </button>
              </div>
              
              {/* View Mode Toggle - Mobile */}
              <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-1 shadow-inner">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-md transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 active:bg-white'
                  }`}
                  title="Grid View"
                >
                  <FaThLarge className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded-md transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 active:bg-white'
                  }`}
                  title="List View"
                >
                  <FaList className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            
            {/* Scrollable Filter Buttons */}
            <div className="w-full overflow-x-auto py-1 md:pb-0 scrollbar-hide">
              <div className="flex gap-2 md:gap-3 md:flex-wrap min-w-max md:min-w-0 px-0.5 md:px-0">
                <button
                  onClick={() => handleFilterClick('all')}
                  className={`px-4 sm:px-5 md:px-6 py-2.5 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium 
                    transition-all duration-200 shadow-sm active:scale-95 focus:outline-none focus:ring-2 
                    focus:ring-offset-2 focus:ring-primary/60 ${
                    activeCategory === 'all'
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  All Products
                </button>
                
                <button
                  onClick={() => handleFilterClick('featured')}
                  className={`px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium 
                    transition-all duration-200 shadow-sm active:scale-95 focus:outline-none focus:ring-2 
                    focus:ring-offset-2 focus:ring-primary/60 flex items-center gap-1.5 ${
                    activeCategory === 'featured'
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <FaStar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  Featured
                </button>
                
                {categories
                  .filter(category => category.id !== 'all' && category.id !== 'featured')
                  .map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleFilterClick(category.id)}
                    className={`px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium 
                      transition-all duration-200 shadow-sm active:scale-95 focus:outline-none focus:ring-2
                      focus:ring-offset-2 focus:ring-primary/60 ${
                      activeCategory === category.id
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* View Mode Toggle - Desktop */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={refreshGalleryData}
                disabled={loading}
                className={`p-2.5 rounded-lg transition-all duration-200 flex items-center gap-2 
                  ${loading 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 active:bg-blue-200'
                  }`}
                title="Refresh gallery"
              >
                <FaSync className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="text-xs font-medium">Sync</span>
              </button>
              
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 shadow-inner">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-md transition-all duration-200 ${
                    viewMode === 'grid'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 active:bg-white'
                  }`}
                  title="Grid View"
                >
                  <FaThLarge className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded-md transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 active:bg-white'
                  }`}
                  title="List View"
                >
                  <FaList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Gallery Display */}
      <section id="gallery-products-section" className="py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
                >
                  <div className="aspect-square bg-gray-200 animate-pulse"></div>
                  <div className="p-4">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                    <div className="h-4 bg-gray-100 rounded w-full mb-3 animate-pulse"></div>
                    <div className="h-8 bg-primary/20 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-50 rounded-xl p-8 max-w-md mx-auto border border-gray-100">
                <FaImages className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Products Found</h3>
                <p className="text-gray-500 mb-6">
                  {activeCategory === 'all' 
                    ? 'No products available in the gallery.' 
                    : <>
                        No products found in the <span className="font-semibold">{
                          categories.find(c => c.id === activeCategory)?.name || activeCategory
                        }</span> category.
                      </>
                  }
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <button 
                    onClick={() => handleFilterClick('all')}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    View All Products
                  </button>
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <FaSync className="inline-block mr-2 w-3 h-3" />
                    Refresh Page
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visibleProducts.map((product, index) => (
                <ProductCard
                  key={product.id || index}
                  product={product}
                  variant="gallery"
                  onProductView={() => handleProductClick(product)}
                  onQuickView={openQuickView}
                  showCategory={false}
                  withActions={true}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Gallery Footer Section */}
      <section className="pt-12 sm:pt-16 pb-14 sm:pb-20 relative">
        <div className="absolute inset-0 bg-primary/5"></div>
        
        <div className="container mx-auto sm:px-6 relative z-10">
          <div className="container mx-auto">
            {/* Stats Section */}
            <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 md:p-10 mb-10 border border-gray-100">
              <div className="text-center mb-8">
                <div className="inline-block rounded-lg bg-primary/10 px-4 py-2 mb-3">
                  <h4 className="text-primary font-medium text-sm sm:text-base">Gallery Highlights</h4>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-3">
                  Bringing Your Vision to Life
                </h2>
                <div className="w-20 h-1.5 bg-gradient-to-r from-primary to-accent mx-auto rounded-full mb-5"></div>
                <p className="text-gray-600 sm:text-lg max-w-2xl mx-auto">
                  Explore our extensive collection and discover how we can transform your space with our premium craftsmanship.
                </p>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-7 mb-8">
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 sm:p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100/80">
                  <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-full p-3 sm:p-4 mb-3 sm:mb-4 shadow-inner">
                    <FaImages className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">{stats.totalImages}</div>
                  <div className="text-xs sm:text-sm text-gray-500 font-medium">Total Products</div>
                </div>
                
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 sm:p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100/80">
                  <div className="bg-gradient-to-br from-accent/20 to-accent/5 rounded-full p-3 sm:p-4 mb-3 sm:mb-4 shadow-inner">
                    <FaHeart className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">{stats.featuredProducts}</div>
                  <div className="text-xs sm:text-sm text-gray-500 font-medium">Featured Products</div>
                </div>
                
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 sm:p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100/80">
                  <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-full p-3 sm:p-4 mb-3 sm:mb-4 shadow-inner">
                    <FaThLarge className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">{stats.totalCategories}</div>
                  <div className="text-xs sm:text-sm text-gray-500 font-medium">Categories</div>
                </div>
                
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 sm:p-6 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100/80">
                  <div className="bg-gradient-to-br from-accent/20 to-accent/5 rounded-full p-3 sm:p-4 mb-3 sm:mb-4 shadow-inner">
                    <FaEye className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">100%</div>
                  <div className="text-xs sm:text-sm text-gray-500 font-medium">Satisfaction</div>
                </div>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-5">
                <Link 
                  href="/contact"
                  onClick={() => scrollToTop({ instant: true })}
                  className="w-4/5 sm:w-auto bg-primary hover:bg-primary-dark text-white text-center font-medium sm:font-semibold px-6 py-3 sm:py-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <span>Start Your Project</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                
                <Link 
                  href="/products"
                  onClick={() => scrollToTop({ instant: true })}
                  className="w-4/5 sm:w-auto bg-white hover:bg-gray-50 text-gray-800 text-center font-medium sm:font-semibold px-6 py-3 sm:py-4 rounded-lg transition-all duration-300 shadow border border-gray-200 hover:border-gray-300"
                >
                  Browse Products
                </Link>
              </div>
            </div>
            
            {/* Customer Testimonials Section */}
            <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 md:p-8 lg:p-10 border border-gray-100">
              <div className="text-center mb-6">
                <div className="inline-block rounded-lg bg-primary/10 px-4 py-2 mb-3">
                  <h4 className="text-primary font-medium text-sm sm:text-base">Customer Testimonials</h4>
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-2">
                  What Our Customers Say
                </h3>
                <div className="w-16 h-1 bg-accent mx-auto rounded-full mb-4"></div>
              </div>
              
              <div className="relative overflow-hidden">
                <div className="flex flex-col lg:flex-row bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg shadow-inner overflow-hidden">
                  {/* Left Column - Testimonial Info */}
                  <div className="lg:w-1/3 bg-gradient-to-br from-primary/10 to-primary/5 p-6 lg:p-8 flex items-center justify-center">
                    <div className="text-center max-w-xs">
                      <div className="inline-flex items-center justify-center w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-white shadow-md mb-4 sm:mb-5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 lg:w-8 lg:h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"></path>
                        </svg>
                      </div>
                      
                      <h4 className="font-bold text-lg lg:text-xl text-gray-800 mb-3">Client Feedback</h4>
                      <div className="w-12 h-1 bg-primary/30 mx-auto rounded-full mb-4"></div>
                      
                      <div className="text-gray-500 text-sm mb-4 font-medium">
                        {currentTestimonialIndex + 1} of {testimonials.length}
                      </div>
                      
                      {/* Navigation Indicators */}
                      <div className="flex justify-center gap-1.5 mt-6 mb-2">
                        {testimonials.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentTestimonialIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                              index === currentTestimonialIndex 
                                ? 'bg-primary scale-125 w-5' 
                                : 'bg-gray-300 hover:bg-gray-400'
                            }`}
                            aria-label={`Go to testimonial ${index + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Column - Testimonial Content */}
                  <div className="lg:w-2/3 p-6 lg:p-8 flex items-center">
                    <div className="w-full">
                      <blockquote className="text-gray-700 text-base lg:text-lg leading-relaxed italic mb-6 min-h-[5rem] relative">
                        <div className="absolute -top-2 -left-2 text-primary/20 text-5xl font-serif">&quot;</div>
                        <div className="pl-4">{testimonials[currentTestimonialIndex].text}</div>
                        <div className="absolute -bottom-6 right-0 text-primary/20 text-5xl font-serif">&quot;</div>
                      </blockquote>
                      
                      <div className="flex items-center mt-8 border-t border-gray-200 pt-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center mr-4 shadow-md">
                          <span className="font-bold text-white text-lg">{testimonials[currentTestimonialIndex].initials}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{testimonials[currentTestimonialIndex].name}</p>
                          <p className="text-sm text-gray-600">{testimonials[currentTestimonialIndex].location}</p>
                          {testimonials[currentTestimonialIndex].productPurchased && (
                            <p className="text-xs text-primary/80 mt-1">Purchased: {testimonials[currentTestimonialIndex].productPurchased}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Browse Categories Section */}
            <div className="bg-white rounded-xl shadow-xl p-6 sm:p-8 md:p-10 mt-8 border border-gray-100">
              <div className="text-center mb-6">
                <div className="inline-block rounded-lg bg-primary/10 px-4 py-2 mb-3">
                  <h4 className="text-primary font-medium text-sm sm:text-base">Browse Categories</h4>
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-2">
                  Explore Our Gallery Categories
                </h3>
                <div className="w-16 h-1 bg-accent mx-auto rounded-full mb-4"></div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 container mx-auto">
                <button 
                  onClick={() => handleFilterClick('all')}
                  className="group"
                >
                  <div className="flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-300 
                    bg-gradient-to-br from-gray-50 to-gray-100 hover:from-white hover:to-gray-50 border border-gray-200 hover:border-primary/20 hover:shadow-lg transform hover:-translate-y-1">
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary shadow-inner group-hover:from-primary/30 group-hover:to-primary/20 group-hover:shadow-md group-hover:scale-110 transition-all duration-300">
                      <FaImages className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="block text-lg font-semibold text-gray-800 group-hover:text-primary transition-all duration-200">
                        All Products
                      </span>
                      <span className="text-xs text-gray-500">View our complete collection</span>
                    </div>
                    <FaAngleRight className="w-4 h-4 text-gray-400 group-hover:text-primary transform group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
                
                <button 
                  onClick={() => handleFilterClick('featured')}
                  className="group"
                >
                  <div className="flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-300 
                    bg-gradient-to-br from-gray-50 to-gray-100 hover:from-white hover:to-gray-50 border border-gray-200 hover:border-primary/20 hover:shadow-lg transform hover:-translate-y-1">
                    <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-400/20 to-yellow-300/10 text-yellow-500 shadow-inner group-hover:from-yellow-400/30 group-hover:to-yellow-300/20 group-hover:shadow-md group-hover:scale-110 transition-all duration-300">
                      <FaStar className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="block text-lg font-semibold text-gray-800 group-hover:text-primary transition-all duration-200">
                        Featured
                      </span>
                      <span className="text-xs text-gray-500">Our most popular items</span>
                    </div>
                    <FaAngleRight className="w-4 h-4 text-gray-400 group-hover:text-primary transform group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
                
                {categories.filter(c => c.id !== 'all' && c.id !== 'featured').map(category => (
                  <button 
                    key={category.id}
                    onClick={() => handleFilterClick(category.id)}
                    className="group"
                  >
                    <div className="flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-300 
                      bg-gradient-to-br from-gray-50 to-gray-100 hover:from-white hover:to-gray-50 border border-gray-200 hover:border-primary/20 hover:shadow-lg transform hover:-translate-y-1">
                      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-primary shadow-inner group-hover:from-primary/30 group-hover:to-primary/20 group-hover:shadow-md group-hover:scale-110 transition-all duration-300">
                        <FaThLarge className="w-5 h-5" />
                      </div>
                      <div className="flex-1 text-left">
                        <span className="block text-lg font-semibold text-gray-800 group-hover:text-primary transition-all duration-200">
                          {category.name}
                        </span>
                        <span className="text-xs text-gray-500">Browse this collection</span>
                      </div>
                      <FaAngleRight className="w-4 h-4 text-gray-400 group-hover:text-primary transform group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Professional Gallery Modal */}
      <ProfessionalGalleryModal
        isOpen={isGalleryModalOpen}
        onClose={closeGalleryModal}
        images={galleryModalImages}
        initialIndex={galleryModalInitialIndex}
        productName={galleryModalTitle}
      />

      {/* Quick View Modal */}
      <QuickView
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={closeQuickView}
        variant="gallery"
      />
    </div>
  );
};

export default GalleryPage;
