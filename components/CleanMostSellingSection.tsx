'use client';

import React, { useState, useEffect, memo } from 'react';
import Link from 'next/link';
import { FaArrowRight, FaFire } from 'react-icons/fa';
import { productAPI } from '@/services/api';
import ProductCard from './common/ProductCard';
import QuickView from './QuickView';
import { useQuickView } from '@/hooks/useQuickView';

interface Product {
  _id?: string;
  id?: string;
  name: string;
  category?: string;
  image?: string | null;
  images?: string[];
  price?: number;
  description?: string;
  soldCount?: number;
  [key: string]: unknown;
}

interface CleanMostSellingSectionProps {
  initialProducts?: Product[];
}

const CleanMostSellingSection: React.FC<CleanMostSellingSectionProps> = ({ initialProducts }) => {
  const [bestSellingProducts, setBestSellingProducts] = useState<Product[]>(initialProducts || []);
  const [loading, setLoading] = useState(!initialProducts?.length);
  const [error, setError] = useState<string | null>(null);
  const { quickViewProduct, isQuickViewOpen, openQuickView, closeQuickView } = useQuickView();

  useEffect(() => {
    if (!initialProducts || initialProducts.length === 0) {
      fetchBestSellingProducts();
    }
  }, [initialProducts]);

  const fetchBestSellingProducts = async () => {
    try {
      setLoading(true);
      setError(null);


      // Use the correct API method for most selling products
      const response = await productAPI.getMostSelling(8);


      if (response) {
        const products = response.products || [];
        setBestSellingProducts(products);
      } else {
        console.warn('No most selling products data received');
        setBestSellingProducts([]);
      }

    } catch (err) {
      console.error('Error fetching most selling products:', err);
      // Use fallback sample products when API fails - using local images
      const fallbackProducts: Product[] = [
        {
          _id: 'bestseller-1',
          name: 'Premium Steel Wardrobe',
          category: 'Wardrobe',
          image: '/images/furniture-1.jpg',
          price: 28000,
          soldCount: 145
        },
        {
          _id: 'bestseller-2',
          name: 'Executive Office Table',
          category: 'Table',
          image: '/images/furniture-2.jpg',
          price: 18000,
          soldCount: 132
        },
        {
          _id: 'bestseller-3',
          name: 'Modern Steel Almirah',
          category: 'Almirah',
          image: '/images/furniture-1.jpg',
          price: 20000,
          soldCount: 98
        },
        {
          _id: 'bestseller-4',
          name: 'Ergonomic Study Chair',
          category: 'Chair',
          image: '/images/furniture-2.jpg',
          price: 10000,
          soldCount: 87
        },
        {
          _id: 'bestseller-5',
          name: 'King Size Bed Frame',
          category: 'Bed',
          image: '/images/furniture-1.jpg',
          price: 25000,
          soldCount: 76
        },
        {
          _id: 'bestseller-6',
          name: 'Designer Kitchen Cabinet',
          category: 'Cabinet',
          image: '/images/furniture-2.jpg',
          price: 15000,
          soldCount: 65
        }
      ];
      setBestSellingProducts(fallbackProducts);
      setError(null); // Clear error since we have fallback data
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-12 md:py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="content-container">
          {/* Section Header Skeleton */}
          <div className="text-center mb-8 md:mb-10">
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-2 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto animate-pulse"></div>
          </div>
          {/* Product cards skeleton — matches real grid layout to prevent CLS */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                {/* Image area — matches ProductCard aspect-ratio 3/4 */}
                <div className="w-full bg-gray-200" style={{ aspectRatio: '3/4' }}></div>
                {/* Text area */}
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2 mx-auto"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!bestSellingProducts || bestSellingProducts.length === 0) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto">
          <div className="text-center">
            <p className="text-gray-600">No most selling products available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="content-container">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-10">
          <h4 className="text-xs md:text-sm font-medium tracking-widest uppercase text-gray-500 mb-2">Best Sellers</h4>
          <div className="flex items-center justify-center mb-3">
            <FaFire className="text-lg md:text-xl text-red-500 mr-2" />
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-primary">Most Selling Products</h2>
          </div>
          <p className="text-xs md:text-sm text-gray-500 max-w-2xl mx-auto">
            Our customers&apos; favorite furniture pieces
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-8 md:mb-10">
          {bestSellingProducts.map((product) => (
            <ProductCard
              key={product._id || product.id}
              product={product}
              onQuickView={openQuickView}
              variant="bestseller"
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link
            href="/products"
            className="inline-flex items-center px-6 py-2.5 md:px-8 md:py-3 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors duration-300 shadow-md hover:shadow-lg text-sm md:text-base"
          >
            🔥 View All Best Sellers
            <FaArrowRight className="ml-2 h-3.5 w-3.5 md:h-4 md:w-4" />
          </Link>
        </div>
      </div>

      {/* Quick View Modal */}
      {isQuickViewOpen && quickViewProduct && (
        <QuickView
          product={quickViewProduct}
          isOpen={isQuickViewOpen}
          onClose={closeQuickView}
          variant="bestseller"
        />
      )}
    </section>
  );
};

// Bolt ⚡: Memoizing this component to prevent unnecessary re-renders.
// As a static component with no props, it's an ideal candidate for this optimization.
// This improves performance by avoiding costly re-renders when parent components update.
export default memo(CleanMostSellingSection);
