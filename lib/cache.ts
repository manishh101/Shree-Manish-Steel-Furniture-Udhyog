/**
 * Caching utilities for API responses and data fetching
 * Implements efficient caching strategies for SEO optimization (Req 10.3)
 */

/**
 * Cache configuration for different resource types
 */
export const CACHE_CONFIG = {
  // Static assets - immutable, long cache
  STATIC_ASSETS: {
    maxAge: 31536000, // 1 year
    staleWhileRevalidate: 0,
    immutable: true,
  },
  
  // Product data - frequently accessed, moderate freshness
  PRODUCTS: {
    maxAge: 3600, // 1 hour
    staleWhileRevalidate: 86400, // 24 hours
    revalidate: 3600, // ISR revalidation: 1 hour
  },
  
  // Category data - less frequent updates
  CATEGORIES: {
    maxAge: 7200, // 2 hours
    staleWhileRevalidate: 86400, // 24 hours
    revalidate: 7200, // ISR revalidation: 2 hours
  },
  
  // Blog posts - content doesn't change often
  BLOGS: {
    maxAge: 3600, // 1 hour
    staleWhileRevalidate: 86400, // 24 hours
    revalidate: 86400, // ISR revalidation: 24 hours
  },
  
  // Homepage - dynamic but cacheable
  HOMEPAGE: {
    maxAge: 1800, // 30 minutes
    staleWhileRevalidate: 3600, // 1 hour
    revalidate: 3600, // ISR revalidation: 1 hour
  },
  
  // Site settings - rarely changes
  SETTINGS: {
    maxAge: 7200, // 2 hours
    staleWhileRevalidate: 86400, // 24 hours
    revalidate: 7200, // ISR revalidation: 2 hours
  },
  
  // Gallery images - static content
  GALLERY: {
    maxAge: 3600, // 1 hour
    staleWhileRevalidate: 86400, // 24 hours
    revalidate: 3600, // ISR revalidation: 1 hour
  },
  
  // Services - rarely updated
  SERVICES: {
    maxAge: 7200, // 2 hours
    staleWhileRevalidate: 86400, // 24 hours
    revalidate: 7200, // ISR revalidation: 2 hours
  },
  
  // Search results - short cache for better UX
  SEARCH: {
    maxAge: 300, // 5 minutes
    staleWhileRevalidate: 1800, // 30 minutes
    revalidate: 0, // No ISR, always dynamic
  },
  
  // API mutations - no cache
  NO_CACHE: {
    maxAge: 0,
    staleWhileRevalidate: 0,
    revalidate: 0,
  },
} as const;

/**
 * Generate Cache-Control header value
 * @param config - Cache configuration object
 * @param isPrivate - Whether the cache is private (user-specific)
 * @returns Cache-Control header value
 */
export function getCacheControlHeader(
  config: { maxAge: number; staleWhileRevalidate: number; immutable?: boolean },
  isPrivate: boolean = false
): string {
  const parts: string[] = [];
  
  // Public or private cache
  parts.push(isPrivate ? 'private' : 'public');
  
  // Max age
  if (config.maxAge > 0) {
    parts.push(`max-age=${config.maxAge}`);
  } else {
    parts.push('no-cache');
  }
  
  // Stale while revalidate for better UX
  if (config.staleWhileRevalidate > 0) {
    parts.push(`stale-while-revalidate=${config.staleWhileRevalidate}`);
  }
  
  // Immutable flag for static assets
  if (config.immutable) {
    parts.push('immutable');
  }
  
  return parts.join(', ');
}

/**
 * Get cache headers for a specific resource type
 * @param resourceType - Type of resource
 * @param isPrivate - Whether the cache is private
 * @returns Object with cache headers
 */
export function getCacheHeaders(
  resourceType: keyof typeof CACHE_CONFIG,
  isPrivate: boolean = false
): Record<string, string> {
  const config = CACHE_CONFIG[resourceType];
  
  return {
    'Cache-Control': getCacheControlHeader(config, isPrivate),
    'CDN-Cache-Control': getCacheControlHeader(config, false), // Always public for CDN
    'Vercel-CDN-Cache-Control': getCacheControlHeader(config, false),
  };
}

/**
 * Create headers object with caching directives for Next.js Response
 * @param resourceType - Type of resource
 * @param additionalHeaders - Additional headers to include
 * @returns Headers object
 */
export function createCachedResponse(
  resourceType: keyof typeof CACHE_CONFIG,
  additionalHeaders: Record<string, string> = {}
): Record<string, string> {
  return {
    ...getCacheHeaders(resourceType),
    ...additionalHeaders,
  };
}

/**
 * In-memory cache for frequent lookups (e.g., redirects)
 * Simple LRU-like cache with TTL
 */
export class MemoryCache<T> {
  private cache: Map<string, { value: T; expiry: number }>;
  private maxSize: number;
  
  constructor(maxSize: number = 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }
  
  /**
   * Get value from cache
   * @param key - Cache key
   * @returns Cached value or undefined if not found or expired
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }
    
    // Check if expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return undefined;
    }
    
    return entry.value;
  }
  
  /**
   * Set value in cache with TTL
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in milliseconds
   */
  set(key: string, value: T, ttl: number): void {
    // Evict oldest entry if at max size
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl,
    });
  }
  
  /**
   * Check if key exists and is not expired
   * @param key - Cache key
   * @returns True if key exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }
  
  /**
   * Delete entry from cache
   * @param key - Cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * Clear all entries from cache
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Get cache size
   * @returns Number of entries in cache
   */
  size(): number {
    return this.cache.size;
  }
}

/**
 * Singleton instance of memory cache for application-wide use
 */
export const memoryCache = new MemoryCache<any>(1000);
