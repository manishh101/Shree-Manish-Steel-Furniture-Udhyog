/**
 * Dual-Keyword Strategy Manager
 * 
 * Manages formal/colloquial keyword pairs for Nepal market SEO optimization.
 * Example: "almirah" (formal) vs "daraj" (colloquial)
 * 
 * Purpose: Nepali customers search using both formal English terms and 
 * colloquial Nepali-English terms. This service ensures both are naturally
 * integrated across product titles, descriptions, URLs, and alt text.
 */

export interface KeywordPair {
  formal: string;        // e.g., "almirah"
  colloquial: string;    // e.g., "daraj"
  category: string;      // e.g., "storage"
  priority: 'high' | 'medium' | 'low';
  usage: {
    titles: boolean;     // Use in product titles
    urls: boolean;       // Use in URL slugs
    altText: boolean;    // Use in image alt text
    content: boolean;    // Use in descriptions
  };
}

// Master keyword pairs based on Nepal market research
export const KEYWORD_PAIRS: KeywordPair[] = [
  // Storage Furniture (Highest Priority)
  {
    formal: 'almirah',
    colloquial: 'daraj',
    category: 'storage',
    priority: 'high',
    usage: { titles: true, urls: true, altText: true, content: true }
  },
  {
    formal: 'wardrobe',
    colloquial: 'kapada rakhne',
    category: 'storage',
    priority: 'high',
    usage: { titles: true, urls: true, altText: true, content: true }
  },
  {
    formal: 'cupboard',
    colloquial: 'daraz',
    category: 'storage',
    priority: 'medium',
    usage: { titles: true, urls: true, altText: true, content: true }
  },
  {
    formal: 'cabinet',
    colloquial: 'almirah',
    category: 'storage',
    priority: 'medium',
    usage: { titles: false, urls: true, altText: true, content: true }
  },
  
  // Powder Coated Furniture
  {
    formal: 'powder coated',
    colloquial: 'powder coating',
    category: 'finish',
    priority: 'high',
    usage: { titles: true, urls: true, altText: true, content: true }
  },
  
  // Office & Study Furniture
  {
    formal: 'study table',
    colloquial: 'padhne table',
    category: 'furniture',
    priority: 'medium',
    usage: { titles: true, urls: false, altText: true, content: true }
  },
  {
    formal: 'desk',
    colloquial: 'table',
    category: 'furniture',
    priority: 'medium',
    usage: { titles: false, urls: true, altText: true, content: true }
  },
  {
    formal: 'office chair',
    colloquial: 'chair',
    category: 'furniture',
    priority: 'medium',
    usage: { titles: false, urls: true, altText: true, content: true }
  },
  
  // Security Furniture
  {
    formal: 'locker',
    colloquial: 'tala wala daraj',
    category: 'security',
    priority: 'medium',
    usage: { titles: false, urls: false, altText: true, content: true }
  },
  {
    formal: 'safe',
    colloquial: 'locker',
    category: 'security',
    priority: 'medium',
    usage: { titles: false, urls: true, altText: true, content: true }
  },
  
  // Storage Solutions
  {
    formal: 'rack',
    colloquial: 'rack',
    category: 'storage',
    priority: 'low',
    usage: { titles: true, urls: true, altText: true, content: true }
  },
  {
    formal: 'shelf',
    colloquial: 'rack',
    category: 'storage',
    priority: 'low',
    usage: { titles: false, urls: true, altText: true, content: true }
  },
  {
    formal: 'bookshelf',
    colloquial: 'kitab rakhne',
    category: 'storage',
    priority: 'low',
    usage: { titles: false, urls: false, altText: true, content: true }
  },
];

/**
 * Dual-Keyword Manager Service
 */
