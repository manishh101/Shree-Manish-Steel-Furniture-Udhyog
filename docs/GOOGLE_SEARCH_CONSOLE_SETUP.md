# Google Search Console Setup Guide

This document provides step-by-step instructions for setting up and configuring Google Search Console for the Manish Steel Furniture website.

**Requirements:** 14.2

## Prerequisites

- Website ownership/admin access
- Google account (Gmail)
- Access to website DNS or HTML file upload

## Step 1: Verify Website Ownership

### Option A: HTML File Upload (Recommended)

1. Visit [Google Search Console](https://search.google.com/search-console)
2. Click "Add property"
3. Enter your domain: `https://manishsteel.com.np`
4. Choose "HTML file" verification method
5. Download the verification HTML file
6. Upload it to `manish-steel-furniture/public/` directory
7. Deploy the changes
8. Return to Search Console and click "Verify"

### Option B: HTML Tag (Already Implemented)

The website already has the Google verification meta tag in the root layout:

```typescript
verification: {
  google: 'wESfcK5NYIoxGC9o3yIduzXbJM0wcx6tWAqKzUuI9Zw',
}
```

**To verify:**
1. Visit [Google Search Console](https://search.google.com/search-console)
2. Add property: `https://manishsteel.com.np`
3. Choose "HTML tag" verification
4. The verification code should match the one in the layout
5. Click "Verify"

### Option C: DNS Record

1. Add property in Search Console
2. Choose "Domain" property type
3. Add TXT record to DNS:
   - Go to your domain registrar's DNS settings
   - Add a TXT record with the value provided by Google
   - Wait for DNS propagation (can take up to 48 hours)
4. Return to Search Console and click "Verify"

## Step 2: Submit Sitemaps

Once verified, submit your sitemaps to help Google discover and index your content:

### Main Sitemap
- URL: `https://manishsteel.com.np/sitemap.xml`
- Contains: All pages, products, blogs, categories

### Image Sitemap
- URL: `https://manishsteel.com.np/image-sitemap.xml`
- Contains: All product images, gallery images with optimized alt text

**Steps to submit:**
1. In Search Console, go to "Sitemaps" section (left sidebar)
2. Click "Add a new sitemap"
3. Enter: `sitemap.xml`
4. Click "Submit"
5. Repeat for `image-sitemap.xml`

## Step 3: Configure Settings

### International Targeting

Set the target country for your website:

1. Go to "Settings" in Search Console
2. Click "International Targeting"
3. Set target country: **Nepal (NP)**
4. Save changes

### URL Parameters

Configure how Google handles URL parameters:

1. Go to "Legacy tools and reports" → "URL Parameters"
2. Add parameter: `category` → Let Googlebot decide
3. Add parameter: `subcategory` → Let Googlebot decide
4. Add parameter: `search` → Representative URLs
5. Add parameter: `page` → Let Googlebot decide

### Crawl Rate

Leave crawl rate at default (Let Google optimize). Only adjust if you experience server performance issues.

## Step 4: Set Up Email Notifications

Stay informed about critical issues:

1. Go to "Settings" → "User and permissions"
2. Click on your email address
3. Under "Email notifications", enable:
   - ✅ Site Issues
   - ✅ New messages
   - ✅ Manual actions
   - ✅ Unparsable structured data
   - ✅ Mobile usability issues
   - ✅ Core Web Vitals

## Step 5: Initial Index Request

Request indexing for key pages:

1. Go to "URL Inspection" tool
2. Enter URL: `https://manishsteel.com.np/`
3. Click "Request Indexing"
4. Repeat for important pages:
   - `/products`
   - `/about`
   - `/contact`
   - `/blogs`
   - Top 5-10 product pages

## Step 6: Link Google Analytics

Connect Search Console with Google Analytics for comprehensive data:

1. In Google Analytics, go to Admin
2. Under Property, click "Product Links"
3. Select "Search Console Links"
4. Click "Link" and choose your Search Console property
5. Confirm the link

## Monitoring & Maintenance

### Weekly Tasks

1. **Check Performance Report**
   - Monitor impressions and clicks
   - Identify top-performing queries
   - Track average position changes

2. **Review Index Coverage**
   - Check for new errors
   - Monitor "Valid" page count
   - Fix any "Error" or "Excluded" issues

3. **Core Web Vitals**
   - Review mobile and desktop performance
   - Address any "Poor" URLs
   - Track improvements over time

### Monthly Tasks

1. **Manual Actions Check**
   - Ensure no penalties applied
   - Address any issues immediately

2. **Security Issues**
   - Check for malware or hacked content warnings

3. **Mobile Usability**
   - Review mobile-specific issues
   - Fix clickable element spacing
   - Address text readability problems

4. **Structured Data**
   - Monitor rich result status
   - Fix any invalid schema errors

5. **Search Appearance**
   - Check how pages appear in search
   - Optimize snippets for better CTR

## Expected Results

After setup and initial indexing:

- **Week 1-2:** Initial pages indexed, baseline data collection
- **Week 3-4:** Majority of site indexed, first meaningful data
- **Month 2:** Full indexing, clear performance trends
- **Month 3:** Actionable insights, optimization opportunities

## Troubleshooting

### "URL is not on Google"

**Cause:** Page not yet crawled or indexed

**Solutions:**
1. Request indexing via URL Inspection tool
2. Ensure page is in sitemap
3. Check robots.txt isn't blocking
4. Verify page has quality content
5. Build internal links to the page

### "Crawled - currently not indexed"

**Cause:** Google crawled but chose not to index

**Solutions:**
1. Improve content quality and uniqueness
2. Add more internal links
3. Ensure proper meta tags
4. Check for duplicate content
5. Wait 2-4 weeks and monitor

### "Discovered - currently not indexed"

**Cause:** URL found but not crawled yet

**Solutions:**
1. Request indexing
2. Improve site's overall crawl efficiency
3. Add page to sitemap (if not already)
4. Build more internal links

### Mobile Usability Issues

**Common issues:**
- Text too small to read
- Clickable elements too close
- Content wider than screen
- Viewport not set

**Solution:** Already handled by responsive design, but verify on real devices

## API Access (Advanced)

For the SEO monitoring dashboard (Task 9.3), you'll need API access:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project: "Manish Steel SEO"
3. Enable "Google Search Console API"
4. Create credentials (Service Account)
5. Download JSON key file
6. Store securely in `.env.local`:
   ```
   GOOGLE_SEARCH_CONSOLE_KEY_FILE=/path/to/key.json
   ```

## Support Resources

- [Search Console Help Center](https://support.google.com/webmasters/)
- [SEO Starter Guide](https://developers.google.com/search/docs/beginner/seo-starter-guide)
- [Search Console API Documentation](https://developers.google.com/webmasters/search-console-api-original)

## Checklist

- [ ] Website ownership verified
- [ ] Main sitemap submitted
- [ ] Image sitemap submitted
- [ ] International targeting set to Nepal
- [ ] Email notifications configured
- [ ] Top pages requested for indexing
- [ ] Google Analytics linked
- [ ] Weekly monitoring schedule established
- [ ] API credentials created (for dashboard)
