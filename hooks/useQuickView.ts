'use client';

import { useState, useCallback } from 'react';

interface Product {
  _id?: string;
  id?: string;
  name: string;
  title?: string;
  category?: string;
  subcategory?: string;
  description?: string;
  image?: string | null;
  images?: string[];
  features?: string[];
  specifications?: Array<{ label: string; value: string }>;
  salesCount?: number | null;
  inStock?: boolean;
  deliveryInformation?: {
    estimatedDelivery?: string;
    shippingCost?: string;
    availableLocations?: string[];
    specialInstructions?: string;
  };
  // Allow additional properties
  [key: string]: unknown;
}

interface UseQuickViewReturn {
  quickViewProduct: Product | null;
  isQuickViewOpen: boolean;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
}

/**
 * Custom hook for managing QuickView modal state
 * @returns {UseQuickViewReturn} - { quickViewProduct, isQuickViewOpen, openQuickView, closeQuickView }
 */
export const useQuickView = (): UseQuickViewReturn => {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const openQuickView = useCallback((product: Product) => {
    setQuickViewProduct(product);
  }, []);

  const closeQuickView = useCallback(() => {
    setQuickViewProduct(null);
  }, []);

  const isQuickViewOpen = !!quickViewProduct;

  return {
    quickViewProduct,
    isQuickViewOpen,
    openQuickView,
    closeQuickView
  };
};

export default useQuickView;
