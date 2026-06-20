/**
 * URL Management System
 * 
 * Handles product URL slug generation, validation, canonical URL generation,
 * and redirect management for changed URLs.
 */

import { dualKeywordManager } from './dualKeywordManager';

export interface SlugOptions {
  includeCategory?: boolean;      // Include category in slug
  includeLocation?: boolean;      // Add "-biratnagar" suffix
  includeDualKeyword?: boolean;   // Include both formal and colloquial terms
  maxLength?: number;             // Maximum slug length (default: 100)
  categoryName?: string;          // Category name for context
}

export interface UpdateResult {
  success: boolean;
  updated: number;
  skipped: number;
  errors: string[];
}

const SITE_CONFIG = {
  baseUrl: 'https://manishsteel.com.np',
  locationSuffix: 'biratnagar',
};

/**
 * URL Manager Service
 */
class URLManager {
  /**
   * Generate SEO-friendly slug from product name
   */
  generateSlug(
    productName: string,
    options: SlugOptions = {}
  ): string {
    const {
      includeCategory = false,
      includeLocation = true,
      includeDualKeyword = true,
      maxLength = 100,
      categoryName,
    } = options;
    
    if (!productName) {
      throw new Error('Product name is required for slug generation');
    }
    
    let slug = productName.toLowerCase().trim();
    
    // Apply dual-keyword enrichment if enabled
    if (includeDualKeyword && categoryName) {
      slug = dualKeywordManager.generateDualKeywordSlug(slug, categoryName);
    } else {
      // Basic slug generation
      slug = this.cleanSlug(slug);
    }
    
    // Add category if specified and not already in slug
    if (includeCategory && categoryName) {
      const cleanCategory = this.cleanSlug(categoryName);
      if (!slug.includes(cleanCategory)) {
        slug = `${cleanCategory}-${slug}`;
      }
    }
    
    // Add location suffix if not present
    if (includeLocation && !slug.includes(SITE_CONFIG.locationSuffix)) {
      slug = `${slug}-${SITE_CONFIG.locationSuffix}`;
    }
    
    // Trim to max length
    if (slug.length > maxLength) {
      // Try to break at last hyphen before max length
      const trimmed = slug.substring(0, maxLength);
      const lastHyphen = trimmed.lastIndexOf('-');
      
      if (lastHyphen > maxLength * 0.7) {
        slug = trimmed.substring(0, lastHyphen);
      } else {
        slug = trimmed;
      }
    }
    
    // Final cleanup
    slug = this.cleanSlug(slug);
    
    return slug;
  }

