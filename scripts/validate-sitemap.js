#!/usr/bin/env node

/**
 * Sitemap Validator
 * Validates sitemap structure, URLs, and accessibility
 */

const https = require('https');
const xml2js = require('xml2js');

const BASE_URL = 'https://manishsteel.com.np';

const validationResults = {
  mainSitemap: {
    accessible: false,
    valid: false,
    urlCount: 0,
    issues: [],
  },
  imageSitemap: {
    accessible: false,
    valid: false,
    urlCount: 0,
    imageCount: 0,
    issues: [],
  },
};

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 15000 }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ data, statusCode: res.statusCode });
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    }).on('error', reject)
      .on('timeout', () => {
        reject(new Error('Request timeout'));
      });
  });
}

async function validateMainSitemap() {
  console.log('🗺️  Validating main sitemap...\n');
  
  try {
    const result = await fetchUrl(`${BASE_URL}/sitemap.xml`);
    validationResults.mainSitemap.accessible = true;
    
    console.log('✅ Sitemap is accessible');
    console.log(`   Status Code: ${result.statusCode}\n`);
    
    // Parse XML
    const parser = new xml2js.Parser();
    const parsed = await parser.parseStringPromise(result.data);
    
    if (!parsed.urlset || !parsed.urlset.url) {
      validationResults.mainSitemap.issues.push('Invalid sitemap structure');
      console.log('❌ Invalid sitemap structure\n');
      return;
    }
    
    validationResults.mainSitemap.valid = true;
    validationResults.mainSitemap.urlCount = parsed.urlset.url.length;
    
    console.log(`✅ Valid XML structure`);
    console.log(`   Total URLs: ${parsed.urlset.url.length}\n`);
    
    // Validate URLs
    const urls = parsed.urlset.url;
    const issues = [];
    
    urls.forEach((urlEntry, idx) => {
      if (!urlEntry.loc || !urlEntry.loc[0]) {
        issues.push(`URL #${idx + 1}: Missing <loc> element`);
      } else {
        const url = urlEntry.loc[0];
        
        // Check URL format
        if (!url.startsWith(BASE_URL)) {
          issues.push(`URL #${idx + 1}: Invalid base URL - ${url}`);
        }
        
        // Check for proper URL encoding
        if (url.includes(' ')) {
          issues.push(`URL #${idx + 1}: Contains spaces - ${url}`);
        }
      }
      
      // Check lastmod format
      if (urlEntry.lastModified && urlEntry.lastModified[0]) {
        const lastMod = urlEntry.lastModified[0];
        if (!/^\d{4}-\d{2}-\d{2}/.test(lastMod)) {
          issues.push(`URL #${idx + 1}: Invalid lastModified format - ${lastMod}`);
        }
      }
      
      // Check changefreq values
      if (urlEntry.changefreq && urlEntry.changefreq[0]) {
        const validFreqs = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
        if (!validFreqs.includes(urlEntry.changefreq[0])) {
          issues.push(`URL #${idx + 1}: Invalid changefreq - ${urlEntry.changefreq[0]}`);
        }
      }
      
      // Check priority range
      if (urlEntry.priority && urlEntry.priority[0]) {
        const priority = parseFloat(urlEntry.priority[0]);
        if (priority < 0 || priority > 1) {
          issues.push(`URL #${idx + 1}: Priority out of range (0-1) - ${priority}`);
        }
      }
    });
    
    if (issues.length > 0) {
      console.log(`⚠️  Found ${issues.length} issues:\n`);
      issues.slice(0, 10).forEach((issue) => {
        console.log(`   • ${issue}`);
      });
      if (issues.length > 10) {
        console.log(`   ... and ${issues.length - 10} more\n`);
      }
      validationResults.mainSitemap.issues = issues;
    } else {
      console.log('✅ All URLs are valid\n');
    }
    
  } catch (error) {
    console.log(`❌ Failed to access sitemap: ${error.message}\n`);
    validationResults.mainSitemap.issues.push(error.message);
  }
}

