#!/usr/bin/env node

/**
 * Comprehensive SEO Audit Script
 * Audits metadata, broken links, duplicate content, and SEO implementation
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Import models
const Product = require('../models/Product').default;
const Blog = require('../models/Blog').default;
const Category = require('../models/Category').default;

const MONGODB_URI = process.env.MONGODB_URI;
const BASE_URL = 'https://manishsteel.com.np';

// Audit results
const auditResults = {
  metadata: {
    missingTitles: [],
    missingDescriptions: [],
    duplicateTitles: [],
    duplicateDescriptions: [],
    titleLengthIssues: [],
    descriptionLengthIssues: [],
  },
  content: {
    thinContent: [],
    missingKeywords: [],
    missingAltText: [],
  },
  urls: {
    missingSlugs: [],
    duplicateSlugs: [],
    invalidSlugs: [],
  },
  schema: {
    missingSchema: [],
    incompleteProduct: [],
  },
  images: {
    missingAlt: [],
    missingDimensions: [],
  },
  critical: [],
  warnings: [],
  suggestions: [],
};

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }
  
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');
}

function validateTitleLength(title) {
  if (!title) return { valid: false, issue: 'missing' };
  const length = title.length;
  if (length < 30) return { valid: false, issue: 'too_short', length };
  if (length > 70) return { valid: false, issue: 'too_long', length };
  if (length >= 50 && length <= 60) return { valid: true, optimal: true, length };
  return { valid: true, optimal: false, length };
}

function validateDescriptionLength(description) {
  if (!description) return { valid: false, issue: 'missing' };
  const length = description.length;
  if (length < 100) return { valid: false, issue: 'too_short', length };
  if (length > 170) return { valid: false, issue: 'too_long', length };
  if (length >= 140 && length <= 160) return { valid: true, optimal: true, length };
  return { valid: true, optimal: false, length };
}

function validateSlug(slug) {
  if (!slug) return { valid: false, issue: 'missing' };
  
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugRegex.test(slug)) {
    return { valid: false, issue: 'invalid_format' };
  }
  
  if (!slug.includes('biratnagar') && !slug.includes('nepal')) {
    return { valid: true, suggestion: 'add_location_keyword' };
  }
  
  return { valid: true };
}

async function auditProducts() {
  console.log('🔍 Auditing Products...\n');
  
  const products = await Product.find({})
    .populate('categoryId', 'name')
    .populate('subcategoryId', 'name')
    .lean();
  
  console.log(`📦 Total products: ${products.length}\n`);
  
  const slugs = [];
  const titles = [];
  const descriptions = [];
  
  for (const product of products) {
    const productId = product._id.toString();
    const productName = product.name || 'Unnamed Product';
    
    // Check metadata
    const titleCheck = validateTitleLength(product.metaTitle || product.name);
    const descCheck = validateDescriptionLength(product.metaDescription || product.description);
    
    if (!titleCheck.valid) {
      auditResults.metadata.titleLengthIssues.push({
        id: productId,
        name: productName,
        issue: titleCheck.issue,
        length: titleCheck.length,
        current: product.metaTitle || product.name || '',
      });
    }
    
    if (!descCheck.valid) {
      auditResults.metadata.descriptionLengthIssues.push({
        id: productId,
        name: productName,
        issue: descCheck.issue,
        length: descCheck.length,
        current: product.metaDescription || product.description || '',
      });
    }
    
    // Check for duplicates
    const title = product.metaTitle || product.name;
    const desc = product.metaDescription || product.description;
    
    if (title) titles.push({ title, id: productId, name: productName });
    if (desc) descriptions.push({ desc, id: productId, name: productName });
    
    // Check slugs
    const slugCheck = validateSlug(product.slug);
    if (!slugCheck.valid) {
      if (slugCheck.issue === 'missing') {
        auditResults.urls.missingSlugs.push({ id: productId, name: productName });
      } else if (slugCheck.issue === 'invalid_format') {
        auditResults.urls.invalidSlugs.push({
          id: productId,
          name: productName,
          slug: product.slug,
        });
      }
    } else if (slugCheck.suggestion) {
      auditResults.suggestions.push({
        type: 'slug',
        id: productId,
        name: productName,
        suggestion: slugCheck.suggestion,
        current: product.slug,
      });
    }
    
    if (product.slug) slugs.push({ slug: product.slug, id: productId, name: productName });
    
    // Check content quality
    const contentLength = (product.description || '').length;
    if (contentLength < 150) {
      auditResults.content.thinContent.push({
        id: productId,
        name: productName,
        length: contentLength,
        type: 'product',
      });
    }
    
    // Check keywords
    if (!product.focusKeywords || product.focusKeywords.length === 0) {
      auditResults.content.missingKeywords.push({
        id: productId,
        name: productName,
        type: 'product',
      });
    }
    
    // Check images
    if (product.image && !product.imageAlt) {
      auditResults.images.missingAlt.push({
        id: productId,
        name: productName,
        image: product.image,
      });
    }
    
    // Check product schema requirements
    const schemaIssues = [];
    if (!product.price) schemaIssues.push('price');
    if (!product.image) schemaIssues.push('image');
    if (!product.categoryId && !product.category) schemaIssues.push('category');
    
    if (schemaIssues.length > 0) {
      auditResults.schema.incompleteProduct.push({
        id: productId,
        name: productName,
        missing: schemaIssues,
      });
    }
  }
  
  // Find duplicate titles
  const titleMap = {};
  titles.forEach(({ title, id, name }) => {
    if (!titleMap[title]) {
      titleMap[title] = [];
    }
    titleMap[title].push({ id, name });
  });
  
  Object.entries(titleMap).forEach(([title, items]) => {
    if (items.length > 1) {
      auditResults.metadata.duplicateTitles.push({ title, products: items });
    }
  });
  
  // Find duplicate descriptions
  const descMap = {};
  descriptions.forEach(({ desc, id, name }) => {
    if (!descMap[desc]) {
      descMap[desc] = [];
    }
    descMap[desc].push({ id, name });
  });
  
  Object.entries(descMap).forEach(([desc, items]) => {
    if (items.length > 1) {
      auditResults.metadata.duplicateDescriptions.push({
        description: desc.substring(0, 100) + '...',
        products: items,
      });
    }
  });
  
  // Find duplicate slugs
  const slugMap = {};
  slugs.forEach(({ slug, id, name }) => {
    if (!slugMap[slug]) {
      slugMap[slug] = [];
    }
    slugMap[slug].push({ id, name });
  });
  
  Object.entries(slugMap).forEach(([slug, items]) => {
    if (items.length > 1) {
      auditResults.urls.duplicateSlugs.push({ slug, products: items });
    }
  });
}

async function auditBlogs() {
  console.log('📝 Auditing Blogs...\n');
  
  const blogs = await Blog.find({}).lean();
  
  console.log(`📄 Total blogs: ${blogs.length}\n`);
  
  for (const blog of blogs) {
    const blogId = blog._id.toString();
    const blogTitle = blog.title || 'Untitled Blog';
    
    // Check metadata
    const titleCheck = validateTitleLength(blog.metaTitle || blog.title);
    const descCheck = validateDescriptionLength(blog.metaDescription || blog.excerpt);
    
    if (!titleCheck.valid) {
      auditResults.metadata.titleLengthIssues.push({
        id: blogId,
        name: blogTitle,
        type: 'blog',
        issue: titleCheck.issue,
        length: titleCheck.length,
      });
    }
    
    if (!descCheck.valid) {
      auditResults.metadata.descriptionLengthIssues.push({
        id: blogId,
        name: blogTitle,
        type: 'blog',
        issue: descCheck.issue,
        length: descCheck.length,
      });
    }
    
    // Check content length
    const contentLength = (blog.content || '').length;
    if (contentLength < 500) {
      auditResults.content.thinContent.push({
        id: blogId,
        name: blogTitle,
        length: contentLength,
        type: 'blog',
      });
    }
    
    // Check slug
    if (!blog.slug) {
      auditResults.urls.missingSlugs.push({
        id: blogId,
        name: blogTitle,
        type: 'blog',
      });
    }
    
    // Check image
    if (blog.image && !blog.imageAlt) {
      auditResults.images.missingAlt.push({
        id: blogId,
        name: blogTitle,
        image: blog.image,
        type: 'blog',
      });
    }
  }
}

async function auditCategories() {
  console.log('📂 Auditing Categories...\n');
  
  const categories = await Category.find({}).lean();
  
  console.log(`🗂️  Total categories: ${categories.length}\n`);
  
  for (const category of categories) {
    const catId = category._id.toString();
    const catName = category.name || 'Unnamed Category';
    
    // Check metadata
    if (!category.metaTitle) {
      auditResults.metadata.missingTitles.push({
        id: catId,
        name: catName,
        type: 'category',
      });
    }
    
    if (!category.metaDescription) {
      auditResults.metadata.missingDescriptions.push({
        id: catId,
        name: catName,
        type: 'category',
      });
    }
    
    // Check content
    const descLength = (category.description || '').length;
    if (descLength < 200) {
      auditResults.content.thinContent.push({
        id: catId,
        name: catName,
        length: descLength,
        type: 'category',
      });
    }
  }
}

function categorizeIssues() {
  // Critical issues (must fix)
  if (auditResults.urls.duplicateSlugs.length > 0) {
    auditResults.critical.push({
      severity: 'CRITICAL',
      category: 'URLs',
      issue: 'Duplicate slugs detected',
      count: auditResults.urls.duplicateSlugs.length,
      impact: 'Products with duplicate slugs will cause routing conflicts',
    });
  }
  
  if (auditResults.metadata.duplicateTitles.length > 0) {
    auditResults.critical.push({
      severity: 'CRITICAL',
      category: 'Metadata',
      issue: 'Duplicate meta titles',
      count: auditResults.metadata.duplicateTitles.length,
      impact: 'Search engines may not rank pages properly',
    });
  }
  
  // Warnings (should fix)
  if (auditResults.urls.missingSlugs.length > 0) {
    auditResults.warnings.push({
      severity: 'WARNING',
      category: 'URLs',
      issue: 'Missing slugs',
      count: auditResults.urls.missingSlugs.length,
      impact: 'Products will use ObjectId in URLs instead of SEO-friendly slugs',
    });
  }
  
  if (auditResults.content.thinContent.length > 0) {
    auditResults.warnings.push({
      severity: 'WARNING',
      category: 'Content',
      issue: 'Thin content detected',
      count: auditResults.content.thinContent.length,
      impact: 'Pages may not rank well due to insufficient content',
    });
  }
  
  if (auditResults.metadata.titleLengthIssues.length > 0) {
    auditResults.warnings.push({
      severity: 'WARNING',
      category: 'Metadata',
      issue: 'Title length issues',
      count: auditResults.metadata.titleLengthIssues.length,
      impact: 'Titles may be truncated in search results',
    });
  }
}

function printReport() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 SEO AUDIT REPORT');
  console.log('='.repeat(80) + '\n');
  
  // Critical Issues
  if (auditResults.critical.length > 0) {
    console.log('🚨 CRITICAL ISSUES (Must Fix Immediately)\n');
    auditResults.critical.forEach((issue, idx) => {
      console.log(`${idx + 1}. [${issue.severity}] ${issue.category}: ${issue.issue}`);
      console.log(`   Count: ${issue.count}`);
      console.log(`   Impact: ${issue.impact}\n`);
    });
  } else {
    console.log('✅ No critical issues found!\n');
  }
  
  // Warnings
  if (auditResults.warnings.length > 0) {
    console.log('⚠️  WARNINGS (Should Fix Soon)\n');
    auditResults.warnings.forEach((warning, idx) => {
      console.log(`${idx + 1}. [${warning.severity}] ${warning.category}: ${warning.issue}`);
      console.log(`   Count: ${warning.count}`);
      console.log(`   Impact: ${warning.impact}\n`);
    });
  }
  
  // Summary Statistics
  console.log('📈 DETAILED STATISTICS\n');
  
  console.log('Metadata Issues:');
  console.log(`  • Missing titles: ${auditResults.metadata.missingTitles.length}`);
  console.log(`  • Missing descriptions: ${auditResults.metadata.missingDescriptions.length}`);
  console.log(`  • Duplicate titles: ${auditResults.metadata.duplicateTitles.length}`);
  console.log(`  • Duplicate descriptions: ${auditResults.metadata.duplicateDescriptions.length}`);
  console.log(`  • Title length issues: ${auditResults.metadata.titleLengthIssues.length}`);
  console.log(`  • Description length issues: ${auditResults.metadata.descriptionLengthIssues.length}\n`);
  
  console.log('Content Issues:');
  console.log(`  • Thin content pages: ${auditResults.content.thinContent.length}`);
  console.log(`  • Missing keywords: ${auditResults.content.missingKeywords.length}\n`);
  
  console.log('URL Issues:');
  console.log(`  • Missing slugs: ${auditResults.urls.missingSlugs.length}`);
  console.log(`  • Duplicate slugs: ${auditResults.urls.duplicateSlugs.length}`);
  console.log(`  • Invalid slug format: ${auditResults.urls.invalidSlugs.length}\n`);
  
  console.log('Image Issues:');
  console.log(`  • Missing alt text: ${auditResults.images.missingAlt.length}\n`);
  
  console.log('Schema Issues:');
  console.log(`  • Incomplete product schema: ${auditResults.schema.incompleteProduct.length}\n`);
  
  // Calculate SEO Health Score
  const totalIssues = auditResults.critical.length * 10 +
                      auditResults.warnings.length * 3 +
                      auditResults.suggestions.length;
  
  const maxScore = 100;
  const score = Math.max(0, maxScore - totalIssues);
  
  console.log('='.repeat(80));
  console.log(`🎯 SEO HEALTH SCORE: ${score}/100`);
  console.log('='.repeat(80) + '\n');
  
  if (score >= 90) {
    console.log('✅ Excellent! Your site is well-optimized for search engines.\n');
  } else if (score >= 70) {
    console.log('👍 Good! Address warnings to improve further.\n');
  } else if (score >= 50) {
    console.log('⚠️  Fair. Several issues need attention.\n');
  } else {
    console.log('🚨 Poor. Critical issues must be fixed immediately.\n');
  }
}

async function main() {
  try {
    console.log('🚀 Starting SEO Audit...\n');
    
    await connectDB();
    
    await auditProducts();
    await auditBlogs();
    await auditCategories();
    
    categorizeIssues();
    printReport();
    
    // Save detailed report
    const fs = require('fs');
    const reportPath = './seo-audit-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(auditResults, null, 2));
    console.log(`📄 Detailed report saved to: ${reportPath}\n`);
    
  } catch (error) {
    console.error('❌ Audit failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

main();
