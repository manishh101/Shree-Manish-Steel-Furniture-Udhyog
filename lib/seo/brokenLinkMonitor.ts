/**
 * Broken Link Monitoring Utility
 * Tracks and reports broken links (404 errors) for SEO maintenance
 */

import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';

// Schema for tracking 404 errors
const brokenLinkSchema = new mongoose.Schema({
  path: { type: String, required: true, index: true },
  referrer: { type: String, default: null },
  userAgent: { type: String, default: null },
  firstSeen: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now },
  hitCount: { type: Number, default: 1 },
  resolved: { type: Boolean, default: false },
  resolvedAt: { type: Date, default: null },
  redirectTo: { type: String, default: null },
});

// Create or get the BrokenLink model
const BrokenLink = mongoose.models.BrokenLink || mongoose.model('BrokenLink', brokenLinkSchema);

export interface BrokenLinkRecord {
  _id: string;
  path: string;
  referrer: string | null;
  userAgent: string | null;
  firstSeen: Date;
  lastSeen: Date;
  hitCount: number;
  resolved: boolean;
  resolvedAt: Date | null;
  redirectTo: string | null;
}

/**
 * Log a 404 error
 */
export async function log404Error(
  path: string,
  referrer?: string | null,
  userAgent?: string | null
): Promise<void> {
  try {
    await connectDB();

    // Check if this path already exists
    const existing = await BrokenLink.findOne({ path, resolved: false });

    if (existing) {
      // Update existing record
      existing.lastSeen = new Date();
      existing.hitCount += 1;
      if (referrer) existing.referrer = referrer;
      if (userAgent) existing.userAgent = userAgent;
      await existing.save();
    } else {
      // Create new record
      await BrokenLink.create({
        path,
        referrer: referrer || null,
        userAgent: userAgent || null,
        firstSeen: new Date(),
        lastSeen: new Date(),
        hitCount: 1,
        resolved: false,
      });
    }
  } catch (error) {
    // Don't throw errors from logging to avoid breaking the app
    console.error('Error logging 404:', error);
  }
}

/**
 * Get all broken links
 */
export async function getBrokenLinks(options: {
  resolved?: boolean;
  limit?: number;
  sortBy?: 'hitCount' | 'lastSeen' | 'firstSeen';
  sortOrder?: 'asc' | 'desc';
} = {}): Promise<BrokenLinkRecord[]> {
  try {
    await connectDB();

    const {
      resolved = false,
      limit = 100,
      sortBy = 'hitCount',
      sortOrder = 'desc',
    } = options;

    const query = resolved !== null ? { resolved } : {};
    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const links = await BrokenLink.find(query)
      .sort(sort)
      .limit(limit)
      .lean();

    return JSON.parse(JSON.stringify(links));
  } catch (error) {
    console.error('Error fetching broken links:', error);
    return [];
  }
}

/**
 * Mark a broken link as resolved
 */
export async function markAsResolved(
  path: string,
  redirectTo?: string
): Promise<boolean> {
  try {
    await connectDB();

    const result = await BrokenLink.updateOne(
      { path, resolved: false },
      {
        $set: {
          resolved: true,
          resolvedAt: new Date(),
          ...(redirectTo ? { redirectTo } : {}),
        },
      }
    );

    return result.modifiedCount > 0;
  } catch (error) {
    console.error('Error marking broken link as resolved:', error);
    return false;
  }
}

/**
 * Get broken link statistics
 */
export async function getBrokenLinkStats(): Promise<{
  total: number;
  resolved: number;
  unresolved: number;
  topBrokenLinks: Array<{ path: string; hitCount: number }>;
}> {
  try {
    await connectDB();

    const [total, resolved, topBrokenLinks] = await Promise.all([
      BrokenLink.countDocuments({}),
      BrokenLink.countDocuments({ resolved: true }),
      BrokenLink.find({ resolved: false })
        .sort({ hitCount: -1 })
        .limit(10)
        .select('path hitCount')
        .lean(),
    ]);

    return {
      total,
      resolved,
      unresolved: total - resolved,
      topBrokenLinks: JSON.parse(JSON.stringify(topBrokenLinks)),
    };
  } catch (error) {
    console.error('Error getting broken link stats:', error);
    return {
      total: 0,
      resolved: 0,
      unresolved: 0,
      topBrokenLinks: [],
    };
  }
}

/**
 * Delete old resolved broken links
 */
export async function cleanupOldResolvedLinks(daysOld = 90): Promise<number> {
  try {
    await connectDB();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await BrokenLink.deleteMany({
      resolved: true,
      resolvedAt: { $lt: cutoffDate },
    });

    return result.deletedCount || 0;
  } catch (error) {
    console.error('Error cleaning up old broken links:', error);
    return 0;
  }
}

/**
 * Internal link crawler utility
 * Crawls internal links and checks for broken links
 */
export async function crawlInternalLinks(
  baseUrl: string,
  maxPages = 100
): Promise<{
  totalLinks: number;
  brokenLinks: Array<{ url: string; statusCode: number; referrer: string }>;
  validLinks: number;
}> {
  const visited = new Set<string>();
  const toVisit: Array<{ url: string; referrer: string }> = [{ url: baseUrl, referrer: '' }];
  const brokenLinks: Array<{ url: string; statusCode: number; referrer: string }> = [];
  let validLinks = 0;

  while (toVisit.length > 0 && visited.size < maxPages) {
    const { url, referrer } = toVisit.shift()!;
    
    if (visited.has(url)) continue;
    visited.add(url);

    try {
      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'SEO-Link-Crawler/1.0',
        },
      });

      if (response.status === 404) {
        brokenLinks.push({
          url,
          statusCode: response.status,
          referrer,
        });
      } else if (response.ok) {
        validLinks++;
        
        // Only crawl HTML pages
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('text/html')) {
          // Fetch the page content to extract links
          const htmlResponse = await fetch(url);
          const html = await htmlResponse.text();
          
          // Simple regex to extract links (in production, use a proper HTML parser)
          const linkRegex = /href=["']([^"']+)["']/g;
          let match;
          
          while ((match = linkRegex.exec(html)) !== null) {
            const link = match[1];
            
            // Only follow internal links
            if (link.startsWith('/') || link.startsWith(baseUrl)) {
              const fullUrl = link.startsWith('/')
                ? `${baseUrl}${link}`
                : link;
              
              // Don't crawl API routes, admin, or external links
              if (
                !fullUrl.includes('/api/') &&
                !fullUrl.includes('/admin/') &&
                !visited.has(fullUrl)
              ) {
                toVisit.push({ url: fullUrl, referrer: url });
              }
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error crawling ${url}:`, error);
    }
  }

  return {
    totalLinks: visited.size,
    brokenLinks,
    validLinks,
  };
}
