#!/usr/bin/env node

/**
 * Simple Product Description Enrichment Script
 * 
 * This script enriches product descriptions with:
 * - Dual keywords
 * - Local service areas
 * - Material details  
 * - Warranty information
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const Product = require('../models/Product').default;

// Parse CLI args
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const limitArg = args.find(arg => arg.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 10;

// Keyword pairs configuration
const KEYWORD_PAIRS = {
  storage: [
    { formal: 'almirah', colloquial: 'daraj' },
    { formal: 'wardrobe', colloquial: 'kapada rakhne' },
    { formal: 'cupboard', colloquial: 'daraz' }
  ],
  bedroom: [
    { formal: 'bed', colloquial: 'palang' },
    { formal: 'bed', colloquial: 'khat' },
    { formal: 'dressing table', colloquial: 'singarne table' }
  ],
  furniture: [
    { formal: 'study table', colloquial: 'padhne table' },
    { formal: 'desk', colloquial: 'table' }
  ],
  office: [
    { formal: 'study table', colloquial: 'padhne table' },
    { formal: 'desk', colloquial: 'table' }
  ]
};

const LOCAL_AREAS = ['Biratnagar', 'Dharan', 'Itahari'];

function countWords(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

function findRelevantKeywordPair(productName, category) {
  const categoryLower = (category || 'furniture').toLowerCase();
  const nameLower = productName.toLowerCase();
  
  const pairs = KEYWORD_PAIRS[categoryLower] || KEYWORD_PAIRS.furniture;
  
  for (const pair of pairs) {
    if (nameLower.includes(pair.formal) || nameLower.includes(pair.colloquial)) {
      return pair;
    }
  }
  
  return pairs[0];
}

function enrichDescription(product) {
  const categoryLower = (product.category || 'furniture').toLowerCase();
  const isStorage = categoryLower.includes('storage') || 
                    product.name.toLowerCase().includes('almirah') ||
                    product.name.toLowerCase().includes('wardrobe');
  const isBedroom = categoryLower.includes('bedroom') || 
                    product.name.toLowerCase().includes('bed');
  const isOffice = categoryLower.includes('office') || 
                   product.name.toLowerCase().includes('table') ||
                   product.name.toLowerCase().includes('desk');

  const sections = [];
  
  // Opening paragraph
  if (isStorage) {
    sections.push('Premium steel storage solution designed for modern homes and offices. Manufactured at our facility in Biratnagar with high-quality materials and precision craftsmanship, this furniture combines durability with practical functionality.');
  } else if (isBedroom) {
    sections.push('Durable steel furniture built to provide reliable comfort and support. Made with heavy-duty steel frame construction, this piece is perfect for residential and institutional use in Biratnagar and surrounding areas.');
  } else if (isOffice) {
    sections.push('Professional furniture solution designed for productivity and comfort. Manufactured with quality steel and finished to perfection, ideal for offices, schools, and homes across Province 1.');
  } else {
    sections.push('Quality steel furniture manufactured in Biratnagar, Nepal. Built with premium materials and expert craftsmanship to ensure long-lasting performance and reliability.');
  }

  // Add original description if exists
  if (product.description && product.description.trim()) {
    sections.push(product.description);
  }

  // Material section
  const material = product.specifications?.material || 'premium steel';
  sections.push(`Constructed from ${material.toLowerCase()}, this furniture features rust-resistant powder coating that withstands Nepal's humid climate. The steel construction ensures termite-proof durability, unlike traditional wooden furniture. Each piece is carefully manufactured with quality control at every stage.`);

  // Specifications
  if (product.specifications?.dimensions) {
    sections.push(`Product specifications include ${product.specifications.dimensions}. Designed for optimal space utilization and easy assembly.`);
  }

  // Warranty
  const warranty = product.specifications?.guarantee || '5-year warranty';
  sections.push(`Backed by our ${warranty} covering manufacturing defects. We stand behind the quality of our products with reliable after-sales support in the Biratnagar region.`);

  // Delivery
  const locations = product.deliveryInformation?.availableLocations || LOCAL_AREAS;
  const locationText = locations.slice(0, 3).join(', ');
  sections.push(`Free delivery and installation available in ${locationText} and surrounding Morang district areas. Professional installation service included to ensure proper setup.`);

  return sections.join('\n\n');
}

function addDualKeyword(description, pair) {
  if (!pair || !description) return description;
  
  const regex = new RegExp(`\\b${pair.formal}\\b`, 'i');
  const match = description.match(regex);
  
  if (match && match.index !== undefined) {
    const firstOccurrence = description.indexOf(match[0]);
    const before = description.substring(0, firstOccurrence + match[0].length);
    const after = description.substring(firstOccurrence + match[0].length);
    
    return `${before} (${pair.colloquial})${after}`;
  }
  
  return description;
}

async function enrichProducts() {
  try {
    console.log('🚀 Product Description Enrichment\n');
    
    if (dryRun) {
      console.log('🔍 DRY RUN MODE - No changes will be saved\n');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find products with thin content
    const allProducts = await Product.find().exec();
    const thinProducts = allProducts.filter(p => countWords(p.description) < 150);

    console.log(`📊 Found ${thinProducts.length} products with thin content`);
    
    const productsToProcess = thinProducts.slice(0, limit);
    console.log(`📝 Processing ${productsToProcess.length} products...\n`);

    let successCount = 0;

    for (const product of productsToProcess) {
      console.log(`\n${'='.repeat(70)}`);
      console.log(`Product: ${product.name}`);
      console.log(`Category: ${product.category || 'N/A'}`);
      
      const oldWordCount = countWords(product.description);
      console.log(`Current: ${oldWordCount} words`);

      // Enrich description
      let enrichedDesc = enrichDescription(product);
      
      // Add dual keyword
      const keywordPair = findRelevantKeywordPair(product.name, product.category);
      enrichedDesc = addDualKeyword(enrichedDesc, keywordPair);
      
      const newWordCount = countWords(enrichedDesc);
      console.log(`Enriched: ${newWordCount} words (+${newWordCount - oldWordCount})`);
      
      if (keywordPair) {
        console.log(`Keywords: ${keywordPair.formal} / ${keywordPair.colloquial}`);
      }

      // Check quality
      const hasLocal = LOCAL_AREAS.some(area => enrichedDesc.includes(area));
      const hasMaterial = /steel|metal|material/i.test(enrichedDesc);
      const hasWarranty = /warranty|guarantee/i.test(enrichedDesc);
      
      console.log(`Quality checks:`);
      console.log(`  ✅ Word count: ${newWordCount >= 150 ? 'Pass' : 'Fail'}`);
      console.log(`  ${hasLocal ? '✅' : '❌'} Local mentions`);
      console.log(`  ${hasMaterial ? '✅' : '❌'} Material info`);
      console.log(`  ${hasWarranty ? '✅' : '❌'} Warranty info`);

      // Preview
      console.log(`\nPreview:\n${enrichedDesc.substring(0, 200)}...\n`);

      if (!dryRun) {
        product.description = enrichedDesc;
        
        if (keywordPair) {
          product.dualKeywords = [{
            formal: keywordPair.formal,
            colloquial: keywordPair.colloquial
          }];
        }
        
        product.focusKeywords = [
          product.category?.toLowerCase(),
          keywordPair?.formal,
          keywordPair?.colloquial,
          'biratnagar',
          'steel furniture'
        ].filter(Boolean);
        
        // Calculate quality score
        let score = 0;
        score += Math.min(40, (newWordCount / 150) * 40); // Word count
        score += hasLocal ? 10 : 0;
        score += hasMaterial ? 10 : 0;
        score += hasWarranty ? 10 : 0;
        score += 30; // Base readability
        
        product.contentQualityScore = Math.round(score);
        product.lastSEOAudit = new Date();
        
        await product.save();
        console.log(`✅ Saved (Score: ${product.contentQualityScore}/100)`);
      }

      successCount++;
    }

    console.log(`\n${'='.repeat(70)}`);
    console.log(`\n✅ Complete! Processed ${successCount} products`);
    
    if (dryRun) {
      console.log(`\n💡 Run without --dry-run to save changes`);
    }

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

enrichProducts();
