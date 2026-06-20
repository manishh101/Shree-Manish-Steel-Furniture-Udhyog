'use client';

/**
 * Analytics Tracker Component
 * Tracks page views and route changes in Next.js App Router
 * Requirements: 14.1
 */

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageView } from '@/lib/analytics';

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      // Construct full URL with search params
      const url = searchParams?.toString()
        ? `${pathname}?${searchParams.toString()}`
        : pathname;

      // Track page view
      trackPageView(url);
    }
  }, [pathname, searchParams]);

  // This component doesn't render anything
  return null;
}
