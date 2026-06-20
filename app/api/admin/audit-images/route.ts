import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import {
  auditImagesAcrossPages,
  generateImageSitemap,
  exportImageAuditToCSV,
} from '@/lib/seo/imageAuditor';
import { getUrlsFromSitemap } from '@/lib/seo/metadataAuditor';

/**
 * GET - Audit images across pages
 * Query params:
 * - urls: comma-separated list of URLs
 * - useSitemap: boolean
 * - format: 'json' | 'csv' | 'sitemap'
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
    const format = searchParams.get('format') || 'json';

    let urls: string[] = [];

    if (useSitemap) {
      urls = await getUrlsFromSitemap('https://manishsteel.com.np/sitemap.xml');
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
        { success: false, message: 'URLs or sitemap required' },
        { status: 400 }
      );
    }

    // Audit images
    const reports = await auditImagesAcrossPages(urls);

    // Return in requested format
    if (format === 'csv') {
      const csv = exportImageAuditToCSV(reports);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="image-audit.csv"',
        },
      });
    }

    if (format === 'sitemap') {
      const sitemap = generateImageSitemap(reports);
      return new NextResponse(sitemap, {
        headers: {
          'Content-Type': 'application/xml',
          'Content-Disposition': 'attachment; filename="image-sitemap.xml"',
        },
      });
    }

    return NextResponse.json({ success: true, reports });
  } catch (error) {
    logger.error('Error auditing images:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
