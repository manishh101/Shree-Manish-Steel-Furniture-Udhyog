/**
 * Schema.org Validation Utility
 * Validates structured data markup against schema.org specifications
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  schemaType: string;
}

export interface SchemaValidationReport {
  totalSchemas: number;
  validSchemas: number;
  invalidSchemas: number;
  results: Array<{
    url: string;
    schemaType: string;
    valid: boolean;
    errors: string[];
    warnings: string[];
  }>;
}

/**
 * Validate LocalBusiness schema
 */
export function validateLocalBusinessSchema(schema: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!schema['@context'] || schema['@context'] !== 'https://schema.org') {
    errors.push('Missing or invalid @context');
  }
  if (!schema['@type'] || (schema['@type'] !== 'LocalBusiness' && schema['@type'] !== 'FurnitureStore')) {
    errors.push('Missing or invalid @type (should be LocalBusiness or FurnitureStore)');
  }
  if (!schema.name) {
    errors.push('Missing required field: name');
  }
  if (!schema.address || typeof schema.address !== 'object') {
    errors.push('Missing or invalid required field: address');
  } else {
    if (!schema.address.streetAddress) warnings.push('Missing address.streetAddress');
    if (!schema.address.addressLocality) warnings.push('Missing address.addressLocality');
    if (!schema.address.addressCountry) warnings.push('Missing address.addressCountry');
  }

  // Recommended fields
  if (!schema.telephone) warnings.push('Missing recommended field: telephone');
  if (!schema.url) warnings.push('Missing recommended field: url');
  if (!schema.geo) {
    warnings.push('Missing recommended field: geo (GeoCoordinates)');
  } else {
    if (!schema.geo.latitude) warnings.push('Missing geo.latitude');
    if (!schema.geo.longitude) warnings.push('Missing geo.longitude');
  }
  if (!schema.openingHoursSpecification) {
    warnings.push('Missing recommended field: openingHoursSpecification');
  }
  if (!schema.priceRange) warnings.push('Missing recommended field: priceRange');

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    schemaType: 'LocalBusiness',
  };
}

/**
 * Validate Product schema
 */
export function validateProductSchema(schema: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!schema['@context']) {
    errors.push('Missing @context');
  }
  if (!schema['@type'] || schema['@type'] !== 'Product') {
    errors.push('Missing or invalid @type (should be Product)');
  }
  if (!schema.name) {
    errors.push('Missing required field: name');
  }
  if (!schema.image && !schema.images) {
    errors.push('Missing required field: image or images');
  }
  if (!schema.description) {
    errors.push('Missing required field: description');
  }

  // Offers validation
  if (!schema.offers) {
    warnings.push('Missing recommended field: offers');
  } else {
    if (!schema.offers.price && schema.offers.price !== 0) {
      warnings.push('Missing offers.price');
    }
    if (!schema.offers.priceCurrency) {
      warnings.push('Missing offers.priceCurrency');
    }
    if (!schema.offers.availability) {
      warnings.push('Missing offers.availability');
    }
  }

  // Brand
  if (!schema.brand) {
    warnings.push('Missing recommended field: brand');
  }

  // SKU/identifiers
  if (!schema.sku && !schema.mpn && !schema.gtin) {
    warnings.push('Missing product identifier (sku, mpn, or gtin)');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    schemaType: 'Product',
  };
}

/**
 * Validate Article schema
 */
export function validateArticleSchema(schema: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!schema['@context']) {
    errors.push('Missing @context');
  }
  if (!schema['@type'] || !['Article', 'BlogPosting', 'NewsArticle'].includes(schema['@type'])) {
    errors.push('Missing or invalid @type (should be Article, BlogPosting, or NewsArticle)');
  }
  if (!schema.headline) {
    errors.push('Missing required field: headline');
  }
  if (!schema.author) {
    errors.push('Missing required field: author');
  }
  if (!schema.datePublished) {
    errors.push('Missing required field: datePublished');
  }

  // Recommended fields
  if (!schema.image) {
    warnings.push('Missing recommended field: image');
  }
  if (!schema.publisher) {
    warnings.push('Missing recommended field: publisher');
  }
  if (!schema.dateModified) {
    warnings.push('Missing recommended field: dateModified');
  }
  if (!schema.description) {
    warnings.push('Missing recommended field: description');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    schemaType: 'Article',
  };
}

/**
 * Validate BreadcrumbList schema
 */
