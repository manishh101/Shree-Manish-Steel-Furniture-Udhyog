/**
 * Optimized category navigation hook with instant loading
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import cacheService from '../services/cacheService';

interface Subcategory {
  id: string;
  name: string;
  parentId: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
  image: string | null;
  subcategories: Subcategory[];
}

interface UseCategoryNavigationReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  loadCategories: (forceRefresh?: boolean) => Promise<void>;
  navigateToCategory: (categoryId: string, subcategoryId?: string | null) => Promise<void>;
  getCategoryById: (categoryId: string) => Category | undefined;
  getSubcategoryById: (categoryId: string, subcategoryId: string) => Subcategory | undefined;
}

export const useCategoryNavigation = (): UseCategoryNavigationReturn => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Load categories with caching
  const loadCategories = useCallback(async (forceRefresh: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const categoriesData = await cacheService.getCategories(forceRefresh);
      setCategories(categoriesData);

      console.log('useCategoryNavigation: Loaded', categoriesData.length, 'categories');
    } catch (err) {
      console.error('useCategoryNavigation: Error loading categories:', err);
      setError((err as Error).message);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Navigate to products with instant preloading
  const navigateToCategory = useCallback(async (categoryId: string, subcategoryId: string | null = null) => {
    console.log('useCategoryNavigation: Navigating to category', { categoryId, subcategoryId });

    // Start preloading products immediately
    cacheService.getProducts(categoryId, subcategoryId).catch(err =>
      console.warn('Failed to preload products:', (err as Error).message)
    );

    // Build URL
    let url = '/products';
    const params = new URLSearchParams();

    if (categoryId && categoryId !== 'all') {
      params.set('category', categoryId);
      if (subcategoryId) {
        params.set('subcategory', subcategoryId);
      }
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    // Get current URL to check if we're just changing parameters on the same page
    const currentPath = window.location.pathname;
    const isOnProductsPage = currentPath === '/products';

    // Navigate with replace to avoid adding to history stack
    // Use replace only when we're already on the products page
    if (isOnProductsPage) {
      router.replace(url);
    } else {
      router.push(url);
    }

    // Dispatch event for other components
    const event = new CustomEvent('categoryNavigation', {
      detail: {
        category: categoryId,
        subcategory: subcategoryId,
        source: 'categoryNavigation'
      }
    });
    window.dispatchEvent(event);
  }, [router]);

  // Get category by ID
  const getCategoryById = useCallback((categoryId: string): Category | undefined => {
    return categories.find(cat => cat.id === categoryId);
  }, [categories]);

  // Get subcategory by ID
  const getSubcategoryById = useCallback((categoryId: string, subcategoryId: string): Subcategory | undefined => {
    const category = getCategoryById(categoryId);
    return category?.subcategories?.find(sub => sub.id === subcategoryId);
  }, [getCategoryById]);

  // Initialize categories on mount
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    loading,
    error,
    loadCategories,
    navigateToCategory,
    getCategoryById,
    getSubcategoryById
  };
};

export default useCategoryNavigation;
