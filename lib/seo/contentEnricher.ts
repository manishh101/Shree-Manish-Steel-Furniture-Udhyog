/**
 * Content Enrichment Service
 * 
 * Enriches product descriptions with:
 * - Dual keywords (formal/colloquial terms)
 * - Local service area mentions
 * - Material details
 * - Warranty information
 * - SEO-optimized content structure
 */

import { dualKeywordManager, KeywordPair } from './dualKeywordManager';

export interface ContentQualityReport {
  wordCount: number;
  keywordDensity: { [keyword: string]: number };
  readabilityScore: number;
  issues: string[];
  suggestions: string[];
  hasLocalMentions: boolean;
  hasMaterialInfo: boolean;
  hasWarrantyInfo: boolean;
}

export interface ProductData {
  name: string;
  category?: string;
  subcategory?: string;
  specifications?: {
    material?: string;
    dimensions?: string;
    guarantee?: string;
    brand?: string;
    [key: string]: any;
  };
  deliveryInformation?: {
    availableLocations?: string[];
    estimatedDelivery?: string;
    shippingCost?: string;
  };
}

export interface EnrichmentOptions {
  minWordCount?: number;
  includeLocalAreas?: boolean;
  includeMaterial?: boolean;
  includeWarranty?: boolean;
  includeDelivery?: boolean;
  tone?: 'professional' | 'friendly' | 'technical';
}

class ContentEnricher {
  private readonly LOCAL_AREAS = ['Biratnagar', 'Dharan', 'Itahari', 'Morang'];
  private readonly DEFAULT_WARRANTY = '5-year warranty';
  private readonly DEFAULT_DELIVERY = 'Free delivery and installation';

  /**
   * Enrich existing product description with dual keywords and additional content
   */
  enrichProductDescription(
    currentDescription: string,
    product: ProductData,
    options: EnrichmentOptions = {}
  ): string {
    const {
      minWordCount = 150,
      includeLocalAreas = true,
      includeMaterial = true,
      includeWarranty = true,
      includeDelivery = true,
      tone = 'professional'
    } = options;

    let enriched = currentDescription || '';
    const currentWordCount = this.countWords(enriched);

    // If content is already adequate and has keywords, just enhance lightly
    if (currentWordCount >= minWordCount) {
      enriched = dualKeywordManager.enrichContent(enriched);
      return enriched;
    }

    // Build comprehensive enriched description
    const sections: string[] = [];

    // 1. Opening paragraph with dual keywords
    const opening = this.generateOpening(product, tone);
    sections.push(opening);

    // 2. Current description (if exists)
    if (enriched.trim()) {
      sections.push(enriched);
    }

    // 3. Material and construction details
    if (includeMaterial && product.specifications?.material) {
      sections.push(this.generateMaterialSection(product));
    }

    // 4. Dimensions and specifications
    if (product.specifications?.dimensions) {
      sections.push(this.generateSpecificationsSection(product));
    }

    // 5. Warranty information
    if (includeWarranty) {
      sections.push(this.generateWarrantySection(product));
    }

    // 6. Delivery and service areas
    if (includeDelivery && includeLocalAreas) {
      sections.push(this.generateDeliverySection(product));
    }

    // Join sections and apply dual keyword enrichment
    enriched = sections.filter(s => s.trim()).join('\n\n');
    enriched = dualKeywordManager.enrichContent(enriched);

    return enriched;
  }

  /**
   * Generate opening paragraph with product introduction and dual keywords
   */
  private generateOpening(product: ProductData, tone: 'professional' | 'friendly' | 'technical'): string {
    const category = product.category?.toLowerCase() || 'furniture';
    const relevantPairs = dualKeywordManager.getKeywordPairs(category);
    
    // Find the most relevant keyword pair for this product
    const mainPair = this.findRelevantKeywordPair(product.name, relevantPairs);

    let opening = '';

    if (category.includes('storage') || product.name.toLowerCase().includes('almirah')) {
      if (tone === 'friendly') {
        opening = `This premium steel furniture piece offers exceptional storage and organization for your space. Designed and manufactured in Biratnagar, Nepal, it combines durability with practical functionality.`;
      } else {
        opening = `Premium steel storage solution designed for modern homes and offices. Manufactured at our facility in Biratnagar with high-quality materials and precision craftsmanship.`;
      }
    } else if (category.includes('bedroom') || product.name.toLowerCase().includes('bed')) {
      opening = `Durable steel furniture built to provide reliable comfort and support. Made with heavy-duty steel frame construction, this piece is perfect for residential and institutional use in Biratnagar and surrounding areas.`;
    } else if (category.includes('office') || product.name.toLowerCase().includes('table') || product.name.toLowerCase().includes('desk')) {
      opening = `Professional furniture solution designed for productivity and comfort. Manufactured with quality steel and finished to perfection, ideal for offices, schools, and homes across Province 1.`;
    } else {
      opening = `Quality steel furniture manufactured in Biratnagar, Nepal. Built with premium materials and expert craftsmanship to ensure long-lasting performance and reliability.`;
    }

    return opening;
  }