export function validateBreadcrumbSchema(schema: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!schema['@context']) {
    errors.push('Missing @context');
  }
  if (!schema['@type'] || schema['@type'] !== 'BreadcrumbList') {
    errors.push('Missing or invalid @type (should be BreadcrumbList)');
  }
  if (!schema.itemListElement || !Array.isArray(schema.itemListElement)) {
    errors.push('Missing or invalid itemListElement (should be array)');
  } else {
    schema.itemListElement.forEach((item: any, index: number) => {
      if (!item['@type'] || item['@type'] !== 'ListItem') {
        errors.push(`Item ${index + 1}: Missing or invalid @type (should be ListItem)`);
      }
      if (item.position === undefined) {
        errors.push(`Item ${index + 1}: Missing required field: position`);
      }
      if (!item.name) {
        errors.push(`Item ${index + 1}: Missing required field: name`);
      }
      // Last item doesn't need 'item' field
      if (index < schema.itemListElement.length - 1 && !item.item) {
        warnings.push(`Item ${index + 1}: Missing item URL (recommended for non-last items)`);
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    schemaType: 'BreadcrumbList',
  };
}

/**
 * Validate FAQPage schema
 */
export function validateFAQSchema(schema: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!schema['@context']) {
    errors.push('Missing @context');
  }
  if (!schema['@type'] || schema['@type'] !== 'FAQPage') {
    errors.push('Missing or invalid @type (should be FAQPage)');
  }
  if (!schema.mainEntity || !Array.isArray(schema.mainEntity)) {
    errors.push('Missing or invalid mainEntity (should be array of Questions)');
  } else {
    schema.mainEntity.forEach((question: any, index: number) => {
      if (!question['@type'] || question['@type'] !== 'Question') {
        errors.push(`Question ${index + 1}: Missing or invalid @type (should be Question)`);
      }
      if (!question.name) {
        errors.push(`Question ${index + 1}: Missing required field: name`);
      }
      if (!question.acceptedAnswer) {
        errors.push(`Question ${index + 1}: Missing required field: acceptedAnswer`);
      } else {
        if (!question.acceptedAnswer['@type'] || question.acceptedAnswer['@type'] !== 'Answer') {
          errors.push(`Question ${index + 1}: acceptedAnswer missing or invalid @type (should be Answer)`);
        }
        if (!question.acceptedAnswer.text) {
          errors.push(`Question ${index + 1}: acceptedAnswer missing required field: text`);
        }
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    schemaType: 'FAQPage',
  };
}

/**
 * Automatically detect and validate schema type
 */
export function validateSchema(schema: any): ValidationResult {
  const schemaType = schema['@type'];

  switch (schemaType) {
    case 'LocalBusiness':
    case 'FurnitureStore':
      return validateLocalBusinessSchema(schema);
    case 'Product':
      return validateProductSchema(schema);
    case 'Article':
    case 'BlogPosting':
    case 'NewsArticle':
      return validateArticleSchema(schema);
    case 'BreadcrumbList':
      return validateBreadcrumbSchema(schema);
    case 'FAQPage':
      return validateFAQSchema(schema);
    default:
      return {
        valid: false,
        errors: [`Unknown or unsupported schema type: ${schemaType}`],
        warnings: [],
        schemaType: schemaType || 'Unknown',
      };
  }
}

/**
 * Extract and validate all schemas from a page HTML
 */
export function validatePageSchemas(html: string, url: string): SchemaValidationReport {
  const results: SchemaValidationReport['results'] = [];
  
  // Extract all JSON-LD scripts
  const scriptRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  
  while ((match = scriptRegex.exec(html)) !== null) {
    try {
      const schemaJson = match[1].trim();
      const schema = JSON.parse(schemaJson);
      
      const validation = validateSchema(schema);
      
      results.push({
        url,
        schemaType: validation.schemaType,
        valid: validation.valid,
        errors: validation.errors,
        warnings: validation.warnings,
      });
    } catch (error) {
      results.push({
        url,
        schemaType: 'Unknown',
        valid: false,
        errors: ['Failed to parse JSON-LD: ' + (error instanceof Error ? error.message : 'Unknown error')],
        warnings: [],
      });
    }
  }
  
  const validSchemas = results.filter(r => r.valid).length;
  
  return {
    totalSchemas: results.length,
    validSchemas,
    invalidSchemas: results.length - validSchemas,
    results,
  };
}

/**
 * Test schema against Google Rich Results Test API
 * Note: This is a simplified version - actual Google API requires authentication
 */
export async function testWithGoogleRichResults(url: string): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    // In a real implementation, you would call the actual Google Rich Results API
    // For now, we'll just validate the structure locally
    const response = await fetch(url);
    const html = await response.text();
    const report = validatePageSchemas(html, url);
    
    return {
      success: report.invalidSchemas === 0,
      message: report.invalidSchemas === 0 
        ? `All ${report.totalSchemas} schemas are valid`
        : `${report.invalidSchemas} of ${report.totalSchemas} schemas have errors`,
      details: report,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to test schema: ' + (error instanceof Error ? error.message : 'Unknown error'),
    };
  }
}
