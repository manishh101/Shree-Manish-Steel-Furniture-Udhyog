/**
 * Metadata Auditing Utility
 * Audits meta titles, descriptions, and other SEO metadata across pages
 */

export interface MetadataAuditResult {
  url: string;
  title: string | null;
  titleLength: number;
  titleIssues: string[];
  description: string | null;
  descriptionLength: number;
  descriptionIssues: string[];
  canonical: string | null;
  robotsDirective: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  hasH1: boolean;
  h1Text: string | null;
  score: number;
}

export interface MetadataAuditReport {
  totalPages: number;
  pagesWithIssues: number;
  duplicateTitles: Array<{ title: string; urls: string[] }>;
  duplicateDescriptions: Array<{ description: string; urls: string[] }>;
  results: MetadataAuditResult[];
}

/**
 * Recommended lengths for metadata
 */
const METADATA_RECOMMENDATIONS = {
  title: {
    min: 50,
    max: 60,
    absoluteMax: 70,
  },
  description: {
    min: 140,
    max: 160,
    absoluteMax: 200,
  },
};

/**
 * Extract metadata from HTML
 */
export function extractMetadata(html: string, url: string): MetadataAuditResult {
  const titleIssues: string[] = [];
  const descriptionIssues: string[] = [];

  // Extract title
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : null;
  const titleLength = title ? title.length : 0;

  // Check title issues
  if (!title) {
    titleIssues.push('Missing title tag');
  } else {
    if (titleLength < METADATA_RECOMMENDATIONS.title.min) {
      titleIssues.push(`Title too short (${titleLength} chars, recommended ${METADATA_RECOMMENDATIONS.title.min}-${METADATA_RECOMMENDATIONS.title.max})`);
    } else if (titleLength > METADATA_RECOMMENDATIONS.title.absoluteMax) {
      titleIssues.push(`Title too long (${titleLength} chars, recommended ${METADATA_RECOMMENDATIONS.title.min}-${METADATA_RECOMMENDATIONS.title.max})`);
    } else if (titleLength > METADATA_RECOMMENDATIONS.title.max) {
      titleIssues.push(`Title slightly long (${titleLength} chars, optimal is ${METADATA_RECOMMENDATIONS.title.min}-${METADATA_RECOMMENDATIONS.title.max})`);
    }
  }

  // Extract meta description
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/i);
  const description = descMatch ? descMatch[1].trim() : null;
  const descriptionLength = description ? description.length : 0;

  // Check description issues
  if (!description) {
    descriptionIssues.push('Missing meta description');
  } else {
    if (descriptionLength < METADATA_RECOMMENDATIONS.description.min) {
      descriptionIssues.push(`Description too short (${descriptionLength} chars, recommended ${METADATA_RECOMMENDATIONS.description.min}-${METADATA_RECOMMENDATIONS.description.max})`);
    } else if (descriptionLength > METADATA_RECOMMENDATIONS.description.absoluteMax) {
      descriptionIssues.push(`Description too long (${descriptionLength} chars, recommended ${METADATA_RECOMMENDATIONS.description.min}-${METADATA_RECOMMENDATIONS.description.max})`);
    } else if (descriptionLength > METADATA_RECOMMENDATIONS.description.max) {
      descriptionIssues.push(`Description slightly long (${descriptionLength} chars, optimal is ${METADATA_RECOMMENDATIONS.description.min}-${METADATA_RECOMMENDATIONS.description.max})`);
    }
  }

  // Extract canonical
  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["'](.*?)["']/i);
  const canonical = canonicalMatch ? canonicalMatch[1].trim() : null;

  // Extract robots directive
  const robotsMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["'](.*?)["']/i);
  const robotsDirective = robotsMatch ? robotsMatch[1].trim() : null;

  // Extract Open Graph metadata
  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["'](.*?)["']/i);
  const ogTitle = ogTitleMatch ? ogTitleMatch[1].trim() : null;

  const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["'](.*?)["']/i);
  const ogDescription = ogDescMatch ? ogDescMatch[1].trim() : null;

  const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["'](.*?)["']/i);
  const ogImage = ogImageMatch ? ogImageMatch[1].trim() : null;

  // Extract H1
  const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
  const h1Text = h1Match ? h1Match[1].replace(/<[^>]*>/g, '').trim() : null;
  const hasH1 = !!h1Text;

  if (!hasH1) {
    titleIssues.push('Missing H1 tag');
  }

  // Calculate score (0-100)
  let score = 100;
  score -= titleIssues.length * 15;
  score -= descriptionIssues.length * 15;
  if (!canonical) score -= 10;
  if (!hasH1) score -= 10;
  if (!ogTitle) score -= 5;
  if (!ogDescription) score -= 5;
  if (!ogImage) score -= 5;
  score = Math.max(0, score);

  return {
    url,
    title,
    titleLength,
    titleIssues,
    description,
    descriptionLength,
    descriptionIssues,
    canonical,
    robotsDirective,
    ogTitle,
    ogDescription,
    ogImage,
    hasH1,
    h1Text,
    score,
  };
}

/**
 * Audit metadata across multiple pages
 */
export async function auditMetadata(urls: string[]): Promise<MetadataAuditReport> {
  const results: MetadataAuditResult[] = [];

  // Fetch and analyze each page
  for (const url of urls) {
    try {
      const response = await fetch(url);
      const html = await response.text();
      const metadata = extractMetadata(html, url);
      results.push(metadata);
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      results.push({
        url,
        title: null,
        titleLength: 0,
        titleIssues: ['Failed to fetch page'],
        description: null,
        descriptionLength: 0,
        descriptionIssues: ['Failed to fetch page'],
        canonical: null,
        robotsDirective: null,
        ogTitle: null,
        ogDescription: null,
        ogImage: null,
        hasH1: false,
        h1Text: null,
        score: 0,
      });
    }
  }

  // Find duplicates
  const titleMap = new Map<string, string[]>();
  const descriptionMap = new Map<string, string[]>();

  results.forEach((result) => {
    if (result.title) {
      const urls = titleMap.get(result.title) || [];
      urls.push(result.url);
      titleMap.set(result.title, urls);
    }
    if (result.description) {
      const urls = descriptionMap.get(result.description) || [];
      urls.push(result.url);
      descriptionMap.set(result.description, urls);
    }
  });

  const duplicateTitles = Array.from(titleMap.entries())
    .filter(([, urls]) => urls.length > 1)
    .map(([title, urls]) => ({ title, urls }));

  const duplicateDescriptions = Array.from(descriptionMap.entries())
    .filter(([, urls]) => urls.length > 1)
    .map(([description, urls]) => ({ description, urls }));

  const pagesWithIssues = results.filter(
    (r) => r.titleIssues.length > 0 || r.descriptionIssues.length > 0
  ).length;

  return {
    totalPages: results.length,
    pagesWithIssues,
    duplicateTitles,
    duplicateDescriptions,
    results,
  };
}

/**
 * Export metadata audit results to CSV
 */
export function exportToCSV(report: MetadataAuditReport): string {
  const headers = [
    'URL',
    'Title',
    'Title Length',
    'Title Issues',
    'Description',
    'Description Length',
    'Description Issues',
    'Canonical',
    'Robots',
    'Has H1',
    'H1 Text',
    'Score',
  ];

  const rows = report.results.map((result) => [
    result.url,
    result.title || '',
    result.titleLength.toString(),
    result.titleIssues.join('; '),
    result.description || '',
    result.descriptionLength.toString(),
    result.descriptionIssues.join('; '),
    result.canonical || '',
    result.robotsDirective || '',
    result.hasH1 ? 'Yes' : 'No',
    result.h1Text || '',
    result.score.toString(),
  ]);

  const csvLines = [headers, ...rows].map((row) =>
    row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')
  );

  return csvLines.join('\n');
}

/**
 * Get page URLs from sitemap
 */
export async function getUrlsFromSitemap(sitemapUrl: string): Promise<string[]> {
  try {
    const response = await fetch(sitemapUrl);
    const xml = await response.text();

    // Extract URLs from sitemap XML
    const urlMatches = xml.matchAll(/<loc>(.*?)<\/loc>/g);
    const urls: string[] = [];

    for (const match of urlMatches) {
      urls.push(match[1]);
    }

    return urls;
  } catch (error) {
    console.error('Error fetching sitemap:', error);
    return [];
  }
}
