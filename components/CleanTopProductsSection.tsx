'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaArrowRight, FaStar } from 'react-icons/fa';
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
  [key: string]: unknown;
}

const CleanTopProductsSection: React.FC = () => {
  const [topProducts, setTopProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { quickViewProduct, isQuickViewOpen, openQuickView, closeQuickView } = useQuickView();

  useEffect(() => {
    fetchTopProducts();
  }, []);

  const fetchTopProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching top products from API...');
      
      // Use the correct API method for top products
      const response = await productAPI.getTopProducts(6);
      
      console.log('Top products API response:', response);
      
      if (response) {
        const products = response.products || [];
        console.log('Setting top products:', products.length, 'products');
        setTopProducts(products);
      } else {
        console.warn('No top products data received');
        setTopProducts([]);
      }
      
    } catch (err) {
      console.error('Error fetching top products:', err);
      // Use fallback sample products when API fails - using local images
      const fallbackProducts: Product[] = [
        {
          _id: 'sample-1',
          name: '3 Door Steel Wardrobe',
          category: 'Wardrobe',
          image: '/images/furniture-1.jpg',
          price: 25000
        },
        {
          _id: 'sample-2',
          name: 'Office Steel Table',
          category: 'Table',
          image: '/images/furniture-2.jpg',
          price: 15000
        },
        {
          _id: 'sample-3',
          name: 'Single Door Almirah',
          category: 'Almirah',
          image: '/images/furniture-1.jpg',
          price: 18000
        },
        {
          _id: 'sample-4',
          name: 'Steel Study Chair',
          category: 'Chair',
          image: '/images/furniture-2.jpg',
          price: 8000
        },
        {
          _id: 'sample-5',
          name: 'Double Bed Frame',
          category: 'Bed',
          image: '/images/furniture-1.jpg',
          price: 22000
        },
        {
          _id: 'sample-6',
          name: 'Kitchen Cabinet',
          category: 'Cabinet',
          image: '/images/furniture-2.jpg',
          price: 12000
        }
      ];
      setTopProducts(fallbackProducts);
      setError(null); // Don't show error when fallback is used
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading top products...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!topProducts || topProducts.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto">
          <div className="text-center">
            <p className="text-gray-600">No top products available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-10">
          <h4 className="text-xs md:text-sm font-medium tracking-widest uppercase text-gray-500 mb-2">Featured Products</h4>
          <div className="flex items-center justify-center mb-3">
            <FaStar className="text-lg md:text-xl text-yellow-500 mr-2" />
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-primary">Our Top Products</h2>
          </div>
          <p className="text-xs md:text-sm text-gray-500 max-w-2xl mx-auto">
            Take a close look at our best products
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 md:gap-6 mb-8 md:mb-10">
          {topProducts.map((product) => (
            <ProductCard
              key={product._id || product.id}
              product={product}
              onQuickView={openQuickView}
              variant="featured"
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link
            href="/products"
            className="inline-flex items-center px-6 py-2.5 md:px-8 md:py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors duration-300 shadow-md hover:shadow-lg text-sm md:text-base"
          >
            View All Top Products
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
          variant="featured"
        />
      )}
    </section>
  );
};

export default CleanTopProductsSection;
