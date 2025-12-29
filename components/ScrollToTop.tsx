'use client';

import { useEffect, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { ScrollHandlers } from '../utils/scrollUtils';

/**
 * ScrollToTop - Automatically scrolls to top on route changes
 * 
 * Features:
 * - Uses enhanced scroll utilities for consistent behavior
 * - Device-aware scroll optimization
 * - Accessibility support
 * - Proper handling of all page navigation
 */
const ScrollToTopInner: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPathname = useRef(pathname);

  useEffect(() => {
    // Force scroll to top for any pathname change
    if (lastPathname.current !== pathname) {
      console.log(`ScrollToTop: Navigating from ${lastPathname.current} to ${pathname}`);

      // Force immediate scroll to top before any animations
      window.scrollTo(0, 0);

      // Use the enhanced scroll handler as backup
      if (typeof ScrollHandlers !== 'undefined' && ScrollHandlers.onNavigation) {
        ScrollHandlers.onNavigation();
      }

      // Update last pathname
      lastPathname.current = pathname;

      // Focus on main content for accessibility after scroll
      setTimeout(() => {
        const mainContent =
          document.getElementById('main-content') ||
          document.querySelector('main') ||
          document.querySelector('[role="main"]');
        if (mainContent) {
          (mainContent as HTMLElement).focus({ preventScroll: true });
        }
      }, 100);
    }
  }, [pathname, searchParams]);

  return null; // This component doesn't render anything
};

// Wrap with Suspense to fix SSR build error
const ScrollToTop: React.FC = () => {
  return (
    <Suspense fallback={null}>
      <ScrollToTopInner />
    </Suspense>
  );
};

export default ScrollToTop;
