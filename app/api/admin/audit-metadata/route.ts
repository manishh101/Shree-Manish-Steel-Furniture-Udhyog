import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { auditMetadata, getUrlsFromSitemap, exportToCSV } from '@/lib/seo/metadataAuditor';

/**
 * GET - Audit metadata across pages
 * Query params:
 * - urls: comma-separated list of URLs
 * - useSitemap: boolean - fetch URLs from sitemap
 * - sitemapUrl: URL of sitemap
 * - format: 'json' | 'csv'
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAuth(request);
    if (!authResult.valid || authResult.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const urlsParam = searchParams.get('urls');
    const useSitemap = searchParams.get('useSitemap') === 'true';
    const sitemapUrl = searchParams.get('sitemapUrl') || 'https://manishsteel.com.np/sitemap.xml';
    const format = searchParams.get('format') || 'json';

    let urls: string[] = [];

    if (useSitemap) {
      // Fetch URLs from sitemap
      urls = await getUrlsFromSitemap(sitemapUrl);
      if (urls.length === 0) {
        return NextResponse.json(
          { success: false, message: 'No URLs found in sitemap' },
          { status: 400 }
        );
      }
    } else if (urlsParam) {
      urls = urlsParam.split(',').map(url => url.trim());
    } else {
      return NextResponse.json(
        { success: false, message: 'URLs or sitemap URL is required' },
        { status: 400 }
      );
    }

    // Audit metadata
    const report = await auditMetadata(urls);

    // Return in requested format
    if (format === 'csv') {
      const csv = exportToCSV(report);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="metadata-audit.csv"',
        },
      });
    }

    return NextResponse.json({ success: true, report });
  } catch (error) {
    logger.error('Error auditing metadata:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
