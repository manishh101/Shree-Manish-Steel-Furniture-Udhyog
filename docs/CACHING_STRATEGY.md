# Caching Strategy Documentation

This document outlines the comprehensive caching strategy implemented for the Manish Steel Furniture website to optimize performance and SEO (Requirement 10.3).

## Overview

The caching strategy uses a multi-layered approach:

1. **Static Asset Caching** - Long-term caching for immutable assets
2. **ISR (Incremental Static Regeneration)** - Stale-while-revalidate for pages
3. **API Response Caching** - Cache-Control headers for API routes
4. **CDN Caching** - Vercel Edge Network optimization

## Configuration

All caching configurations are centralized in `/lib/cache.ts`:

```typescript
export const CACHE_CONFIG = {
  STATIC_ASSETS: { maxAge: 31536000, immutable: true },
  PRODUCTS: { maxAge: 3600, staleWhileRevalidate: 86400, revalidate: 3600 },
  CATEGORIES: { maxAge: 7200, staleWhileRevalidate: 86400, revalidate: 7200 },
  BLOGS: { maxAge: 3600, staleWhileRevalidate: 86400, revalidate: 86400 },
  HOMEPAGE: { maxAge: 1800, staleWhileRevalidate: 3600, revalidate: 3600 },
  // ... more configurations
}
```

## 1. Static Asset Caching

### Implementation Location
- `next.config.js` - Headers configuration

### Strategy
- **Images, CSS, JS**: `Cache-Control: public, max-age=31536000, immutable`
- **TTL**: 1 year (immutable with content hashing)
- **Invalidation**: Automatic via Next.js build hash

### Verification
Static assets are cached at:
- Browser level
- CDN level (Vercel Edge Network)
- Cloudinary CDN for images

## 2. ISR (Incremental Static Regeneration)

### Pages with ISR

| Page Type | Revalidation Period | Rationale |
|-----------|-------------------|-----------|
| Homepage | 1 hour (3600s) | Dynamic content, frequent updates |
| Product Detail | 1 hour (3600s) | Moderate update frequency |
| Product Listing | Client-side | Real-time filtering needed |
| Blog Listing | 24 hours (86400s) | Infrequent content changes |
| Blog Detail | 24 hours (86400s) | Static content after publish |
| Category Pages | 2 hours (7200s) | Rarely updated |

### Implementation Example

```typescript
// app/(public)/products/[productId]/page.tsx
import { CACHE_CONFIG } from '@/lib/cache';

export const revalidate = CACHE_CONFIG.PRODUCTS.revalidate; // 3600s
```

### Benefits
- Pages regenerate in background after revalidation period
- Visitors always get instant response (stale content while revalidating)
- No build-time delays for new content
- Automatic cache invalidation on revalidation

## 3. API Response Caching

### Implementation
API routes return Cache-Control headers using the `createCachedResponse()` utility:

```typescript
// app/api/products/route.ts
import { createCachedResponse } from '@/lib/cache';

return NextResponse.json(
  { products },
  { headers: createCachedResponse('PRODUCTS') }
);
```

### Cache Headers Generated

For products API:
```
Cache-Control: public, max-age=3600, stale-while-revalidate=86400
CDN-Cache-Control: public, max-age=3600, stale-while-revalidate=86400
Vercel-CDN-Cache-Control: public, max-age=3600, stale-while-revalidate=86400
```

### API Endpoints with Caching

| Endpoint | Cache Duration | SWR Duration |
|----------|---------------|--------------|
| `/api/products` | 1 hour | 24 hours |
| `/api/categories` | 2 hours | 24 hours |
| `/api/blogs` | 1 hour | 24 hours |
| `/api/homepage` | 30 minutes | 1 hour |
| `/api/settings` | 2 hours | 24 hours |
| `/api/gallery` | 1 hour | 24 hours |

## 4. Stale-While-Revalidate Strategy

### What is SWR?

Stale-While-Revalidate allows:
1. Serve cached (stale) content immediately
2. Fetch fresh content in background
3. Update cache with fresh content for next request

### Benefits for SEO & UX
- **Instant page loads** - No waiting for API calls
- **Better Core Web Vitals** - Improved LCP and FID
- **SEO-friendly** - Search engines get fast responses
- **Resilience** - Works even if backend is slow

### Implementation Flow

```
User Request → Check Cache
  ↓
Cache Hit (within max-age) → Serve immediately
  ↓
Cache Hit (past max-age, within SWR) → Serve stale + Revalidate background
  ↓
Cache Miss → Fetch fresh + Cache
```

## 5. Next.js Static Asset Configuration

### Already Configured (next.config.js)

```javascript
{
  source: '/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico)',
  headers: [
    {
      key: 'Cache-Control',
      value: 'public, max-age=31536000, immutable',
    },
  ],
}
```

This ensures:
- All images cached for 1 year
- Immutable flag prevents revalidation checks
- Content-addressed (hash in filename) for cache busting

## 6. Image Optimization Caching

### Cloudinary Configuration
Images served via Cloudinary automatically benefit from:
- Global CDN distribution
- Automatic format optimization (WebP)
- Responsive image sizing
- Long-term caching (1 year TTL)

### Next.js Image Component
```javascript
minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
```

