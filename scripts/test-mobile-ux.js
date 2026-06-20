#!/usr/bin/env node

/**
 * Mobile UX Testing Script
 * 
 * Tests mobile navigation, forms, and user interactions.
 * Requirements: 8.3, 8.5
 * 
 * This script analyzes the codebase for mobile UX best practices.
 * For comprehensive testing, use with a headless browser like Playwright or Puppeteer.
 * 
 * Usage: node scripts/test-mobile-ux.js
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

/**
 * Check mobile navigation implementation
 */
function checkMobileNavigation() {
  log.section('Mobile Navigation Check');
  
  const navigationFiles = [
    'components/Header.tsx',
    'components/MobileMenuDrawer.tsx',
    'components/BottomNavigation.tsx',
  ];
  
  const issues = [];
  const successes = [];
  
  navigationFiles.forEach((file) => {
    const filePath = path.join(process.cwd(), file);
    
    if (!fs.existsSync(filePath)) {
      issues.push(`Missing file: ${file}`);
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check for mobile-specific classes
    if (content.includes('md:hidden') || content.includes('md:block')) {
      successes.push(`${file}: Has responsive visibility classes`);
    }
    
    // Check for touch-friendly events
    if (content.includes('onClick') || content.includes('onTouchStart')) {
      successes.push(`${file}: Has touch event handlers`);
    }
    
    // Check for accessibility
    if (content.includes('aria-label')) {
      successes.push(`${file}: Has ARIA labels`);
    } else {
      issues.push(`${file}: Missing ARIA labels`);
    }
    
    // Check for smooth scrolling
    if (file === 'components/MobileMenuDrawer.tsx') {
      if (!content.includes('overflow-y-auto') && !content.includes('overflow-auto')) {
        issues.push(`${file}: Missing scrollable container`);
      } else {
        successes.push(`${file}: Has scrollable content`);
      }
    }
  });
  
  successes.forEach((msg) => log.success(msg));
  issues.forEach((msg) => log.warn(msg));
  
  return issues.length === 0;
}

/**
 * Check form mobile-friendliness
 */
function checkMobileForms() {
  log.section('Mobile Forms Check');
  
  const formFiles = [
    'components/ContactForm.tsx',
    'app/(public)/contact/page.tsx',
    'app/(public)/custom-order/page.tsx',
  ];
  
  const issues = [];
  const successes = [];
  
  formFiles.forEach((file) => {
    const filePath = path.join(process.cwd(), file);
    
    if (!fs.existsSync(filePath)) {
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check for input types
    if (content.includes('type="email"') || content.includes('type="tel"')) {
      successes.push(`${file}: Uses appropriate input types`);
    }
    
    // Check for mobile-friendly input sizes
    if (content.includes('py-3') || content.includes('py-4') || content.includes('h-12')) {
      successes.push(`${file}: Has adequate input height`);
    } else {
      issues.push(`${file}: Inputs might be too small for mobile`);
    }
    
    // Check for form validation
    if (content.includes('required') || content.includes('pattern')) {
      successes.push(`${file}: Has form validation`);
    }
    
    // Check for error messages
    if (content.includes('error') || content.includes('Error')) {
      successes.push(`${file}: Has error handling`);
    }
  });
  
  successes.forEach((msg) => log.success(msg));
  issues.forEach((msg) => log.warn(msg));
  
  return issues.length === 0;
}

/**
 * Check WhatsApp and call functionality
 */
function checkContactIntegration() {
  log.section('Contact Integration Check');
  
  const contactFiles = [
    'components/FloatingContactWidget.tsx',
    'app/(public)/contact/page.tsx',
  ];
  
  const issues = [];
  const successes = [];
  
  contactFiles.forEach((file) => {
    const filePath = path.join(process.cwd(), file);
    
    if (!fs.existsSync(filePath)) {
      issues.push(`Missing file: ${file}`);
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check for WhatsApp integration
    if (content.includes('wa.me/') || content.includes('whatsapp.com')) {
      successes.push(`${file}: Has WhatsApp integration`);
    } else if (file.includes('contact')) {
      issues.push(`${file}: Missing WhatsApp integration`);
    }
    
    // Check for tel: links
    if (content.includes('tel:')) {
      successes.push(`${file}: Has click-to-call functionality`);
    } else if (file.includes('contact')) {
      issues.push(`${file}: Missing click-to-call functionality`);
    }
    
    // Check for proper mobile display
    if (content.includes('fixed bottom') || content.includes('md:hidden')) {
      successes.push(`${file}: Has mobile-specific positioning`);
    }
  });
  
  successes.forEach((msg) => log.success(msg));
  issues.forEach((msg) => log.warn(msg));
  
  return issues.length === 0;
}

/**
 * Check for intrusive interstitials
 */
function checkInterstitials() {
  log.section('Intrusive Interstitials Check');
  
  const componentFiles = fs.readdirSync(path.join(process.cwd(), 'components'))
    .filter(f => f.endsWith('.tsx') || f.endsWith('.jsx'));
  
  const issues = [];
  const successes = [];
  
  // Patterns that might indicate intrusive interstitials
  const intrusivePatterns = [
    /fixed.*inset-0.*z-\[?\d{3,}\]?/, // High z-index full-screen overlays
    /modal.*inset-0/, // Full-screen modals
  ];
  
  componentFiles.forEach((file) => {
    const filePath = path.join(process.cwd(), 'components', file);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Check if it's a modal or overlay
    if (file.toLowerCase().includes('modal') || file.toLowerCase().includes('drawer')) {
      // Check if it has proper close mechanism
      if (content.includes('onClick={onClose}') || content.includes('onClick={handleClose}')) {
        successes.push(`${file}: Has close functionality`);
      } else {
        issues.push(`${file}: Overlay might be missing easy close option`);
      }
      
      // Check if it's triggered by user action (not automatic)
      if (content.includes('isOpen') || content.includes('show')) {
        successes.push(`${file}: User-controlled display`);
      }
    }
  });
  
  if (issues.length === 0) {
    log.success('No intrusive interstitials detected');
  }
  
  successes.forEach((msg) => log.success(msg));
  issues.forEach((msg) => log.warn(msg));
  
  return issues.length === 0;
}

/**
 * Check product filtering on mobile
 */
function checkProductFiltering() {
  log.section('Product Filtering Check');
  
  const productsPage = path.join(process.cwd(), 'app/(public)/products/page.tsx');
  
  if (!fs.existsSync(productsPage)) {
    log.error('Products page not found');
    return false;
  }
  
  const content = fs.readFileSync(productsPage, 'utf-8');
  
  const issues = [];
  const successes = [];
  
  // Check for mobile drawer
  if (content.includes('Drawer') || content.includes('drawer')) {
    successes.push('Has mobile filter drawer');
  } else {
    issues.push('No mobile filter drawer detected');
  }
  
  // Check for category filtering
  if (content.includes('category') || content.includes('Category')) {
    successes.push('Has category filtering');
  }
  
  // Check for responsive design
  if (content.includes('md:block md:hidden') || content.includes('lg:')) {
    successes.push('Has responsive filter layout');
  } else {
    issues.push('Filter layout might not be responsive');
  }
  
  successes.forEach((msg) => log.success(msg));
  issues.forEach((msg) => log.warn(msg));
  
  return issues.length === 0;
}

/**
 * Check mobile performance optimizations
 */
function checkMobilePerformance() {
  log.section('Mobile Performance Check');
  
  const nextConfig = path.join(process.cwd(), 'next.config.js');
  
  if (!fs.existsSync(nextConfig)) {
    log.error('next.config.js not found');
    return false;
  }
  
  const content = fs.readFileSync(nextConfig, 'utf-8');
  
  const successes = [];
  const issues = [];
  
  // Check for image optimization
  if (content.includes('images')) {
    successes.push('Image optimization configured');
  }
  
  // Check for compression
  if (content.includes('compress')) {
    successes.push('Compression enabled');
  } else {
    issues.push('Consider enabling compression');
  }
  
  // Check for modern image formats
  if (content.includes('webp') || content.includes('avif')) {
    successes.push('Modern image formats supported');
  }
  
  successes.forEach((msg) => log.success(msg));
  issues.forEach((msg) => log.warn(msg));
  
  return issues.length === 0;
}

/**
 * Generate mobile testing checklist
 */
function generateTestingChecklist() {
  log.section('Manual Mobile Testing Checklist');
  
  const checklist = [
    {
      category: 'Navigation',
      items: [
        'Mobile menu opens and closes smoothly',
        'Bottom navigation works on all pages',
        'Category drawer opens without lag',
        'All navigation links work correctly',
        'Back button behavior is intuitive',
      ],
    },
    {
      category: 'Forms',
      items: [
        'Contact form is easy to fill on mobile',
        'Keyboard doesn\'t obscure input fields',
        'Form validation shows clear error messages',
        'Submit button is easily tappable',
        'Custom order form works on mobile',
      ],
    },
    {
      category: 'Product Pages',
      items: [
        'Product images can be zoomed/swiped',
        'Add to cart button is prominent',
        'Quick view modal works on mobile',
        'Product description is readable',
        'Related products load correctly',
      ],
    },
    {
      category: 'Contact Features',
      items: [
        'WhatsApp button opens WhatsApp app',
        'Click-to-call initiates phone call',
        'Viber button works correctly',
        'Google Maps loads on contact page',
        'Floating contact widget is accessible',
      ],
    },
    {
      category: 'Performance',
      items: [
        'Pages load in under 3 seconds on 3G',
        'Images load progressively',
        'No layout shift during page load',
        'Smooth scrolling without jank',
        'Interactive elements respond instantly',
      ],
    },
  ];
  
  checklist.forEach(({ category, items }) => {
    console.log(`\n${colors.bold}${category}${colors.reset}`);
    items.forEach((item, index) => {
      console.log(`  ${index + 1}. [ ] ${item}`);
    });
  });
  
  log.section('\nDevice Testing Recommendations');
  log.info('Test on the following devices:');
  log.info('  • iPhone SE (small screen, 375px width)');
  log.info('  • iPhone 12/13 (standard iPhone)');
  log.info('  • Samsung Galaxy S21 (Android)');
  log.info('  • iPad Mini (tablet)');
  log.info('  • Using Chrome DevTools mobile emulation');
}

/**
 * Main test runner
 */
function runMobileUXTests() {
  log.section('Mobile UX Test Suite');
  
  const results = {
    navigation: checkMobileNavigation(),
    forms: checkMobileForms(),
    contact: checkContactIntegration(),
    interstitials: checkInterstitials(),
    filtering: checkProductFiltering(),
    performance: checkMobilePerformance(),
  };
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  log.section('\nTest Summary');
  log.info(`Passed: ${passed}/${total} categories`);
  
  Object.entries(results).forEach(([category, passed]) => {
    if (passed) {
      log.success(`${category}: PASS`);
    } else {
      log.warn(`${category}: NEEDS ATTENTION`);
    }
  });
  
  generateTestingChecklist();
  
  if (passed === total) {
    log.success('\n✓ All automated mobile UX checks passed!');
    log.info('Complete the manual testing checklist above for comprehensive validation.');
  } else {
    log.warn('\n⚠ Some mobile UX checks need attention.');
    log.info('Review the issues above and complete the manual testing checklist.');
  }
  
  return passed === total ? 0 : 1;
}

// Run tests
const exitCode = runMobileUXTests();
process.exit(exitCode);
