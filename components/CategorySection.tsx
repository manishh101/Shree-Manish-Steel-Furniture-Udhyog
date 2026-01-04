'use client';

import React from 'react';
import ProductCard from './common/ProductCard';
import QuickView from './QuickView';
import { useQuickView } from '../hooks/useQuickView';

interface Product {
  id?: string | number;
  _id?: string;
  title?: string;
  name?: string;
  image?: string;
  description?: string;
  category?: string;
  subcategory?: string;
}

interface CategorySectionProps {
  title: string;
  description?: string;
  products: Product[];
}

/**
 * CategorySection - Displays a section of products with a title and description
 * 
 * Features:
 * - Responsive grid layout
 * - QuickView integration
 * - Professional styling
 */
const CategorySection: React.FC<CategorySectionProps> = ({ 
  title, 
  description, 
  products 
}) => {
  const { quickViewProduct, isQuickViewOpen, openQuickView, closeQuickView } = useQuickView();

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold text-primary mb-3">{title}</h2>
      {description && (
        <p className="text-gray-600 mb-6">{description}</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, index) => (
          <ProductCard
            key={product.id || product._id || index}
            product={{
              _id: String(product.id || product._id || index),
              name: product.title || product.name || 'Product',
              image: product.image || null,
              description: product.description || '',
              category: product.category || 'Furniture',
              subcategory: product.subcategory || undefined
            }}
            onQuickView={openQuickView}
            withActions={true}
            showCategory={true}
            variant="standard"
          />
        ))}
      </div>

      {/* Quick View Modal */}
      <QuickView
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={closeQuickView}
      />
    </div>
  );
};

export default CategorySection;