class DualKeywordManager {
  /**
   * Get all keyword pairs for a specific category
   */
  getKeywordPairs(category: string): KeywordPair[] {
    return KEYWORD_PAIRS.filter(
      pair => pair.category.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Get high priority keyword pairs
   */
  getHighPriorityPairs(): KeywordPair[] {
    return KEYWORD_PAIRS.filter(pair => pair.priority === 'high');
  }

  /**
   * Find keyword pair by formal or colloquial term
   */
  findPair(term: string): KeywordPair | undefined {
    const searchTerm = term.toLowerCase();
    return KEYWORD_PAIRS.find(
      pair => pair.formal.toLowerCase() === searchTerm || 
              pair.colloquial.toLowerCase() === searchTerm
    );
  }

  /**
   * Get all variations of a keyword (formal + colloquial)
   */
  getKeywordVariations(baseKeyword: string): string[] {
    const variations = new Set<string>();
    const searchTerm = baseKeyword.toLowerCase();
    
    KEYWORD_PAIRS.forEach(pair => {
      if (pair.formal.toLowerCase().includes(searchTerm) || 
          pair.colloquial.toLowerCase().includes(searchTerm)) {
        variations.add(pair.formal);
        variations.add(pair.colloquial);
      }
    });
    
    return Array.from(variations);
  }

  /**
   * Enrich content with dual keywords naturally
   * Detects formal terms and adds colloquial equivalent nearby
   */
  enrichContent(content: string, pairs?: KeywordPair[]): string {
    if (!content) return content;
    
    const pairsToUse = pairs || KEYWORD_PAIRS.filter(p => p.usage.content);
    let enriched = content;
    
    // Track which pairs we've already used to avoid over-optimization
    const usedPairs = new Set<string>();
    
    pairsToUse.forEach(pair => {
      // Only enrich high priority pairs to avoid keyword stuffing
      if (pair.priority !== 'high') return;
      
      const pairKey = `${pair.formal}-${pair.colloquial}`;
      if (usedPairs.has(pairKey)) return;
      
      // Case-insensitive search for formal term
      const regex = new RegExp(`\\b${pair.formal}\\b`, 'gi');
      const matches = enriched.match(regex);
      
      if (matches && matches.length > 0) {
        // Add colloquial term in parentheses after first occurrence only
        enriched = enriched.replace(
          regex,
          (match, offset) => {
            // Only replace first occurrence
            if (offset === enriched.search(regex)) {
              usedPairs.add(pairKey);
              return `${match} (${pair.colloquial})`;
            }
            return match;
          }
        );
      }
    });
    
    return enriched;
  }

  /**
   * Generate URL-friendly slug with dual keywords
   * Example: "Steel Almirah 72 Inch" -> "steel-almirah-daraj-72-inch-biratnagar"
   */
  generateDualKeywordSlug(productName: string, category?: string): string {
    let slug = productName.toLowerCase().trim();
    
    // Find relevant keyword pairs
    const relevantPairs = category 
      ? this.getKeywordPairs(category).filter(p => p.usage.urls)
      : KEYWORD_PAIRS.filter(p => p.usage.urls && p.priority === 'high');
    
    // Add colloquial term if formal term is in the name
    relevantPairs.forEach(pair => {
      const formalRegex = new RegExp(`\\b${pair.formal}\\b`, 'i');
      if (formalRegex.test(slug) && !slug.includes(pair.colloquial.toLowerCase())) {
        // Insert colloquial term after formal term
        slug = slug.replace(formalRegex, `${pair.formal} ${pair.colloquial}`);
      }
    });
    
    // Clean up and format
    slug = slug
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_]+/g, '-')   // Replace spaces with hyphens
      .replace(/-+/g, '-')       // Remove duplicate hyphens
      .replace(/^-|-$/g, '');    // Trim hyphens from ends
    
    // Add location suffix if not present
    if (!slug.includes('biratnagar')) {
      slug = `${slug}-biratnagar`;
    }
    
    return slug;
  }

  /**
   * Generate keyword-rich alt text with dual terms
   */
  generateAltText(
    productName: string,
    category: string,
    options: { includeLocation?: boolean; includeMaterial?: boolean } = {}
  ): string {
    const parts: string[] = [];
    
    // Add product name with enrichment
    const enrichedName = this.enrichContent(productName);
    parts.push(enrichedName);
    
    // Add category
    if (category) {
      parts.push(category);
    }
    
    // Add material if specified
    if (options.includeMaterial) {
      parts.push('Steel Furniture');
    }
    
    // Add location if specified (default true)
    if (options.includeLocation !== false) {
      parts.push('Biratnagar Nepal');
    }
    
    return parts.join(' | ');
  }

  /**
   * Validate keyword density (avoid over-optimization)
   * Returns true if density is acceptable (2-4%)
   */
  validateKeywordDensity(content: string, keyword: string): boolean {
    if (!content || !keyword) return false;
    
    const words = content.split(/\s+/).length;
    const keywordRegex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = content.match(keywordRegex);
    const count = matches ? matches.length : 0;
    
    const density = (count / words) * 100;
    
    // Ideal density: 2-4%
    return density >= 2 && density <= 4;
  }

  /**
   * Get SEO-friendly product title with dual keywords
   */
  generateSEOTitle(
    productName: string,
    category: string,
    options: { includeLocation?: boolean; maxLength?: number } = {}
  ): string {
    const maxLength = options.maxLength || 60;
    
    // Enrich with dual keywords
    let title = this.enrichContent(productName);
    
    // Add category if not already in name
    if (!title.toLowerCase().includes(category.toLowerCase())) {
      title = `${title} - ${category}`;
    }
    
    // Add location if specified and space allows
    if (options.includeLocation !== false) {
      const withLocation = `${title} | Biratnagar Nepal`;
      if (withLocation.length <= maxLength) {
        title = withLocation;
      } else {
        // Try shorter version
        const withShortLocation = `${title} | Biratnagar`;
        if (withShortLocation.length <= maxLength) {
          title = withShortLocation;
        }
      }
    }
    
    // Truncate if still too long
    if (title.length > maxLength) {
      title = title.substring(0, maxLength - 3) + '...';
    }
    
    return title;
  }

  /**
   * Export keyword pairs for external use (marketing, social media)
   */
  exportKeywordPairs(): { formal: string; colloquial: string }[] {
    return KEYWORD_PAIRS.map(pair => ({
      formal: pair.formal,
      colloquial: pair.colloquial
    }));
  }
}

// Export singleton instance
export const dualKeywordManager = new DualKeywordManager();

// Export class for testing
export default DualKeywordManager;