  /**
   * Generate material and construction details section
   */
  private generateMaterialSection(product: ProductData): string {
    const material = product.specifications?.material || 'Premium steel';
    const brand = product.specifications?.brand || 'Shree Manish Steel';

    return `Constructed from ${material.toLowerCase()}, this furniture features rust-resistant powder coating that withstands Nepal's humid climate. The steel construction ensures termite-proof durability, unlike traditional wooden furniture. Each piece is carefully manufactured at ${brand} facility with quality control at every stage.`;
  }

  /**
   * Generate specifications section
   */
  private generateSpecificationsSection(product: ProductData): string {
    const specs = product.specifications || {};
    const parts: string[] = [];

    if (specs.dimensions) {
      parts.push(`Dimensions: ${specs.dimensions}`);
    }

    if (specs.noOfDoors) {
      parts.push(`${specs.noOfDoors} door configuration`);
    }

    if (specs.modelType) {
      parts.push(`${specs.modelType} model`);
    }

    if (parts.length > 0) {
      return `Product specifications: ${parts.join(', ')}. Designed for optimal space utilization and easy assembly.`;
    }

    return '';
  }

  /**
   * Generate warranty section
   */
  private generateWarrantySection(product: ProductData): string {
    const warranty = product.specifications?.guarantee || this.DEFAULT_WARRANTY;
    
    return `Backed by our ${warranty} covering manufacturing defects. We stand behind the quality of our products with reliable after-sales support in the Biratnagar region.`;
  }

  /**
   * Generate delivery and service area section
   */
  private generateDeliverySection(product: ProductData): string {
    const locations = product.deliveryInformation?.availableLocations || this.LOCAL_AREAS;
    const delivery = product.deliveryInformation?.shippingCost || this.DEFAULT_DELIVERY;
    
    const locationText = locations.slice(0, 3).join(', ');
    
    return `${delivery} available in ${locationText} and surrounding Morang district areas. Professional installation service included to ensure proper setup.`;
  }

  /**
   * Find the most relevant keyword pair for a product name
   */
  private findRelevantKeywordPair(productName: string, pairs: KeywordPair[]): KeywordPair | null {
    const nameLower = productName.toLowerCase();
    
    for (const pair of pairs) {
      if (nameLower.includes(pair.formal.toLowerCase()) || 
          nameLower.includes(pair.colloquial.toLowerCase())) {
        return pair;
      }
    }
    
    return pairs.length > 0 ? pairs[0] : null;
  }

  /**
   * Generate content template for a specific category
   */
  generateCategoryTemplate(category: string, subcategory?: string): string {
    const categoryLower = category.toLowerCase();
    
    const templates: { [key: string]: string } = {
      storage: this.getStorageTemplate(),
      bedroom: this.getBedroomTemplate(),
      office: this.getOfficeTemplate(),
      furniture: this.getGeneralTemplate(),
    };

    // Find matching template
    for (const [key, template] of Object.entries(templates)) {
      if (categoryLower.includes(key)) {
        return template;
      }
    }

    return this.getGeneralTemplate();
  }

  /**
   * Storage furniture template (Almirahs, Wardrobes, Cupboards)
   */
  private getStorageTemplate(): string {
    return `[Opening with dual keyword - Premium steel storage solution]

Key Features:
- Multiple compartments for organized storage
- Rust-resistant powder-coated finish
- Secure locking system for valuables
- Termite-proof steel construction

[Material info - High-grade steel with reinforced panels]

[Specifications - Dimensions, doors, shelves]

[Warranty - 5-year warranty on manufacturing defects]

[Delivery - Available in Biratnagar, Dharan, Itahari with free installation]`;
  }

  /**
   * Bedroom furniture template (Beds)
   */
  private getBedroomTemplate(): string {
    return `[Opening - Durable steel bed frame for comfort]

Key Features:
- Heavy-duty steel frame construction
- High weight capacity
- Scratch-resistant powder coating
- Easy assembly design

[Material - Premium steel, rust-proof finish]

[Specifications - Dimensions, weight capacity]

[Climate advantage - Perfect for Terai humidity, termite-proof]

[Delivery - Free delivery in Biratnagar, Dharan, Itahari areas]`;
  }

  /**
   * Office furniture template (Tables, Desks)
   */
  private getOfficeTemplate(): string {
    return `[Opening - Professional office furniture for productivity]

Key Features:
- Ergonomic design for comfort
- Spacious work surface
- Durable steel construction
- Modern professional finish

[Material - Quality steel frame with smooth surface]

[Specifications - Dimensions, storage options]

[Bulk orders - Special rates for institutional orders]

[Delivery - Available in Biratnagar and Morang district]`;
  }

