#!/usr/bin/env node

/**
 * Comprehensive SEO Audit Runner
 * Runs all SEO checks: metadata, broken links, robots.txt, sitemaps, content quality
 * 
 * Usage: node scripts/run-seo-audit.js [--live] [--output=<path>]
 *   --live     Also check live URLs (requires site to be running)
 *   --output   Save JSON report to specified path (default: ./seo-audit-results.json)
 */

const mongoose = require('mongoose');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://manishsteel.com.np';

const args = process.argv.slice(2);
const CHECK_LIVE = args.includes('--live');
const outputArg = args.find(a => a.startsWith('--output='));
const OUTPUT_PATH = outputArg ? outputArg.split('=')[1] : path.join(__dirname, '../seo-audit-results.json');

// ─── Report Structure ───────────────────────────────────────────────────────
const report = {
  auditedAt: new Date().toISOString(),
  baseUrl: BASE_URL,
  summary: {
    critical: 0,
    warnings: 0,
    passed: 0,
    healthScore: 100,
  },
  sections: {
    robots: { status: 'not_checked', issues: [] },
    sitemaps: { status: 'not_checked', issues: [] },
    metadata: { status: 'not_checked', issues: [] },
    content: { status: 'not_checked', issues: [] },
    urls: { status: 'not_checked', issues: [] },
    images: { status: 'not_checked', issues: [] },
    schema: { status: 'not_checked', issues: [] },
    liveLinks: { status: 'not_checked', issues: [] },
  },
  details: {
    products: { total: 0, issues: [] },
    blogs: { total: 0, issues: [] },
    categories: { total: 0, issues: [] },
  },
};

// ─── Utilities ────────────────────────────────────────────────────────────────
function fetchUrl(url, timeout = 10000) {
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(url);
      const protocol = urlObj.protocol === 'https:' ? https : http;

      const req = protocol.get(url, { timeout }, (res) => {
        let body = '';
        res.on('data', chunk => { body += chunk; });
        res.on('end', () => resolve({ ok: res.statusCode >= 200 && res.statusCode < 400, status: res.statusCode, body }));
      });

      req.on('error', err => resolve({ ok: false, status: 0, error: err.message }));
      req.on('timeout', () => { req.destroy(); resolve({ ok: false, status: 0, error: 'timeout' }); });
    } catch (e) {
      resolve({ ok: false, status: 0, error: e.message });
    }
  });
}

function addIssue(section, severity, message, data = null) {
  const issue = { severity, message };
  if (data) issue.data = data;
  report.sections[section].issues.push(issue);

  if (severity === 'critical') report.summary.critical++;
  else if (severity === 'warning') report.summary.warnings++;
  else report.summary.passed++;
}

function validateTitleLength(title) {
  if (!title || !title.trim()) return { valid: false, issue: 'missing' };
  const len = title.trim().length;
  if (len < 30) return { valid: false, issue: 'too_short', length: len };
  if (len > 70) return { valid: false, issue: 'too_long', length: len };
  return { valid: true, optimal: len >= 50 && len <= 60, length: len };
}

function validateDescriptionLength(desc) {
  if (!desc || !desc.trim()) return { valid: false, issue: 'missing' };
  const len = desc.trim().length;
  if (len < 80) return { valid: false, issue: 'too_short', length: len };
  if (len > 170) return { valid: false, issue: 'too_long', length: len };
  return { valid: true, optimal: len >= 140 && len <= 160, length: len };
}

function validateSlug(slug) {
  if (!slug || !slug.trim()) return { valid: false, issue: 'missing' };
  const clean = slug.trim();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(clean)) return { valid: false, issue: 'invalid_format', slug: clean };
  if (!clean.includes('biratnagar') && !clean.includes('nepal')) return { valid: true, suggestion: 'missing_location' };
  return { valid: true };
}

