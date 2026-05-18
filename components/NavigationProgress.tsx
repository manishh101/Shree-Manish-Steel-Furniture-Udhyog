'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * A thin animated progress bar at the top of the page that shows during
 * Next.js route transitions — similar to NProgress but zero-dependency.
 */
export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Start the progress bar when a navigation begins (click intercept)
  const startProgress = useCallback(() => {
    setIsVisible(true);
    setProgress(15);

    // Simulate incremental progress
    let current = 15;
    const interval = setInterval(() => {
      current += Math.random() * 10;
      if (current >= 90) {
        current = 90; // Cap at 90% until the page actually loads
        clearInterval(interval);
      }
      setProgress(current);
    }, 200);

    return () => clearInterval(interval);
  }, []);

  // Complete the progress bar when the route finishes loading
  const completeProgress = useCallback(() => {
    setProgress(100);
    setTimeout(() => {
      setIsVisible(false);
      setProgress(0);
    }, 200);
  }, []);

  // Listen for click events on links to start progress immediately
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Only trigger for internal navigation links (not external, hash-only, etc.)
      if (
        href.startsWith('/') &&
        !href.startsWith('//') &&
        href !== pathname &&
        !anchor.getAttribute('target') &&
        !anchor.getAttribute('download')
      ) {
        cleanup = startProgress();
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
      cleanup?.();
    };
  }, [pathname, startProgress]);

  // When pathname or searchParams change, the new route has loaded — complete the bar
  useEffect(() => {
    completeProgress();
  }, [pathname, searchParams, completeProgress]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        height: '3px',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #0057A3 0%, #0088ff 50%, #00b4ff 100%)',
          transition: progress === 100 ? 'width 0.15s ease-out' : 'width 0.3s ease',
          boxShadow: '0 0 8px rgba(0, 87, 163, 0.5)',
          borderRadius: '0 2px 2px 0',
        }}
      />
    </div>
  );
}
