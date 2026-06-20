import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { validatePageSchemas, testWithGoogleRichResults } from '@/lib/seo/schemaValidator';

/**
 * GET - Validate schemas on specified pages
 * Query params:
 * - urls: comma-separated list of URLs to validate
 * - action: 'validate' | 'google-test'
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
    const action = searchParams.get('action') || 'validate';
    const urlsParam = searchParams.get('urls');

    if (!urlsParam) {
      return NextResponse.json(
        { success: false, message: 'URLs parameter is required' },
        { status: 400 }
      );
    }

    const urls = urlsParam.split(',').map(url => url.trim());

    if (action === 'google-test') {
      // Test with Google Rich Results (simplified version)
      const results = await Promise.all(
        urls.map(url => testWithGoogleRichResults(url))
      );
      return NextResponse.json({ success: true, results });
    }

    // Default: Local validation
    const validationResults = await Promise.all(
      urls.map(async (url) => {
        try {
          const response = await fetch(url);
          const html = await response.text();
          return validatePageSchemas(html, url);
        } catch (error) {
          return {
            totalSchemas: 0,
            validSchemas: 0,
            invalidSchemas: 0,
            results: [{
              url,
              schemaType: 'Unknown',
              valid: false,
              errors: [`Failed to fetch page: ${error instanceof Error ? error.message : 'Unknown error'}`],
              warnings: [],
            }],
          };
        }
      })
    );

    return NextResponse.json({ success: true, validationResults });
  } catch (error) {
    logger.error('Error validating schemas:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST - Validate schemas from HTML content
 * Body: { html: string, url: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await verifyAuth(request);
    if (!authResult.valid || authResult.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { html, url } = body;

    if (!html) {
      return NextResponse.json(
        { success: false, message: 'HTML content is required' },
        { status: 400 }
      );
    }

    const validation = validatePageSchemas(html, url || 'Provided HTML');

    return NextResponse.json({ success: true, validation });
  } catch (error) {
    logger.error('Error validating schemas:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