async function validateImageSitemap() {
  console.log('🖼️  Validating image sitemap...\n');
  
  try {
    const result = await fetchUrl(`${BASE_URL}/image-sitemap.xml`);
    validationResults.imageSitemap.accessible = true;
    
    console.log('✅ Image sitemap is accessible');
    console.log(`   Status Code: ${result.statusCode}\n`);
    
    // Parse XML
    const parser = new xml2js.Parser();
    const parsed = await parser.parseStringPromise(result.data);
    
    if (!parsed.urlset || !parsed.urlset.url) {
      validationResults.imageSitemap.issues.push('Invalid sitemap structure');
      console.log('❌ Invalid sitemap structure\n');
      return;
    }
    
    validationResults.imageSitemap.valid = true;
    validationResults.imageSitemap.urlCount = parsed.urlset.url.length;
    
    // Count images
    let totalImages = 0;
    const issues = [];
    
    parsed.urlset.url.forEach((urlEntry, idx) => {
      if (!urlEntry.loc || !urlEntry.loc[0]) {
        issues.push(`URL #${idx + 1}: Missing <loc> element`);
        return;
      }
      
      // Check for image:image elements
      const images = urlEntry['image:image'];
      if (!images || images.length === 0) {
        issues.push(`URL #${idx + 1}: No images found for ${urlEntry.loc[0]}`);
        return;
      }
      
      totalImages += images.length;
      
      // Validate each image
      images.forEach((img, imgIdx) => {
        if (!img['image:loc'] || !img['image:loc'][0]) {
          issues.push(`URL #${idx + 1}, Image #${imgIdx + 1}: Missing image:loc`);
        }
        
        if (!img['image:title'] || !img['image:title'][0]) {
          issues.push(`URL #${idx + 1}, Image #${imgIdx + 1}: Missing image:title`);
        }
        
        if (!img['image:caption'] || !img['image:caption'][0]) {
          issues.push(`URL #${idx + 1}, Image #${imgIdx + 1}: Missing image:caption`);
        }
        
        // Check for proper XML escaping
        const title = img['image:title'] ? img['image:title'][0] : '';
        const caption = img['image:caption'] ? img['image:caption'][0] : '';
        
        if (title.includes('<') || title.includes('>')) {
          issues.push(`URL #${idx + 1}, Image #${imgIdx + 1}: Unescaped XML in title`);
        }
        
        if (caption.includes('<') || caption.includes('>')) {
          issues.push(`URL #${idx + 1}, Image #${imgIdx + 1}: Unescaped XML in caption`);
        }
      });
    });
    
    validationResults.imageSitemap.imageCount = totalImages;
    
    console.log(`✅ Valid XML structure`);
    console.log(`   Total URLs: ${parsed.urlset.url.length}`);
    console.log(`   Total Images: ${totalImages}\n`);
    
    if (issues.length > 0) {
      console.log(`⚠️  Found ${issues.length} issues:\n`);
      issues.slice(0, 10).forEach((issue) => {
        console.log(`   • ${issue}`);
      });
      if (issues.length > 10) {
        console.log(`   ... and ${issues.length - 10} more\n`);
      }
      validationResults.imageSitemap.issues = issues;
    } else {
      console.log('✅ All image entries are valid\n');
    }
    
  } catch (error) {
    console.log(`❌ Failed to access image sitemap: ${error.message}\n`);
    validationResults.imageSitemap.issues.push(error.message);
  }
}

async function validateRobotsTxt() {
  console.log('🤖 Validating robots.txt...\n');
  
  try {
    const result = await fetchUrl(`${BASE_URL}/robots.txt`);
    
    console.log('✅ robots.txt is accessible');
    console.log(`   Status Code: ${result.statusCode}\n`);
    
    // Check for sitemap references
    const content = result.data;
    const hasSitemapRef = content.includes('Sitemap:');
    const hasMainSitemap = content.includes('/sitemap.xml');
    const hasImageSitemap = content.includes('/image-sitemap.xml');
    
    console.log('Sitemap references:');
    console.log(`   • Main sitemap: ${hasMainSitemap ? '✅' : '❌'}`);
    console.log(`   • Image sitemap: ${hasImageSitemap ? '✅' : '❌'}\n`);
    
    if (!hasSitemapRef) {
      console.log('⚠️  No sitemap references found in robots.txt\n');
    }
    
    // Check for important paths
    const disallowAdmin = content.includes('/admin');
    const disallowApi = content.includes('/api');
    
    console.log('Access control:');
    console.log(`   • Admin blocked: ${disallowAdmin ? '✅' : '⚠️ '}`);
    console.log(`   • API blocked: ${disallowApi ? '✅' : '⚠️ '}\n`);
    
  } catch (error) {
    console.log(`❌ Failed to access robots.txt: ${error.message}\n`);
  }
}

function printSummary() {
  console.log('='.repeat(80));
  console.log('📊 SITEMAP VALIDATION SUMMARY');
  console.log('='.repeat(80) + '\n');
  
  console.log('Main Sitemap:');
  console.log(`   Accessible: ${validationResults.mainSitemap.accessible ? '✅' : '❌'}`);
  console.log(`   Valid: ${validationResults.mainSitemap.valid ? '✅' : '❌'}`);
  console.log(`   URLs: ${validationResults.mainSitemap.urlCount}`);
  console.log(`   Issues: ${validationResults.mainSitemap.issues.length}\n`);
  
  console.log('Image Sitemap:');
  console.log(`   Accessible: ${validationResults.imageSitemap.accessible ? '✅' : '❌'}`);
  console.log(`   Valid: ${validationResults.imageSitemap.valid ? '✅' : '❌'}`);
  console.log(`   URLs: ${validationResults.imageSitemap.urlCount}`);
  console.log(`   Images: ${validationResults.imageSitemap.imageCount}`);
  console.log(`   Issues: ${validationResults.imageSitemap.issues.length}\n`);
  
  const totalIssues = validationResults.mainSitemap.issues.length +
                      validationResults.imageSitemap.issues.length;
  
  if (totalIssues === 0 && validationResults.mainSitemap.accessible && validationResults.imageSitemap.accessible) {
    console.log('✅ All sitemaps are valid and accessible!\n');
  } else {
    console.log(`⚠️  Total issues found: ${totalIssues}\n`);
  }
  
  console.log('='.repeat(80) + '\n');
}

async function main() {
  try {
    console.log('🚀 Starting Sitemap Validation...\n');
    
    await validateRobotsTxt();
    await validateMainSitemap();
    await validateImageSitemap();
    
    printSummary();
    
    // Save report
    const fs = require('fs');
    const reportPath = './sitemap-validation-report.json';
    fs.writeFileSync(reportPath, JSON.stringify({
      validatedAt: new Date().toISOString(),
      baseUrl: BASE_URL,
      results: validationResults,
    }, null, 2));
    console.log(`📄 Detailed report saved to: ${reportPath}\n`);
    
  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  }
}

// Check if xml2js is available
try {
  require.resolve('xml2js');
  main();
} catch (e) {
  console.log('Installing xml2js...');
  const { execSync } = require('child_process');
  execSync('npm install xml2js', { stdio: 'inherit', cwd: __dirname + '/..' });
  console.log('');
  main();
}
