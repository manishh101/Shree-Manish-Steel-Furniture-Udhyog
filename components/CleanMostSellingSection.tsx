'use client';

import React from 'react';
import Link from 'next/link';
import { FaArrowRight, FaFire } from 'react-icons/fa';
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
  bestSellingProducts: Product[];
}

const CleanMostSellingSection: React.FC<CleanMostSellingSectionProps> = ({ bestSellingProducts }) => {
  const { quickViewProduct, isQuickViewOpen, openQuickView, closeQuickView } = useQuickView();

  if (!bestSellingProducts || bestSellingProducts.length === 0) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-600">No most selling products available at the moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 md:gap-6 mb-8 md:mb-10">
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

export default CleanMostSellingSection;
