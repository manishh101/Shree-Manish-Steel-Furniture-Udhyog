import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { log404Error } from '@/lib/seo/brokenLinkMonitor';

/**
 * POST - Log a 404 error
 * Body: { path: string, referrer?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, referrer } = body;

    if (!path) {
      return NextResponse.json(
        { success: false, message: 'Path is required' },
        { status: 400 }
      );
    }

    // Get user agent from headers
    const userAgent = request.headers.get('user-agent') || null;

    // Log the 404 error
    await log404Error(path, referrer || null, userAgent);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error logging 404:', error);
    // Return success anyway to not break client-side
    return NextResponse.json({ success: true });
  }
}