// ─── Robots.txt Check ─────────────────────────────────────────────────────────
async function checkRobotsTxt() {
  console.log('\n🤖 Checking robots.txt...');

  if (!CHECK_LIVE) {
    // Static validation: read the robots.ts source
    const robotsPath = path.join(__dirname, '../app/robots.ts');
    if (!fs.existsSync(robotsPath)) {
      addIssue('robots', 'critical', 'robots.ts not found in app directory');
      report.sections.robots.status = 'fail';
      return;
    }

    const content = fs.readFileSync(robotsPath, 'utf8');
    const hasAdminDisallow = content.includes('/admin');
    const hasApiDisallow = content.includes('/api');
    const hasSitemapRef = content.includes('sitemap');

    if (!hasAdminDisallow) addIssue('robots', 'warning', 'Admin path not disallowed in robots.ts');
    else addIssue('robots', 'pass', 'Admin path is disallowed');

    if (!hasApiDisallow) addIssue('robots', 'warning', 'API path not disallowed in robots.ts');
    else addIssue('robots', 'pass', 'API path is disallowed');

    if (!hasSitemapRef) addIssue('robots', 'warning', 'No sitemap reference in robots.ts');
    else addIssue('robots', 'pass', 'Sitemap reference found in robots.ts');

    report.sections.robots.status = report.sections.robots.issues.some(i => i.severity === 'critical') ? 'fail' : 'pass';
    console.log('  ✅ robots.ts validated (static check)');
    return;
  }

  const res = await fetchUrl(`${BASE_URL}/robots.txt`);
  if (!res.ok) {
    addIssue('robots', 'critical', `robots.txt not accessible (HTTP ${res.status})`);
    report.sections.robots.status = 'fail';
    return;
  }

  const body = res.body || '';
  if (!body.includes('Disallow') && !body.includes('Allow')) {
    addIssue('robots', 'critical', 'robots.txt has no Allow/Disallow directives');
  } else {
    addIssue('robots', 'pass', 'robots.txt has valid directives');
  }

  if (!body.includes('Sitemap:')) addIssue('robots', 'warning', 'No Sitemap: reference in robots.txt');
  else addIssue('robots', 'pass', 'Sitemap reference found in robots.txt');

  report.sections.robots.status = 'pass';
  console.log('  ✅ robots.txt accessible and valid');
}

// ─── Sitemap Check ────────────────────────────────────────────────────────────
async function checkSitemaps() {
  console.log('\n🗺️  Checking sitemaps...');

  // Static check: verify sitemap source files exist
  const sitemapPath = path.join(__dirname, '../app/sitemap.ts');
  const imageSitemapPath = path.join(__dirname, '../app/image-sitemap.xml/route.ts');

  if (!fs.existsSync(sitemapPath)) {
    addIssue('sitemaps', 'critical', 'sitemap.ts not found in app directory');
  } else {
    const content = fs.readFileSync(sitemapPath, 'utf8');
    if (!content.includes('MetadataRoute.Sitemap')) {
      addIssue('sitemaps', 'warning', 'sitemap.ts may not be using Next.js MetadataRoute.Sitemap');
    } else {
      addIssue('sitemaps', 'pass', 'sitemap.ts uses proper Next.js sitemap format');
    }
    if (!content.includes("changeFrequency: 'daily'") && !content.includes("changeFrequency: 'weekly'")) {
      addIssue('sitemaps', 'warning', 'sitemap.ts has no changeFrequency values');
    } else {
      addIssue('sitemaps', 'pass', 'sitemap.ts includes changeFrequency values');
    }
    if (!content.includes('priority')) {
      addIssue('sitemaps', 'warning', 'sitemap.ts has no priority values');
    } else {
      addIssue('sitemaps', 'pass', 'sitemap.ts includes priority values');
    }
  }

  if (!fs.existsSync(imageSitemapPath)) {
    addIssue('sitemaps', 'warning', 'image-sitemap route not found');
  } else {
    addIssue('sitemaps', 'pass', 'Image sitemap route exists');
  }

  if (CHECK_LIVE) {
    const mainRes = await fetchUrl(`${BASE_URL}/sitemap.xml`);
    if (!mainRes.ok) {
      addIssue('sitemaps', 'critical', `Main sitemap not accessible (HTTP ${mainRes.status})`);
    } else {
      const urlCount = (mainRes.body.match(/<loc>/g) || []).length;
      addIssue('sitemaps', 'pass', `Main sitemap accessible with ${urlCount} URLs`);
    }

    const imgRes = await fetchUrl(`${BASE_URL}/image-sitemap.xml`);
    if (!imgRes.ok) {
      addIssue('sitemaps', 'warning', `Image sitemap not accessible (HTTP ${imgRes.status})`);
    } else {
      const imgCount = (imgRes.body.match(/<image:loc>/g) || []).length;
      addIssue('sitemaps', 'pass', `Image sitemap accessible with ${imgCount} images`);
    }
  }

  report.sections.sitemaps.status = report.sections.sitemaps.issues.some(i => i.severity === 'critical') ? 'fail' : 'pass';
  console.log('  ✅ Sitemaps checked');
}

