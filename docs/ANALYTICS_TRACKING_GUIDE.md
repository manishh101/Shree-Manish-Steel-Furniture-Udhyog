# Analytics & Tracking Implementation Guide

This document provides comprehensive information about the analytics and tracking implementation for the Manish Steel Furniture website.

**Requirements:** 14.1, 14.3

## Overview

The website uses Google Analytics 4 (GA4) to track user behavior, conversion events, and performance metrics. All tracking is handled through a centralized analytics utility that ensures consistent event tracking across the application.

## Google Analytics 4 Setup

### Configuration

The GA4 property is configured in `app/layout.tsx`:

- **Property ID:** G-TGW5L8QT90
- **Script Loading:** Lazy loading strategy (after page interactive)
- **Page View Tracking:** Automatic via AnalyticsTracker component

### Components

1. **AnalyticsTracker** (`components/AnalyticsTracker.tsx`)
   - Tracks route changes in Next.js App Router
   - Sends pageview events to GA4
   - Automatically includes search params in URLs

2. **Analytics Utility** (`lib/analytics.ts`)
   - Centralized tracking functions
   - Type-safe event tracking
   - Graceful handling of missing gtag

## Tracked Events

### Conversion Events

#### 1. Contact Form Submission
**Function:** `trackContactFormSubmission(category, method)`
- Fires on successful form submission
- Tracks inquiry category (product, service, support, etc.)
- Records conversion for lead generation

**Implementation:**
```typescript
import { trackContactFormSubmission } from '@/lib/analytics';

// After successful form submission
trackContactFormSubmission('product', 'contact_form');
```

#### 2. Phone Clicks (Click-to-Call)
**Function:** `trackPhoneClick(phoneNumber, location)`
- Fires when user clicks phone number
- Tracks which phone number was clicked
- Records conversion event

**Locations tracked:**
- Floating widget
- Footer
- Contact page
- Product pages

**Implementation:**
```typescript
import { trackPhoneClick } from '@/lib/analytics';

<a 
  href="tel:+9779824336371" 
  onClick={() => trackPhoneClick('+9779824336371', 'footer')}
>
  Call Us
</a>
```

#### 3. WhatsApp Clicks
**Function:** `trackWhatsAppClick(source)`
- Fires when WhatsApp button is clicked
- Tracks source of click
- Records conversion event

**Sources tracked:**
- Floating contact widget
- Product inquiry buttons
- Contact page

**Implementation:**
```typescript
import { trackWhatsAppClick } from '@/lib/analytics';

<button onClick={() => {
  trackWhatsAppClick('floating_widget');
  window.open(whatsappUrl, '_blank');
}}>
  Chat on WhatsApp
</button>
```

#### 4. Email Clicks
**Function:** `trackEmailClick(source)`
- Fires when mailto: link is clicked
- Tracks click source

**Implementation:**
```typescript
import { trackEmailClick } from '@/lib/analytics';

<a 
  href="mailto:email@example.com"
  onClick={() => trackEmailClick('footer')}
>
  Email Us
</a>
```

### Engagement Events

#### 5. Product Quick View
**Function:** `trackQuickViewOpen(productId, productName, source)`
- Fires when product quick view modal opens
- Tracks which product was viewed
- Sends view_item e-commerce event

**Implementation:**
```typescript
import { trackQuickViewOpen } from '@/lib/analytics';

// In QuickView component useEffect
useEffect(() => {
  if (product) {
    trackQuickViewOpen(
      product._id || product.id || '',
      product.name,
      'product_grid'
    );
  }
}, [product]);
```

#### 6. Category Navigation
**Function:** `trackCategoryNavigation(categoryName, method)`
- Fires when user navigates to a category
- Tracks navigation method (menu, filter, link, breadcrumb)
- Sends view_item_list e-commerce event

**Methods:**
- `menu`: Main navigation menu
- `filter`: Category filter on products page
- `link`: Direct category links
- `breadcrumb`: Breadcrumb navigation

**Implementation:**
```typescript
import { trackCategoryNavigation } from '@/lib/analytics';

<Link 
  href="/products?category=office-furniture"
  onClick={() => trackCategoryNavigation('Office Furniture', 'menu')}
>
  Office Furniture
</Link>
```

#### 7. Social Media Clicks
**Function:** `trackSocialClick(platform, location)`
- Tracks social media link clicks
- Platforms: facebook, instagram, tiktok, twitter, youtube

**Implementation:**
```typescript
import { trackSocialClick } from '@/lib/analytics';

<a 
  href={facebookUrl}
  onClick={() => trackSocialClick('facebook', 'footer')}
>
  Facebook
</a>
```

#### 8. Directions/Map Clicks
**Function:** `trackDirectionsClick(source)`
- Tracks when users click for directions
- Records conversion event

### Additional Tracking Functions

#### Product View
**Function:** `trackProductView(product)`
- Tracks detailed product page views
- Sends view_item e-commerce event
- Includes category and subcategory

#### Search
**Function:** `trackSearch(searchTerm, resultsCount)`
- Tracks product searches
- Records search term and results count

