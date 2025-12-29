/**
 * Cache Service for high-performance data caching
 * Provides instant loading with smart cache management
 */
import { categoryAPI, productAPI } from './api';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface CacheMetadata {
  count: number;
  category: string;
  subcategory: string | null;
  lastFetch: number;
}

interface Category {
  id: string;
  name: string;
  description: string;
  image: string | null;
  subcategories: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
  parentId: string;
}

interface Product {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  price?: number;
  image?: string | null;
  images?: string[];
  category?: string;
  subcategory?: string;
  [key: string]: unknown;
}

interface RawCategory {
  _id?: string;
  id?: string;
  name?: string;
  description?: string;
  image?: string | null;
  subcategories?: Array<{
    _id?: string;
    id?: string;
    name?: string;
  }>;
}

class CacheService {
  private caches: {
    categories: Map<string, CacheEntry<Category[]>>;
    products: Map<string, CacheEntry<Product[]>>;
    categoryProducts: Map<string, CacheEntry<Product[]>>;
    metadata: Map<string, CacheEntry<CacheMetadata>>;
  };

  private cacheDuration: {
    categories: number;
    products: number;
    categoryProducts: number;
    metadata?: number;
  };

  constructor() {
    this.caches = {
      categories: new Map(),
      products: new Map(),
      categoryProducts: new Map(),
      metadata: new Map()
    };

    this.cacheDuration = {
      categories: 5 * 60 * 1000, // 5 minutes
      products: 3 * 60 * 1000,   // 3 minutes
      categoryProducts: 2 * 60 * 1000 // 2 minutes
    };

    // Initialize cache cleanup
    if (typeof window !== 'undefined') {
      this.startCacheCleanup();
    }
  }

  /**
   * Cache key generators
   */
  private getCategoryKey(): string {
    return 'all_categories';
  }

  private getProductKey(category: string = 'all', subcategory: string | null = null): string {
    return `products_${category}_${subcategory || 'none'}`;
  }

  private getProductsMetaKey(category: string = 'all', subcategory: string | null = null): string {
    return `meta_${this.getProductKey(category, subcategory)}`;
  }

  /**
   * Check if cache entry is valid
   */
  private isCacheValid(key: string, cacheType: 'categories' | 'products' | 'categoryProducts' | 'metadata'): boolean {
    const cache = this.caches[cacheType] as Map<string, CacheEntry<unknown>>;
    const entry = cache.get(key);
    if (!entry) return false;

    const duration = this.cacheDuration[cacheType as keyof typeof this.cacheDuration];
    if (!duration) return false;

    const isValid = (Date.now() - entry.timestamp) < duration;

    if (!isValid) {
      cache.delete(key);
    }

    return isValid;
  }

