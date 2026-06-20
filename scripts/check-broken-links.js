#!/usr/bin/env node

/**
 * Broken Links Checker
 * Crawls internal links and checks for 404s
 */

const mongoose = require('mongoose');
const https = require('https');
const http = require('http');
require('dotenv').config({ path: '.env.local' });

const Product = require('../models/Product').default;
const Blog = require('../models/Blog').default;
const Category = require('../models/Category').default;

const MONGODB_URI = process.env.MONGODB_URI;
const BASE_URL = 'https://manishsteel.com.np';

const brokenLinks = [];
const checkedUrls = new Set();

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

function checkUrl(url) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const req = protocol.get(url, { timeout: 10000 }, (res) => {
      resolve({
        url,
        statusCode: res.statusCode,
        ok: res.statusCode >= 200 && res.statusCode < 400,
      });
    });
    
    req.on('error', (error) => {
      resolve({
        url,
        statusCode: 0,
        ok: false,
        error: error.message,
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        statusCode: 0,
        ok: false,
        error: 'Request timeout',
      });
    });
  });
}

async function checkInternalLinks() {
  console.log('🔍 Checking internal links...\n');
  
  // Static pages
  const staticPages = [
    '/',
    '/products',
    '/blogs',
    '/about',
    '/contact',
    '/gallery',
    '/custom-order',
    '/faq',
  ];
  
  console.log('Checking static pages...');
  for (const page of staticPages) {
    const url = `${BASE_URL}${page}`;
    if (!checkedUrls.has(url)) {
      checkedUrls.add(url);
      const result = await checkUrl(url);
      if (!result.ok) {
        brokenLinks.push({
          type: 'static_page',
          url: page,
          statusCode: result.statusCode,
          error: result.error,
        });
      }
      process.stdout.write('.');
    }
  }
  console.log('\n');
  
  // Product pages
  console.log('Checking product pages...');
  const products = await Product.find({ isActive: { $ne: false } })
    .select('_id slug name')
    .limit(100) // Limit for testing
    .lean();
  
  for (const product of products) {
    const slugOrId = product.slug || product._id.toString();
    const url = `${BASE_URL}/products/${slugOrId}`;
    
    if (!checkedUrls.has(url)) {
      checkedUrls.add(url);
      const result = await checkUrl(url);
      if (!result.ok) {
        brokenLinks.push({
          type: 'product',
          id: product._id.toString(),
          name: product.name,
          url: `/products/${slugOrId}`,
          statusCode: result.statusCode,
          error: result.error,
        });
      }
      process.stdout.write('.');
    }
  }
  console.log('\n');
  
  // Blog pages
  console.log('Checking blog pages...');
  const blogs = await Blog.find({ status: 'published' })
    .select('_id slug title')
    .lean();
  
  for (const blog of blogs) {
    if (blog.slug) {
      const url = `${BASE_URL}/blogs/${blog.slug}`;
      
      if (!checkedUrls.has(url)) {
        checkedUrls.add(url);
        const result = await checkUrl(url);
        if (!result.ok) {
          brokenLinks.push({
            type: 'blog',
            id: blog._id.toString(),
            title: blog.title,
            url: `/blogs/${blog.slug}`,
            statusCode: result.statusCode,
            error: result.error,
          });
        }
        process.stdout.write('.');
      }
    }
  }
  console.log('\n');
}

async function checkRobotsTxt() {
  console.log('🤖 Checking robots.txt...\n');
  
  const robotsUrl = `${BASE_URL}/robots.txt`;
  const result = await checkUrl(robotsUrl);
  
  if (result.ok) {
    console.log('✅ robots.txt is accessible\n');
  } else {
    console.log(`❌ robots.txt check failed: ${result.statusCode} - ${result.error}\n`);
    brokenLinks.push({
      type: 'robots_txt',
      url: '/robots.txt',
      statusCode: result.statusCode,
      error: result.error,
    });
  }
}

async function checkSitemaps() {
  console.log('🗺️  Checking sitemaps...\n');
  
  const sitemaps = [
    '/sitemap.xml',
    '/image-sitemap.xml',
  ];
  
  for (const sitemap of sitemaps) {
    const url = `${BASE_URL}${sitemap}`;
    const result = await checkUrl(url);
    
    if (result.ok) {
      console.log(`✅ ${sitemap} is accessible`);
    } else {
      console.log(`❌ ${sitemap} check failed: ${result.statusCode}`);
      brokenLinks.push({
        type: 'sitemap',
        url: sitemap,
        statusCode: result.statusCode,
        error: result.error,
      });
    }
  }
  console.log('');
}

function printReport() {
  console.log('\n' + '='.repeat(80));
  console.log('🔗 BROKEN LINKS REPORT');
  console.log('='.repeat(80) + '\n');
  
  console.log(`Total URLs checked: ${checkedUrls.size}`);
  console.log(`Broken links found: ${brokenLinks.length}\n`);
  
  if (brokenLinks.length === 0) {
    console.log('✅ No broken links found! All internal links are working.\n');
  } else {
    console.log('❌ Broken links detected:\n');
    
    const byType = {};
    brokenLinks.forEach((link) => {
      if (!byType[link.type]) {
        byType[link.type] = [];
      }
      byType[link.type].push(link);
    });
    
    Object.entries(byType).forEach(([type, links]) => {
      console.log(`\n${type.toUpperCase()} (${links.length}):`);
      links.forEach((link, idx) => {
        console.log(`  ${idx + 1}. ${link.url}`);
        console.log(`     Status: ${link.statusCode}${link.error ? ` (${link.error})` : ''}`);
        if (link.name) console.log(`     Name: ${link.name}`);
      });
    });
    
    console.log('');
  }
  
  console.log('='.repeat(80) + '\n');
}

async function main() {
  try {
    console.log('🚀 Starting Broken Links Check...\n');
    
    await connectDB();
    
    await checkRobotsTxt();
    await checkSitemaps();
    await checkInternalLinks();
    
    printReport();
    
    // Save report
    const fs = require('fs');
    const reportPath = './broken-links-report.json';
    fs.writeFileSync(reportPath, JSON.stringify({
      checkedAt: new Date().toISOString(),
      totalChecked: checkedUrls.size,
      brokenCount: brokenLinks.length,
      brokenLinks,
    }, null, 2));
    console.log(`📄 Detailed report saved to: ${reportPath}\n`);
    
  } catch (error) {
    console.error('❌ Check failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

main();
