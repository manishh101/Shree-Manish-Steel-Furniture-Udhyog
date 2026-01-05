#!/bin/bash

# Sitemap Validation Script
# Tests sitemap.xml for common issues

echo "🔍 Sitemap Validation Test"
echo "=========================="
echo ""

DOMAIN="https://manishsteel.com.np"
SITEMAP_URL="$DOMAIN/sitemap.xml"

echo "Testing: $SITEMAP_URL"
echo ""

# Test 1: Check if sitemap is accessible
echo "1. Checking accessibility..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SITEMAP_URL")
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Sitemap accessible (HTTP $HTTP_CODE)"
else
    echo "❌ Sitemap not accessible (HTTP $HTTP_CODE)"
    exit 1
fi
echo ""

# Test 2: Check if it's valid XML
echo "2. Checking XML format..."
CONTENT=$(curl -s "$SITEMAP_URL")
if echo "$CONTENT" | grep -q "<?xml version"; then
    echo "✅ Valid XML declaration found"
else
    echo "❌ Invalid or missing XML declaration"
fi
echo ""

# Test 3: Check for query parameters (not recommended)
echo "3. Checking for query parameters..."
QUERY_PARAMS=$(echo "$CONTENT" | grep -c "?category=\|&subcategory=")
if [ "$QUERY_PARAMS" -eq 0 ]; then
    echo "✅ No query parameters found (Good!)"
else
    echo "⚠️  Found $QUERY_PARAMS URLs with query parameters"
    echo "   Google may ignore these URLs"
fi
echo ""

# Test 4: Count URLs in sitemap
echo "4. Counting URLs..."
URL_COUNT=$(echo "$CONTENT" | grep -c "<loc>")
if [ "$URL_COUNT" -gt 0 ]; then
    echo "✅ Found $URL_COUNT URLs in sitemap"
    if [ "$URL_COUNT" -gt 50000 ]; then
        echo "⚠️  Warning: More than 50,000 URLs (consider splitting)"
    fi
else
    echo "❌ No URLs found in sitemap"
fi
echo ""

# Test 5: Check for required tags
echo "5. Checking required tags..."
if echo "$CONTENT" | grep -q "<urlset"; then
    echo "✅ <urlset> tag found"
else
    echo "❌ Missing <urlset> tag"
fi

if echo "$CONTENT" | grep -q "<loc>"; then
    echo "✅ <loc> tags found"
else
    echo "❌ Missing <loc> tags"
fi
echo ""

# Test 6: Validate URLs
echo "6. Validating URL format..."
if echo "$CONTENT" | grep -q "http://localhost\|http://127.0.0.1"; then
    echo "❌ Found localhost URLs (must be production URLs)"
else
    echo "✅ No localhost URLs found"
fi
echo ""

# Test 7: Check lastModified dates
echo "7. Checking date format..."
if echo "$CONTENT" | grep -q "<lastmod>"; then
    echo "✅ lastModified dates found"
else
    echo "⚠️  No lastModified dates (optional but recommended)"
fi
echo ""

echo "=========================="
echo "✅ Validation Complete"
echo ""

echo "Next steps:"
echo "1. Go to: https://www.xml-sitemaps.com/validate-xml-sitemap.html"
echo "2. Enter: $SITEMAP_URL"
echo "3. Click 'Validate Sitemap'"
echo ""
echo "Or use Google Search Console:"
echo "1. Go to: https://search.google.com/search-console"
echo "2. Sitemaps → Add new sitemap"
echo "3. Enter: sitemap.xml"
echo "4. Click 'Submit'"
echo ""
