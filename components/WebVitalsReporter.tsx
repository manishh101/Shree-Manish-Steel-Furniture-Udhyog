'use client';

/**
 * Web Vitals Reporter Component
 * Tracks and reports Core Web Vitals using the web-vitals library
 * Requirements: 10.1, 14.4
 */

import { useEffect } from 'react';
import { reportWebVitals } from '@/lib/performance/webVitals';

export default function WebVitalsReporter() {
  useEffect(() => {
    // Dynamically import web-vitals to avoid blocking initial load
    if (typeof window !== 'undefined') {
      import('web-vitals').then(({ onCLS, onFCP, onFID, onLCP, onTTFB, onINP }) => {
        onCLS(reportWebVitals);
        onFCP(reportWebVitals);
        onFID(reportWebVitals);
        onLCP(reportWebVitals);
        onTTFB(reportWebVitals);
        onINP(reportWebVitals);
      }).catch(error => {
        console.error('Failed to load web-vitals:', error);
      });
    }
  }, []);

  // This component doesn't render anything
  return null;
}