Optimized images are cached at:
1. Browser cache (30 days)
2. Cloudinary CDN (1 year)
3. Vercel CDN (1 year)

## 7. Memory Cache (In-Memory)

### Use Cases
- URL redirects lookup (middleware)
- Frequent read operations
- Short-lived session data

### Implementation
```typescript
import { memoryCache } from '@/lib/cache';

// Set with TTL
memoryCache.set('redirect:/old-url', { to: '/new-url' }, 5 * 60 * 1000);

// Get
const redirect = memoryCache.get('redirect:/old-url');
```

### Configuration
- Max size: 1000 entries
- LRU eviction policy
- Per-entry TTL

## 8. Cache Invalidation

### Automatic Invalidation

Next.js automatically invalidates cache when:
1. Revalidation period expires
2. `revalidatePath()` or `revalidateTag()` called
3. Content updated via admin panel

### Manual Invalidation

Admin operations trigger cache revalidation:

```typescript
// After product update
revalidatePath('/products');
revalidatePath(`/products/${product.slug}`);
revalidatePath('/');
```

### On-Demand Revalidation

Implemented in mutation APIs:
- Product create/update/delete
- Blog create/update/delete
- Category modifications
- Settings updates

## 9. CDN Caching (Vercel)

### Edge Network Benefits
- 50+ global edge locations
- Automatic HTTPS
- Compression (Brotli/gzip)
- Smart routing

### Cache Layers
1. **Edge Cache** - Closest to user
2. **Origin Cache** - Vercel origin servers
3. **ISR Cache** - Next.js ISR cache

### Purging
- Automatic on deployment
- Manual via Vercel API if needed
- Automatic on `revalidatePath()`

## 10. Performance Monitoring

### Metrics to Track

1. **Cache Hit Rate**
   - Target: >80% for static assets
   - Target: >60% for API responses

2. **Time to First Byte (TTFB)**
   - Target: <200ms (cached)
   - Target: <800ms (uncached)

3. **Core Web Vitals**
   - LCP: <2.5s
   - FID: <100ms
   - CLS: <0.1

### Tools
- Vercel Analytics Dashboard
- Chrome DevTools Network tab
- Lighthouse CI
- Google Search Console (Core Web Vitals)

## 11. Best Practices

### Do's
✅ Use ISR for semi-static content
✅ Apply stale-while-revalidate for better UX
✅ Cache API responses with appropriate TTLs
✅ Invalidate cache on content updates
✅ Monitor cache hit rates
✅ Use immutable flag for hashed assets

### Don'ts
❌ Don't cache user-specific data publicly
❌ Don't set very short cache durations (<30s)
❌ Don't cache error responses
❌ Don't forget to revalidate after mutations
❌ Don't cache authentication endpoints

## 12. Testing Cache Behavior

### Test Static Asset Caching

```bash
# Check response headers
curl -I https://manishsteel.com.np/logo192.png

# Expected:
# Cache-Control: public, max-age=31536000, immutable
```

### Test API Caching

```bash
# Check API response headers
curl -I https://manishsteel.com.np/api/products

# Expected:
# Cache-Control: public, max-age=3600, stale-while-revalidate=86400
```

### Test ISR Behavior

1. Visit a product page
2. Note the timestamp/data
3. Wait for revalidation period
4. Visit again - should see instant response (stale)
5. Refresh again - should see updated content

## 13. Troubleshooting

### Problem: Stale content not updating

**Solution:**
1. Check revalidation period in page config
2. Verify `revalidatePath()` is called after mutations
3. Check Vercel deployment logs
4. Clear CDN cache via Vercel dashboard if needed

### Problem: Cache hit rate too low

**Solution:**
1. Increase `max-age` for stable content
2. Extend `stale-while-revalidate` duration
3. Check for cache-busting query parameters
4. Verify CDN configuration

### Problem: Users seeing very old content

**Solution:**
1. Reduce revalidation period
2. Implement webhook-based revalidation
3. Add manual cache clear button in admin
4. Check `CDN-Cache-Control` headers

## 14. Future Enhancements

### Planned Improvements
1. **Redis Cache** - Distributed cache for scalability
2. **Webhook Revalidation** - Instant updates on content changes
3. **Prefetching** - Predict and prefetch likely next pages
4. **Service Worker** - Offline support and advanced caching
5. **GraphQL Caching** - If migrating to GraphQL

## Summary

The implemented caching strategy provides:

- ✅ **1-year caching** for static assets
- ✅ **Stale-while-revalidate** for all dynamic content
- ✅ **ISR** with appropriate revalidation periods
- ✅ **API response caching** with proper headers
- ✅ **CDN optimization** via Vercel Edge Network
- ✅ **Memory caching** for frequent lookups
- ✅ **Automatic invalidation** on content updates

This results in:
- Fast page loads (better UX)
- Improved Core Web Vitals (better SEO)
- Reduced server load
- Better resilience
- Lower hosting costs

## References

- [Next.js ISR Documentation](https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration)
- [HTTP Caching MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching)
- [Vercel Edge Network](https://vercel.com/docs/concepts/edge-network/overview)
- [Stale-While-Revalidate RFC](https://tools.ietf.org/html/rfc5861)
