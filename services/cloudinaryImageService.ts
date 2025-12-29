/**
 * Enhanced Cloudinary Image Service
 * Specialized service for handling Cloudinary images in production environments
 */

interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  uploadPreset: string;
  folder: string;
}

interface TransformationOptions {
  width?: number;
  height?: number;
  quality?: string;
  format?: string;
  crop?: string;
}

interface ImageObject {
  url?: string;
  src?: string;
  path?: string;
  image?: string;
  imageUrl?: string;
  secure_url?: string;
  [key: string]: unknown;
}

class CloudinaryImageService {
  /**
   * Get cloudinary configuration
   */
  static getConfig(): CloudinaryConfig {
    return {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dwrrja8cz',
      apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '',
      uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'manish-steel',
      folder: process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || 'manish-steel'
    };
  }

  /**
   * Check if a URL is a Cloudinary URL
   */
  static isCloudinaryUrl(url: string | null | undefined): boolean {
    if (!url || typeof url !== 'string') return false;
    
    // More flexible Cloudinary URL detection
    return (
      url.includes('cloudinary.com') || 
      url.includes('res.cloudinary.com') || 
      url.includes('cloudinary.com/image/upload') ||
      url.includes('/upload/v')
    );
  }

  /**
   * Sanitize and normalize an image URL for consistent processing
   */
  static normalizeImageUrl(image: string | ImageObject | null | undefined): string {
    // Handle different image formats
    if (!image) return '';
    
    let url = '';
    if (typeof image === 'string') {
      url = image.trim();
    } else if (typeof image === 'object') {
      // Extract URL from object with multiple possible properties
      url = (
        image.url || 
        image.src || 
        image.path || 
        image.image || 
        image.imageUrl || 
        image.secure_url || 
        ''
      ) as string;
      url = url.trim();
      
      // For Cloudinary image objects, make sure we get the best URL
      if (image.secure_url) {
        return image.secure_url as string;
      }
    }
    
    // Handle empty URL
    if (!url) return '';
    
    // Handle relative URL paths for local development
    if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
      // Get API base URL from environment
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 
                        process.env.NEXT_PUBLIC_API_BASE_URL || 
                        'http://localhost:5000';
      
      // Remove /api suffix if present since we're serving static files
      const baseUrl = apiBaseUrl.replace('/api', '');
      
      // Ensure proper path formatting
      const imagePath = url.startsWith('/') ? url : `/${url}`;
      return `${baseUrl}${imagePath}`;
    }
    
    // Handle other relative paths
    if (url.startsWith('/') && !url.startsWith('//')) {
      // In production, use the appropriate domain
      if (process.env.NODE_ENV === 'production') {
        const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 
          (typeof window !== 'undefined' ? window.location.origin : '');
        return `${frontendUrl}${url}`;
      } else {
        // In development, assume localhost
        return `http://localhost:3000${url}`;
      }
    }
    
    // For Cloudinary URLs, make sure we use HTTPS
    if (url.startsWith('http:') && url.includes('cloudinary.com')) {
      return url.replace('http:', 'https:');
    }
    
    // Return already formed URL
    return url;
  }

  /**
   * Optimize a Cloudinary URL with proper transformations
   */
  static optimizeCloudinaryUrl(url: string, options: TransformationOptions = {}): string {
    if (!url || !this.isCloudinaryUrl(url)) return url;
    
    try {
      // Parse the URL - be more flexible with URL formats
      let baseUrl: string, publicId: string;
      
      // Handle standard cloudinary URLs
      if (url.includes('/upload/')) {
        // Remove any existing transformations for consistency
        const cleanUrl = url.replace(/\/[^/]+\/upload\//, '/upload/');
        const urlParts = cleanUrl.split('/upload/');
        
        if (urlParts.length !== 2) return url; // Not a standard Cloudinary URL
        baseUrl = urlParts[0] + '/upload';
        publicId = urlParts[1];
        
        // Remove any query parameters from the public ID
        if (publicId.includes('?')) {
          publicId = publicId.split('?')[0];
        }
      } else {
        // Fallback for non-standard URLs
        return url;
      }
      
      // Build transformation string
      const {
        width = 1600,
        height = 1600,
        quality = 'auto:best',
        format = 'auto',
        crop = 'fit'
      } = options;
      
      // Build a comprehensive transformation string
      const transformations = `w_${width},h_${height},q_${quality},f_${format},c_${crop},dpr_auto`;
      
      // Create the optimized URL
      return `${baseUrl}/${transformations}/${publicId}`;
    } catch (error) {
      console.error('Error optimizing Cloudinary URL:', error);
      return url; // Return original URL if there's an error
    }
  }

  /**
   * Get a properly formatted Cloudinary URL for a public ID
   */
  static getUrlFromPublicId(publicId: string, options: TransformationOptions = {}): string {
    if (!publicId) return '';
    
    const { cloudName } = this.getConfig();
    const {
      width = 800,
      height = 600,
      quality = 'auto:good',
      format = 'auto',
      crop = 'fill'
    } = options;
    
    const transformations = `w_${width},h_${height},q_${quality},f_${format},c_${crop}`;
    
    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`;
  }

  /**
   * Process gallery images to ensure they're properly formatted for display
   */
  static processGalleryImages(images: (string | ImageObject)[], options: TransformationOptions = {}): string[] {
    if (!Array.isArray(images)) {
      console.warn('Invalid images array provided to processGalleryImages');
      return [];
    }
    
    return images.map(image => {
      // Normalize the URL first
      const normalizedUrl = this.normalizeImageUrl(image);
      
      if (!normalizedUrl) return '';
      
      // Process Cloudinary URLs with optimizations
      if (this.isCloudinaryUrl(normalizedUrl)) {
        return this.optimizeCloudinaryUrl(normalizedUrl, options);
      }
      
      // Return non-Cloudinary URLs as is
      return normalizedUrl;
    }).filter(Boolean);
  }
  
  /**
   * Validate and repair gallery images that might be broken
   */
  static validateGalleryImages(images: unknown): string[] {
    // If input isn't an array, handle gracefully
    if (!Array.isArray(images)) {
      if (!images) return [];
      // Try to convert single item to array
      if (typeof images === 'string' || typeof images === 'object') {
        return this.processGalleryImages([images as string | ImageObject]);
      }
      return [];
    }
    
    // Filter out invalid entries and normalize URLs
    return this.processGalleryImages(images as (string | ImageObject)[]);
  }
}

export default CloudinaryImageService;