// ─── Database Audits ──────────────────────────────────────────────────────────
async function connectDB() {
  if (!MONGODB_URI) {
    console.log('\n⚠️  MONGODB_URI not set — skipping database audits\n');
    return false;
  }
  if (mongoose.connection.readyState === 1) return true;

  try {
    await mongoose.connect(MONGODB_URI);
    return true;
  } catch (e) {
    console.log(`\n⚠️  Could not connect to MongoDB: ${e.message}\n`);
    return false;
  }
}

async function auditProducts() {
  console.log('\n📦 Auditing products...');

  let Product;
  try {
    Product = require('../models/Product').default;
  } catch (e) {
    addIssue('metadata', 'warning', 'Could not load Product model');
    return;
  }

  const products = await Product.find({}).lean();
  report.details.products.total = products.length;
  console.log(`  Found ${products.length} products`);

  const slugsSeen = new Map();
  const titlesSeen = new Map();

  for (const p of products) {
    const id = p._id.toString();
    const name = p.name || `ID:${id}`;

    // Title check
    const titleCheck = validateTitleLength(p.metaTitle || p.name);
    if (!titleCheck.valid) {
      report.details.products.issues.push({ id, name, type: 'title', issue: titleCheck.issue, length: titleCheck.length });
      addIssue('metadata', 'warning', `Product "${name}": title ${titleCheck.issue} (${titleCheck.length || 0} chars)`);
    }

    // Description check
    const descCheck = validateDescriptionLength(p.metaDescription || p.description);
    if (!descCheck.valid) {
      report.details.products.issues.push({ id, name, type: 'description', issue: descCheck.issue, length: descCheck.length });
      if (descCheck.issue === 'missing') {
        addIssue('metadata', 'critical', `Product "${name}": missing meta description`);
      } else {
        addIssue('metadata', 'warning', `Product "${name}": description ${descCheck.issue} (${descCheck.length || 0} chars)`);
      }
    }

    // Slug check
    const slugCheck = validateSlug(p.slug);
    if (!slugCheck.valid) {
      if (slugCheck.issue === 'missing') {
        addIssue('urls', 'critical', `Product "${name}": missing slug (uses ObjectId in URL)`);
      } else {
        addIssue('urls', 'warning', `Product "${name}": invalid slug format "${p.slug}"`);
      }
    } else if (slugCheck.suggestion === 'missing_location') {
      addIssue('urls', 'warning', `Product "${name}": slug "${p.slug}" missing location keyword`);
    }

    // Duplicate slug detection
    if (p.slug) {
      if (slugsSeen.has(p.slug)) {
        addIssue('urls', 'critical', `Duplicate slug "${p.slug}" on "${name}" and "${slugsSeen.get(p.slug)}"`);
      } else {
        slugsSeen.set(p.slug, name);
      }
    }

    // Duplicate title detection
    const effectiveTitle = (p.metaTitle || p.name || '').toLowerCase().trim();
    if (effectiveTitle) {
      if (titlesSeen.has(effectiveTitle)) {
        addIssue('metadata', 'warning', `Duplicate title "${effectiveTitle.slice(0, 40)}..." on "${name}"`);
      } else {
        titlesSeen.set(effectiveTitle, name);
      }
    }

    // Thin content
    const wordCount = (p.description || '').split(/\s+/).filter(Boolean).length;
    if (wordCount < 50) {
      addIssue('content', 'warning', `Product "${name}": thin content (${wordCount} words, target 150+)`);
    }

    // Image alt text
    if (p.image && !p.imageAlt) {
      addIssue('images', 'warning', `Product "${name}": main image missing alt text`);
    }

    // Schema fields
    if (!p.price) addIssue('schema', 'warning', `Product "${name}": missing price (required for Product schema)`);
  }
}

async function auditBlogs() {
  console.log('\n📝 Auditing blogs...');

  let Blog;
  try {
    Blog = require('../models/Blog').default;
  } catch (e) {
    return;
  }

  const blogs = await Blog.find({}).lean();
  report.details.blogs.total = blogs.length;
  console.log(`  Found ${blogs.length} blogs`);

  for (const b of blogs) {
    const id = b._id.toString();
    const title = b.title || `ID:${id}`;

    const titleCheck = validateTitleLength(b.metaTitle || b.title);
    if (!titleCheck.valid) {
      addIssue('metadata', 'warning', `Blog "${title}": title ${titleCheck.issue}`);
    }

    const descCheck = validateDescriptionLength(b.metaDescription || b.excerpt);
    if (!descCheck.valid && descCheck.issue === 'missing') {
      addIssue('metadata', 'warning', `Blog "${title}": missing meta description`);
    }

    if (!b.slug) {
      addIssue('urls', 'critical', `Blog "${title}": missing slug`);
    }

    const wordCount = (b.content || '').split(/\s+/).filter(Boolean).length;
    if (wordCount < 300) {
      addIssue('content', 'warning', `Blog "${title}": thin content (${wordCount} words, target 800+)`);
    }
  }
}

