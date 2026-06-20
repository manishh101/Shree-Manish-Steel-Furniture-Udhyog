# Open Graph Image Creation Guide

## Overview
Open Graph (OG) images are displayed when your website is shared on social media platforms like Facebook, WhatsApp, Twitter, and LinkedIn. They should be visually appealing and represent your brand effectively.

## Image Specifications

### Default OG Image
- **Size**: 1200 x 630 pixels (Facebook/LinkedIn recommended)
- **Format**: JPG or PNG
- **File Size**: < 300KB for fast loading
- **Location**: `public/images/og-image.jpg`
- **Aspect Ratio**: 1.91:1

### Product-Specific OG Images (Future Enhancement)
- **Size**: 1200 x 630 pixels
- **Format**: JPG (better compression for photos)
- **Naming**: `product-{productId}-og.jpg`
- **Content**: Product image + product name + brand logo

### Blog Post OG Images
- **Size**: 1200 x 630 pixels
- **Format**: JPG
- **Content**: Featured blog image or custom design with blog title

## Design Guidelines

### Default OG Image Content
Your default OG image should include:

1. **Brand Logo**: Prominently displayed
2. **Tagline**: "Best Steel Furniture in Biratnagar Nepal" or similar
3. **Key Products**: Showcase 2-3 popular products (almirah, bed, table)
4. **Contact Info**: Phone number or website URL (optional)
5. **Background**: Clean, professional (white or brand color)

### Design Template Structure
```
┌─────────────────────────────────────────────────────┐
│                                                       │
│        [LOGO]                                         │
│                                                       │
│     Shree Manish Steel Furniture                      │
│     श्री मनिष स्टील फर्निचर                          │
│                                                       │
│  Best Steel Furniture in Biratnagar, Nepal            │
│  [Product Image 1] [Product Image 2] [Product Image 3]│
│                                                       │
│  ✓ Free Delivery  ✓ 5-Year Warranty  ✓ Affordable    │
│                                                       │
│           www.manishsteel.com.np                      │
└─────────────────────────────────────────────────────┘
```

## Tools for Creating OG Images

### Option 1: Canva (Recommended - Easy)
1. Go to [Canva.com](https://www.canva.com)
2. Search for "Facebook Post" template (1200x630)
3. Customize with your logo, products, and text
4. Download as JPG (high quality)

### Option 2: Figma (Professional)
1. Create 1200x630px artboard
2. Design with brand assets
3. Export as JPG with 80-90% quality

### Option 3: Photoshop
1. New document: 1200x630px, 72 DPI
2. Design layers
3. Save for Web as JPG (60-80 quality)

## Current Implementation Status

### ✅ Implemented:
- Open Graph meta tags on all pages
- og:title, og:description properly set
- og:type (website, article, product) based on page
- og:locale set to 'ne_NP' (Nepali)
- og:locale:alternate set to 'en_NP'
- og:url points to canonical URLs
- og:siteName includes business name
- Image dimensions specified (1200x630)

### ⚠️ Pending:
- **Create default og-image.jpg** at `public/images/og-image.jpg`
- Optional: Generate dynamic OG images for each product
- Optional: Create OG images for blog posts

## Quick Fix - Create Placeholder

If you don't have a designed OG image yet, you can:

1. **Use your logo as temporary OG image:**
   - Copy `public/logo192.png` or `public/images/new-logo-1.png`
   - Resize to 1200x630px (add white background)
   - Save as `public/images/og-image.jpg`

2. **Use Canva's Quick Template:**
   - Go to Canva
   - Search "Facebook Post"
   - Use "Photo Grid" template
   - Add 3 product photos
   - Add text: "Manish Steel Furniture - Best Furniture Shop in Biratnagar"
   - Download as JPG

## Testing Your OG Image

### Facebook Debugger
- URL: https://developers.facebook.com/tools/debug/
- Enter your URL
- Click "Scrape Again" to refresh cache
- Preview how it looks when shared

### LinkedIn Post Inspector
- URL: https://www.linkedin.com/post-inspector/
- Enter your URL to preview

### Twitter Card Validator
- URL: https://cards-dev.twitter.com/validator
- Preview Twitter card appearance

### WhatsApp Preview
- Simply share your URL in a chat
- WhatsApp will generate preview

## Implementation Checklist

- [ ] Design default OG image (1200x630px)
- [ ] Save as `public/images/og-image.jpg`
- [ ] Optimize file size (< 300KB)
- [ ] Test with Facebook Debugger
- [ ] Test with LinkedIn Post Inspector
- [ ] Test actual sharing on WhatsApp
- [ ] Optional: Create product-specific OG images
- [ ] Optional: Create blog post OG images

## Example OG Tags in HTML

```html
<!-- Already implemented in your app -->
<meta property="og:title" content="Best Steel Furniture Biratnagar | Almirah Daraj Palang Bed" />
<meta property="og:description" content="Premium steel almirahs, beds, tables at affordable prices..." />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://manishsteel.com.np" />
<meta property="og:image" content="https://manishsteel.com.np/images/og-image.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Manish Steel Furniture - Best Furniture Shop in Biratnagar" />
<meta property="og:locale" content="ne_NP" />
<meta property="og:locale:alternate" content="en_NP" />
<meta property="og:site_name" content="Shree Manish Steel Furniture" />
```

## Dynamic Product OG Images (Future Enhancement)

To generate OG images dynamically for products:

### Option 1: Use Cloudinary Transformations
```typescript
// Generate OG image URL using Cloudinary overlays
const generateProductOGImage = (product: any) => {
  const baseImage = product.image;
  
  // Add text overlays using Cloudinary's transformation API
  return baseImage.replace(
    '/upload/',
    '/upload/w_1200,h_630,c_fill,g_center/l_text:Arial_60_bold:' + 
    encodeURIComponent(product.name) + ',co_rgb:FFFFFF,g_south,y_50/'
  );
};
```

### Option 2: Use Vercel OG Image Generation
```typescript
// pages/api/og-image/[productId].tsx
import { ImageResponse } from '@vercel/og';

export default function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productName = searchParams.get('name');
  
  return new ImageResponse(
    <div style={{ /* design OG image */ }}>
      <h1>{productName}</h1>
    </div>,
    { width: 1200, height: 630 }
  );
}
```

### Option 3: Pre-generate with Script
```javascript
// scripts/generate-product-og-images.js
// Use Puppeteer or Sharp to generate images from HTML templates
```

## Notes

- The OG image is cached by social platforms, so changes may take time to reflect
- Use Facebook Debugger to force re-scrape
- Keep text minimal and readable (large fonts)
- Test on mobile devices (most social media usage)
- Ensure good contrast for readability
- Use actual product photos, not stock images
- Include Nepali text (दराज, पलंग) for local relevance

## Priority Actions

1. **IMMEDIATE**: Create default og-image.jpg and place in public/images/
2. **SHORT-TERM**: Create category-specific OG images
3. **LONG-TERM**: Implement dynamic OG image generation for products
