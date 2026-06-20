/**
 * Migration Script: Generate SEO-friendly slugs for all products
 *
 * This script:
 * 1. Connects to MongoDB
 * 2. Finds all products without a slug OR without "-biratnagar" suffix
 * 3. Generates an SEO-friendly slug with the location keyword
 * 4. Ensures uniqueness with a counter suffix if needed
 * 5. Saves old slug → new slug for redirect tracking (logged to console)
 *
 * Usage:
 *   node scripts/migrate-product-slugs-v2.js
 *
 * Requirements: MONGODB_URI in .env.local
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI is not set in .env.local');
  process.exit(1);
}

// Dual-keyword pairs for slug enrichment
const DUAL_KEYWORD_PAIRS = [
  { formal: 'almirah', colloquial: 'daraj' },
  { formal: 'wardrobe', colloquial: 'daraj' },
  { formal: 'bed', colloquial: 'palang' },
  { formal: 'cupboard', colloquial: 'daraj' },
  { formal: 'locker', colloquial: 'locker' },
  { formal: 'rack', colloquial: 'rack' },
  { formal: 'table', colloquial: 'table' },
  { formal: 'chair', colloquial: 'chair' },
  { formal: 'sofa', colloquial: 'sofa' },
  { formal: 'shelf', colloquial: 'shelf' },
];

/**
 * Convert a product name to a clean URL slug
 */
function cleanSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')   // remove special chars
    .replace(/[\s_]+/g, '-')    // spaces → hyphens
    .replace(/-+/g, '-')        // collapse duplicate hyphens
    .replace(/^-+|-+$/g, '');   // trim leading/trailing hyphens
}

/**
 * Generate slug with dual-keyword awareness and location suffix
 */
function generateSlug(name, categoryName) {
  let slug = cleanSlug(name);

  // If we have a category, check for dual-keyword opportunities
  if (categoryName) {
    const lowerCategory = categoryName.toLowerCase();
    for (const pair of DUAL_KEYWORD_PAIRS) {
      const hasFormal = slug.includes(pair.formal) || lowerCategory.includes(pair.formal);
      const hasColloquial = slug.includes(pair.colloquial) || lowerCategory.includes(pair.colloquial);

      // If the slug has the formal term but not colloquial, and they differ, optionally add colloquial
      // We keep it simple: just ensure slug has the primary keyword from the pair
      if (hasFormal && !hasColloquial && pair.formal !== pair.colloquial) {
        // Don't add colloquial to avoid slug being too long; slug already has formal term
      }
    }
  }

  // Add -biratnagar suffix if not already present
  if (!slug.includes('biratnagar')) {
    slug = `${slug}-biratnagar`;
  }

  // Trim to max 80 chars (before uniqueness counter)
  if (slug.length > 80) {
    const trimmed = slug.substring(0, 80);
    const lastHyphen = trimmed.lastIndexOf('-');
    slug = lastHyphen > 56 ? trimmed.substring(0, lastHyphen) : trimmed;
  }

  return cleanSlug(slug);
}

/**
 * Generate a unique slug by checking the DB
 */
async function generateUniqueSlug(ProductModel, baseSlug, excludeId) {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await ProductModel.findOne({
      slug,
      _id: { $ne: excludeId },
    });
    if (!existing) break;

    // Insert counter before -biratnagar
    if (baseSlug.endsWith('-biratnagar')) {
      const prefix = baseSlug.slice(0, -11);
      slug = `${prefix}-${counter}-biratnagar`;
    } else {
      slug = `${baseSlug}-${counter}`;
    }
    counter++;

    if (counter > 100) {
      throw new Error(`Could not generate unique slug for base: ${baseSlug}`);
    }
  }

  return slug;
}

async function migrate() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.\n');

  // Minimal Product schema for migration
  const ProductSchema = new mongoose.Schema({}, { strict: false });
  const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema, 'products');

  // Find products that need slug migration:
  // - no slug, OR slug doesn't contain "biratnagar"
  const products = await Product.find({
    $or: [
      { slug: { $exists: false } },
      { slug: null },
      { slug: '' },
      { slug: { $not: /biratnagar/ } },
    ],
  }).lean();

  console.log(`Found ${products.length} product(s) needing slug migration.\n`);

  if (products.length === 0) {
    console.log('All products already have SEO-friendly slugs. Nothing to do.');
    await mongoose.disconnect();
    return;
  }

  const redirectLog = [];
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const product of products) {
    try {
      const name = product.name;
      if (!name) {
        console.warn(`  [SKIP] Product ${product._id} has no name`);
        skipped++;
        continue;
      }

      const categoryName = product.category || product.subcategory || '';
      const baseSlug = generateSlug(name, categoryName);
      const uniqueSlug = await generateUniqueSlug(Product, baseSlug, product._id);

      const oldSlug = product.slug || null;

      // Update using updateOne to bypass pre-save hooks (slug already generated)
      await Product.updateOne(
        { _id: product._id },
        { $set: { slug: uniqueSlug } }
      );

      if (oldSlug && oldSlug !== uniqueSlug) {
        redirectLog.push({ from: `/products/${oldSlug}`, to: `/products/${uniqueSlug}` });
      }

      console.log(`  [OK] "${name}"`);
      console.log(`       ${oldSlug || '(no slug)'} → ${uniqueSlug}`);
      updated++;
    } catch (err) {
      console.error(`  [ERROR] Product ${product._id}: ${err.message}`);
      errors++;
    }
  }

  console.log('\n--- Migration Summary ---');
  console.log(`  Updated : ${updated}`);
  console.log(`  Skipped : ${skipped}`);
  console.log(`  Errors  : ${errors}`);

  if (redirectLog.length > 0) {
    console.log('\n--- Redirect Mappings (add these to URLRedirect collection or middleware) ---');
    redirectLog.forEach(({ from, to }) => {
      console.log(`  ${from}  →  ${to}`);
    });
  }

  await mongoose.disconnect();
  console.log('\nDone. Disconnected from MongoDB.');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
