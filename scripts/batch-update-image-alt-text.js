/**
 * Batch Update Product Image Alt Text
 *
 * Migration script to update all existing product images with SEO-optimized alt text.
 * Uses the dual-keyword strategy to include both formal and colloquial terms.
 *
 * Format: "[Product Name] - [Category] | [Material] | Biratnagar Nepal"
 *
 * Usage: node scripts/batch-update-image-alt-text.js [--dry-run]
 *
 * Requirements: 4.1, 3.3
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// ---- Load .env.local ----
try {
  const envPath = path.join(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value.trim();
      }
    });
    console.log('✅ Loaded env variables from .env.local');
  }
} catch (e) {
  console.error('Error reading .env.local file', e);
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  console.log('🔍 DRY RUN mode - no changes will be saved to the database');
}

// ---- Dual-keyword pairs (mirrors dualKeywordManager.ts) ----
const KEYWORD_PAIRS = [
  { formal: 'almirah', colloquial: 'daraj', category: 'storage', priority: 'high' },
  { formal: 'wardrobe', colloquial: 'kapada rakhne', category: 'storage', priority: 'high' },
  { formal: 'cupboard', colloquial: 'daraz', category: 'storage', priority: 'medium' },
  { formal: 'cabinet', colloquial: 'almirah', category: 'storage', priority: 'medium' },
  { formal: 'bed', colloquial: 'palang', category: 'bedroom', priority: 'high' },
  { formal: 'dressing table', colloquial: 'singarne table', category: 'bedroom', priority: 'medium' },
  { formal: 'study table', colloquial: 'padhne table', category: 'furniture', priority: 'medium' },
  { formal: 'locker', colloquial: 'tala wala daraj', category: 'security', priority: 'medium' },
  { formal: 'bookshelf', colloquial: 'kitab rakhne', category: 'storage', priority: 'low' },
];

/**
 * Enrich product name with dual keywords (formal + colloquial in parentheses)
 * Only enriches high-priority pairs and only adds colloquial once.
 */
function enrichWithDualKeywords(text) {
  if (!text) return text;
  let enriched = text;
  const usedPairs = new Set();

  for (const pair of KEYWORD_PAIRS) {
    if (pair.priority !== 'high') continue;
    const key = `${pair.formal}-${pair.colloquial}`;
    if (usedPairs.has(key)) continue;

    const regex = new RegExp(`\\b${pair.formal}\\b`, 'i');
    if (regex.test(enriched)) {
      // Add colloquial term in parentheses after the first match
      enriched = enriched.replace(regex, match => {
        usedPairs.add(key);
        return `${match} (${pair.colloquial})`;
      });
    }
  }
  return enriched;
}

/**
 * Generate SEO-optimized alt text for a product image.
 *
 * Format: "[Product Name (dual term)] - [Category] | [Material] | Biratnagar Nepal"
 */
function generateAltText(product, imageIndex = 0) {
  const name = product.name || 'Steel Furniture';
  const category = product.subcategory || product.category || 'Steel Furniture';
  const material = product.specifications?.material || product.material || 'Steel';

  // Enrich product name with dual keywords
  const enrichedName = enrichWithDualKeywords(name);

  const viewSuffix = imageIndex > 0 ? ` - View ${imageIndex + 1}` : '';
  const parts = [
    `${enrichedName}${viewSuffix}`,
    category,
    `${material} Furniture`,
    'Biratnagar Nepal',
  ];

  return parts.join(' | ');
}

/**
 * Generate image title attribute
 */
function generateImageTitle(product, category) {
  const name = product.name || 'Product';
  const cat = category || product.subcategory || product.category || 'Furniture';
  return `${name} - ${cat} | Shree Manish Steel Furniture`;
}

// ---- Minimal Mongoose Schema ----
const ProductSchema = new mongoose.Schema(
  {
    name: { type: String },
    slug: { type: String },
    category: { type: String },
    subcategory: { type: String },
    material: { type: String },
    image: { type: String },
    images: [{ type: String }],
    specifications: {
      material: { type: String },
    },
    // SEO alt text fields (stored for reference / admin display)
    imageAltText: { type: String },
    imageAltTexts: [{ type: String }],
  },
  { collection: 'products', strict: false }
);

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function batchUpdateAltText() {
  try {
    console.log('\n🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, { bufferCommands: false });
    console.log('✅ Connected to MongoDB.\n');

    const products = await Product.find({})
      .select('name slug category subcategory material image images specifications imageAltText imageAltTexts')
      .lean();

    console.log(`📦 Found ${products.length} products to process.\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    const results = [];

    for (const product of products) {
      const mainAltText = generateAltText(product, 0);
      const mainTitle = generateImageTitle(product, product.subcategory || product.category);

      // Generate alt texts for additional images
      const additionalAltTexts = [];
      if (Array.isArray(product.images)) {
        for (let i = 0; i < product.images.length; i++) {
          if (product.images[i] && product.images[i] !== product.image) {
            additionalAltTexts.push(generateAltText(product, i + 1));
          }
        }
      }

      const result = {
        name: product.name,
        slug: product.slug,
        mainAltText,
        mainTitle,
        additionalAltTexts,
        additionalImageCount: additionalAltTexts.length,
      };
      results.push(result);

      if (!isDryRun) {
        await Product.updateOne(
          { _id: product._id },
          {
            $set: {
              imageAltText: mainAltText,
              imageAltTexts: additionalAltTexts,
            },
          }
        );
        updatedCount++;
      } else {
        console.log(`  📝 Product: "${product.name}"`);
        console.log(`     Main alt:   ${mainAltText}`);
        if (additionalAltTexts.length > 0) {
          additionalAltTexts.forEach((alt, i) => {
            console.log(`     Image ${i + 2} alt: ${alt}`);
          });
        }
        console.log('');
      }
    }

    if (isDryRun) {
      console.log(`\n🔍 Dry run complete. ${products.length} products would be updated.`);
    } else {
      console.log(`\n🎉 Batch update complete!`);
      console.log(`   ✅ Updated:  ${updatedCount} products`);
      console.log(`   ⏭️  Skipped:  ${skippedCount} products (already up to date)`);
    }

    // Write a summary report
    const reportPath = path.join(__dirname, '../.kiro/specs/seo-optimization/image-alt-text-report.json');
    try {
      fs.writeFileSync(reportPath, JSON.stringify({ generatedAt: new Date().toISOString(), count: results.length, products: results }, null, 2));
      console.log(`\n📄 Report written to: ${reportPath}`);
    } catch {
      // Non-critical - report output failure should not fail the script
    }

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Batch update failed:', error);
    process.exit(1);
  }
}

batchUpdateAltText();
