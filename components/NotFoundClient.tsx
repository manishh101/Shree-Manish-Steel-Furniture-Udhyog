/**
 * Enhanced 404 Not Found Client Component
 * Provides search functionality, popular categories, and product suggestions
 */
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import EnhancedSearch from './EnhancedSearch';
import ProductCard from './common/ProductCard';

interface Category {
  _id: string;
  name: string;
  description?: string;
  displayOrder?: number;
}

interface Product {
  _id: string;
  id?: string;
  slug?: string;
  name: string;
  description?: string;
  image?: string | null;
  category?: string;
  categoryId?: string | { _id: string; name: string };
  price?: number;
  featured?: boolean;
}

interface NotFoundClientProps {
  categories: Category[];
  popularProducts: Product[];
}

const NotFoundClient: React.FC<NotFoundClientProps> = ({ 
  categories = [], 
  popularProducts = [] 
}) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Log 404 error on mount
  React.useEffect(() => {
    const logError = async () => {
      try {
        await fetch('/api/log-404', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: window.location.pathname,
            referrer: document.referrer || null,
          }),
        });
      } catch (error) {
        console.error('Failed to log 404:', error);
      }
    };

    logError();
  }, []);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="min-h-[70vh] bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Error Message Section */}
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-8xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-gray-600 mb-6 max-w-md mx-auto">
            The page you are looking for might have been removed, had its name changed, 
            or is temporarily unavailable.
          </p>

          {/* Breadcrumb */}
          <nav className="flex justify-center items-center text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-700">Page Not Found</span>
          </nav>
        </div>

        {/* Search Section */}
        <div className="max-w-2xl mx-auto mb-12">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Try Searching for What You Need
          </h3>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <EnhancedSearch 
              placeholder="Search for furniture, categories, or products..."
              onSearchSubmit={handleSearch}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link 
            href="/" 
            className="inline-flex items-center justify-center bg-primary text-white font-medium px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors shadow-md"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Return to Homepage
          </Link>
          <Link 
            href="/products" 
            className="inline-flex items-center justify-center bg-white text-primary border-2 border-primary font-medium px-8 py-3 rounded-lg hover:bg-primary/5 transition-colors shadow-md"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Browse All Products
          </Link>
          <Link 
            href="/contact" 
            className="inline-flex items-center justify-center bg-white text-gray-700 border border-gray-300 font-medium px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors shadow-md"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contact Us
          </Link>
        </div>

        {/* Popular Categories */}
        {categories.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Browse Popular Categories
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link
                  key={category._id}
                  href={`/products?category=${encodeURIComponent(category.name)}`}
                  className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1 text-center group"
                >
                  <div className="w-12 h-12 mx-auto mb-3 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-6 w-6 text-primary" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-gray-800 group-hover:text-primary transition-colors">
                    {category.name}
                  </h4>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Popular Products */}
        {popularProducts.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              You Might Be Looking For These
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {popularProducts.slice(0, 8).map((product) => (
                <ProductCard 
                  key={product._id} 
                  product={product} 
                />
              ))}
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-2">
            Still can't find what you're looking for?
          </p>
          <Link 
            href="/contact" 
            className="text-primary font-semibold hover:underline"
          >
            Contact our support team for assistance
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundClient;
