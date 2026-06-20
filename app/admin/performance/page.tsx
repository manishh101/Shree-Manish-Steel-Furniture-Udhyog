'use client';

/**
 * Admin Performance Monitoring Page
 * Displays Core Web Vitals and performance metrics
 * Requirements: 10.1, 14.4
 */

import PerformanceMonitor from '@/components/admin/PerformanceMonitor';

export default function PerformancePage() {
  return (
    <div className="w-full">
      <div className="container mx-auto p-4 sm:p-6">
        <PerformanceMonitor />
      </div>
    </div>
  );
}
