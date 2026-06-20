#!/usr/bin/env node

/**
 * Enrich Product Descriptions Script
 * 
 * This script enriches thin product descriptions with:
 * - Dual keywords (formal/colloquial terms)
 * - Local service area mentions
 * - Material details
 * - Warranty information
 * 
 * Usage:
 *   node scripts/enrich-product-descriptions.js [--dry-run] [--limit=N]
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const Product = require('../models/Product').default;

// Import the content enricher (will be transpiled)
const { contentEnricher } = require('../lib/seo/contentEnricher.ts');
const { dualKeywordManager } = require('../lib/seo/dualKeywordManager.ts');

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const limitArg = args.find(arg => arg.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : null;

async function enrichProducts() {
  try {
    console.log('🚀 Product Description Enrichment Script\n');
    
    if (dryRun) {
      console.log('🔍 DRY RUN MODE - No changes will be saved\n');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find products with thin content (< 150 words)
    const allProducts = await Product.find().exec();
    
    const thinProducts = allProducts.filter(product => {
      const wordCount = product.description ? product.description.split(/\s+/).length : 0;
      return wordCount < 150;
    });

    console.log(`📊 Found ${thinProducts.length} products with thin content (< 150 words)`);
    
    const productsToEnrich = limit ? thinProducts.slice(0, limit) : thinProducts;
    console.log(`📝 Enriching ${productsToEnrich.length} products...\n`);

    let enrichedCount = 0;
    let errorCount = 0;
    const results = [];

    for (const product of productsToEnrich) {
      try {
        console.log(`\n${'='.repeat(70)}`);
        console.log(`Processing: ${product.name}`);
        console.log(`Category: ${product.category} ${product.subcategory ? '> ' + product.subcategory : ''}`);
        
        const oldWordCount = product.description ? product.description.split(/\s+/).length : 0;
        console.log(`Current word count: ${oldWordCount}`);

        // Prepare product data
        const productData = {
          name: product.name,
          category: product.category,
          subcategory: product.subcategory,
          specifications: product.specifications,
          deliveryInformation: product.deliveryInformation
        };

        // Enrich the description
        const enrichedDescription = contentEnricher.enrichProductDescription(
          product.description || '',
          productData,
          {
            minWordCount: 150,
            includeLocalAreas: true,
            includeMaterial: true,
            includeWarranty: true,
            includeDelivery: true,
            tone: 'professional'
          }
        );

        const newWordCount = enrichedDescription.split(/\s+/).length;
        console.log(`New word count: ${newWordCount} (+${newWordCount - oldWordCount})`);

        // Identify and add dual keywords
        const categoryKeywords = dualKeywordManager.getKeywordPairs(product.category || 'furniture');
        const relevantPair = categoryKeywords.find(pair => 
          product.name.toLowerCase().includes(pair.formal.toLowerCase()) ||
          product.name.toLowerCase().includes(pair.colloquial.toLowerCase())
        );

        const dualKeywords = relevantPair ? [{
          formal: relevantPair.formal,
          colloquial: relevantPair.colloquial
        }] : [];

        // Validate content quality
        const focusKeywords = [
          product.category?.toLowerCase() || '',
          relevantPair?.formal || '',
          relevantPair?.colloquial || '',
          'biratnagar',
          'steel furniture'
        ].filter(Boolean);

        const qualityReport = contentEnricher.validateContentQuality(
          enrichedDescription,
          focusKeywords
        );

        console.log(`\nQuality Report:`);
        console.log(`  Word count: ${qualityReport.wordCount}`);
        console.log(`  Local mentions: ${qualityReport.hasLocalMentions ? '✅' : '❌'}`);
        console.log(`  Material info: ${qualityReport.hasMaterialInfo ? '✅' : '❌'}`);
        console.log(`  Warranty info: ${qualityReport.hasWarrantyInfo ? '✅' : '❌'}`);
        console.log(`  Readability score: ${qualityReport.readabilityScore.toFixed(1)}/100`);

        if (qualityReport.issues.length > 0) {
          console.log(`  ⚠️  Issues: ${qualityReport.issues.join('; ')}`);
        }

        if (dualKeywords.length > 0) {
          console.log(`  Dual keywords: ${dualKeywords[0].formal} / ${dualKeywords[0].colloquial}`);
        }

        // Show preview of enriched content
        console.log(`\n📄 Enriched Description Preview:`);
        console.log(enrichedDescription.substring(0, 300) + '...\n');

        if (!dryRun) {
          // Update product
          product.description = enrichedDescription;
          product.dualKeywords = dualKeywords;
          product.focusKeywords = focusKeywords;
          product.contentQualityScore = Math.min(100, Math.round(
            (newWordCount / 150) * 40 + // Word count score (40%)
            qualityReport.readabilityScore * 0.3 + // Readability (30%)
            (qualityReport.hasLocalMentions ? 10 : 0) + // Local mentions (10%)
            (qualityReport.hasMaterialInfo ? 10 : 0) + // Material info (10%)
            (qualityReport.hasWarrantyInfo ? 10 : 0) // Warranty info (10%)
          ));
          product.lastSEOAudit = new Date();

          await product.save();
          console.log(`✅ Updated in database (Quality Score: ${product.contentQualityScore})`);
        }

        enrichedCount++;

        results.push({
          name: product.name,
          oldWordCount,
          newWordCount,
          qualityScore: product.contentQualityScore || 0,
          dualKeywords: dualKeywords.length > 0 ? `${dualKeywords[0].formal}/${dualKeywords[0].colloquial}` : 'none'
        });

      } catch (error) {
        console.error(`❌ Error processing ${product.name}:`, error.message);
        errorCount++;
      }
    }

    // Summary
    console.log(`\n${'='.repeat(70)}`);
    console.log(`\n📊 Enrichment Summary:\n`);
    console.log(`Total processed: ${enrichedCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log(`Success rate: ${((enrichedCount / productsToEnrich.length) * 100).toFixed(1)}%`);

    if (results.length > 0) {
      console.log(`\n📈 Results:\n`);
      results.forEach(r => {
        console.log(`  ${r.name}`);
        console.log(`    Words: ${r.oldWordCount} → ${r.newWordCount}`);
        console.log(`    Quality: ${r.qualityScore}/100`);
        console.log(`    Keywords: ${r.dualKeywords}`);
      });
    }

    if (dryRun) {
      console.log(`\n💡 Tip: Run without --dry-run to save changes to database`);
    }

    await mongoose.disconnect();
    console.log(`\n✅ Complete!\n`);
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

enrichProducts();
