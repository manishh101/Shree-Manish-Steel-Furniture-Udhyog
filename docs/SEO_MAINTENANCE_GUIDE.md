# SEO Maintenance Guide — Manish Steel Furniture

This guide covers how to maintain and improve SEO for manishsteel.com.np on an ongoing basis.

---

## Running the SEO Audit

Run the full audit at any time:

```bash
# Static check (source code + database)
npm run seo:audit

# Full check including live URL sampling
npm run seo:audit:live

# Check for broken links only
npm run seo:check-links

# Validate sitemap structure
npm run seo:validate-sitemap
```

The audit produces `seo-audit-results.json` in the project root and prints a health score (0–100). Aim to keep this above 80.

---

## Adding New Products with SEO Best Practices

### Required fields for every product

| Field | Requirement | Example |
|-------|------------|---------|
| `name` | Clear, descriptive | "Steel Almirah 3-Door 72 Inch" |
| `slug` | Lowercase, hyphens, ends in `-biratnagar` | `steel-almirah-3-door-72-inch-biratnagar` |
| `metaTitle` | 50–60 characters, includes primary keyword | "Steel Almirah 3 Door 72 Inch - Biratnagar Nepal" |
| `metaDescription` | 140–160 characters, includes CTA | "Buy 3-door 72-inch steel almirah (daraj) in Biratnagar. Free delivery to Dharan, Itahari. 10-year warranty. Call +977 9824336371." |
| `description` | 150+ words, unique per product | Full paragraph with features, material, dimensions |
| `focusKeywords` | 3–5 keywords | `["steel almirah", "daraj", "3 door almirah biratnagar"]` |
| `image` | Cloudinary URL | Required for Product schema |
| `imageAlt` | Descriptive alt text | "Steel 3-Door Almirah - Storage Furniture \| Biratnagar Nepal" |
| `price` | Numeric, in NPR | Required for Product schema rich results |

### Slug generation rules

1. Convert the product name to lowercase
2. Replace spaces with hyphens
3. Remove special characters (keep only `a-z`, `0-9`, `-`)
4. Always append `-biratnagar` if not already present
5. Keep it under 60 characters

Good: `double-bed-palang-queen-size-biratnagar`
Bad: `Double Bed`, `product-12345`, `double_bed_biratnagar`

### Dual-keyword strategy

For product categories with both formal and colloquial names, include both naturally:

| Formal (English) | Colloquial (Nepali) | Usage |
|-----------------|--------------------|----|
| almirah / wardrobe | daraj / daraz | Title, description, alt text |
| bed | palang / khat | Description, meta |
| dressing table | singarne table | Description |
| study table | padhne table | Description |
| locker | tala wala daraj | Description |

Example description:
> "This premium steel almirah (daraj) features three doors and comes in a standard 72-inch height..."

Do **not** repeat the same keyword more than 2–3 times per page. Natural language always wins.

### Image alt text formula

```
[Product Name] - [Category] | [Material] | [Location]
```

Examples:
- `"Steel Almirah 72 Inch - Storage Furniture | Premium Steel Daraj | Biratnagar Nepal"`
- `"Double Bed - Bedroom Furniture | Steel Palang | Free Delivery Biratnagar"`

---

## Writing SEO-Optimized Blog Posts

### Post structure

```
Title (H1): Target keyword + location or intent
  e.g., "How to Choose a Steel Almirah (Daraj) in Biratnagar"

Introduction (100–150 words):
  State the topic, include the primary keyword in the first sentence.

H2 sections (3–5 sections):
  Each covering a subtopic. Include secondary keywords naturally.

Conclusion + CTA:
  Link to a relevant product category. Include WhatsApp/contact link.
```

### Metadata for blog posts

- `metaTitle`: 50–60 chars — usually the post title, trimmed if needed
- `metaDescription`: 140–160 chars — one sentence summary with keyword + benefit
- `slug`: URL-friendly version of title, no location suffix needed for blogs
- `featuredImage`: Always set — used for Open Graph sharing

### Keyword targets per post

Pick one primary keyword and 2–3 secondary keywords. Write naturally — don't force them in.

| Post topic | Primary keyword | Secondary keywords |
|-----------|----------------|-------------------|
| Almirah buying guide | steel almirah Biratnagar | daraj price Nepal, 3 door almirah |
| Office furniture | office furniture Nepal | office table Biratnagar, steel office desk |
| Furniture care | steel furniture care tips | how to clean almirah |

### Internal linking

Every blog post should link to at least 2 product category pages. Example:
- Writing about almirahs → link to `/products?category=almirah`
- Writing about beds → link to `/products?category=bed`

### Publishing frequency

Aim for 2–4 posts per month to maintain freshness signals.

---

## Dual-Keyword Usage Guidelines

