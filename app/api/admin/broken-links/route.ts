import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import {
  getBrokenLinks,
  getBrokenLinkStats,
  markAsResolved,
  cleanupOldResolvedLinks,
  crawlInternalLinks,
} from '@/lib/seo/brokenLinkMonitor';

/**
 * GET - Fetch broken links report
 * Query params:
 * - action: 'list' | 'stats' | 'crawl'
 * - resolved: boolean (for list action)
 * - limit: number (for list action)
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
    const action = searchParams.get('action') || 'list';
    
    if (action === 'stats') {
      const stats = await getBrokenLinkStats();
      return NextResponse.json({ success: true, stats });
    }
    
    if (action === 'crawl') {
      const baseUrl = searchParams.get('baseUrl') || 'https://manishsteel.com.np';
      const maxPages = parseInt(searchParams.get('maxPages') || '50', 10);
      
      const results = await crawlInternalLinks(baseUrl, maxPages);
      return NextResponse.json({ success: true, results });
    }
    
    // Default: list broken links
    const resolved = searchParams.get('resolved') === 'true';
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const sortBy = (searchParams.get('sortBy') as 'hitCount' | 'lastSeen' | 'firstSeen') || 'hitCount';
    
    const links = await getBrokenLinks({ resolved, limit, sortBy });
    return NextResponse.json({ success: true, links });
  } catch (error) {
    logger.error('Error in broken links API:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST - Mark broken link as resolved
 * Body: { path: string, redirectTo?: string }
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
    const { path, redirectTo } = body;

    if (!path) {
      return NextResponse.json(
        { success: false, message: 'Path is required' },
        { status: 400 }
      );
    }

    const success = await markAsResolved(path, redirectTo);
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Broken link marked as resolved' 
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Broken link not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    logger.error('Error marking broken link as resolved:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Cleanup old resolved links
 * Query params:
 * - daysOld: number (default: 90)
 */
export async function DELETE(request: NextRequest) {
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
    const daysOld = parseInt(searchParams.get('daysOld') || '90', 10);

    const deletedCount = await cleanupOldResolvedLinks(daysOld);
    
    return NextResponse.json({ 
      success: true, 
      message: `Deleted ${deletedCount} old resolved links`,
      deletedCount 
    });
  } catch (error) {
    logger.error('Error cleaning up broken links:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
