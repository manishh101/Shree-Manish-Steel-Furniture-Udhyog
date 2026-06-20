'use client';

/**
 * Admin SEO Monitoring Page
 * Full-page view of SEO metrics and performance data
 * Requirements: 14.1, 14.2, 14.4
 */

import React from 'react';
import SEOMonitoringDashboard from '@/components/admin/SEOMonitoringDashboard';

export default function AdminSEOPage() {
  return (
    <div className="w-full">
      <SEOMonitoringDashboard />
    </div>
  );
}
