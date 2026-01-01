/**
 * Production-ready Image Service
 * Handles image optimization, fallbacks, and responsive loading
 */
import { 
  productPlaceholderImage, 
  householdFurniturePlaceholderImage, 
  officeProductsPlaceholderImage,
  bedsPlaceholderImage
} from '../utils/productPlaceholders';

interface TransformationOptions {
  width?: number;
  height?: number;
  quality?: string;
  format?: string;
  crop?: string;
  category?: string;
}

interface ResponsiveImage {
  url: string;
  width: number;
}

interface Product {
  name?: string;
  category?: string;
}

class ImageService {
  static getCloudinaryUrl(publicId: string, transformations: TransformationOptions = {}): string {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dwrrja8cz';
    const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
    
    const {
      width = 800,
      height = 600,
      quality = 'auto:good',
      format = 'auto',
      crop = 'fill'
    } = transformations;
    
    const transformString = `w_${width},h_${height},q_${quality},f_${format},c_${crop}`;
    return `${baseUrl}/${transformString}/${publicId}`;
  }

  // Production-ready placeholder - use local steel furniture images instead of Cloudinary's sample
  static getCloudinaryPlaceholder(category = 'Product'): string {
    // Use local furniture images as placeholders - these are guaranteed to exist
    // and show actual steel furniture instead of Cloudinary's default flower (sample.jpg)
    return this.getPlaceholderImage(category);
  }

  static getOptimizedImageUrl(imageUrl: string | null | undefined, options: TransformationOptions = {}): string {
    // If no image URL provided, use placeholder
    if (!imageUrl) {
      return this.getPlaceholderImage(options.category);
    }

    // Clean and normalize the URL
    const cleanUrl = imageUrl.trim();
    
    // If empty after trim, use placeholder
    if (!cleanUrl) {
      return this.getPlaceholderImage(options.category);
    }

    // PRIORITY 1: Cloudinary URLs - optimize them
    if (this.isCloudinaryUrl(cleanUrl)) {
      return this.fixCloudinaryUrl(cleanUrl, options);
    }
    
    // PRIORITY 2: Local URLs (starting with /) - return as-is
    if (cleanUrl.startsWith('/')) {
      return cleanUrl;
    }
    
    // PRIORITY 3: External URLs - return as-is (don't try to convert)
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
      return cleanUrl;
    }
    
