/**
 * Production-ready Image Service
 * Handles image optimization, fallbacks, and responsive loading
 */
import {
  productPlaceholderImage,
  householdFurniturePlaceholderImage,
  officeProductsPlaceholderImage,
} from '../utils/productPlaceholders';
import { dualKeywordManager } from '../lib/seo/dualKeywordManager';

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
  subcategory?: string;
  material?: string;
  description?: string;
}

class ImageService {
  static getCloudinaryUrl(publicId: string, transformations: TransformationOptions = {}): string {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      throw new Error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME environment variable is required');
    }
    const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;

    const {
      width = 800,
      height = 600,
      quality = 'auto:good',
      format = 'auto',
      crop = 'limit'
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
        `/upload/w_${width},h_${height},q_${quality},f_auto,c_limit/`
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
        `/upload/w_${width},h_${height},q_${quality},f_auto,c_limit/`
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
    const cloudinaryUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_${width},h_${height},q_${quality},f_auto,c_limit/${publicId}`;
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
    return "(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 400px";
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
    if (!product) return 'Steel Furniture - Manish Steel Biratnagar Nepal';

    const name = product.name || 'Product';
    const subcategory = product.subcategory || '';
    const category = product.category || '';

    // Prefer subcategory for better SEO specificity
    const categoryLabel = subcategory || category;

    // Enhanced SEO-optimized alt text with dual keywords and location
    // Use dual keyword manager to enrich product name with colloquial terms
    const enrichedName = dualKeywordManager.enrichContent(name);
    
    // Format: Product Name | Category | Location
    const parts: string[] = [enrichedName];
    
    if (categoryLabel) {
      const enrichedCategory = dualKeywordManager.enrichContent(categoryLabel);
      parts.push(enrichedCategory);
    }
    
    // Add location for local SEO
    parts.push('Biratnagar Nepal');
    
    return parts.join(' | ');
  }

  /**
   * Generate SEO-optimized alt text with dual keywords
   * Enhanced version with more customization options
   */
  static generateSEOAltText(
    product: Product | null | undefined,
    options: {
      includeLocation?: boolean;
      includeMaterial?: boolean;
      includeCategory?: boolean;
      imageIndex?: number;
    } = {}
  ): string {
    if (!product) return 'Steel Furniture - Manish Steel Biratnagar Nepal';
    
    const {
      includeLocation = true,
      includeMaterial = false,
      includeCategory = true,
      imageIndex,
    } = options;
    
    const parts: string[] = [];
    const name = product.name || 'Product';
    const category = product.subcategory || product.category || '';
    
    // Add product name with dual keyword enrichment
    const enrichedName = dualKeywordManager.enrichContent(name);
    parts.push(enrichedName);
    
    // Add view indicator for additional images
    if (imageIndex !== undefined && imageIndex > 0) {
      parts.push(`View ${imageIndex + 1}`);
    }
    
    // Add category with dual keyword enrichment
    if (includeCategory && category) {
      const enrichedCategory = dualKeywordManager.enrichContent(category);
      parts.push(enrichedCategory);
    }
    
    // Add material
    if (includeMaterial) {
      const material = product.material || 'Steel';
      parts.push(`${material} Furniture`);
    }
    
    // Add location for local SEO
    if (includeLocation) {
      parts.push('Biratnagar Nepal');
    }
    
    return parts.join(' | ');
  }

  /**
   * Generate image title attribute
   */
  static generateImageTitle(product: Product | null | undefined, category?: string): string {
    if (!product) return 'Steel Furniture Nepal';
    
    const name = product.name || 'Product';
    const cat = category || product.subcategory || product.category || 'Furniture';
    
    return `${name} - ${cat} | Shree Manish Steel Furniture`;
  }

  /**
   * Generate image caption for sitemap
   */
  static generateImageCaption(
    product: Product | null | undefined,
    detailed: boolean = false
  ): string {
    if (!product) return 'Quality steel furniture from Biratnagar, Nepal';
    
    const name = product.name || 'Product';
    const category = product.subcategory || product.category || 'Furniture';
    
    // Enrich name and category with dual keywords
    const enrichedName = dualKeywordManager.enrichContent(name);
    const enrichedCategory = dualKeywordManager.enrichContent(category);
    
    if (detailed) {
      const description = product.description || '';
      const shortDesc = description.substring(0, 100);
      return `${enrichedName} - ${enrichedCategory}. ${shortDesc}. Free delivery in Biratnagar, Dharan, Itahari.`;
    }
    
    return `${enrichedName} - Premium ${enrichedCategory} from Shree Manish Steel Furniture, Biratnagar Nepal`;
  }

  static generateAltText(
    productName: string,
    options: { category?: string; color?: string; location?: string } = {}
  ): string {
    const parts: string[] = [];
    const enrichedName = dualKeywordManager.enrichContent(productName || 'Product');
    parts.push(enrichedName);
    
    if (options.category) {
      const enrichedCategory = dualKeywordManager.enrichContent(options.category);
      parts.push(enrichedCategory);
    }
    
    if (options.color) {
      parts.push(options.color);
    }
    
    if (options.location) {
      parts.push(options.location);
    } else {
      parts.push('Biratnagar Nepal');
    }
    
    return parts.join(' | ');
  }
}

export const imageService = {
  generateAltText: ImageService.generateAltText,
  getCloudinaryUrl: ImageService.getCloudinaryUrl,
  getCloudinaryPlaceholder: ImageService.getCloudinaryPlaceholder,
  getOptimizedImageUrl: ImageService.getOptimizedImageUrl,
  isPlaceholder: ImageService.isPlaceholder,
  isCloudinaryUrl: ImageService.isCloudinaryUrl,
  enhanceCloudinaryUrl: ImageService.enhanceCloudinaryUrl,
  fixCloudinaryUrl: ImageService.fixCloudinaryUrl,
  convertToCloudinaryUrl: ImageService.convertToCloudinaryUrl,
  ensurePublicAssetUrl: ImageService.ensurePublicAssetUrl,
  getPlaceholderImage: ImageService.getPlaceholderImage,
  getResponsiveImageSet: ImageService.getResponsiveImageSet,
  generateSrcSet: ImageService.generateSrcSet,
  getImageSizes: ImageService.getImageSizes,
  preloadImage: ImageService.preloadImage,
  getImageAlt: ImageService.getImageAlt,
  generateSEOAltText: ImageService.generateSEOAltText,
  generateImageTitle: ImageService.generateImageTitle,
  generateImageCaption: ImageService.generateImageCaption,
};

export default ImageService;
