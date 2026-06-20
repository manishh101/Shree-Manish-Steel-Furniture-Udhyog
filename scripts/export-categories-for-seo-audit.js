/**
 * Export Categories and Subcategories for SEO Dual-Keyword Audit
 * 
 * This script exports all unique categories and subcategories from the database
 * to help identify formal vs. colloquial keyword pairs for Nepal market.
 */

const fs = require('fs');
const path = require('path');

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
  }
} catch (e) {
  console.error('Error reading .env.local file', e);
}

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env.local');
  process.exit(1);
}

// Import models
require('../models/Category');
require('../models/Subcategory');
require('../models/Product');

const Category = mongoose.model('Category');
const Subcategory = mongoose.model('Subcategory');
const Product = mongoose.model('Product');

async function exportCategoriesAndSubcategories() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, { bufferCommands: false });
    console.log('Connected successfully\n');

    // Fetch all categories with subcategories
    const categories = await Category.find({}).sort({ displayOrder: 1, name: 1 }).lean();
    
    console.log('='.repeat(80));
    console.log('CATEGORY AND SUBCATEGORY AUDIT FOR DUAL-KEYWORD STRATEGY');
    console.log('='.repeat(80));
    console.log('\n');

    const auditData = [];

    for (const category of categories) {
      // Get subcategories for this category
      const subcategories = await Subcategory.find({ categoryId: category._id })
        .sort({ displayOrder: 1, name: 1 })
        .lean();

      // Get product count for this category
      const productCount = await Product.countDocuments({ categoryId: category._id });

      const categoryData = {
        categoryName: category.name,
        productCount: productCount,
        subcategories: subcategories.map(sub => sub.name),
        existingDualKeywords: category.dualKeywords || [],
        existingFocusKeywords: category.focusKeywords || []
      };

      auditData.push(categoryData);

      // Display category info
      console.log(`📁 CATEGORY: ${category.name}`);
      console.log(`   Products: ${productCount}`);
      console.log(`   Display Order: ${category.displayOrder}`);
      
      if (category.dualKeywords && category.dualKeywords.length > 0) {
        console.log(`   Existing Dual Keywords:`);
        category.dualKeywords.forEach(kw => {
          console.log(`      - ${kw.formal} / ${kw.colloquial}`);
        });
      }
      
      if (subcategories.length > 0) {
        console.log(`   Subcategories (${subcategories.length}):`);
        subcategories.forEach(sub => {
          console.log(`      - ${sub.name}`);
        });
      }
      console.log('\n');
    }

    // Export sample products to identify common terms
    console.log('='.repeat(80));
    console.log('SAMPLE PRODUCTS BY CATEGORY (for keyword identification)');
    console.log('='.repeat(80));
    console.log('\n');

    for (const category of categories.slice(0, 10)) { // Limit to first 10 categories
      const products = await Product.find({ categoryId: category._id })
        .limit(5)
        .select('name category subcategory')
        .lean();

      if (products.length > 0) {
        console.log(`📦 ${category.name} - Sample Products:`);
        products.forEach((product, index) => {
          console.log(`   ${index + 1}. ${product.name}`);
        });
        console.log('\n');
      }
    }

    // Summary statistics
    console.log('='.repeat(80));
    console.log('SUMMARY STATISTICS');
    console.log('='.repeat(80));
    console.log(`Total Categories: ${categories.length}`);
    console.log(`Categories with Dual Keywords: ${categories.filter(c => c.dualKeywords && c.dualKeywords.length > 0).length}`);
    
    const totalSubcategories = await Subcategory.countDocuments();
    console.log(`Total Subcategories: ${totalSubcategories}`);
    
    const totalProducts = await Product.countDocuments();
    console.log(`Total Products: ${totalProducts}`);

    // High-priority categories (by product count)
    const highPriorityCategories = auditData
      .filter(c => c.productCount > 0)
      .sort((a, b) => b.productCount - a.productCount)
      .slice(0, 10);

    console.log('\n📊 HIGH-PRIORITY CATEGORIES (by product count):');
    highPriorityCategories.forEach((cat, index) => {
      console.log(`   ${index + 1}. ${cat.categoryName} (${cat.productCount} products)`);
    });

    console.log('\n✅ Export complete!\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the export
exportCategoriesAndSubcategories();
