# Product Description Enrichment Guide

## Overview

This guide explains how to enrich product descriptions with dual keywords, local service areas, material details, and warranty information to improve SEO and provide better customer information.

## Prerequisites

- Node.js installed
- MongoDB connection configured in `.env.local`
- Product data in the database

## Quick Start

### 1. Analyze Current Content

Check which products need enrichment:

```bash
cd manish-steel-furniture
node scripts/analyze-product-descriptions.js
```

This will show:
- Total products analyzed
- Products with thin content (< 50 words)
- Products needing enrichment (50-149 words)
- Products with good content (>= 150 words)

### 2. Preview Enrichment (Dry Run)

Preview changes without saving to database:

```bash
node scripts/enrich-product-descriptions.js --dry-run --limit=5
```

This will:
- Process first 5 products with thin content
- Show before/after word counts
- Display quality metrics
- Preview enriched content
- **NOT** save to database

### 3. Enrich Products

Apply enrichment to products:

```bash
# Enrich first 10 products
node scripts/enrich-product-descriptions.js --limit=10

# Enrich all thin content products
node scripts/enrich-product-descriptions.js
```

## Content Enrichment Features

### 1. Dual Keywords Integration

Automatically adds formal and colloquial terms:

**Before:**
```
Steel almirah with 3 doors
```

**After:**
```
Premium steel storage solution designed for modern homes. This steel almirah (daraj) features three compartments for organized storage...
```

### 2. Local Service Areas

Adds mentions of delivery locations:

```
Free delivery and installation available in Biratnagar, Dharan, Itahari 
and surrounding Morang district areas.
```

### 3. Material Details

Includes construction and material information:

```
Constructed from premium steel, this furniture features rust-resistant 
powder coating that withstands Nepal's humid climate. The steel construction 
ensures termite-proof durability, unlike traditional wooden furniture.
```

### 4. Warranty Information

Adds warranty details:

```
Backed by our 5-year warranty covering manufacturing defects. We stand 
behind the quality of our products with reliable after-sales support in 
the Biratnagar region.
```

### 5. Quality Scoring

Each product receives a quality score (0-100) based on:
- Word count (40% weight)
- Readability (30% weight)
- Local mentions (10% weight)
- Material information (10% weight)
- Warranty information (10% weight)

## Category-Specific Templates

### Storage Furniture (Almirahs, Wardrobes)

Emphasizes:
- Storage capacity and organization
- Rust-resistant coating
- Secure locking system
- Termite-proof construction

**Dual Keywords:**
- almirah / daraj
- wardrobe / kapada rakhne
- cupboard / daraz

### Bedroom Furniture (Beds)

Emphasizes:
- Structural strength and weight capacity
- Comfort and support
- Climate resistance
- Easy assembly

**Dual Keywords:**
- bed / palang
- bed / khat
- double bed / dohoro palang

### Office Furniture (Tables, Desks)

Emphasizes:
- Professional design
- Productivity features
- Durability
- Bulk order options

**Dual Keywords:**
- study table / padhne table
- desk / table
- computer table / computer ko table

### Security Furniture (Safes, Lockers)

Emphasizes:
- Security features
- Protection capabilities
- Use cases
- Business applications

**Dual Keywords:**
- safe / tijori
- locker / tala wala daraj

## Content Quality Standards

### Minimum Requirements

✅ **Word Count:** At least 150 words
✅ **Local Mentions:** Include Biratnagar, Dharan, or Itahari
✅ **Dual Keywords:** Natural integration of formal/colloquial terms
✅ **Material Info:** Mention construction materials
✅ **Warranty:** Include warranty or guarantee information

### Best Practices

1. **Natural Language:** Avoid keyword stuffing (keep density under 3%)
2. **Unique Content:** Each product should have unique descriptions
3. **Customer Focus:** Write for customers, not search engines
4. **Local Context:** Emphasize Nepal-specific benefits (climate, termites, etc.)
5. **Clear Structure:** Use paragraphs and natural flow

### Quality Metrics

| Metric | Target | Weight |
|--------|--------|--------|
| Word Count | 150-300 words | 40% |
| Readability Score | 60-80 | 30% |
| Local Mentions | Yes | 10% |
| Material Info | Yes | 10% |
| Warranty Info | Yes | 10% |

## API Usage

### Programmatic Enrichment

