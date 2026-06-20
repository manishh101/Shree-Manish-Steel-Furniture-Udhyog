/**
 * Metadata Generation Service
 * 
 * Centralized service for generating SEO-optimized metadata for all page types.
 * Ensures consistent title/description lengths, keyword integration, and local SEO.
 */

import { dualKeywordManager } from './dualKeywordManager';

export interface OpenGraphMetadata {
  title: string;
  description: string;
  type: 'website' | 'article' | 'product';
  url: string;
  images?: {
    url: string;
    width?: number;
    height?: number;
    alt?: string;
  }[];
  locale?: string;
  alternateLocale?: string | string[];
  siteName?: string;
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
}

export interface TwitterMetadata {
  card: 'summary' | 'summary_large_image';
  title: string;
  description: string;
  images?: string[];
}

export interface AlternateMetadata {
  canonical?: string;
  languages?: {
    [locale: string]: string;
  };
}

export interface RobotsMetadata {
  index?: boolean;
  follow?: boolean;
  googleBot?: {
    index?: boolean;
    follow?: boolean;
  };
}

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  openGraph?: OpenGraphMetadata;
  twitter?: TwitterMetadata;
  alternates?: AlternateMetadata;
  robots?: RobotsMetadata;
}

export interface ValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
}

// Site configuration
const SITE_CONFIG = {
  baseUrl: 'https://manishsteel.com.np',
  siteName: 'Shree Manish Steel Furniture',
  defaultTitleSuffix: ' | श्री मनिष स्टील फर्निचर विराटनगर',
  defaultOgImage: 'https://manishsteel.com.np/images/og-image.jpg',
  locale: 'ne_NP',
  alternateLocale: 'en_NP',
};

// Character limits
const LIMITS = {
  title: { min: 50, max: 60, ideal: 55 },
  description: { min: 140, max: 160, ideal: 150 },
  keywords: { max: 10 },
};

/**
 * Metadata Generator Service
 */
