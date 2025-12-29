/**
 * Image Availability Service
 * Ensures robust image loading across the application
 */

interface CacheStats {
  total: number;
  available: number;
  unavailable: number;
  hitRate: string;
}

class ImageAvailabilityService {
  private static cache = new Map<string, boolean>();

  /**
   * Check if an image URL is accessible
   */
  static async checkImageAvailability(url: string): Promise<boolean> {
    if (!url) return false;
    
    // Check cache first
    if (this.cache.has(url)) {
      return this.cache.get(url) || false;
    }

    // Only run in browser
    if (typeof window === 'undefined') {
      return true; // Assume available on server
    }

    try {
      // Create a promise that resolves/rejects based on image load
      const isAvailable = await new Promise<boolean>((resolve) => {
        const img = new Image();
        const timeoutId = setTimeout(() => {
          resolve(false);
        }, 5000); // 5 second timeout

        img.onload = () => {
          clearTimeout(timeoutId);
          resolve(true);
        };

        img.onerror = () => {
          clearTimeout(timeoutId);
          resolve(false);
        };

        img.src = url;
      });

      // Cache the result
      this.cache.set(url, isAvailable);
      return isAvailable;
    } catch (error) {
      console.warn('Error checking image availability:', url, (error as Error).message);
      this.cache.set(url, false);
      return false;
    }
  }

  /**
   * Get the best available image URL from a list of options
   */
  static async getBestAvailableImage(imageUrls: string[], fallbackUrl: string | null = null): Promise<string | null> {
    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      return fallbackUrl;
    }

    // Try each URL in order until we find one that works
    for (const url of imageUrls) {
      if (url && await this.checkImageAvailability(url)) {
        return url;
      }
    }

    // If no URLs work, return the fallback
    return fallbackUrl;
  }

  /**
   * Preload critical images for better performance
   */
  static preloadImages(imageUrls: string[]): void {
    if (!Array.isArray(imageUrls)) return;
    if (typeof window === 'undefined') return;

    imageUrls.forEach(url => {
      if (url && !this.cache.has(url)) {
        // Start loading the image but don't wait for it
        this.checkImageAvailability(url).catch(() => {
          // Silent fail for preloading
        });
      }
    });
  }

  /**
   * Clear the availability cache
   */
  static clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): CacheStats {
    const total = this.cache.size;
    const available = Array.from(this.cache.values()).filter(Boolean).length;
    return {
      total,
      available,
      unavailable: total - available,
      hitRate: total > 0 ? (available / total * 100).toFixed(1) + '%' : '0%'
    };
  }
}

export default ImageAvailabilityService;
