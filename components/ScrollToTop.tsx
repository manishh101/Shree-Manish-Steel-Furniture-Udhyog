'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * ScrollToTop - Instantly scrolls to top on every route change.
 * Prevents the visible scroll-crawl effect caused by smooth scrolling.
 */
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
