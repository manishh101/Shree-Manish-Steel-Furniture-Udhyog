#!/usr/bin/env node

/**
 * Mobile Optimization Testing Script
 * 
 * Tests mobile-friendliness, performance, and usability across key pages.
 * Requirements: 8.1, 8.2, 8.3, 10.1
 * 
 * Usage: node scripts/test-mobile-optimization.js [url]
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.argv[2] || 'http://localhost:3000';

// Key pages to test
const TEST_PAGES = [
  '/',
  '/products',
  '/about',
  '/contact',
  '/blogs',
];

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.bold}${colors.cyan}${msg}${colors.reset}\n`),
};

/**
 * Fetch a URL and return response data
 */
async function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
      },
    };
    
    protocol
      .get(url, options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
          });
        });
      })
      .on('error', reject);
  });
}

/**
 * Check if page has mobile viewport meta tag
 */
function checkViewportMeta(html) {
  const viewportRegex = /<meta\s+name=["']viewport["']\s+content=["']([^"']+)["']/i;
  const match = html.match(viewportRegex);
  
  if (!match) {
    return {
      pass: false,
      message: 'No viewport meta tag found',
    };
  }
  
  const content = match[1];
  const hasWidth = content.includes('width=device-width');
  const hasInitialScale = content.includes('initial-scale=1');
  
  if (hasWidth && hasInitialScale) {
    return {
      pass: true,
      message: 'Viewport configured correctly',
    };
  }
  
  return {
    pass: false,
    message: `Viewport meta incomplete: ${content}`,
  };
}

/**
 * Check if page has proper responsive image attributes
 */
function checkResponsiveImages(html) {
  const imgRegex = /<img[^>]+>/gi;
  const images = html.match(imgRegex) || [];
  
  let hasWidthHeight = 0;
  let hasSrcset = 0;
  let hasLoading = 0;
  
  images.forEach((img) => {
    if (img.includes('width=') && img.includes('height=')) {
      hasWidthHeight++;
    }
    if (img.includes('srcset=')) {
      hasSrcset++;
    }
    if (img.includes('loading=')) {
      hasLoading++;
    }
  });
  
  const total = images.length;
  
  return {
    total,
    withDimensions: hasWidthHeight,
    withSrcset: hasSrcset,
    withLazyLoading: hasLoading,
    pass: total > 0 && hasWidthHeight / total > 0.8,
  };
}

/**
 * Check if page has proper touch target sizes
 */
function checkTouchTargets(html) {
  // Look for buttons and links with minimum size classes
  const hasMinTouchTargets =
    html.includes('min-h-[44px]') ||
    html.includes('min-h-[48px]') ||
    html.includes('h-12') ||
    html.includes('h-14') ||
    html.includes('p-3') ||
    html.includes('p-4');
  
  return {
    pass: hasMinTouchTargets,
    message: hasMinTouchTargets
      ? 'Touch target size classes found'
      : 'No minimum touch target size classes detected',
  };
}

/**
 * Check mobile-specific optimizations
 */
function checkMobileOptimizations(html) {
  const optimizations = {
    hasPreconnect: html.includes('<link rel="preconnect"'),
    hasDNSPrefetch: html.includes('<link rel="dns-prefetch"'),
    hasPreload: html.includes('<link rel="preload"'),
    hasAsyncScripts: html.includes('async') || html.includes('defer'),
    hasServiceWorker: html.includes('serviceWorker'),
  };
  
  return optimizations;
}

/**
 * Check Core Web Vitals optimizations
 */
function checkCoreWebVitals(html, headers) {
  const checks = {
    lcpOptimized: false,
    clsPrevented: false,
    fidOptimized: false,
  };
  
  // LCP: Check for priority images
  checks.lcpOptimized =
    html.includes('priority') ||
    html.includes('fetchpriority="high"') ||
    html.includes('loading="eager"');
  
  // CLS: Check for image dimensions
  checks.clsPrevented =
    html.includes('aspect-ratio') ||
    html.includes('width=') && html.includes('height=');
  
  // FID: Check for deferred scripts
  checks.fidOptimized =
    html.includes('defer') ||
    html.includes('async') ||
    html.includes('type="module"');
  
  return checks;
}

/**
 * Test a single page
 */
async function testPage(path) {
  const url = `${BASE_URL}${path}`;
  log.info(`Testing: ${url}`);
  
  try {
    const response = await fetchPage(url);
    const { statusCode, headers, body } = response;
    
    // Check HTTP status
    if (statusCode !== 200) {
      log.error(`HTTP ${statusCode}`);
      return false;
    }
    log.success(`HTTP ${statusCode}`);
    
    // Check viewport meta
    const viewport = checkViewportMeta(body);
    if (viewport.pass) {
      log.success(viewport.message);
    } else {
      log.error(viewport.message);
    }
    
    // Check responsive images
    const images = checkResponsiveImages(body);
    log.info(`Images: ${images.total} total, ${images.withDimensions} with dimensions, ${images.withLazyLoading} with lazy loading`);
    if (images.pass) {
      log.success('Image optimization acceptable');
    } else {
      log.warn(`Only ${Math.round((images.withDimensions / images.total) * 100)}% of images have dimensions`);
    }
    
    // Check touch targets
    const touch = checkTouchTargets(body);
    if (touch.pass) {
      log.success(touch.message);
    } else {
      log.warn(touch.message);
    }
    
    // Check mobile optimizations
    const mobile = checkMobileOptimizations(body);
    log.info('Mobile Optimizations:');
    Object.entries(mobile).forEach(([key, value]) => {
      if (value) {
        log.success(`  ${key}`);
      } else {
        log.warn(`  ${key} not found`);
      }
    });
    
    // Check Core Web Vitals
    const cwv = checkCoreWebVitals(body, headers);
    log.info('Core Web Vitals Optimizations:');
    Object.entries(cwv).forEach(([key, value]) => {
      if (value) {
        log.success(`  ${key}`);
      } else {
        log.warn(`  ${key} not optimized`);
      }
    });
    
    return true;
  } catch (error) {
    log.error(`Failed to test page: ${error.message}`);
    return false;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  log.section('Mobile Optimization Test Suite');
  log.info(`Testing base URL: ${BASE_URL}`);
  
  let passed = 0;
  let failed = 0;
  
  for (const path of TEST_PAGES) {
    log.section(`\nPage: ${path}`);
    const result = await testPage(path);
    
    if (result) {
      passed++;
    } else {
      failed++;
    }
    
    // Add delay between requests
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  
  log.section('\nTest Summary');
  log.info(`Total pages: ${TEST_PAGES.length}`);
  log.success(`Passed: ${passed}`);
  if (failed > 0) {
    log.error(`Failed: ${failed}`);
  }
  
  if (failed === 0) {
    log.success('\n✓ All mobile optimization tests passed!');
  } else {
    log.warn('\n⚠ Some tests failed. Review the output above for details.');
  }
  
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch((error) => {
  log.error(`Test suite failed: ${error.message}`);
  process.exit(1);
});
