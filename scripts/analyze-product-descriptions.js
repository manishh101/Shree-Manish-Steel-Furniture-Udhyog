#!/usr/bin/env node

/**
 * Analyze Product Descriptions Script
 * 
 * This script analyzes existing product descriptions to identify:
 * - Products with thin content (< 150 words)
 * - Products missing dual keywords
 * - Products needing content enrichment
 */

require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const Product = require('../models/Product').default;

async function analyzeProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Fetch all products
    const products = await Product.find()
      .select('name description category subcategory specifications deliveryInformation')
      .limit(20)
      .exec();

    console.log(`📊 Analyzing ${products.length} products...\n`);

    const stats = {
      total: products.length,
      thinContent: [],
      adequate: [],
      good: []
    };

    products.forEach(product => {
      const wordCount = product.description ? product.description.split(/\s+/).length : 0;
      
      const info = {
        name: product.name,
        category: product.category,
        subcategory: product.subcategory,
        wordCount,
        hasSpecs: !!(product.specifications && product.specifications.material)
      };

      if (wordCount < 50) {
        stats.thinContent.push(info);
      } else if (wordCount < 150) {
        stats.adequate.push(info);
      } else {
        stats.good.push(info);
      }
    });

    console.log('📈 Content Analysis Results:\n');
    console.log(`Total Products: ${stats.total}`);
    console.log(`❌ Thin Content (< 50 words): ${stats.thinContent.length}`);
    console.log(`⚠️  Adequate (50-149 words): ${stats.adequate.length}`);
    console.log(`✅ Good Content (>= 150 words): ${stats.good.length}\n`);

    if (stats.thinContent.length > 0) {
      console.log('❌ Products with Thin Content:');
      stats.thinContent.forEach(p => {
        console.log(`  - ${p.name} (${p.category}) - ${p.wordCount} words`);
      });
      console.log('');
    }

    if (stats.adequate.length > 0) {
      console.log('⚠️  Products Needing Enrichment:');
      stats.adequate.slice(0, 5).forEach(p => {
        console.log(`  - ${p.name} (${p.category}) - ${p.wordCount} words`);
      });
      console.log('');
    }

    // Show sample product for template creation
    if (products.length > 0) {
      const sample = products[0];
      console.log('📝 Sample Product Data:');
      console.log(JSON.stringify({
        name: sample.name,
        category: sample.category,
        subcategory: sample.subcategory,
        description: sample.description?.substring(0, 200) + '...',
        specifications: sample.specifications,
        deliveryInfo: sample.deliveryInformation
      }, null, 2));
    }

    await mongoose.disconnect();
    console.log('\n✅ Analysis complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

analyzeProducts();
