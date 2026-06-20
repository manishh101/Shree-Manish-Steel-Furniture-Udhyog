# Product Description Enrichment Scripts

## Quick Start

### 1. Analyze Current Products

Check which products need enrichment:

```bash
node scripts/analyze-product-descriptions.js
```

### 2. Preview Enrichment (Recommended First Step)

Test on a few products without saving:

```bash
node scripts/enrich-descriptions-simple.js --dry-run --limit=5
```

### 3. Enrich Products

Apply enrichment to products:

```bash
# Enrich first 10 products
node scripts/enrich-descriptions-simple.js --limit=10

# Enrich all products with thin content
node scripts/enrich-descriptions-simple.js
```

## What Gets Added

Each enriched description includes:

✅ **150+ words** of unique content (meets SEO minimum)
✅ **Dual keywords** - Both formal (almirah) and colloquial (daraj) terms
✅ **Local service areas** - Biratnagar, Dharan, Itahari mentioned
✅ **Material details** - Construction and quality information
✅ **Warranty info** - 5-year warranty and after-sales support
✅ **Delivery info** - Free delivery and installation details

## Example Output

### Before (28 words):
```
Steel almirah with 3 doors and mirror. Good quality product with 
powder coating. Available in different colors.
```

### After (187 words):
```
Premium steel storage solution designed for modern homes and offices. 
This steel almirah (daraj) features three compartments for organized 
storage, making it perfect for bedrooms, offices, or commercial spaces 
in Biratnagar and surrounding areas.

[... full enriched content continues ...]

Free delivery and installation available in Biratnagar, Dharan, Itahari 
and surrounding Morang district areas.
```

## Quality Metrics

Each product gets a quality score (0-100) based on:
- Word count (40%)
- Readability (30%)
- Local mentions (10%)
- Material info (10%)
- Warranty info (10%)

## Scripts Available

### 1. analyze-product-descriptions.js
Analyzes existing products and shows statistics about content quality.

### 2. enrich-descriptions-simple.js
Main enrichment script. Simple, fast, easy to use.

**Options:**
- `--dry-run` - Preview without saving
- `--limit=N` - Process only N products

### 3. enrich-product-descriptions.js
Advanced version with full TypeScript integration (requires build step).

## Dual Keywords by Category

| Category | Formal | Colloquial |
|----------|--------|------------|
| Storage | almirah | daraj |
| Storage | wardrobe | kapada rakhne |
| Bedroom | bed | palang |
| Office | study table | padhne table |
| Security | safe | tijori |

## Troubleshooting

**Problem:** Script can't connect to MongoDB
**Solution:** Check `.env.local` file has `MONGODB_URI` set correctly

**Problem:** No products found with thin content
**Solution:** Great! All products already have good descriptions

**Problem:** Want to re-enrich already enriched products
**Solution:** Modify script to skip word count check or lower the threshold

## Documentation

Full documentation available in:
- `docs/CONTENT_ENRICHMENT_GUIDE.md` - Complete guide
- `.kiro/specs/seo-optimization/dual-keyword-implementation-guide.md` - Keyword guide
- `.kiro/specs/seo-optimization/task-4.1-implementation-summary.md` - Implementation details

## Support

For questions or issues, refer to the documentation files or contact the development team.

---

**Created:** June 18, 2026
**Version:** 1.0