  /**
   * Set cache entry with timestamp
   */
  private setCache<T>(key: string, data: T, cacheType: 'categories' | 'products' | 'categoryProducts' | 'metadata'): void {
    const cache = this.caches[cacheType] as Map<string, CacheEntry<T>>;
    cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Get cache entry
   */
  private getCache<T>(key: string, cacheType: 'categories' | 'products' | 'categoryProducts' | 'metadata'): T | null {
    const cache = this.caches[cacheType] as Map<string, CacheEntry<T>>;
    const entry = cache.get(key);
    return entry ? entry.data : null;
  }

  /**
   * Categories with instant loading
   */
  async getCategories(forceRefresh: boolean = false): Promise<Category[]> {
    const key = this.getCategoryKey();

    // Return cached data if valid
    if (!forceRefresh && this.isCacheValid(key, 'categories')) {
      console.log('CacheService: Returning cached categories');
      return this.getCache<Category[]>(key, 'categories') || [];
    }

    try {
      console.log('CacheService: Fetching fresh categories from API');
      const response = await categoryAPI.getAll(true);

      // Response is Category[] directly
      if (response && Array.isArray(response)) {
        const normalizedCategories = response.map((cat: RawCategory) => this.normalizeCategory(cat));

        // Cache the normalized data
        this.setCache(key, normalizedCategories, 'categories');

        console.log('CacheService: Cached', normalizedCategories.length, 'categories');
        return normalizedCategories;
      }

      throw new Error('Invalid categories response');
    } catch (error) {
      console.warn('CacheService: Categories API failed, using fallback:', (error as Error).message);

      // Return cached data if available, even if expired
      const cachedData = this.getCache<Category[]>(key, 'categories');
      if (cachedData) {
        console.log('CacheService: Using expired cache as fallback');
        return cachedData;
      }

      // Ultimate fallback to empty array
      return [];
    }
  }

  /**
   * Products with intelligent caching and instant loading
   */
  async getProducts(category: string = 'all', subcategory: string | null = null, forceRefresh: boolean = false): Promise<Product[]> {
    const key = this.getProductKey(category, subcategory);

    // Return cached data if valid
    if (!forceRefresh && this.isCacheValid(key, 'categoryProducts')) {
      console.log('CacheService: Returning cached products for', { category, subcategory });
      return this.getCache<Product[]>(key, 'categoryProducts') || [];
    }

    try {
      console.log('CacheService: Fetching fresh products from API for', { category, subcategory });

      let response;
      if (category === 'all') {
        // Get all products
        response = await productAPI.getAll(1, 1000);
      } else if (subcategory) {
        // Get products by specific subcategory using filter endpoint
        response = await productAPI.getByCategoryAlternative(category, {
          subcategory,
          limit: 1000,
          timestamp: Date.now()
        });
      } else {
        // Get all products from main category INCLUDING all subcategories
        console.log('CacheService: Getting all products for main category (including subcategories):', category);
        response = await productAPI.getProductsByCategory(category, { limit: 1000 });
      }

      // Response is ProductsResponse with products array
      if (response) {
        const products: Product[] = response.products || [];

        // Cache the products
        this.setCache(key, products, 'categoryProducts');

        // Cache metadata
        const metaKey = this.getProductsMetaKey(category, subcategory);
        this.setCache(metaKey, {
          count: products.length,
          category,
          subcategory,
          lastFetch: Date.now()
        }, 'metadata');

        console.log('CacheService: Cached', products.length, 'products for', { category, subcategory });
        return products;
      }

      throw new Error('Invalid products response');
    } catch (error) {
      console.warn('CacheService: Products API failed, using fallback:', (error as Error).message);

      // Return cached data if available, even if expired
      const cachedData = this.getCache<Product[]>(key, 'categoryProducts');
      if (cachedData) {
        console.log('CacheService: Using expired cache as fallback');
        return Array.isArray(cachedData) ? cachedData : [];
      }

      // Ultimate fallback to empty array
      console.log('CacheService: Ultimate fallback - returning empty products array');
      return [];
    }
  }

  /**
   * Preload common products for browsing
   */
  async preloadCommonProducts(): Promise<void> {
    // Already preloaded products
    const preloadedCategories = new Set<string>();

    try {
      // Get all categories
      const categories = await this.getCategories();

      if (!categories || categories.length === 0) {
        console.warn('CacheService: No categories to preload products for');
        return;
      }

      // Preload top categories (max 3)
      const topCategories = categories.slice(0, 3);

      console.log(`CacheService: Preloading products for ${topCategories.length} top categories`);

      for (const category of topCategories) {
        // Skip if already preloaded
        const categoryId = category.id;
        if (preloadedCategories.has(categoryId)) continue;

        // Preload category products
        this.getProducts(categoryId).catch(err => {
          console.warn(`Failed to preload products for ${category.name}:`, (err as Error).message);
        });

        preloadedCategories.add(categoryId);
      }

      console.log(`CacheService: Preloaded products for ${preloadedCategories.size} categories`);
    } catch (err) {
      console.error('CacheService: Error preloading products:', err);
    }
  }

  /**
   * Normalize category data
   */
  private normalizeCategory = (category: RawCategory): Category => {
    const categoryId = category._id || category.id || '';

    let subcategories: Subcategory[] = [];
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
      image: category.image || null,
      subcategories
    };
  };

  /**
   * Clear specific cache
   */
  clearCache(cacheType: 'categories' | 'products' | 'categoryProducts' | 'metadata', key: string | null = null): void {
    if (key) {
      this.caches[cacheType].delete(key);
    } else {
      this.caches[cacheType].clear();
    }
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    Object.keys(this.caches).forEach(cacheType => {
      (this.caches[cacheType as keyof typeof this.caches] as Map<string, unknown>).clear();
    });
    console.log('CacheService: All caches cleared');
  }

  /**
   * Start automatic cache cleanup
   */
  private startCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      let totalCleaned = 0;

      (Object.entries(this.caches) as Array<[keyof typeof this.caches, Map<string, CacheEntry<unknown>>]>).forEach(([cacheType, cache]) => {
        const duration = this.cacheDuration[cacheType as keyof typeof this.cacheDuration];
        if (!duration) return;

        const entriesToDelete: string[] = [];
        cache.forEach((entry, key) => {
          if (now - entry.timestamp > duration) {
            entriesToDelete.push(key);
          }
        });

        entriesToDelete.forEach(key => {
          cache.delete(key);
          totalCleaned++;
        });
      });

      if (totalCleaned > 0) {
        console.log('CacheService: Cleaned', totalCleaned, 'expired cache entries');
      }
    }, 60000); // Clean every minute
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): Record<string, { size: number; entries: string[] }> {
    const stats: Record<string, { size: number; entries: string[] }> = {};
    (Object.entries(this.caches) as Array<[string, Map<string, unknown>]>).forEach(([cacheType, cache]) => {
      stats[cacheType] = {
        size: cache.size,
        entries: Array.from(cache.keys())
      };
    });
    return stats;
  }
}

// Create and export singleton instance
const cacheService = new CacheService();

// Start preloading on initialization (client-side only)
if (typeof window !== 'undefined') {
  setTimeout(() => {
    cacheService.preloadCommonProducts();
  }, 1000);
}

export default cacheService;