class MetadataGenerator {
  /**
   * Generate metadata for product pages
   */
  generateProductMetadata(
    product: any,
    category?: any
  ): SEOMetadata {
    const categoryName = category?.name || product.category || 'Furniture';
    const subcategoryName = product.subcategoryId?.name || product.subcategory;
    
    // Use custom meta or generate from product data
    let title = product.metaTitle;
    if (!title) {
      title = dualKeywordManager.generateSEOTitle(
        product.name,
        subcategoryName || categoryName,
        { includeLocation: true, maxLength: LIMITS.title.max }
      );
    }
    
    // Generate description with dual keywords
    let description = product.metaDescription;
    if (!description) {
      const enrichedName = dualKeywordManager.enrichContent(product.name);
      const features = product.features?.slice(0, 2).join('. ') || '';
      
      description = `${enrichedName} in Biratnagar. ${features}. Free delivery in Biratnagar, Dharan, Itahari. Quality steel furniture from Shree Manish Steel.`;
      
      // Trim to ideal length
      description = this.trimToLength(description, LIMITS.description.max);
    }
    
    // Generate keywords
    const keywords = product.focusKeywords || this.generateProductKeywords(product, categoryName);
    
    // Canonical URL using slug
    const slug = product.slug || product._id;
    const canonical = `${SITE_CONFIG.baseUrl}/products/${slug}`;
    
    // Open Graph - use 'website' type for products (product is not valid in OpenGraph spec)
    // Product schema is handled via JSON-LD instead
    const openGraph: OpenGraphMetadata = {
      title: this.trimToLength(title.replace(SITE_CONFIG.defaultTitleSuffix, ''), 60),
      description: description,
      type: 'website',
      url: canonical,
      images: product.images?.length > 0 ? [
        {
          url: product.image || product.images[0],
          width: 1200,
          height: 630,
          alt: dualKeywordManager.generateAltText(product.name, categoryName),
        }
      ] : undefined,
      locale: SITE_CONFIG.locale,
      alternateLocale: SITE_CONFIG.alternateLocale,
      siteName: SITE_CONFIG.siteName,
    };
    
    // Twitter Card
    const twitter: TwitterMetadata = {
      card: 'summary_large_image',
      title: openGraph.title,
      description: description,
      images: openGraph.images?.map(img => img.url),
    };
    
    return {
      title,
      description,
      keywords,
      canonical,
      openGraph,
      twitter,
      alternates: {
        canonical,
        languages: {
          'ne-NP': canonical,
          'en-NP': canonical,
        },
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
        },
      },
    };
  }

  /**
   * Generate metadata for blog posts
   */
  generateBlogMetadata(blog: any): SEOMetadata {
    const title = blog.metaTitle || `${blog.title}${SITE_CONFIG.defaultTitleSuffix}`;
    const description = blog.metaDescription || this.trimToLength(blog.excerpt, LIMITS.description.max);
    
    const canonical = `${SITE_CONFIG.baseUrl}/blogs/${blog.slug}`;
    
    const openGraph: OpenGraphMetadata = {
      title: blog.title,
      description: description,
      type: 'article',
      url: canonical,
      images: blog.image ? [{
        url: blog.image,
        width: 1200,
        height: 630,
        alt: blog.title,
      }] : undefined,
      locale: SITE_CONFIG.locale,
      alternateLocale: SITE_CONFIG.alternateLocale,
      siteName: SITE_CONFIG.siteName,
      publishedTime: blog.createdAt ? new Date(blog.createdAt).toISOString() : undefined,
      modifiedTime: blog.updatedAt ? new Date(blog.updatedAt).toISOString() : undefined,
      authors: blog.author ? [blog.author] : undefined,
    };
    
    return {
      title: this.trimToLength(title, LIMITS.title.max),
      description,
      keywords: blog.tags || [],
      canonical,
      openGraph,
      twitter: {
        card: 'summary_large_image',
        title: blog.title,
        description,
        images: blog.image ? [blog.image] : undefined,
      },
      alternates: {
        canonical,
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  }

  /**
   * Generate metadata for category pages
   */
  generateCategoryMetadata(
    category: any,
    subcategory?: any
  ): SEOMetadata {
    const isSubcategory = !!subcategory;
    const targetCategory = subcategory || category;
    
    // Build title with dual keywords
    const categoryName = targetCategory.name;
    const enrichedName = dualKeywordManager.enrichContent(categoryName);
    const title = targetCategory.metaTitle || 
      `${enrichedName} | विराटनगर ${isSubcategory ? category.name : 'Nepal'}${SITE_CONFIG.defaultTitleSuffix}`;
    
    // Build description
    const description = targetCategory.metaDescription || 
      `Browse ${enrichedName.toLowerCase()} in Biratnagar. Quality ${categoryName.toLowerCase()} with free delivery in Biratnagar, Dharan, Itahari. Affordable prices, 5-year warranty.`;
    
    // Keywords
    const keywords = targetCategory.focusKeywords || [
      `${categoryName} Biratnagar`,
      `steel ${categoryName.toLowerCase()}`,
      `${categoryName} Nepal`,
      `buy ${categoryName.toLowerCase()} Biratnagar`,
      `affordable ${categoryName.toLowerCase()}`,
    ];
    
    const url = isSubcategory
      ? `${SITE_CONFIG.baseUrl}/products?category=${category._id || category.id}&subcategory=${subcategory._id || subcategory.id}`
      : `${SITE_CONFIG.baseUrl}/products?category=${category._id || category.id}`;
    
    return {
      title: this.trimToLength(title, LIMITS.title.max),
      description: this.trimToLength(description, LIMITS.description.max),
      keywords,
      canonical: url,
      openGraph: {
        title: enrichedName,
        description: this.trimToLength(description, LIMITS.description.max),
        type: 'website',
        url,
        locale: SITE_CONFIG.locale,
        alternateLocale: SITE_CONFIG.alternateLocale,
        siteName: SITE_CONFIG.siteName,
      },
      twitter: {
        card: 'summary_large_image',
        title: enrichedName,
        description: this.trimToLength(description, LIMITS.description.max),
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  }

  /**
   * Generate metadata for static pages
   */
  generatePageMetadata(
    pageType: 'home' | 'about' | 'contact' | 'products' | 'blogs' | 'gallery' | 'custom-order',
    customData?: any
  ): SEOMetadata {
    const templates: Record<string, { title: string; description: string; keywords: string[] }> = {
      home: {
        title: `Best Steel Furniture Biratnagar | Almirah Daraj Powder Coated | Affordable Prices Nepal`,
        description: 'Best steel furniture shop in Biratnagar - Premium almirahs (daraj), powder coating services, tables at सस्तो prices. Free delivery in Biratnagar, Dharan, Itahari. 5-year warranty. Order now!',
        keywords: [
          'furniture shop Biratnagar',
          'steel furniture Nepal',
          'steel almirah Biratnagar',
          'steel daraj Nepal',
          'cheap furniture Biratnagar',
          'office furniture Biratnagar',
          'powder coating Biratnagar',
          'furniture delivery Dharan Itahari',
        ],
      },
      about: {
        title: `About Us - 10+ Years Trusted Furniture Manufacturer | Biratnagar`,
        description: 'Shree Manish Steel - Leading furniture manufacturer in Biratnagar with 10+ years experience. Quality steel almirahs (daraj), powder coating services. Trusted by 1000+ customers. Visit us today!',
        keywords: [
          'furniture manufacturer Biratnagar',
          'about Manish Steel',
          'furniture company Nepal',
          'steel furniture factory',
          'trusted furniture shop',
          'quality furniture Nepal',
        ],
      },
      contact: {
        title: `Contact Us - Free Delivery in Biratnagar, Dharan, Itahari | Call Now`,
        description: 'Contact Shree Manish Steel Furniture Biratnagar. ☎ 9824336371. Free delivery & installation in Biratnagar, Dharan, Itahari. Showroom: Dharan Road. Get quote today!',
        keywords: [
          'furniture shop Biratnagar address',
          'contact furniture Nepal',
          'furniture showroom Biratnagar',
          'furniture delivery Biratnagar',
          'furniture phone number',
          'free delivery Biratnagar',
        ],
      },
      products: {
        title: `Steel Furniture Products - Almirahs, Powder Coating, Tables | Best Prices Biratnagar`,
        description: 'Browse 100+ steel furniture: almirahs (daraj), powder coating services, office desks, tables. Quality furniture at lowest prices in Biratnagar. Free delivery. Shop now!',
        keywords: [
          'buy furniture Biratnagar',
          'steel almirah price',
          'furniture catalog Nepal',
          'cheap furniture shop',
          'furniture online Biratnagar',
          'steel furniture price',
        ],
      },
      blogs: {
        title: `Furniture Buying Guides & Tips | Steel Furniture Care | Biratnagar`,
        description: 'Expert furniture guides - How to choose almirahs (daraj), metal finishing tips, furniture comparison. Free advice from Biratnagar furniture experts. Read now!',
        keywords: [
          'furniture buying guide Nepal',
          'steel furniture tips',
          'furniture care guide',
          'home decor Nepal',
          'almirah buying tips',
          'furniture maintenance',
        ],
      },
      gallery: {
        title: `Gallery - Our Furniture Projects & Showroom | Biratnagar`,
        description: 'View completed furniture installations in Biratnagar, Dharan, Itahari. Showroom photos, custom projects, quality steel furniture work. Get inspired - visit us today!',
        keywords: [
          'furniture gallery Biratnagar',
          'furniture showroom photos',
          'steel furniture images',
          'furniture projects Nepal',
          'custom furniture photos',
        ],
      },
      'custom-order': {
        title: `Custom Furniture Order - Made to Measure | Free Consultation Biratnagar`,
        description: 'Order custom steel furniture in Biratnagar - Almirahs, beds, office furniture tailored to your space. Free home measurement & consultation. Expert design. Order now!',
        keywords: [
          'custom furniture Biratnagar',
          'made to order furniture',
          'custom almirah Nepal',
          'bespoke furniture',
          'tailored furniture',
          'custom size furniture',
        ],
      },
    };
    
    const template = templates[pageType] || templates.home;
    const url = pageType === 'home' ? SITE_CONFIG.baseUrl : `${SITE_CONFIG.baseUrl}/${pageType}`;
    
    return {
      title: customData?.title || template.title,
      description: customData?.description || template.description,
      keywords: customData?.keywords || template.keywords,
      canonical: url,
      openGraph: {
        title: (customData?.title || template.title).replace(SITE_CONFIG.defaultTitleSuffix, ''),
        description: template.description,
        type: 'website',
        url,
        images: customData?.ogImage ? [{ url: customData.ogImage, width: 1200, height: 630 }] : [{ url: SITE_CONFIG.defaultOgImage, width: 1200, height: 630 }],
        locale: SITE_CONFIG.locale,
        alternateLocale: SITE_CONFIG.alternateLocale,
        siteName: SITE_CONFIG.siteName,
      },
      twitter: {
        card: 'summary_large_image',
        title: (customData?.title || template.title).replace(SITE_CONFIG.defaultTitleSuffix, ''),
        description: template.description,
        images: customData?.ogImage ? [customData.ogImage] : [SITE_CONFIG.defaultOgImage],
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  }

  /**
   * Validate metadata constraints
   */
  validateMetadata(metadata: SEOMetadata): ValidationResult {
    const warnings: string[] = [];
    const errors: string[] = [];
    
    // Title validation
    if (!metadata.title) {
      errors.push('Title is required');
    } else {
      const titleLength = metadata.title.length;
      if (titleLength < LIMITS.title.min) {
        warnings.push(`Title is too short (${titleLength} chars). Recommended: ${LIMITS.title.min}-${LIMITS.title.max} chars`);
      } else if (titleLength > LIMITS.title.max) {
        warnings.push(`Title is too long (${titleLength} chars). Will be truncated in search results. Max: ${LIMITS.title.max} chars`);
      }
    }
    
    // Description validation
    if (!metadata.description) {
      errors.push('Description is required');
    } else {
      const descLength = metadata.description.length;
      if (descLength < LIMITS.description.min) {
        warnings.push(`Description is too short (${descLength} chars). Recommended: ${LIMITS.description.min}-${LIMITS.description.max} chars`);
      } else if (descLength > LIMITS.description.max) {
        warnings.push(`Description is too long (${descLength} chars). Will be truncated in search results. Max: ${LIMITS.description.max} chars`);
      }
    }
    
    // Keywords validation
    if (metadata.keywords && metadata.keywords.length > LIMITS.keywords.max) {
      warnings.push(`Too many keywords (${metadata.keywords.length}). Recommended max: ${LIMITS.keywords.max}`);
    }
    
    // Canonical URL validation
    if (!metadata.canonical) {
      warnings.push('Canonical URL not specified');
    }
    
    // Open Graph validation
    if (metadata.openGraph && !metadata.openGraph.images?.length) {
      warnings.push('Open Graph image not specified');
    }
    
    return {
      valid: errors.length === 0,
      warnings,
      errors,
    };
  }

  // Helper methods

  /**
   * Trim text to specified length, breaking at word boundaries
   */
  private trimToLength(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) return text;
    
    // Try to break at last space before limit
    const trimmed = text.substring(0, maxLength);
    const lastSpace = trimmed.lastIndexOf(' ');
    
    if (lastSpace > maxLength * 0.8) {
      return trimmed.substring(0, lastSpace) + '...';
    }
    
    return trimmed.substring(0, maxLength - 3) + '...';
  }

  /**
   * Generate keywords for product based on attributes
   */
  private generateProductKeywords(product: any, category: string): string[] {
    const keywords: string[] = [];
    const productName = product.name.toLowerCase();
    
    // Add product name variations
    keywords.push(productName);
    keywords.push(`${productName} Biratnagar`);
    keywords.push(`${productName} Nepal`);
    
    // Add category keywords
    keywords.push(`${category.toLowerCase()} Biratnagar`);
    keywords.push(`steel ${category.toLowerCase()}`);
    
    // Add dual keywords if applicable
    const dualTerms = dualKeywordManager.getKeywordVariations(productName);
    dualTerms.forEach(term => {
      if (!keywords.includes(term.toLowerCase())) {
        keywords.push(term.toLowerCase());
      }
    });
    
    // Add material if present
    if (product.material) {
      keywords.push(`${product.material.toLowerCase()} furniture`);
    }
    
    // Add price-related keywords
    keywords.push('cheap furniture Biratnagar');
    keywords.push('affordable furniture Nepal');
    
    // Limit to max keywords
    return keywords.slice(0, LIMITS.keywords.max);
  }
}

// Export singleton instance
export const metadataGenerator = new MetadataGenerator();

// Export class for testing
export default MetadataGenerator;
