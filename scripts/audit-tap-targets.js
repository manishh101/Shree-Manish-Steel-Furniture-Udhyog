#!/usr/bin/env node

/**
 * Tap Target Audit Script
 * 
 * Audits all interactive elements to ensure they meet minimum tap target sizes (48x48px).
 * Requirements: 8.3
 * 
 * This script should be run in browser console or using a headless browser.
 * For command-line usage, it provides static code analysis.
 * 
 * Usage: node scripts/audit-tap-targets.js
 */

const fs = require('fs');
const path = require('path');

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

// Minimum tap target size (Google recommends 48x48px)
const MIN_TAP_SIZE = 48;

/**
 * Find all component files
 */
function findComponentFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findComponentFiles(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Check if a component has proper tap target sizing
 */
function checkTapTargetSizing(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const issues = [];
  
  // Patterns that indicate proper tap target sizing
  const goodPatterns = [
    /min-h-\[48px\]/,
    /min-h-\[44px\]/,
    /h-12/, // 48px
    /h-14/, // 56px
    /h-16/, // 64px
    /py-3/, // padding that adds to height
    /py-4/,
    /p-3/,
    /p-4/,
    /min-w-\[48px\]/,
    /min-w-\[44px\]/,
    /w-12/,
    /w-14/,
    /w-16/,
    /mobile-touch-target/,
  ];
  
  // Patterns that might indicate small touch targets
  const concernPatterns = [
    /<button[^>]*className="[^"]*\bh-6\b/g, // 24px - too small
    /<button[^>]*className="[^"]*\bh-8\b/g, // 32px - too small
    /<button[^>]*className="[^"]*\bp-1\b/g, // 4px padding - too small
    /<button[^>]*className="[^"]*\bp-2\b/g, // 8px padding - might be too small
    /<a[^>]*className="[^"]*\btext-xs\b/g, // Small text in links
    /<a[^>]*className="[^"]*\btext-sm\b/g, // Small text in links
  ];
  
  // Check for buttons without explicit sizing
  const buttonRegex = /<button[^>]*>/g;
  let match;
  let lineNumber = 1;
  let charCount = 0;
  
  while ((match = buttonRegex.exec(content)) !== null) {
    const buttonTag = match[0];
    
    // Calculate line number
    const beforeMatch = content.substring(0, match.index);
    lineNumber = (beforeMatch.match(/\n/g) || []).length + 1;
    
    // Check if button has good size classes
    const hasGoodSizing = goodPatterns.some(pattern => pattern.test(buttonTag));
    
    // Check for concerning patterns
    const hasConcern = concernPatterns.some(pattern => pattern.test(buttonTag));
    
    if (hasConcern && !hasGoodSizing) {
      issues.push({
        line: lineNumber,
        type: 'button',
        issue: 'Button might have insufficient tap target size',
        suggestion: 'Add min-h-[48px] min-w-[48px] or equivalent classes',
      });
    }
  }
  
  // Check for links without sizing
  const linkRegex = /<a[^>]*>/g;
  while ((match = linkRegex.exec(content)) !== null) {
    const linkTag = match[0];
    
    // Calculate line number
    const beforeMatch = content.substring(0, match.index);
    lineNumber = (beforeMatch.match(/\n/g) || []).length + 1;
    
    // Skip if it's a wrapper link around a card or large element
    if (linkTag.includes('block') || linkTag.includes('flex flex-col')) {
      continue;
    }
    
    const hasGoodSizing = goodPatterns.some(pattern => pattern.test(linkTag));
    const hasSmallText = /text-xs|text-sm/.test(linkTag);
    const hasMinimalPadding = /\bp-1\b|\bp-2\b/.test(linkTag);
    
    if ((hasSmallText || hasMinimalPadding) && !hasGoodSizing) {
      issues.push({
        line: lineNumber,
        type: 'link',
        issue: 'Link might have insufficient tap target size',
        suggestion: 'Ensure link has adequate padding or min-height/min-width',
      });
    }
  }
  
  return issues;
}

/**
 * Main audit function
 */
function auditTapTargets() {
  log.section('Tap Target Size Audit');
  log.info(`Minimum tap target size: ${MIN_TAP_SIZE}x${MIN_TAP_SIZE}px`);
  
  const componentsDir = path.join(process.cwd(), 'components');
  const appDir = path.join(process.cwd(), 'app');
  
  const componentFiles = [
    ...findComponentFiles(componentsDir),
    ...findComponentFiles(appDir),
  ];
  
  log.info(`Found ${componentFiles.length} component files\n`);
  
  let totalIssues = 0;
  const fileIssues = [];
  
  componentFiles.forEach((filePath) => {
    const issues = checkTapTargetSizing(filePath);
    
    if (issues.length > 0) {
      const relativePath = path.relative(process.cwd(), filePath);
      fileIssues.push({ path: relativePath, issues });
      totalIssues += issues.length;
    }
  });
  
  // Report findings
  if (fileIssues.length === 0) {
    log.success('No tap target issues found!');
  } else {
    log.warn(`Found ${totalIssues} potential tap target issues in ${fileIssues.length} files:\n`);
    
    fileIssues.forEach(({ path, issues }) => {
      console.log(`\n${colors.bold}${path}${colors.reset}`);
      issues.forEach(({ line, type, issue, suggestion }) => {
        log.warn(`  Line ${line} (${type}): ${issue}`);
        log.info(`    → ${suggestion}`);
      });
    });
  }
  
  // Provide recommendations
  log.section('\nRecommendations');
  log.info('1. Ensure all buttons and links have minimum 48x48px tap targets');
  log.info('2. Add proper padding classes: p-3, p-4, py-3, px-4');
  log.info('3. Use min-h-[48px] and min-w-[48px] for explicit sizing');
  log.info('4. Add adequate spacing between adjacent interactive elements');
  log.info('5. Test on real devices with various screen sizes');
  
  // Browser console snippet
  log.section('\nBrowser Console Test');
  console.log('Copy and paste this into your browser console to test live tap targets:\n');
  console.log(`
${colors.cyan}// Audit tap targets in browser
const MIN_SIZE = ${MIN_TAP_SIZE};
const interactiveElements = document.querySelectorAll('button, a, input[type="button"], input[type="submit"], [role="button"], [onclick]');
const issues = [];

interactiveElements.forEach((el) => {
  const rect = el.getBoundingClientRect();
  if (rect.width < MIN_SIZE || rect.height < MIN_SIZE) {
    issues.push({
      element: el,
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      text: el.textContent?.trim().substring(0, 30) || el.getAttribute('aria-label') || 'No text'
    });
  }
});

console.log(\`Found \${issues.length} elements below minimum tap target size:\`);
issues.forEach(({ element, width, height, text }) => {
  console.log(\`❌ \${width}x\${height}px: "\${text}"\`, element);
});

if (issues.length === 0) {
  console.log('✓ All tap targets meet minimum size requirements!');
}${colors.reset}
  `);
  
  return totalIssues;
}

// Run audit
const issueCount = auditTapTargets();
process.exit(issueCount > 0 ? 1 : 0);