    // PRIORITY 4: Relative paths - prepend /
    return `/${cleanUrl}`;
  }

  static getApiBaseUrl(): string {
    return process.env.NEXT_PUBLIC_API_URL || 
           process.env.NEXT_PUBLIC_API_BASE_URL || 
           'http://localhost:5000/api';
  }
  
  // Helper to identify placeholder images
  static isPlaceholder(url: string | null | undefined): boolean {
    return !!url && url.includes('/placeholders/');
  }

  static isCloudinaryUrl(url: string | null | undefined): boolean {
    return !!url && (
      url.includes('res.cloudinary.com') || 
      url.includes('cloudinary.com') ||
      (url.includes('/upload/') && 
       (url.includes('/v1/') || url.includes('/image/') || url.includes('/video/')))
    );
  }

  static enhanceCloudinaryUrl(url: string, options: TransformationOptions = {}): string {
    const { width = 800, height = 600, quality = 'auto:good' } = options;
    
    // If URL already has transformations, return as-is to avoid double transformation
    if (url.includes('/upload/') && (url.includes('w_') || url.includes('c_'))) {
      return url;
    }
    
    // Only add transformations if URL doesn't have them
    if (url.includes('/upload/') && !url.includes('w_')) {
      const transformedUrl = url.replace(
        '/upload/', 
        `/upload/w_${width},h_${height},q_${quality},f_auto,c_fill/`
      );
      return transformedUrl;
    }
    
    return url;
  }

  // Fix Cloudinary URLs that have issues
  static fixCloudinaryUrl(url: string, options: TransformationOptions = {}): string {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dwrrja8cz';
    let fixedUrl = url;
    
    // Fix URLs missing cloud name
    if (fixedUrl.includes('res.cloudinary.com/upload/')) {
      fixedUrl = fixedUrl.replace('res.cloudinary.com/upload/', `res.cloudinary.com/${cloudName}/image/upload/`);
    }
    
    // If already has transformations, return as-is to avoid double transformation
    if (fixedUrl.includes('w_') && fixedUrl.includes('h_') && fixedUrl.includes('q_')) {
      return fixedUrl;
    }
    
    // Add transformations if missing
    const { width = 800, height = 600, quality = 'auto:good' } = options;
    
    if (fixedUrl.includes('/upload/') && !fixedUrl.includes('w_')) {
      const transformedUrl = fixedUrl.replace(
        '/upload/', 
        `/upload/w_${width},h_${height},q_${quality},f_auto,c_fill/`
      );
      return transformedUrl;
    }
    
    return fixedUrl;
  }

  // Convert any URL to Cloudinary URL for production
  static convertToCloudinaryUrl(originalUrl: string, options: TransformationOptions = {}): string {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dwrrja8cz';
    const { width = 800, height = 600, quality = 'auto:good' } = options;
    
    // Extract filename or use a generic identifier
    let publicId = 'manish-steel/products/converted-image';
    
    if (originalUrl) {
      // Try to extract meaningful filename
      const urlParts = originalUrl.split('/');
      const filename = urlParts[urlParts.length - 1];
      if (filename && filename.includes('.')) {
        const nameWithoutExt = filename.split('.')[0];
        publicId = `manish-steel/products/${nameWithoutExt}`;
      }
    }
    
    // Generate Cloudinary URL
    const cloudinaryUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_${width},h_${height},q_${quality},f_auto,c_fill/${publicId}`;
    return cloudinaryUrl;
  }

  static ensurePublicAssetUrl(url: string | null | undefined): string {
    if (!url) return '';
    
    // If it's already an absolute URL or a path starting with /, return as is
    if (url.startsWith('http') || url.startsWith('/')) {
      return url;
    }
    
    // Otherwise, ensure it starts with '/'
    return `/${url}`;
  }

  static getPlaceholderImage(category = 'Product'): string {
    // Map categories to placeholder images - using imported images
    const categoryMap: Record<string, string> = {
      'beds': bedsPlaceholderImage,
      'chairs': householdFurniturePlaceholderImage,
      'tables': householdFurniturePlaceholderImage,
      'wardrobes': householdFurniturePlaceholderImage,
      'office-chairs': officeProductsPlaceholderImage,
      'office-desks': officeProductsPlaceholderImage,
      'storage': officeProductsPlaceholderImage,
      'lockers': officeProductsPlaceholderImage,
      'counters': officeProductsPlaceholderImage,
      'display-units': officeProductsPlaceholderImage,
      'filing-cabinets': officeProductsPlaceholderImage,
      'commercial-shelving': officeProductsPlaceholderImage,
      'office-storage': officeProductsPlaceholderImage,
      'wood-products': householdFurniturePlaceholderImage,
      'household-furniture': householdFurniturePlaceholderImage,
      'office-products': officeProductsPlaceholderImage
    };

    const normalizedCategory = category.toLowerCase().replace(/\s+/g, '-');
    return this.ensurePublicAssetUrl(categoryMap[normalizedCategory] || productPlaceholderImage);
  }

  static getResponsiveImageSet(imageUrl: string | null | undefined, options: TransformationOptions = {}): ResponsiveImage[] {
    const sizes = [400, 800, 1200];
    return sizes.map(size => ({
      url: this.getOptimizedImageUrl(imageUrl, { ...options, width: size, height: size }),
      width: size
    }));
  }

  static generateSrcSet(imageUrl: string | null | undefined, options: TransformationOptions = {}): string {
    const responsiveSet = this.getResponsiveImageSet(imageUrl, options);
    return responsiveSet.map(img => `${img.url} ${img.width}w`).join(', ');
  }

  static getImageSizes(): string {
    return "(max-width: 480px) 400px, (max-width: 768px) 600px, (max-width: 1200px) 800px, 1200px";
  }

  static preloadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  static getImageAlt(product: Product | null | undefined): string {
    if (!product) return 'Product image';
    
    const name = product.name || 'Product';
    const category = product.category || '';
    
    return category ? `${name} - ${category}` : name;
  }
}

export default ImageService;
