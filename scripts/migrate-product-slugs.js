const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Load environment variables from .env.local manually
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

// Define minimal Schema to retrieve and update products
const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String }
  },
  { collection: 'products' } // specify collection name explicitly
);

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove non-alphanumeric except spaces and hyphens
    .replace(/[\s_]+/g, '-')   // replace spaces/underscores with hyphens
    .replace(/-+/g, '-');      // remove duplicate hyphens
}

async function migrateSlugs() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
    console.log('✅ Connected to MongoDB.');

    // Fetch all products
    const products = await Product.find({});
    console.log(`📦 Found ${products.length} products to check/migrate.`);

    let migratedCount = 0;
    const slugsMap = new Map(); // to track slugs dynamically during migration

    for (const product of products) {
      let baseSlug = generateSlug(product.name);
      if (!baseSlug.endsWith('-biratnagar') && !baseSlug.includes('biratnagar')) {
        baseSlug = `${baseSlug}-biratnagar`;
      }

      let uniqueSlug = baseSlug;
      let counter = 1;

      // Ensure uniqueness in DB and in-memory map
      while (true) {
        // Check if slug is already taken by another product in DB
        const existingInDb = await Product.findOne({
          slug: uniqueSlug,
          _id: { $ne: product._id }
        });
        
        // Also check if we already assigned this slug to another product in this run
        const existingInMap = slugsMap.has(uniqueSlug) && slugsMap.get(uniqueSlug) !== product._id.toString();

        if (!existingInDb && !existingInMap) {
          break;
        }

        // Add counter suffix
        if (baseSlug.endsWith('-biratnagar')) {
          const prefix = baseSlug.slice(0, -11); // remove '-biratnagar'
          uniqueSlug = `${prefix}-${counter}-biratnagar`;
        } else {
          uniqueSlug = `${baseSlug}-${counter}`;
        }
        counter++;
      }

      slugsMap.set(uniqueSlug, product._id.toString());

      // Only update if slug is missing or different
      if (product.slug !== uniqueSlug) {
        product.slug = uniqueSlug;
        await product.save();
        console.log(`✅ Migrated Product: "${product.name}" -> slug: "${uniqueSlug}"`);
        migratedCount++;
      } else {
        console.log(`ℹ️ Product "${product.name}" already has correct slug: "${product.slug}"`);
      }
    }

    console.log(`🎉 Migration complete! Successfully updated ${migratedCount} products.`);
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateSlugs();