```typescript
import { contentEnricher } from '@/lib/seo';

// Enrich a product description
const enrichedDescription = contentEnricher.enrichProductDescription(
  currentDescription,
  {
    name: 'Steel Almirah 72 Inch',
    category: 'Storage',
    subcategory: 'Wardrobe',
    specifications: {
      material: 'Premium Steel',
      dimensions: '72 x 36 x 18 inches',
      guarantee: '5 years'
    },
    deliveryInformation: {
      availableLocations: ['Biratnagar', 'Dharan', 'Itahari']
    }
  },
  {
    minWordCount: 150,
    includeLocalAreas: true,
    includeMaterial: true,
    includeWarranty: true,
    includeDelivery: true,
    tone: 'professional'
  }
);

// Validate content quality
const qualityReport = contentEnricher.validateContentQuality(
  enrichedDescription,
  ['almirah', 'daraj', 'storage', 'biratnagar']
);

console.log('Quality Score:', qualityReport.wordCount);
console.log('Issues:', qualityReport.issues);
console.log('Suggestions:', qualityReport.suggestions);
```

### Get Category Template

```typescript
import { contentEnricher } from '@/lib/seo';

// Get template for storage furniture
const template = contentEnricher.generateCategoryTemplate('Storage');

// Use template as starting point for manual content creation
```

## Admin Panel Integration

### Adding SEO Fields to Product Form

The admin panel should include:

1. **Description Editor** - Rich text editor for product descriptions
2. **Word Counter** - Real-time word count display
3. **Quality Preview** - Live quality score as you type
4. **Dual Keywords** - Suggested keyword pairs based on category
5. **SEO Preview** - How description will appear in search results

### Bulk Operations

Admin users can:

1. **Bulk Audit** - Identify all products with thin content
2. **Bulk Enrich** - Apply enrichment to multiple products
3. **Quality Report** - Export SEO quality report for all products

## Monitoring and Maintenance

### Regular Audits

Run monthly audits to check:

```bash
# Check current content quality
node scripts/analyze-product-descriptions.js

# Review quality scores
# (Add MongoDB query to find products with low scores)
```

### Continuous Improvement

1. **Track Search Terms** - Monitor Google Search Console for new colloquial terms
2. **Customer Feedback** - Update descriptions based on customer questions
3. **Competitor Analysis** - Review competitor descriptions for insights
4. **A/B Testing** - Test different description formats for conversion

### Quality Maintenance

- **New Products:** All new products should meet 150-word minimum
- **Updates:** Review and update descriptions quarterly
- **Seasonal:** Update delivery/warranty info as needed
- **Trends:** Incorporate new search terms discovered in analytics

## Troubleshooting

### Script Errors

**Error: Cannot connect to MongoDB**
```bash
# Check .env.local file has MONGODB_URI
# Verify MongoDB is running
# Test connection string
```

**Error: Module not found**
```bash
# Rebuild TypeScript files
npm run build

# Or run with ts-node
npx ts-node scripts/enrich-product-descriptions.ts
```

### Quality Issues

**Issue: Keyword density too high**
- Review content for repetition
- Use pronouns instead of repeating keywords
- Vary sentence structure

**Issue: Content too generic**
- Add specific product features
- Include unique selling points
- Mention actual dimensions/specifications

**Issue: Missing local mentions**
- Always include "Biratnagar" at least once
- Mention delivery areas
- Reference Nepal climate benefits

## Examples

### Before and After

**Before (28 words):**
```
Steel almirah with 3 doors and mirror. Good quality product with 
powder coating. Available in different colors.
```

**After (187 words):**
```
Premium steel storage solution designed for modern homes and offices. 
This steel almirah (daraj) features three compartments for organized 
storage, making it perfect for bedrooms, offices, or commercial spaces 
in Biratnagar and surrounding areas.

Key Features:
- Three-door configuration with spacious interior
- Built-in mirror for convenience
- Multiple compartments for organized storage
- Secure locking system for valuables

Constructed from premium steel, this furniture features rust-resistant 
powder coating that withstands Nepal's humid climate. The steel 
construction ensures termite-proof durability, unlike traditional wooden 
furniture. Each piece is carefully manufactured at Shree Manish Steel 
facility with quality control at every stage.

Product specifications: 72 x 36 x 18 inches, designed for optimal space 
utilization and easy assembly.

Backed by our 5-year warranty covering manufacturing defects. We stand 
behind the quality of our products with reliable after-sales support in 
the Biratnagar region.

Free delivery and installation available in Biratnagar, Dharan, Itahari 
and surrounding Morang district areas. Professional installation service 
included to ensure proper setup.
```

## Additional Resources

- **Dual Keyword Guide:** `.kiro/specs/seo-optimization/dual-keyword-implementation-guide.md`
- **Keyword Audit:** `.kiro/specs/seo-optimization/dual-keyword-audit.md`
- **SEO Requirements:** `.kiro/specs/seo-optimization/requirements.md`
- **Design Document:** `.kiro/specs/seo-optimization/design.md`

## Support

For questions or issues:
1. Review this guide
2. Check implementation guides in `.kiro/specs/seo-optimization/`
3. Contact development team

---

**Last Updated:** June 18, 2026
**Version:** 1.0
