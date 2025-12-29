/**
 * Image Optimization Utilities
 * 
 * Helper functions to optimize Cloudinary images throughout the application
 */

export interface CloudinaryOptions {
  width?: number;
  height?: number;
  quality?: 'auto' | number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  crop?: 'limit' | 'fill' | 'scale' | 'fit';
  gravity?: 'auto' | 'face' | 'center';
}

/**
 * Optimizes a Cloudinary image URL with performance transformations
 * 
 * @param url - Original Cloudinary URL
 * @param options - Optimization options
 * @returns Optimized Cloudinary URL
 */
export function optimizeCloudinaryUrl(
  url: string,
  options: CloudinaryOptions = {}
): string {
  if (!url || !url.includes('res.cloudinary.com')) {
    return url;
  }

  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'limit',
    gravity,
  } = options;

  const transformations = [];

  // Add format optimization (WebP/AVIF for modern browsers)
  transformations.push(`f_${format}`);

  // Add quality optimization
  transformations.push(`q_${quality}`);

  // Add width if specified
  if (width) {
    transformations.push(`w_${width}`);
  }

  // Add height if specified
  if (height) {
    transformations.push(`h_${height}`);
  }

  // Add crop mode
  transformations.push(`c_${crop}`);

  // Add gravity if specified
  if (gravity) {
    transformations.push(`g_${gravity}`);
  }

  // Join all transformations
  const transformString = transformations.join(',');

  // Insert transformations into URL
  return url.replace('/upload/', `/upload/${transformString}/`);
}

/**
 * Get optimized Cloudinary URL for thumbnails (small images)
 */
export function getThumbnailUrl(url: string): string {
  return optimizeCloudinaryUrl(url, {
    width: 400,
    quality: 'auto',
    format: 'auto',
    crop: 'limit',
  });
}

/**
 * Get optimized Cloudinary URL for product images
 */
export function getProductImageUrl(url: string): string {
  return optimizeCloudinaryUrl(url, {
    width: 800,
    quality: 85,
    format: 'auto',
    crop: 'limit',
  });
}

/**
 * Get optimized Cloudinary URL for hero/banner images
 */
export function getHeroImageUrl(url: string): string {
  return optimizeCloudinaryUrl(url, {
    width: 1200,
    quality: 85,
    format: 'auto',
    crop: 'limit',
  });
}

/**
 * Get optimized Cloudinary URL for gallery images
 */
export function getGalleryImageUrl(url: string, size: 'thumbnail' | 'full' = 'full'): string {
  if (size === 'thumbnail') {
    return getThumbnailUrl(url);
  }
  
  return optimizeCloudinaryUrl(url, {
    width: 1920,
    quality: 90,
    format: 'auto',
    crop: 'limit',
  });
}

/**
 * Generate blur placeholder for images
 * Creates a tiny, blurred version for loading states
 */
export function getBlurDataUrl(url: string): string {
  if (!url || !url.includes('res.cloudinary.com')) {
    return '';
  }

  return optimizeCloudinaryUrl(url, {
    width: 10,
    quality: 1,
    format: 'jpg',
    crop: 'scale',
  });
}
