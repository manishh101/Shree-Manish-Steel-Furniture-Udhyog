# Performance Monitoring Guide

## Overview

This document describes the performance monitoring setup for the Manish Steel Furniture website. The system tracks Core Web Vitals, enforces performance budgets, and provides automated Lighthouse CI checks.

**Requirements Addressed**: 10.1, 14.4

---

## Components

### 1. Web Vitals Tracking

**Location**: `lib/performance/webVitals.ts`, `components/WebVitalsReporter.tsx`

The Web Vitals tracking system monitors real-user metrics and sends them to multiple destinations:

- **Google Analytics**: Event tracking for all Core Web Vitals
- **Vercel Analytics**: Native Vercel performance tracking (if enabled)
- **Session Storage**: Local storage for admin dashboard display
- **Console Logging**: Development mode debugging

**Metrics Tracked**:
- LCP (Largest Contentful Paint)
- FID (First Input Delay) / INP (Interaction to Next Paint)
- CLS (Cumulative Layout Shift)
- FCP (First Contentful Paint)
- TTFB (Time to First Byte)

**Thresholds**:
- **Good**: Metric is within recommended range (green)
- **Needs Improvement**: Metric is above good threshold but below poor (yellow)
- **Poor**: Metric exceeds poor threshold (red)

### 2. Performance Budget System

**Location**: `lib/performance/performanceBudget.ts`

Defines performance thresholds and checks metrics against them. Budgets are set for:

- Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- Resource sizes (JS < 300KB, CSS < 100KB, Total < 2MB)
- Lighthouse scores (Performance > 85, SEO > 95)

**Functions**:
- `isWithinBudget()`: Check if a metric passes
- `getBudgetStatus()`: Get pass/warning/fail status
- `getBudgetViolations()`: List all budget violations
- `getPerformanceBudgetSummary()`: Overall budget health

### 3. Lighthouse CI

**Location**: `lighthouserc.js`, `.github/workflows/lighthouse-ci.yml`

Automated performance testing in CI/CD pipeline.

**Features**:
- Runs on every push and pull request
- Tests multiple key pages (home, products, about, contact, blogs)
- 3 runs per page for stable averages
- Fails build on critical performance issues
- Uploads results as artifacts

**Assertions**:
- Performance score must be ≥ 85
- SEO score must be ≥ 95
- LCP must be ≤ 2.5 seconds
- CLS must be ≤ 0.1

### 4. Admin Dashboard

**Location**: `components/admin/PerformanceMonitor.tsx`

Real-time performance monitoring dashboard for admins.

**Features**:
- Live Core Web Vitals display
- Color-coded ratings (green/yellow/red)
- Average metrics over time
- Performance budget targets
- Link to Google Search Console
- Clear data functionality

---

## Setup Instructions

### 1. Install Dependencies

```bash
cd manish-steel-furniture
npm install
```

This installs:
- `web-vitals`: Client-side performance measurement
- `@lhci/cli`: Lighthouse CI automation

### 2. Enable Vercel Analytics (Optional)

If deploying to Vercel:

1. Go to your Vercel project settings
2. Navigate to "Analytics" tab
3. Enable "Vercel Analytics"
4. Deploy - no code changes needed

Vercel Analytics will automatically start receiving Web Vitals data.

### 3. Configure GitHub Actions

The Lighthouse CI workflow is already configured in `.github/workflows/lighthouse-ci.yml`.

**Required Secrets** (add in GitHub repository settings):
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: JWT signing secret
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret

**Optional**:
- `LHCI_GITHUB_APP_TOKEN`: For Lighthouse CI GitHub app integration

### 4. Run Lighthouse Locally

To test performance locally:

```bash
# Build the application
npm run build

# Start production server
npm start

# In another terminal, run Lighthouse
npm run lighthouse
```

Results will be saved in `.lighthouseci/` directory.

### 5. Access Performance Dashboard

1. Log in to admin panel
2. Navigate to Settings or Dashboard
3. View the Performance Monitor section
4. Metrics update automatically every 10 seconds

---

## Monitoring Workflows

### Daily Monitoring

1. **Check Admin Dashboard**:
   - Review Core Web Vitals
   - Look for yellow or red metrics
   - Compare to previous days

2. **Review Google Analytics**:
   - Go to Events > Web Vitals
   - Analyze trends over time
   - Identify problem pages

3. **Check Search Console**:
   - Core Web Vitals report
   - Field data from real users
   - URLs needing improvement

### Weekly Monitoring

1. **Review Lighthouse CI Results**:
   - Check GitHub Actions runs
   - Review any failed builds
   - Analyze performance trends

2. **Performance Audit**:
   - Run full Lighthouse audit on key pages
   - Compare scores to previous week
   - Identify optimization opportunities