  /**
   * Clean and format slug
   */
  private cleanSlug(text: string): string {
    return text
      .toLowerCase()
      .trim()
      // Remove special characters except hyphens and spaces
      .replace(/[^\w\s-]/g, '')
      // Replace multiple spaces/underscores with single hyphen
      .replace(/[\s_]+/g, '-')
      // Remove duplicate hyphens
      .replace(/-+/g, '-')
      // Remove leading/trailing hyphens
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Validate slug uniqueness against database
   * Note: This requires database access, implement in actual usage
   */
  async validateSlugUniqueness(
    slug: string,
    excludeId?: string
  ): Promise<boolean> {
    // This should be implemented with actual database query
    // For now, returns true (assumes unique)
    // Implementation will be in the migration script
    return true;
  }

  /**
   * Generate unique slug by appending counter if needed
   */
  async generateUniqueSlug(
    baseSlug: string,
    checkUniqueness: (slug: string) => Promise<boolean>,
    excludeId?: string
  ): Promise<string> {
    let slug = baseSlug;
    let counter = 1;
    let isUnique = await checkUniqueness(slug);
    
    while (!isUnique && counter < 100) {
      // Extract location suffix if present
      const hasLocation = slug.endsWith(`-${SITE_CONFIG.locationSuffix}`);
      
      if (hasLocation) {
        // Insert counter before location: slug-biratnagar -> slug-1-biratnagar
        const withoutLocation = slug.substring(0, slug.lastIndexOf(`-${SITE_CONFIG.locationSuffix}`));
        slug = `${withoutLocation}-${counter}-${SITE_CONFIG.locationSuffix}`;
      } else {
        // Append counter: slug -> slug-1
        slug = `${baseSlug}-${counter}`;
      }
      
      isUnique = await checkUniqueness(slug);
      counter++;
    }
    
    if (counter >= 100) {
      throw new Error('Could not generate unique slug after 100 attempts');
    }
    
    return slug;
  }

  /**
   * Get canonical URL for product
   */
  getCanonicalURL(product: any): string {
    const slug = product.slug || product._id || product.id;
    return `${SITE_CONFIG.baseUrl}/products/${slug}`;
  }

  /**
   * Get canonical URL for blog post
   */
  getBlogCanonicalURL(blog: any): string {
    const slug = blog.slug || blog._id || blog.id;
    return `${SITE_CONFIG.baseUrl}/blogs/${slug}`;
  }

  /**
   * Get canonical URL for category
   */
  getCategoryCanonicalURL(category: any, subcategory?: any): string {
    const categoryId = category._id || category.id;
    let url = `${SITE_CONFIG.baseUrl}/products?category=${categoryId}`;
    
    if (subcategory) {
      const subcategoryId = subcategory._id || subcategory.id;
      url += `&subcategory=${subcategoryId}`;
    }
    
    return url;
  }

  /**
   * Create redirect mapping for changed URLs
   * Note: Actual implementation will store in database
   */
  async createRedirect(
    oldURL: string,
    newURL: string,
    permanent: boolean = true
  ): Promise<void> {
    // This should store redirect in database
    // For now, just log it
    console.log(`Redirect: ${oldURL} -> ${newURL} (${permanent ? '301' : '302'})`);
    
    // Implementation will be in Phase 6 with URLRedirect model
  }

  /**
   * Generate slug from product data with all enhancements
   */
  generateProductSlug(product: any): string {
    const categoryName = product.categoryId?.name || product.category;
    const subcategoryName = product.subcategoryId?.name || product.subcategory;
    
    // Use subcategory if available, otherwise use category
    const contextCategory = subcategoryName || categoryName;
    
    return this.generateSlug(product.name, {
      includeCategory: false,      // Name usually includes category info
      includeLocation: true,       // Always include Biratnagar
      includeDualKeyword: true,    // Use dual keywords
      maxLength: 80,               // Leave room for counter if needed
      categoryName: contextCategory,
    });
  }

  /**
   * Batch update product slugs
   * This is a helper for migration scripts
   */
  async batchUpdateSlugs(
    products: any[],
    checkUniqueness: (slug: string, excludeId?: string) => Promise<boolean>
  ): Promise<UpdateResult> {
    const result: UpdateResult = {
      success: true,
      updated: 0,
      skipped: 0,
      errors: [],
    };
    
    for (const product of products) {
      try {
        // Skip if product already has a good slug
        if (product.slug && product.slug.includes(SITE_CONFIG.locationSuffix)) {
          result.skipped++;
          continue;
        }
        
        // Generate new slug
        const baseSlug = this.generateProductSlug(product);
        
        // Make it unique
        const uniqueSlug = await this.generateUniqueSlug(
          baseSlug,
          (slug) => checkUniqueness(slug, product._id || product.id),
          product._id || product.id
        );
        
        // Store old slug for redirect if it exists
        if (product.slug && product.slug !== uniqueSlug) {
          await this.createRedirect(
            `/products/${product.slug}`,
            `/products/${uniqueSlug}`,
            true
          );
        }
        
        // Update would happen here in actual implementation
        // product.slug = uniqueSlug;
        // await product.save();
        
        result.updated++;
      } catch (error) {
        result.errors.push(`Error updating ${product.name}: ${error}`);
        result.success = false;
      }
    }
    
    return result;
  }

  /**
   * Validate URL format
   */
  validateURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Extract slug from full URL
   */
  extractSlug(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      return pathParts[pathParts.length - 1] || null;
    } catch {
      // If not a full URL, assume it's already a slug
      return url;
    }
  }

  /**
   * Generate slug variations for testing
   */
  generateSlugVariations(productName: string): string[] {
    const variations: string[] = [];
    
    // Basic slug
    variations.push(this.generateSlug(productName, {
      includeLocation: false,
      includeDualKeyword: false,
    }));
    
    // With location
    variations.push(this.generateSlug(productName, {
      includeLocation: true,
      includeDualKeyword: false,
    }));
    
    // With dual keywords (need category context)
    variations.push(this.generateSlug(productName, {
      includeLocation: true,
      includeDualKeyword: true,
      categoryName: 'storage',
    }));
    
    return variations;
  }

  /**
   * Check if slug meets SEO best practices
   */
  validateSlugSEO(slug: string): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    if (!slug) {
      issues.push('Slug is empty');
      return { valid: false, issues };
    }
    
    // Length check
    if (slug.length < 10) {
      issues.push('Slug is too short (< 10 chars). Longer slugs are more descriptive.');
    }
    if (slug.length > 100) {
      issues.push('Slug is too long (> 100 chars). Shorter slugs are preferred.');
    }
    
    // Hyphen check
    if (!slug.includes('-')) {
      issues.push('Slug should contain hyphens for readability');
    }
    
    // Location check
    if (!slug.includes(SITE_CONFIG.locationSuffix)) {
      issues.push(`Slug should include location keyword "${SITE_CONFIG.locationSuffix}"`);
    }
    
    // Special characters check
    if (/[^a-z0-9-]/.test(slug)) {
      issues.push('Slug contains invalid characters. Use only lowercase letters, numbers, and hyphens.');
    }
    
    // Consecutive hyphens
    if (/--+/.test(slug)) {
      issues.push('Slug contains consecutive hyphens');
    }
    
    // Leading/trailing hyphens
    if (slug.startsWith('-') || slug.endsWith('-')) {
      issues.push('Slug should not start or end with hyphen');
    }
    
    return {
      valid: issues.length === 0,
      issues,
    };
  }
}

// Export singleton instance
export const urlManager = new URLManager();

// Export class for testing
export default URLManager;