async function auditCategories() {
  console.log('\n📂 Auditing categories...');

  let Category;
  try {
    Category = require('../models/Category').default;
  } catch (e) {
    return;
  }

  const categories = await Category.find({}).lean();
  report.details.categories.total = categories.length;
  console.log(`  Found ${categories.length} categories`);

  for (const c of categories) {
    const name = c.name || c._id.toString();

    if (!c.metaTitle) addIssue('metadata', 'warning', `Category "${name}": missing meta title`);
    if (!c.metaDescription) addIssue('metadata', 'warning', `Category "${name}": missing meta description`);

    const descWords = (c.description || '').split(/\s+/).filter(Boolean).length;
    if (descWords < 100) {
      addIssue('content', 'warning', `Category "${name}": thin description (${descWords} words, target 200+)`);
    }
  }
}

// ─── Source Code Checks ───────────────────────────────────────────────────────
function auditSourceCode() {
  console.log('\n🔍 Auditing source code...');

  // Check canonical URLs are implemented
  const layoutPath = path.join(__dirname, '../app/layout.tsx');
  if (fs.existsSync(layoutPath)) {
    const content = fs.readFileSync(layoutPath, 'utf8');
    if (!content.includes('canonical')) {
      addIssue('metadata', 'warning', 'Root layout.tsx may not have canonical URL setup');
    } else {
      addIssue('metadata', 'pass', 'Root layout has canonical URL reference');
    }
    if (!content.includes('openGraph') && !content.includes('og:')) {
      addIssue('metadata', 'warning', 'Root layout.tsx may not have Open Graph tags');
    } else {
      addIssue('metadata', 'pass', 'Open Graph tags found in root layout');
    }
  }

  // Check middleware for redirects
  const middlewarePath = path.join(__dirname, '../middleware.ts');
  if (!fs.existsSync(middlewarePath)) {
    addIssue('urls', 'warning', 'middleware.ts not found — redirect handling may not be active');
  } else {
    const content = fs.readFileSync(middlewarePath, 'utf8');
    if (!content.includes('URLRedirect') && !content.includes('redirect')) {
      addIssue('urls', 'warning', 'middleware.ts does not appear to handle URL redirects');
    } else {
      addIssue('urls', 'pass', 'middleware.ts handles URL redirects');
    }
  }

  // Check schema generator
  const schemaPath = path.join(__dirname, '../lib/seo/schemaGenerator.ts');
  if (!fs.existsSync(schemaPath)) {
    addIssue('schema', 'critical', 'lib/seo/schemaGenerator.ts not found');
  } else {
    const content = fs.readFileSync(schemaPath, 'utf8');
    const schemas = ['LocalBusiness', 'Product', 'Article', 'BreadcrumbList'];
    schemas.forEach(s => {
      if (!content.includes(s)) {
        addIssue('schema', 'warning', `schemaGenerator.ts does not implement ${s} schema`);
      } else {
        addIssue('schema', 'pass', `${s} schema implemented`);
      }
    });
  }

  // Check image alt text in components
  const productCardPath = path.join(__dirname, '../components/common/ProductCard.tsx');
  if (fs.existsSync(productCardPath)) {
    const content = fs.readFileSync(productCardPath, 'utf8');
    if (!content.includes('alt=')) {
      addIssue('images', 'critical', 'ProductCard.tsx does not appear to set alt text on images');
    } else {
      addIssue('images', 'pass', 'ProductCard.tsx has alt text on images');
    }
  }

  console.log('  ✅ Source code checked');
}