The site targets both formal English terms and colloquial Nepali terms used in search.

### When to use both terms

- Product titles: use primary term, add colloquial in parentheses on first mention
- Meta descriptions: include both if space allows (prioritize the colloquial if space is tight)  
- Image alt text: use whichever fits the template more naturally
- URL slugs: prefer the internationally recognized term (`almirah` not `daraj`)
- Content body: introduce both on first use, then use either throughout

### Avoid keyword stuffing

If the same keyword appears more than 3 times in a 200-word passage, it's too much. Read aloud — if it sounds unnatural, rewrite it.

### Master keyword pairs reference

See `.kiro/specs/seo-optimization/dual-keyword-audit.md` for the complete list.

---

## Monthly SEO Maintenance Tasks

Run these every month:

### Week 1 — Technical checks

```bash
npm run seo:audit
npm run seo:check-links
npm run seo:validate-sitemap
```

- Fix any critical issues immediately
- Fix warnings within the week
- Review `seo-audit-results.json` for trends

### Week 2 — Content review

- Open Google Search Console → Performance
- Find pages with impressions but low CTR (< 2%)
- Rewrite meta descriptions for those pages to be more compelling
- Find queries where you rank position 8–20 — these are quick wins
- Update product descriptions for those pages with the search query

### Week 3 — New content

- Publish 1–2 new blog posts targeting identified keyword gaps
- Update 2–3 existing product descriptions that are thin (< 100 words)
- Check for any new product categories that need category descriptions

### Week 4 — Monitoring

- Review Google Search Console for new crawl errors
- Check Core Web Vitals report in Search Console
- Verify no new 404s from the broken links report
- Check that new products added this month have all required SEO fields

---

## Ongoing Optimization Checklist

Use this when adding new content or making changes:

### New product checklist
- [ ] Slug set and includes `-biratnagar`
- [ ] Meta title 50–60 chars with primary keyword
- [ ] Meta description 140–160 chars with CTA
- [ ] Description is 150+ words, unique, includes dual keywords
- [ ] Main image has descriptive alt text
- [ ] At least 3 product images
- [ ] Focus keywords set (3–5)
- [ ] Price set in NPR
- [ ] Category assigned (required for Product schema)

### New blog post checklist
- [ ] Slug is URL-friendly
- [ ] Meta title and description set
- [ ] Featured image with alt text
- [ ] Post is 800+ words
- [ ] Includes 2+ internal links to product pages
- [ ] H2 headings used for structure
- [ ] Primary keyword in first paragraph

### Before deploying site changes
- [ ] Run `npm run seo:audit` and confirm no new critical issues
- [ ] Check that sitemap still generates correctly after schema changes
- [ ] Confirm robots.txt still disallows `/admin` and `/api`

---

## Submitting to Search Engines

### Google Search Console

1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Select the Manish Steel property
3. Go to **Sitemaps** and add:
   - `https://manishsteel.com.np/sitemap.xml`
   - `https://manishsteel.com.np/image-sitemap.xml`
4. For important new pages, use **URL Inspection → Request Indexing**

### Bing Webmaster Tools

1. Go to [bing.com/webmasters](https://www.bing.com/webmasters)
2. Submit `https://manishsteel.com.np/sitemap.xml`

### When to request re-indexing

- After publishing new blog posts
- After significant product page updates
- After fixing critical SEO issues identified in the audit

---

## Core Web Vitals Targets

| Metric | Target | Current Test Method |
|--------|--------|-------------------|
| LCP (Largest Contentful Paint) | < 2.5s | PageSpeed Insights / Lighthouse |
| FID (First Input Delay) | < 100ms | Search Console → Core Web Vitals |
| CLS (Cumulative Layout Shift) | < 0.1 | PageSpeed Insights |

Run Lighthouse periodically:
```bash
npm run lighthouse
```

If scores drop, check:
1. New large images above the fold without `priority` prop
2. New layout shifts from dynamic content loading
3. Heavy new JavaScript bundles — run `npm run analyze` to inspect

---

## Monitoring Alerts to Set Up

In Google Search Console → Settings → Email alerts, enable:
- Coverage issues (new 404s, server errors)
- Manual actions
- Core Web Vitals issues
- Security issues

For uptime, Vercel provides built-in monitoring in the project dashboard.

---

## Key URLs for Reference

| Tool | URL |
|------|-----|
| Google Search Console | https://search.google.com/search-console |
| Google PageSpeed Insights | https://pagespeed.web.dev |
| Google Rich Results Test | https://search.google.com/test/rich-results |
| Bing Webmaster Tools | https://www.bing.com/webmasters |
| Admin SEO Audit (internal) | https://manishsteel.com.np/admin/seo |
| Admin SEO Tools (internal) | https://manishsteel.com.np/admin/seo-tools |
