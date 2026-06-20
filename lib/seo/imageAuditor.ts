/**
 * Image SEO Auditing Utility
 * Validates image alt text, dimensions, lazy loading, and other SEO attributes
 */

export interface ImageAuditResult {
  src: string;
  alt: string | null;
  hasAlt: boolean;
  altQuality: 'good' | 'poor' | 'missing';
  altIssues: string[];
  width: string | null;
  height: string | null;
  hasDimensions: boolean;
  isLazyLoaded: boolean;
  loading: string | null;
  title: string | null;
  fileSize?: number;
  format?: string;
}

export interface ImageAuditReport {
  url: string;
  totalImages: number;
  imagesWithAlt: number;
  imagesWithoutAlt: number;
  imagesWithDimensions: number;
  imagesWithLazyLoading: number;
  images: ImageAuditResult[];
  score: number;
}

/**
 * Extract and validate images from HTML
 */
export function auditImages(html: string, url: string): ImageAuditReport {
  const images: ImageAuditResult[] = [];
  
  // Extract all img tags
  const imgRegex = /<img[^>]*>/gi;
  const imgMatches = html.matchAll(imgRegex);

  for (const match of imgMatches) {
    const imgTag = match[0];
    
    // Extract attributes
    const src = extractAttribute(imgTag, 'src');
    const alt = extractAttribute(imgTag, 'alt');
    const width = extractAttribute(imgTag, 'width');
    const height = extractAttribute(imgTag, 'height');
    const loading = extractAttribute(imgTag, 'loading');
    const title = extractAttribute(imgTag, 'title');

    const altIssues: string[] = [];
    let altQuality: 'good' | 'poor' | 'missing' = 'good';

    // Evaluate alt text
    if (!alt) {
      altIssues.push('Missing alt attribute');
      altQuality = 'missing';
    } else if (alt.trim() === '') {
      altIssues.push('Empty alt text');
      altQuality = 'poor';
    } else {
      // Check alt text quality
      if (alt.length < 10) {
        altIssues.push('Alt text too short (should be descriptive)');
        altQuality = 'poor';
      }
      if (alt.length > 125) {
        altIssues.push('Alt text too long (recommended max 125 chars)');
        altQuality = 'poor';
      }
      // Check for keyword stuffing
      if (/(.{5,})\1{2,}/.test(alt)) {
        altIssues.push('Possible keyword stuffing detected');
        altQuality = 'poor';
      }
      // Check for filename as alt text
      if (alt.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        altIssues.push('Alt text appears to be a filename');
        altQuality = 'poor';
      }
    }

    // Get file format from src
    const format = src?.match(/\.(jpg|jpeg|png|gif|webp|svg|avif)$/i)?.[1];

    images.push({
      src: src || '',
      alt,
      hasAlt: !!alt && alt.trim() !== '',
      altQuality,
      altIssues,
      width,
      height,
      hasDimensions: !!(width && height),
      isLazyLoaded: loading === 'lazy',
      loading,
      title,
      format,
    });
  }

  // Calculate statistics
  const imagesWithAlt = images.filter(img => img.hasAlt).length;
  const imagesWithoutAlt = images.length - imagesWithAlt;
  const imagesWithDimensions = images.filter(img => img.hasDimensions).length;
  const imagesWithLazyLoading = images.filter(img => img.isLazyLoaded).length;

  // Calculate score
  let score = 100;
  if (images.length > 0) {
    const altCoverage = (imagesWithAlt / images.length) * 100;
    const dimensionCoverage = (imagesWithDimensions / images.length) * 100;
    const lazyLoadCoverage = (imagesWithLazyLoading / Math.max(images.length - 3, 1)) * 100; // First 3 images typically don't need lazy loading

    score = (altCoverage * 0.5) + (dimensionCoverage * 0.3) + (Math.min(lazyLoadCoverage, 100) * 0.2);
  }

  return {
    url,
    totalImages: images.length,
    imagesWithAlt,
    imagesWithoutAlt,
    imagesWithDimensions,
    imagesWithLazyLoading,
    images,
    score: Math.round(score),
  };
}