  /**
   * General furniture template
   */
  private getGeneralTemplate(): string {
    return `[Opening - Quality steel furniture from Biratnagar]

Key Features:
- Premium steel construction
- Rust-resistant finish
- Long-lasting durability
- Professional manufacturing

[Material and construction details]

[Specifications]

[Warranty information]

[Delivery - Biratnagar, Dharan, Itahari with free installation]`;
  }

  /**
   * Validate content quality
   */
  validateContentQuality(content: string, targetKeywords: string[] = []): ContentQualityReport {
    const wordCount = this.countWords(content);
    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check word count
    if (wordCount < 150) {
      issues.push(`Content is too short (${wordCount} words). Target: 150+ words.`);
      suggestions.push('Add more detail about features, materials, or benefits.');
    } else if (wordCount > 500) {
      issues.push(`Content might be too long (${wordCount} words). Consider condensing.`);
    }

    // Calculate keyword density
    const keywordDensity: { [keyword: string]: number } = {};
    targetKeywords.forEach(keyword => {
      const density = this.calculateKeywordDensity(content, keyword);
      keywordDensity[keyword] = density;

      if (density > 4) {
        issues.push(`Keyword "${keyword}" density too high (${density.toFixed(1)}%). Risk of keyword stuffing.`);
      } else if (density < 1 && wordCount >= 150) {
        suggestions.push(`Consider adding keyword "${keyword}" (current: ${density.toFixed(1)}%).`);
      }
    });

    // Check for local mentions
    const hasLocalMentions = this.LOCAL_AREAS.some(area => 
      content.toLowerCase().includes(area.toLowerCase())
    );
    if (!hasLocalMentions) {
      issues.push('Missing local area mentions (Biratnagar, Dharan, Itahari).');
      suggestions.push('Add delivery or availability information with local cities.');
    }

    // Check for material information
    const hasMaterialInfo = /steel|metal|iron|wood|material/i.test(content);
    if (!hasMaterialInfo && wordCount >= 150) {
      suggestions.push('Consider adding material or construction details.');
    }

    // Check for warranty information
    const hasWarrantyInfo = /warranty|guarantee|year/i.test(content);
    if (!hasWarrantyInfo && wordCount >= 150) {
      suggestions.push('Consider mentioning warranty or quality guarantee.');
    }

    // Simple readability score (Flesch Reading Ease approximation)
    const readabilityScore = this.calculateReadability(content);

    return {
      wordCount,
      keywordDensity,
      readabilityScore,
      issues,
      suggestions,
      hasLocalMentions,
      hasMaterialInfo,
      hasWarrantyInfo
    };
  }

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Calculate keyword density as percentage
   */
  private calculateKeywordDensity(content: string, keyword: string): number {
    if (!content || !keyword) return 0;

    const words = this.countWords(content);
    if (words === 0) return 0;

    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = content.match(regex);
    const count = matches ? matches.length : 0;

    return (count / words) * 100;
  }

  /**
   * Calculate simple readability score
   * Higher is better (0-100 scale)
   */
  private calculateReadability(content: string): number {
    if (!content) return 0;

    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const words = this.countWords(content);
    const syllables = this.estimateSyllables(content);

    if (sentences === 0 || words === 0) return 0;

    // Simplified Flesch Reading Ease formula
    const avgWordsPerSentence = words / sentences;
    const avgSyllablesPerWord = syllables / words;

    const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);

    // Clamp between 0 and 100
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Estimate syllable count (simplified)
   */
  private estimateSyllables(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    let count = 0;

    words.forEach(word => {
      // Simple syllable estimation
      word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
      word = word.replace(/^y/, '');
      const matches = word.match(/[aeiouy]{1,2}/g);
      count += matches ? matches.length : 1;
    });

    return count;
  }

  /**
   * Ensure content is unique (check against template duplication)
   */
  ensureUniqueness(content: string): { isUnique: boolean; similarity: number } {
    const templates = [
      this.getStorageTemplate(),
      this.getBedroomTemplate(),
      this.getOfficeTemplate(),
      this.getGeneralTemplate()
    ];

    let maxSimilarity = 0;

    templates.forEach(template => {
      const similarity = this.calculateSimilarity(content, template);
      maxSimilarity = Math.max(maxSimilarity, similarity);
    });

    return {
      isUnique: maxSimilarity < 0.7, // Less than 70% similar is considered unique
      similarity: maxSimilarity
    };
  }

  /**
   * Calculate similarity between two texts (0-1 scale)
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }
}

// Export singleton instance
export const contentEnricher = new ContentEnricher();

// Export class for testing
export default ContentEnricher;
