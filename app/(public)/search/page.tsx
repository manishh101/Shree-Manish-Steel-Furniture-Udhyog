'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { productAPI, Product } from '@/services/api';
import ProductCard from '@/components/common/ProductCard';

// Loading fallback for Suspense
function SearchPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 md:px-6 py-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-12 bg-gray-200 rounded max-w-2xl"></div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main page wrapper with Suspense
export default function SearchPageWrapper() {
  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <SearchPage />
    </Suspense>
  );
}

function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [noResults, setNoResults] = useState(false);
  
  // Get search query from URL parameters
  const query = searchParams.get('q') || '';
  
  // Calculate search score for relevance sorting
  const calculateSearchScore = (searchQuery: string, product: Product): number => {
    const queryLower = searchQuery.toLowerCase();
    let score = 0;
    
    // Exact name match gets highest score
    if (product.name.toLowerCase() === queryLower) {
      score += 100;
    } else if (product.name.toLowerCase().includes(queryLower)) {
      score += 50;
    }
    
    // Category match
    if (product.category?.toString().toLowerCase().includes(queryLower)) {
      score += 30;
    }
    
    // Description match
    if (product.description?.toLowerCase().includes(queryLower)) {
      score += 20;
    }
    
    // Featured products get bonus
    if (product.featured) score += 10;
    if (product.isMostSelling) score += 8;
    if (product.isTopProduct) score += 5;
    
    return score;
  };
  
  // Enhanced search function that uses real API data
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.trim().length === 0) {
      setSearchResults([]);
      setTotalResults(0);
      setLoading(false);
      setNoResults(false);
      return;
    }

    setLoading(true);
    setError(null);
    setNoResults(false);
    
    try {
      // Call the backend search API
      const response = await productAPI.search(searchQuery);
      
      let results = response.products || [];
      const total = response.totalProducts || results.length;
      
      // If we're sorting by relevance, apply our custom scoring
      if (sortBy === 'relevance' && results.length > 0) {
        results = results
          .map(product => ({
            ...product,
            searchScore: calculateSearchScore(searchQuery, product)
          }))
          .sort((a, b) => (b.searchScore || 0) - (a.searchScore || 0));
      } else if (sortBy === 'name') {
        results = [...results].sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortBy === 'newest') {
        results = [...results].sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      }
      
      setSearchResults(results);
      setTotalResults(total);
      setNoResults(results.length === 0);
      
    } catch (err) {
      console.error("Search error:", err);
      setError('An error occurred while searching. Please try again.');
      setSearchResults([]);
      setTotalResults(0);
      setNoResults(true);
    } finally {
      setLoading(false);
    }
  }, [sortBy]);
  
  // Perform search when query or sort changes
  useEffect(() => {
    setSearchInput(query);
    performSearch(query);
  }, [query, performSearch]);
  
  // Handle new search submission from this page
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim() && searchInput !== query) {
      router.push(`/search?q=${encodeURIComponent(searchInput)}`);
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
  };
  
  // Handle sort change
  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  // Get search suggestions for empty state
  const getSearchSuggestions = () => [
    'almirah', 'wardrobe', 'office desk', 'chair', 'table', 
    'locker', 'steel furniture', 'book cabinet', 'door'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 md:px-6 py-6">
          {/* Page Title and Breadcrumb */}
          <div className="mb-4">
            <nav className="text-sm text-gray-600 mb-2">
              <Link href="/" className="hover:text-primary">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-gray-800">Search Results</span>
              {query && (
                <>
                  <span className="mx-2">/</span>
                  <span className="text-primary font-medium">&quot;{query}&quot;</span>
                </>
              )}
            </nav>
            
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {query ? `Search Results for "${query}"` : 'Search Products'}
            </h1>
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <div className="max-w-2xl relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search steel furniture..."
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <svg 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1.5 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Results Summary and Sort */}
          {query && (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="text-sm text-gray-600">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    Searching...
                  </span>
                ) : (
                  <span>
                    {totalResults > 0 ? (
                      <>Showing <span className="font-semibold">{searchResults.length}</span> of <span className="font-semibold">{totalResults}</span> results</>
                    ) : noResults ? (
                      'No products found'
                    ) : (
                      'Enter a search term to find products'
                    )}
                  </span>
                )}
              </div>

              {!loading && searchResults.length > 0 && (
                <div className="flex items-center gap-2">
                  <label htmlFor="sort" className="text-sm font-medium text-gray-700">Sort by:</label>
                  <select
                    id="sort"
                    value={sortBy}
                    onChange={handleSortChange}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="category">Category</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Search Results Content */}
      <div className="container mx-auto px-4 md:px-6 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Searching products...</p>
            </div>
          </div>
        )}

        {/* No Results State */}
        {!loading && noResults && query && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">
                We couldn&apos;t find any products matching &quot;{query}&quot;. Try searching with different keywords.
              </p>
              
              {/* Search Suggestions */}
              <div className="text-left">
                <p className="text-sm font-medium text-gray-700 mb-3">Try searching for:</p>
                <div className="flex flex-wrap gap-2">
                  {getSearchSuggestions().map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State (No Query) */}
        {!loading && !query && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Search Our Products</h3>
              <p className="text-gray-600 mb-6">
                Find the perfect steel furniture for your home or office.
              </p>
              
              {/* Popular Searches */}
              <div className="text-left">
                <p className="text-sm font-medium text-gray-700 mb-3">Popular searches:</p>
                <div className="flex flex-wrap gap-2">
                  {getSearchSuggestions().map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-md text-sm hover:bg-primary/20 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Results Grid */}
        {!loading && searchResults.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {searchResults.map((product, index) => (
              <ProductCard
                key={product._id || product.id || index}
                product={product}
                variant={product.isTopProduct ? 'featured' : product.isMostSelling ? 'bestseller' : 'standard'}
                showCategory={true}
              />
            ))}
          </div>
        )}

        {/* Back to Products Link */}
        {!loading && (
          <div className="text-center mt-12">
            <Link 
              href="/products" 
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Browse All Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
