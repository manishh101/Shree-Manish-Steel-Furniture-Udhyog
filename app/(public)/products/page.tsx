'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FaSearch,
  FaChevronDown,
  FaChevronUp,
  FaArrowDown,
  FaTimes
} from 'react-icons/fa';
import { productAPI, categoryAPI, type Product, type Category } from '../../../services/api';
import ProductCard from '../../../components/common/ProductCard';
import { scrollToTop } from '../../../utils/scrollUtils';
import QuickView from '../../../components/QuickView';
import useQuickView from '../../../hooks/useQuickView';

// Loading fallback component
function ProductsPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto py-6">
          <h1 className="text-3xl font-bold text-gray-900 text-center">SHOP</h1>
        </div>
      </header>
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse"
            >
              <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300"></div>
              <div className="p-4 space-y-3">
                <div className="h-5 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main page wrapper with Suspense
export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsPageSkeleton />}>
      <ProductsPageContent />
    </Suspense>
  );
}

function ProductsPageContent() {
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('default');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [mobileFiltersVisible, setMobileFiltersVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDrawerVisible, setSortDrawerVisible] = useState(false);

  // Quick View Hook
  const { quickViewProduct, isQuickViewOpen, openQuickView, closeQuickView } = useQuickView();

  const itemsPerPage = 12;
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse URL parameters on mount
  useEffect(() => {
    const category = searchParams.get('category') || 'all';
    const subcategory = searchParams.get('subcategory') || null;
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);
  }, [searchParams]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoryAPI.getAll(true);
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };
    loadCategories();
  }, []);

  // Load products based on selected category
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        let response;
        if (selectedCategory === 'all') {
          response = await productAPI.getAll(1, 100);
        } else {
          response = await productAPI.getByCategory(selectedCategory, {
            subcategory: selectedSubcategory || undefined
          });
        }

        const productData = response.products || response || [];
        setProducts(Array.isArray(productData) ? productData : []);
      } catch (err) {
        console.error('Error loading products:', err);
        setError(err instanceof Error ? err.message : 'Failed to load products');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [selectedCategory, selectedSubcategory]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Apply search filter
    if (searchTerm) {
      const lowercaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product?.name?.toLowerCase().includes(lowercaseSearchTerm) ||
        product?.description?.toLowerCase().includes(lowercaseSearchTerm)
      );
    }

    // Apply sorting
    if (sortOption !== 'default') {
      if (sortOption === 'price-low-high') {
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
      } else if (sortOption === 'price-high-low') {
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
      } else if (sortOption === 'name-a-z') {
        filtered.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortOption === 'name-z-a') {
        filtered.sort((a, b) => b.name.localeCompare(a.name));
      } else if (sortOption === 'newest') {
        filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      }
    }

    return filtered;
  }, [products, searchTerm, sortOption]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const currentProducts = filteredAndSortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedSubcategory, sortOption]);

  // Navigation utility
  const navigateToProducts = useCallback((category: string, subcategory: string | null = null) => {
    let url = '/products';
    const params = new URLSearchParams();

    if (category && category !== 'all') {
      params.set('category', category);
      if (subcategory) {
        params.set('subcategory', subcategory);
      }
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    router.push(url, { scroll: false });
  }, [router]);

  // Handlers
  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleCategoryFilter = (categoryId: string) => {
    if (selectedCategory === categoryId) return;
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null);
    navigateToProducts(categoryId);
  };

  const handleSubcategoryFilter = (categoryId: string, subcategoryId: string) => {
    if (selectedCategory === categoryId && selectedSubcategory === subcategoryId) return;
    setSelectedCategory(categoryId);
    setSelectedSubcategory(subcategoryId);
    navigateToProducts(categoryId, subcategoryId);
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    scrollToTop({ instant: true });
  };

  const getCategoryById = (categoryId: string) => {
    return categories.find(cat => (cat._id || cat.id) === categoryId);
  };

  const sortOptions = [
    { value: 'default', label: 'Default' },
    { value: 'price-low-high', label: 'Price: Low to High' },
    { value: 'price-high-low', label: 'Price: High to Low' },
    { value: 'name-a-z', label: 'Name: A to Z' },
    { value: 'name-z-a', label: 'Name: Z to A' },
    { value: 'newest', label: 'Newest First' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean Header Section */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto py-6">
          <h1 className="text-3xl font-bold text-gray-900 text-center">SHOP</h1>
          {selectedCategory !== 'all' && getCategoryById(selectedCategory) && (
            <div className="text-center text-gray-600 text-sm mt-2">
              {getCategoryById(selectedCategory)?.name}
              {selectedSubcategory && (
                <> &middot; {selectedSubcategory}</>
              )}
            </div>
          )}
        </div>
        {error && (
          <div className="container mx-auto py-2 text-red-700 bg-red-50 border-t border-red-200 text-sm flex items-center gap-2">
            <FaTimes />
            <span>Error loading products: {error}</span>
          </div>
        )}
      </header>

      {/* Breadcrumb Navigation with Product Count */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto py-3">
          <div className="flex justify-between items-center">
            <nav>
              <div className="flex items-center text-sm text-gray-600">
                <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                <span className="mx-2">/</span>
                <span className="text-gray-900">Shop</span>
              </div>
            </nav>

            <div className="text-sm text-gray-600">
              {loading ? (
                'Loading products...'
              ) : (
                `Showing ${Math.min((currentPage - 1) * itemsPerPage + 1, filteredAndSortedProducts.length)}–${Math.min(currentPage * itemsPerPage, filteredAndSortedProducts.length)} of ${filteredAndSortedProducts.length} results`
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search & Sort Controls */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setSortDrawerVisible(!sortDrawerVisible)}
            className="px-3 py-2 border border-gray-200 rounded bg-white hover:bg-gray-50 text-gray-700 flex items-center gap-1"
          >
            <FaArrowDown />
            <span>Sort</span>
          </button>
        </div>
      </div>

      {/* Sort Drawer */}
      {sortDrawerVisible && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="container mx-auto py-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-medium text-gray-700 flex items-center">
                <FaArrowDown className="mr-2" /> Sort by:
              </span>
              {sortOptions.map(option => (
                <button
                  key={option.value}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${sortOption === option.value
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  onClick={() => {
                    setSortOption(option.value);
                    setSortDrawerVisible(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
              <button
                onClick={() => setSortDrawerVisible(false)}
                className="ml-auto text-gray-400 hover:text-gray-600 p-2"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className={`w-full lg:w-80 ${mobileFiltersVisible ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl shadow-sm border p-6 md:sticky md:top-20">
              {/* Desktop Search */}
              <div className="hidden lg:block mb-6">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Categories</h2>
                <button
                  className="lg:hidden text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setMobileFiltersVisible(false)}
                >
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-2">
                {/* All Products */}
                <button
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${selectedCategory === 'all' ? 'bg-primary text-white' : 'hover:bg-gray-50'
                    }`}
                  onClick={() => handleCategoryFilter('all')}
                >
                  All Products
                </button>

                {/* Categories */}
                {Array.isArray(categories) && categories.map(category => {
                  const categoryId = category._id || category.id || '';
                  return (
                    <div key={categoryId}>
                      <div className="flex items-center">
                        <button
                          className={`text-left px-4 py-3 rounded-lg flex-1 transition-colors ${selectedCategory === categoryId && !selectedSubcategory
                              ? 'bg-primary text-white'
                              : 'hover:bg-gray-50'
                            }`}
                          onClick={() => handleCategoryFilter(categoryId)}
                        >
                          {category.name}
                        </button>

                        {category.subcategories && category.subcategories.length > 0 && (
                          <button
                            onClick={() => toggleCategoryExpansion(categoryId)}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {expandedCategories[categoryId] ? (
                              <FaChevronUp size={14} />
                            ) : (
                              <FaChevronDown size={14} />
                            )}
                          </button>
                        )}
                      </div>

                      {/* Subcategories */}
                      {category.subcategories && category.subcategories.length > 0 && expandedCategories[categoryId] && (
                        <div className="ml-4 mt-2 space-y-1">
                          {category.subcategories.map(subcategory => {
                            const subId = subcategory._id || subcategory.id || '';
                            return (
                              <button
                                key={subId}
                                className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${selectedCategory === categoryId &&
                                    selectedSubcategory === subId
                                    ? 'bg-primary text-white'
                                    : 'hover:bg-gray-50'
                                  }`}
                                onClick={() => handleSubcategoryFilter(categoryId, subId)}
                              >
                                {subcategory.name}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => navigateToProducts('all')}
                className="mt-6 w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <FaTimes size={14} />
                Clear Filters
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {[...Array(8)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse"
                  >
                    <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-5 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="text-center py-16">
                <div className="text-red-500 mb-6">
                  <FaTimes className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-all"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Products Grid */}
            {!loading && !error && (
              <>
                {filteredAndSortedProducts.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="text-gray-400 mb-6">
                      <FaSearch className="h-20 w-20 mx-auto opacity-50" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">No Products Found</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      {searchTerm ? (
                        <>We couldn&apos;t find any products matching &quot;{searchTerm}&quot;. Try adjusting your search terms.</>
                      ) : (
                        <>No products available in this category. Try browsing other categories or check back later.</>
                      )}
                    </p>
                    <div className="flex justify-center gap-4">
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-all"
                        >
                          Clear Search
                        </button>
                      )}
                      <button
                        onClick={() => handleCategoryFilter('all')}
                        className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-all"
                      >
                        View All Products
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Products Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                      {currentProducts.map((product, index) => (
                        <div
                          key={product._id || product.id}
                          className="animate-fadeIn hover:scale-105 transition-transform duration-300"
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <ProductCard
                            product={product}
                            onQuickView={openQuickView}
                          />
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-12">
                    <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 p-1">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-2 rounded-md font-medium transition-all duration-200 ${currentPage === 1
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-gray-100'
                          }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>

                      {[...Array(totalPages)].map((_, index) => {
                        const pageNumber = index + 1;
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`px-3 py-2 rounded-md font-medium transition-all duration-200 ${currentPage === pageNumber
                                ? 'bg-primary text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                              }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-2 rounded-md font-medium transition-all duration-200 ${currentPage === totalPages
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-gray-100'
                          }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sort Drawer */}
      {sortDrawerVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Sort By</h3>
              <button
                onClick={() => setSortDrawerVisible(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-3">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSortOption(option.value);
                    setSortDrawerVisible(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-md transition-colors ${sortOption === option.value
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-100'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      <QuickView
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={closeQuickView}
        variant="standard"
      />
    </div>
  );
}