#### Custom Order Request
**Function:** `trackCustomOrderRequest(category)`
- Tracks custom order form submissions
- Records conversion event

#### Gallery View
**Function:** `trackGalleryView(sectionName, imageCount)`
- Tracks gallery section views
- Records engagement with visual content

#### Blog View
**Function:** `trackBlogView(blogTitle, blogId)`
- Tracks blog post views
- Measures content engagement

#### File Download
**Function:** `trackFileDownload(fileName, fileType)`
- Tracks catalog and brochure downloads
- Records file type and name

#### Error Tracking
**Function:** `trackError(errorDescription, errorContext, fatal)`
- Tracks JavaScript errors
- Helps identify user-facing issues

#### 404 Errors
**Function:** `track404Error(attemptedPath, referrer)`
- Tracks page not found errors
- Helps identify broken links

## Event Parameters

All conversion events include:
- `event_category`: Category of the event
- `event_label`: Specific label/source
- `value`: Numeric value (usually 1 for conversions)

E-commerce events include:
- `items`: Array of product details
- `item_id`, `item_name`, `item_category`: Product information

## Viewing Data in Google Analytics

### Real-Time Reports
1. Go to GA4 property
2. Click "Reports" → "Realtime"
3. See live user activity and events

### Event Reports
1. Go to "Reports" → "Engagement" → "Events"
2. Filter by event name
3. View event count, user count, and parameters

### Conversion Reports
1. Go to "Reports" → "Engagement" → "Conversions"
2. See all tracked conversions
3. View conversion rates and trends

### E-commerce Reports
1. Go to "Reports" → "Monetization" → "E-commerce purchases"
2. View product views (view_item events)
3. See which products are most viewed

## Custom Reports & Explorations

### Top Products by Quick View
1. Go to "Explore"
2. Create new exploration
3. Add dimension: Event parameter → item_name
4. Add metric: Event count
5. Filter: Event name = quick_view_open

### Conversion Funnel
1. Create funnel exploration
2. Steps:
   - Page view
   - Product quick view
   - WhatsApp click OR Phone click OR Form submission

### User Engagement by Source
1. Create free-form exploration
2. Dimensions: Source/Medium
3. Metrics: Engaged sessions, Conversions
4. Compare conversion rates by traffic source

## Debugging

### Check if GA4 is loaded
Open browser console and run:
```javascript
typeof window.gtag === 'function'
```

### Manually fire test event
```javascript
if (window.gtag) {
  window.gtag('event', 'test_event', {
    test_parameter: 'test_value'
  });
}
```

### View dataLayer
```javascript
console.log(window.dataLayer);
```

### Use GA4 Debug Mode
Add `?debug_mode=true` to URL to see events in DebugView (Reports → Configure → DebugView)

## Privacy & GDPR Compliance

The current implementation:
- Does not collect personally identifiable information (PII)
- Uses Google's default data collection
- Tracks user behavior for analytics only

**For full GDPR compliance, consider:**
1. Adding a cookie consent banner
2. Implementing GTM for consent mode
3. Adding privacy policy with analytics disclosure
4. Providing opt-out mechanism

## Performance Considerations

- Scripts load with `lazyOnload` strategy
- No blocking of page rendering
- Minimal impact on Core Web Vitals
- Graceful degradation if gtag fails to load

## Testing Checklist

- [ ] Page views tracked on route changes
- [ ] Contact form submissions tracked
- [ ] Phone clicks tracked
- [ ] WhatsApp clicks tracked
- [ ] Email clicks tracked
- [ ] Product quick views tracked
- [ ] Category navigation tracked
- [ ] Social clicks tracked
- [ ] Events appear in GA4 real-time report
- [ ] Conversions marked in GA4
- [ ] No console errors related to analytics

## Troubleshooting

### Events not showing in GA4
1. Check if GA4 tag is firing (use browser console)
2. Verify property ID is correct (G-TGW5L8QT90)
3. Check for ad blockers or privacy extensions
4. Wait 24-48 hours for data to appear in standard reports

### Duplicate events
1. Check if component re-renders trigger multiple events
2. Use `useEffect` dependencies carefully
3. Debounce rapid-fire events

### Events with wrong parameters
1. Check function call parameters
2. Verify parameter names match GA4 expectations
3. Use lowercase with underscores for consistency

## Future Enhancements

- [ ] Enhanced e-commerce tracking (add_to_cart, begin_checkout)
- [ ] User ID tracking for logged-in users
- [ ] Session recording integration (Hotjar, Clarity)
- [ ] A/B testing integration
- [ ] Scroll depth tracking
- [ ] Time on page tracking
- [ ] Video engagement tracking (if added)
- [ ] Form field analytics (field completion rates)

## Related Documentation

- [SEO Monitoring Dashboard](./SEO_MONITORING_DASHBOARD.md)
- [Google Search Console Setup](./GOOGLE_SEARCH_CONSOLE_SETUP.md)
- [Performance Optimization](./PERFORMANCE_OPTIMIZATION.md)
