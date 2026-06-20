/**
 * Lighthouse CI Configuration
 * Automated performance monitoring for CI/CD pipeline
 * Requirements: 10.1, 14.4
 */

module.exports = {
  ci: {
    collect: {
      // URLs to test
      url: [
        'http://localhost:3000',
        'http://localhost:3000/products',
        'http://localhost:3000/about',
        'http://localhost:3000/contact',
        'http://localhost:3000/blogs',
      ],
      // Number of runs per URL (3 for more stable results)
      numberOfRuns: 3,
      // Lighthouse settings
      settings: {
        // Use mobile emulation by default
        preset: 'desktop',
        // Throttling settings (simulate 4G)
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
        // Skip certain audits that aren't relevant
        skipAudits: [
          'canonical',
          'maskable-icon',
        ],
      },
    },
    assert: {
      // Performance budgets and assertions
      assertions: {
        // Core Web Vitals
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 200 }],
        'max-potential-fid': ['warn', { maxNumericValue: 100 }],
        'interactive': ['warn', { maxNumericValue: 3800 }],
        
        // Performance Score
        'categories:performance': ['error', { minScore: 0.85 }],
        'categories:accessibility': ['warn', { minScore: 0.90 }],
        'categories:best-practices': ['warn', { minScore: 0.90 }],
        'categories:seo': ['error', { minScore: 0.95 }],
        
        // Other Performance Metrics
        'first-contentful-paint': ['warn', { maxNumericValue: 1800 }],
        'speed-index': ['warn', { maxNumericValue: 3000 }],
        'server-response-time': ['warn', { maxNumericValue: 800 }],
        
        // Resource Hints
        'uses-rel-preconnect': 'warn',
        'uses-rel-preload': 'off',
        
        // Image Optimization
        'modern-image-formats': 'warn',
        'offscreen-images': 'warn',
        'uses-optimized-images': 'warn',
        'uses-responsive-images': 'warn',
        
        // JavaScript & CSS
        'unused-javascript': 'warn',
        'unused-css-rules': 'off', // Often false positives with Tailwind
        'render-blocking-resources': 'warn',
        'unminified-javascript': 'error',
        'unminified-css': 'error',
        
        // Fonts
        'font-display': 'warn',
        
        // Caching
        'uses-long-cache-ttl': 'warn',
        
        // SEO
        'meta-description': 'error',
        'document-title': 'error',
        'robots-txt': 'off',
        'hreflang': 'off',
        'image-alt': 'error',
        
        // Accessibility
        'color-contrast': 'warn',
        'aria-allowed-attr': 'error',
        'aria-required-attr': 'error',
        'button-name': 'error',
        'image-alt': 'error',
        'label': 'error',
        'link-name': 'error',
        
        // Best Practices
        'is-on-https': 'error',
        'uses-http2': 'warn',
        'no-vulnerable-libraries': 'error',
        'errors-in-console': 'warn',
      },
    },
    upload: {
      // Upload results to temporary public storage (optional)
      target: 'temporary-public-storage',
      // Or configure LHCI server if you have one
      // target: 'lhci',
      // serverBaseUrl: 'https://your-lhci-server.com',
      // token: process.env.LHCI_TOKEN,
    },
  },
};