3. **Budget Review**:
   - Check for budget violations
   - Adjust thresholds if needed
   - Plan optimization work

### Monthly Monitoring

1. **Comprehensive Analysis**:
   - Review all performance metrics
   - Analyze user experience trends
   - Compare mobile vs desktop
   - Identify seasonal patterns

2. **Optimization Planning**:
   - Prioritize performance improvements
   - Schedule optimization work
   - Update performance budgets

3. **Reporting**:
   - Generate performance report
   - Share with stakeholders
   - Set goals for next month

---

## Performance Targets

### Core Web Vitals Goals

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP | ≤ 2.5s | 2.5s - 4.0s | > 4.0s |
| FID | ≤ 100ms | 100ms - 300ms | > 300ms |
| CLS | ≤ 0.1 | 0.1 - 0.25 | > 0.25 |
| INP | ≤ 200ms | 200ms - 500ms | > 500ms |

### Lighthouse Score Goals

- **Performance**: ≥ 85 (target: 90+)
- **Accessibility**: ≥ 90 (target: 95+)
- **Best Practices**: ≥ 90 (target: 95+)
- **SEO**: ≥ 95 (target: 100)

### Resource Budget Goals

- **JavaScript**: < 300 KB (gzipped)
- **CSS**: < 100 KB (gzipped)
- **Total Page Size**: < 2 MB
- **Image Count**: < 20 per page

---

## Troubleshooting

### Web Vitals Not Showing

1. Check browser console for errors
2. Verify `web-vitals` package is installed
3. Check that JavaScript is not blocked
4. Clear browser cache and reload

### Lighthouse CI Failing

1. Check GitHub Actions logs
2. Verify all environment variables are set
3. Ensure server starts successfully
4. Check for timeout issues

### Poor Performance Scores

**Common Issues**:

1. **High LCP**:
   - Optimize hero image
   - Preload critical resources
   - Reduce server response time
   - Use CDN for images

2. **High CLS**:
   - Set image dimensions
   - Reserve space for dynamic content
   - Avoid inserting content above existing content
   - Use CSS aspect-ratio

3. **High FID/INP**:
   - Reduce JavaScript execution time
   - Split large bundles
   - Defer non-critical scripts
   - Use code splitting

---

## Integration with Google Search Console

### Setup

1. **Verify Ownership**:
   - Already verified with meta tag in `layout.tsx`
   - Verification code: `wESfcK5NYIoxGC9o3yIduzXbJM0wcx6tWAqKzUuI9Zw`

2. **Access Core Web Vitals Report**:
   - Log in to [Google Search Console](https://search.google.com/search-console)
   - Navigate to "Experience" > "Core Web Vitals"
   - View mobile and desktop reports

3. **Monitor Field Data**:
   - Real user metrics from Chrome User Experience Report
   - Updated daily
   - 28-day rolling average
   - Grouped by URL groups

### What to Monitor

- **Poor URLs**: URLs failing Core Web Vitals
- **Needs Improvement**: URLs close to thresholds
- **Good URLs**: URLs passing all metrics
- **Trends**: Performance over time
- **Mobile vs Desktop**: Different experiences

### Taking Action

1. Click on issue type (LCP, FID, CLS)
2. View affected URLs
3. Click "Open report" for details
4. Use PageSpeed Insights for recommendations
5. Fix issues and request validation

---

## Performance Optimization Tips

### Quick Wins

1. **Enable Compression**: Already configured in `next.config.js`
2. **Optimize Images**: Use WebP format, lazy loading
3. **Preload Critical Resources**: Hero images, fonts
4. **Remove Unused Code**: Run bundle analyzer
5. **Cache Static Assets**: Already configured

### Advanced Optimizations

1. **Code Splitting**:
   ```javascript
   const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
     loading: () => <p>Loading...</p>,
     ssr: false,
   });
   ```

2. **Prefetch Critical Pages**:
   ```javascript
   <Link href="/products" prefetch={true}>Products</Link>
   ```

3. **Optimize Third-Party Scripts**:
   ```javascript
   <Script src="..." strategy="lazyOnload" />
   ```

4. **Use ISR for Dynamic Pages**:
   ```javascript
   export const revalidate = 3600; // 1 hour
   ```

---

## Resources

- [Web Vitals Documentation](https://web.dev/vitals/)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Vercel Analytics](https://vercel.com/docs/analytics)
- [Google Search Console](https://search.google.com/search-console)

---

## Next Steps

1. **Enable Vercel Analytics**: Simple one-click in Vercel dashboard
2. **Set Up Alerts**: Configure Search Console email alerts
3. **Create Dashboard**: Build custom performance dashboard
4. **Schedule Reviews**: Set up weekly performance review meetings
5. **Document Baselines**: Record current performance as baseline
