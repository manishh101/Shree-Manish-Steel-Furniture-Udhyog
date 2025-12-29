'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { FaChevronDown, FaChevronUp, FaTimes, FaTag, FaList } from 'react-icons/fa';
import { getCategories } from '../utils/categoryData';
import { categoryAPI } from '../services/api';

interface Subcategory {
  _id?: string;
  id?: string;
  name: string;
  parentId?: string;
}

interface Category {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  subcategories?: Subcategory[];
}

interface NormalizedCategory {
  id: string;
  name: string;
  description: string;
  subcategories: { id: string; name: string; parentId: string }[];
}

interface CategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CategoryDrawerInner = ({ isOpen, onClose }: CategoryDrawerProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  // State management
  const [categories, setCategories] = useState<NormalizedCategory[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Normalize category data to use ObjectIds directly
  const normalizeCategory = useCallback((category: Category): NormalizedCategory => {
    const categoryId = category._id || category.id || '';
    
    let subcategories: { id: string; name: string; parentId: string }[] = [];
    if (Array.isArray(category.subcategories)) {
      subcategories = category.subcategories.map(sub => ({
        id: sub._id || sub.id || '',
        name: sub.name || '',
        parentId: categoryId
      }));
    }

    return {
      id: categoryId,
      name: category.name || '',
      description: category.description || '',
      subcategories
    };
  }, []);

  // Fetch categories from API with fallback
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await categoryAPI.getAll(true);
      
      if (response && Array.isArray(response) && response.length > 0) {
        const normalizedCategories = response.map(normalizeCategory);
        setCategories(normalizedCategories);
      } else {
        throw new Error('No categories received from API');
      }
    } catch (apiError) {
      console.warn('API failed, using local categories:', apiError instanceof Error ? apiError.message : 'Unknown error');
      try {
        const localCategories = getCategories();
        const normalizedLocal = Array.isArray(localCategories) 
          ? localCategories.map(normalizeCategory)
          : [];
        setCategories(normalizedLocal);
      } catch (localError) {
        console.error('Failed to load local categories:', localError);
        setError('Failed to load categories');
        setCategories([]);
      }
    } finally {
      setLoading(false);
    }
  }, [normalizeCategory]);

  // Initialize categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Parse URL parameters
  const urlParams = useMemo(() => ({
    category: searchParams.get('category') || 'all',
    subcategory: searchParams.get('subcategory') || null
  }), [searchParams]);

  // Sync state with URL when drawer opens
  useEffect(() => {
    if (isOpen && categories.length > 0) {
      const { category, subcategory } = urlParams;
      
      setSelectedCategory(category);
      setSelectedSubcategory(subcategory);

      // Auto-expand category if subcategory is selected
      if (category !== 'all' && subcategory) {
        setExpandedCategory(category);
      }
    }
  }, [isOpen, urlParams, categories]);

  // Event dispatching utility
  const dispatchCategoryEvent = useCallback((eventData: {
    category: string;
    subcategory: string | null;
    categoryName: string;
    subcategoryName?: string;
    source: string;
  }) => {
    window.dispatchEvent(new CustomEvent('categoryFilter', {
      bubbles: true,
      detail: eventData
    }));
  }, []);

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
    
    router.push(url);
  }, [router]);

  // Category selection handler
  const handleCategoryClick = useCallback((categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    
    if (categoryId === 'all') {
      setSelectedCategory('all');
      setSelectedSubcategory(null);
      setExpandedCategory(null);
      
      dispatchCategoryEvent({
        category: 'all',
        subcategory: null,
        categoryName: 'All Products',
        source: 'categoryDrawer'
      });
      
      navigateToProducts('all');
      onClose();
    } else if (category?.subcategories?.length && category.subcategories.length > 0) {
      setSelectedCategory(categoryId);
      setSelectedSubcategory(null);
      setExpandedCategory(prev => prev === categoryId ? null : categoryId);
      
      dispatchCategoryEvent({
        category: categoryId,
        subcategory: null,
        categoryName: category?.name || '',
        source: 'categoryDrawer'
      });
      
      navigateToProducts(categoryId);
    } else {
      setSelectedCategory(categoryId);
      setSelectedSubcategory(null);
      setExpandedCategory(null);
      
      dispatchCategoryEvent({
        category: categoryId,
        subcategory: null,
        categoryName: category?.name || '',
        source: 'categoryDrawer'
      });
      
      navigateToProducts(categoryId);
      onClose();
    }
  }, [categories, dispatchCategoryEvent, navigateToProducts, onClose]);

  // Subcategory selection handler
  const handleSubcategoryClick = useCallback((categoryId: string, subcategoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    const subcategory = category?.subcategories?.find(sub => sub.id === subcategoryId);
    
    setSelectedCategory(categoryId);
    setSelectedSubcategory(subcategoryId);
    
    dispatchCategoryEvent({
      category: categoryId,
      subcategory: subcategoryId,
      categoryName: category?.name || '',
      subcategoryName: subcategory?.name || '',
      source: 'categoryDrawer'
    });
    
    navigateToProducts(categoryId, subcategoryId);
    onClose();
  }, [categories, dispatchCategoryEvent, navigateToProducts, onClose]);

  // Prevent event bubbling
  const stopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Loading state
  if (loading) {
    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}>
        <div className={`fixed top-0 bottom-0 left-0 w-4/5 max-w-sm bg-white z-50 transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`} onClick={stopPropagation}>
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading categories...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-60 z-40 md:hidden transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`} 
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="categories-title"
    >
      <div 
        className={`fixed top-0 bottom-0 left-0 w-4/5 max-w-sm bg-white overflow-hidden z-50 transition-transform duration-300 transform shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        onClick={stopPropagation}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaTag className="h-5 w-5 text-primary" />
              <h3 id="categories-title" className="font-semibold text-lg text-gray-800">
                Categories
              </h3>
            </div>
            <button 
              className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200 focus:outline-none"
              onClick={onClose}
              aria-label="Close categories"
            >
              <FaTimes className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="h-full overflow-y-auto pb-20">
          <div className="p-4">
            {error ? (
              <div className="text-center py-12">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="text-red-400 text-4xl mb-4">⚠️</div>
                  <p className="text-red-700 font-medium mb-4">{error}</p>
                  <button 
                    onClick={fetchCategories}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* All Products Button */}
                <div className="mb-4">
                  <button
                    className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                      selectedCategory === 'all' 
                        ? 'bg-primary text-white shadow-md' 
                        : 'bg-gray-50 text-gray-800 hover:bg-gray-100'
                    }`}
                    onClick={() => handleCategoryClick('all')}
                  >
                    <div className="flex items-center">
                      <FaList className={`h-4 w-4 mr-3 ${selectedCategory === 'all' ? 'text-white' : 'text-primary'}`} />
                      <span>All Products</span>
                    </div>
                  </button>
                </div>
                
                {/* Categories List */}
                {categories.length > 0 ? (
                  <div className="space-y-1">
                    {categories.map((category) => (
                      <div 
                        key={category.id} 
                        className="overflow-hidden transition-all duration-300"
                      >
                        {/* Category Button */}
                        <div className="flex items-stretch">
                          <button
                            className={`flex-grow text-left px-4 py-3 rounded-lg transition-all duration-300 ${
                              selectedCategory === category.id 
                                ? 'bg-primary bg-opacity-5 text-primary font-medium' 
                                : 'text-gray-800 hover:bg-gray-50'
                            }`}
                            onClick={() => handleCategoryClick(category.id)}
                          >
                            <div className="flex items-center justify-between">
                              <span>{category.name}</span>
                              {category.subcategories?.length > 0 && (
                                <span className={`ml-2 text-xs ${
                                  expandedCategory === category.id ? 'text-primary' : 'text-gray-500'
                                }`}>
                                  {expandedCategory === category.id ? 
                                    <FaChevronUp className="h-3 w-3" /> : 
                                    <FaChevronDown className="h-3 w-3" />
                                  }
                                </span>
                              )}
                            </div>
                          </button>
                        </div>
                        
                        {/* Subcategories */}
                        <div className={`transition-all duration-300 ease-in-out ${
                          expandedCategory === category.id ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'
                        } overflow-hidden`}>
                          {category.subcategories && category.subcategories.length > 0 && (
                            <div className="pl-4 pr-2">
                              <div className="space-y-1">
                                {category.subcategories.map((subcategory) => (
                                  <button
                                    key={subcategory.id}
                                    className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 ${
                                      selectedCategory === category.id && selectedSubcategory === subcategory.id
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                    onClick={() => handleSubcategoryClick(category.id, subcategory.id)}
                                  >
                                    <span className="text-sm">{subcategory.name}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No categories available</p>
                    <button 
                      onClick={fetchCategories}
                      className="mt-2 px-4 py-2 text-primary hover:text-primary-dark transition-colors"
                    >
                      Refresh
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Fixed Bottom Close Button */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4">
          <button
            className="w-full bg-primary text-white py-3 rounded-lg font-medium text-base hover:bg-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
            onClick={onClose}
          >
            Close Categories
          </button>
        </div>
      </div>
    </div>
  );
};

// Wrap with Suspense to fix SSR build error
const CategoryDrawer = ({ isOpen, onClose }: CategoryDrawerProps) => {
  return (
    <Suspense fallback={null}>
      <CategoryDrawerInner isOpen={isOpen} onClose={onClose} />
    </Suspense>
  );
};

export default CategoryDrawer;