// ─── Live URL Sampling ────────────────────────────────────────────────────────
async function sampleLiveUrls() {
  if (!CHECK_LIVE) return;

  console.log('\n🌐 Sampling live URLs...');

  const urls = ['/', '/products', '/blogs', '/about', '/contact', '/gallery'];
  let failed = 0;

  for (const u of urls) {
    const res = await fetchUrl(`${BASE_URL}${u}`, 8000);
    if (!res.ok) {
      addIssue('liveLinks', 'critical', `${u} returned HTTP ${res.status}`);
      failed++;
    } else {
      addIssue('liveLinks', 'pass', `${u} OK (${res.status})`);
    }
    process.stdout.write(res.ok ? '.' : 'x');
  }

  console.log('');
  report.sections.liveLinks.status = failed > 0 ? 'fail' : 'pass';
}

// ─── Scoring ──────────────────────────────────────────────────────────────────
function calculateScore() {
  const { critical, warnings } = report.summary;
  const deductions = critical * 8 + warnings * 2;
  report.summary.healthScore = Math.max(0, 100 - deductions);

  // Set section statuses
  for (const [key, section] of Object.entries(report.sections)) {
    if (section.status === 'not_checked') continue;
    const hasCritical = section.issues.some(i => i.severity === 'critical');
    const hasWarning = section.issues.some(i => i.severity === 'warning');
    section.status = hasCritical ? 'fail' : hasWarning ? 'warn' : 'pass';
  }
}

// ─── Report Printing ──────────────────────────────────────────────────────────
function printReport() {
  const line = '─'.repeat(70);
  console.log(`\n${'═'.repeat(70)}`);
  console.log('  SEO AUDIT REPORT — Manish Steel Furniture');
  console.log(`${'═'.repeat(70)}`);

  const { healthScore, critical, warnings, passed } = report.summary;
  const scoreEmoji = healthScore >= 90 ? '🟢' : healthScore >= 70 ? '🟡' : healthScore >= 50 ? '🟠' : '🔴';

  console.log(`\n  ${scoreEmoji} Health Score: ${healthScore}/100`);
  console.log(`  🚨 Critical: ${critical}  ⚠️  Warnings: ${warnings}  ✅ Passed: ${passed}\n`);
  console.log(line);

  for (const [name, section] of Object.entries(report.sections)) {
    if (section.status === 'not_checked') continue;

    const icon = section.status === 'pass' ? '✅' : section.status === 'warn' ? '⚠️ ' : '❌';
    const criticals = section.issues.filter(i => i.severity === 'critical');
    const warnings = section.issues.filter(i => i.severity === 'warning');

    console.log(`\n${icon} ${name.toUpperCase()}`);
    if (criticals.length > 0) {
      criticals.slice(0, 5).forEach(i => console.log(`    🚨 ${i.message}`));
      if (criticals.length > 5) console.log(`    🚨 ... and ${criticals.length - 5} more critical issues`);
    }
    if (warnings.length > 0) {
      warnings.slice(0, 5).forEach(i => console.log(`    ⚠️  ${i.message}`));
      if (warnings.length > 5) console.log(`    ⚠️  ... and ${warnings.length - 5} more warnings`);
    }
    if (criticals.length === 0 && warnings.length === 0) {
      console.log('    All checks passed');
    }
  }

  console.log(`\n${line}`);
  console.log(`\n  Database: ${report.details.products.total} products, ${report.details.blogs.total} blogs, ${report.details.categories.total} categories`);

  if (healthScore >= 90) {
    console.log('\n  ✅ Excellent — your site is well-optimized');
  } else if (healthScore >= 70) {
    console.log('\n  👍 Good — address warnings to improve further');
  } else if (healthScore >= 50) {
    console.log('\n  ⚠️  Fair — several issues need attention');
  } else {
    console.log('\n  🚨 Poor — critical issues must be fixed immediately');
  }

  console.log(`\n  📄 Full report saved to: ${OUTPUT_PATH}`);
  console.log(`${'═'.repeat(70)}\n`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🚀 Starting Comprehensive SEO Audit...');
  if (CHECK_LIVE) console.log(`   Mode: LIVE (checking ${BASE_URL})`);
  else console.log('   Mode: STATIC (source code + database checks)\n   Tip: Run with --live to also check live URLs');

  await checkRobotsTxt();
  await checkSitemaps();
  auditSourceCode();

  const hasDB = await connectDB();
  if (hasDB) {
    await auditProducts();
    await auditBlogs();
    await auditCategories();
    await mongoose.disconnect();
  }

  if (CHECK_LIVE) {
    await sampleLiveUrls();
  }

  calculateScore();
  printReport();

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(report, null, 2));

  process.exit(report.summary.critical > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('\n❌ Audit failed:', err.message);
  process.exit(1);
});
