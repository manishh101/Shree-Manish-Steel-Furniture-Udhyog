#!/bin/bash

# SEO Verification Script
# Run this after deploying to production

echo "🔍 SEO Configuration Verification"
echo "=================================="
echo ""

DOMAIN="https://manishsteel.com.np"
PRODUCT_URL="$DOMAIN/products/zczbjgtkgxjxs399go1i"

echo "1. Checking robots.txt..."
curl -s "$DOMAIN/robots.txt" | head -20
echo ""

echo "2. Checking sitemap accessibility..."
curl -s -I "$DOMAIN/sitemap.xml" | grep -i "200\|content-type"
echo ""

echo "3. Checking image sitemap accessibility..."
curl -s -I "$DOMAIN/image-sitemap.xml" | grep -i "200\|content-type"
echo ""

echo "4. Counting images in image sitemap..."
IMAGE_COUNT=$(curl -s "$DOMAIN/image-sitemap.xml" | grep -c "<image:loc>")
echo "✅ Found $IMAGE_COUNT images in sitemap"
echo ""

echo "5. Checking product page renders server-side..."
CONTENT=$(curl -s "$PRODUCT_URL" | grep -o "<h1[^>]*>.*</h1>" | head -1)
if [ -n "$CONTENT" ]; then
    echo "✅ Server-side HTML found: $CONTENT"
else
    echo "❌ No server-rendered content found (may be client-side only)"
fi
echo ""

echo "6. Checking for JSON-LD structured data..."
JSON_LD=$(curl -s "$PRODUCT_URL" | grep -c "application/ld+json")
if [ "$JSON_LD" -gt 0 ]; then
    echo "✅ JSON-LD found ($JSON_LD occurrences)"
else
    echo "❌ No JSON-LD structured data found"
fi
echo ""

echo "7. Checking meta tags..."
curl -s "$PRODUCT_URL" | grep -o '<meta[^>]*>' | head -10
echo ""

echo "=================================="
echo "✅ Verification Complete"
echo ""
echo "Next Steps:"
echo "1. Go to Google Search Console"
echo "2. Submit both sitemaps:"
echo "   - $DOMAIN/sitemap.xml (pages)"
echo "   - $DOMAIN/image-sitemap.xml (images)"
echo "3. Request indexing for: $PRODUCT_URL"
echo "4. Use Rich Results Test: https://search.google.com/test/rich-results"
echo "5. Use Image Search optimization: Enable in Search Console"
echo ""