/**
 * Extract attribute value from HTML tag
 */
function extractAttribute(tag: string, attrName: string): string | null {
  const regex = new RegExp(`${attrName}=["'](.*?)["']`, 'i');
  const match = tag.match(regex);
  return match ? match[1] : null;
}

/**
 * Audit images across multiple pages
 */
export async function auditImagesAcrossPages(urls: string[]): Promise<ImageAuditReport[]> {
  const reports: ImageAuditReport[] = [];

  for (const url of urls) {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const report = auditImages(html, url);
      reports.push(report);
    } catch (error) {
      console.error(`Error auditing images for ${url}:`, error);
      reports.push({
        url,
        totalImages: 0,
        imagesWithAlt: 0,
        imagesWithoutAlt: 0,
        imagesWithDimensions: 0,
        imagesWithLazyLoading: 0,
        images: [],
        score: 0,
      });
    }
  }

  return reports;
}

/**
 * Generate image sitemap XML
 */
export function generateImageSitemap(reports: ImageAuditReport[]): string {
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>'];
  lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
  lines.push('        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">');

  for (const report of reports) {
    if (report.images.length === 0) continue;

    lines.push(`  <url>`);
    lines.push(`    <loc>${escapeXml(report.url)}</loc>`);

    for (const image of report.images) {
      if (!image.src) continue;

      lines.push(`    <image:image>`);
      lines.push(`      <image:loc>${escapeXml(image.src)}</image:loc>`);
      
      if (image.alt) {
        lines.push(`      <image:caption>${escapeXml(image.alt)}</image:caption>`);
      }
      
      if (image.title) {
        lines.push(`      <image:title>${escapeXml(image.title)}</image:title>`);
      }

      lines.push(`    </image:image>`);
    }

    lines.push(`  </url>`);
  }

  lines.push('</urlset>');
  return lines.join('\n');
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Export image audit to CSV
 */
export function exportImageAuditToCSV(reports: ImageAuditReport[]): string {
  const headers = [
    'Page URL',
    'Image Src',
    'Alt Text',
    'Has Alt',
    'Alt Quality',
    'Issues',
    'Has Dimensions',
    'Width',
    'Height',
    'Lazy Loading',
    'Format',
  ];

  const rows: string[][] = [];

  for (const report of reports) {
    for (const image of report.images) {
      rows.push([
        report.url,
        image.src,
        image.alt || '',
        image.hasAlt ? 'Yes' : 'No',
        image.altQuality,
        image.altIssues.join('; '),
        image.hasDimensions ? 'Yes' : 'No',
        image.width || '',
        image.height || '',
        image.isLazyLoaded ? 'Yes' : 'No',
        image.format || '',
      ]);
    }
  }

  const csvLines = [headers, ...rows].map((row) =>
    row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')
  );

  return csvLines.join('\n');
}

/**
 * Check if image is optimized (WebP format and proper dimensions)
 */
export function checkImageOptimization(image: ImageAuditResult): {
  isOptimized: boolean;
  recommendations: string[];
} {
  const recommendations: string[] = [];
  let isOptimized = true;

  // Check format
  if (image.format && !['webp', 'avif'].includes(image.format.toLowerCase())) {
    recommendations.push('Consider converting to WebP or AVIF format for better compression');
    isOptimized = false;
  }

  // Check dimensions
  if (!image.hasDimensions) {
    recommendations.push('Add width and height attributes to prevent layout shift');
    isOptimized = false;
  }

  // Check lazy loading
  if (!image.isLazyLoaded) {
    recommendations.push('Add loading="lazy" attribute for better performance');
    isOptimized = false;
  }

  return {
    isOptimized,
    recommendations,
  };
}
