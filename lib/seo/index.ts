/**
 * SEO Services Exports
 * 
 * Centralized export point for all SEO utilities
 */

export { dualKeywordManager, KEYWORD_PAIRS } from './dualKeywordManager';
export type { KeywordPair } from './dualKeywordManager';

export { metadataGenerator } from './metadataGenerator';
export type {
  SEOMetadata,
  OpenGraphMetadata,
  TwitterMetadata,
  AlternateMetadata,
  RobotsMetadata,
  ValidationResult,
} from './metadataGenerator';

export { urlManager } from './urlManager';
export type { SlugOptions, UpdateResult } from './urlManager';

export { schemaGenerator } from './schemaGenerator';
export type { Breadcrumb, FAQ } from './schemaGenerator';

export { contentEnricher } from './contentEnricher';
export type {
  ContentQualityReport,
  ProductData,
  EnrichmentOptions,
} from './contentEnricher';

// Re-export enhanced ImageService methods
// Note: ImageService is in services/ directory, not lib/seo/
// Import it separately: import ImageService from '@/services/imageService';
