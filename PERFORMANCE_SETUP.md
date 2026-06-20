# Performance Monitoring Setup

This guide will help you set up and configure performance monitoring for the Manish Steel Furniture website.

## Quick Start

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **View Performance Metrics**:
   - Browse the website normally
   - Open browser DevTools Console
   - See Core Web Vitals logged in real-time

3. **Run Lighthouse Audit**:
   ```bash
   npm run build
   npm start
   # In another terminal:
   npm run lighthouse
   ```

## Features Implemented

### ✅ Web Vitals Tracking
- Real-time Core Web Vitals monitoring
- Automatic reporting to Google Analytics
- Session storage for admin dashboard
- Console logging in development

### ✅ Performance Budget System
- Predefined thresholds for all metrics
- Budget violation detection
- Color-coded status indicators
- Comprehensive budget reporting

### ✅ Lighthouse CI
- Automated performance testing
- GitHub Actions integration
- Multiple page testing
- Historical result tracking

### ✅ Admin Dashboard
- Live performance metrics display
- Visual rating system (green/yellow/red)
- Average metrics over time
- Direct links to Search Console

## Vercel Analytics Setup

To enable Vercel Analytics (recommended):

1. **In Vercel Dashboard**:
   - Go to your project
   - Click "Analytics" tab
   - Click "Enable"
   - No code changes needed!

2. **Benefits**:
   - Automatic Core Web Vitals tracking
   - Real user monitoring
   - Geographic breakdown
   - Device/browser insights

3. **View Analytics**:
   - Go to Vercel project
   - Click "Analytics" in sidebar
   - View real-time and historical data

## Google Search Console Integration

### Already Configured
- Site verification tag is in `app/layout.tsx`
- Verification code: `wESfcK5NYIoxGC9o3yIduzXbJM0wcx6tWAqKzUuI9Zw`

### What to Monitor
1. **Core Web Vitals Report**:
   - Experience > Core Web Vitals
   - View mobile and desktop separately
   - See which URLs need improvement

2. **Page Experience**:
   - Mobile usability
   - HTTPS usage
   - Safe browsing status

3. **Field Data**:
   - Real user metrics (28-day rolling)
   - URL groupings
   - Trends over time

### Access
- URL: https://search.google.com/search-console
- Property: `https://manishsteel.com.np`

## GitHub Actions Setup

The Lighthouse CI workflow runs automatically on every push/PR to main branch.

### Required Secrets
Add these in GitHub repository settings (Settings > Secrets and variables > Actions):

```
MONGODB_URI
JWT_SECRET
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

### Workflow Status
- ✅ Green: All performance checks passed
- ⚠️ Yellow: Some warnings, review recommended
- ❌ Red: Performance budget violations, needs fixing

### View Results
1. Go to GitHub repository
2. Click "Actions" tab
3. Select "Lighthouse CI" workflow
4. View run details and artifacts

## Performance Targets

### Production Goals
| Metric | Target | Threshold |
|--------|--------|-----------|
| Performance Score | 90+ | ≥ 85 |
| SEO Score | 100 | ≥ 95 |
| Accessibility | 95+ | ≥ 90 |
| Best Practices | 95+ | ≥ 90 |

### Core Web Vitals
| Metric | Good | Maximum |
|--------|------|---------|
| LCP | ≤ 2.5s | < 4.0s |
| FID | ≤ 100ms | < 300ms |
| CLS | ≤ 0.1 | < 0.25 |
| INP | ≤ 200ms | < 500ms |

## Admin Dashboard Usage

### Access
1. Log in to admin panel: `/admin/login`
2. Navigate to Performance Monitor section
3. View real-time metrics

### Features
- **Live Metrics**: Auto-refresh every 10 seconds
- **Color Coding**: Green (good), Yellow (needs improvement), Red (poor)
- **Averages**: See average performance over session
- **Clear Data**: Reset metrics to start fresh

### Interpreting Results
- **✅ Green**: Excellent performance, no action needed
- **⚠️ Yellow**: Acceptable but could be better
- **❌ Red**: Action required, investigate and optimize

## Monitoring Schedule

### Daily
- Check admin dashboard for any red metrics
- Review Google Analytics Web Vitals events

### Weekly
- Review Lighthouse CI results
- Check Search Console Core Web Vitals report
- Identify pages needing optimization

### Monthly
- Comprehensive performance review
- Update performance budgets if needed
- Plan optimization work for next month

## Common Issues & Solutions

### 1. High LCP (> 2.5s)
**Causes**:
- Large images not optimized
- Slow server response
- Render-blocking resources

**Solutions**:
- Optimize hero images
- Use Next.js Image component
- Preload critical resources
- Check database query performance

### 2. High CLS (> 0.1)
**Causes**:
- Images without dimensions
- Dynamic content insertion
- Web fonts loading

**Solutions**:
- Add width/height to all images
- Reserve space for ads/embeds
- Use font-display: swap

### 3. Poor Performance Score (< 85)
**Causes**:
- Large JavaScript bundles
- Too many third-party scripts
- Unoptimized images

**Solutions**:
- Run bundle analyzer: `npm run analyze`
- Remove unused dependencies
- Lazy load heavy components
- Compress images

## Testing Locally

### 1. Build and Test
```bash
# Build for production
npm run build

# Start production server
npm start

# Run Lighthouse (in another terminal)
npm run lighthouse
```

### 2. View Results
- Results saved to `.lighthouseci/` directory
- Open HTML reports in browser
- Check console for summary

### 3. Mobile Testing
```bash
npm run lighthouse:mobile
```

## Resources

- **Documentation**: See `docs/PERFORMANCE_MONITORING.md`
- **Web Vitals**: https://web.dev/vitals/
- **Lighthouse CI**: https://github.com/GoogleChrome/lighthouse-ci
- **Vercel Analytics**: https://vercel.com/docs/analytics
- **Search Console**: https://search.google.com/search-console

## Support

For issues or questions:
1. Check `docs/PERFORMANCE_MONITORING.md` for detailed info
2. Review Lighthouse reports for specific recommendations
3. Check Google Search Console for real-user data
4. Monitor Vercel Analytics for trends

---

**Status**: ✅ Performance monitoring is fully configured and operational
