'use client';

/**
 * Performance Monitoring Dashboard Component
 * Displays Core Web Vitals and performance budget status
 * Requirements: 10.1, 14.4
 */

import { useEffect, useState } from 'react';
import { getPerformanceSummary, getStoredMetrics, clearStoredMetrics } from '@/lib/performance/webVitals';
import { PERFORMANCE_BUDGETS, getBudgetStatus, formatMetricValue, getPerformanceBudgetSummary } from '@/lib/performance/performanceBudget';

interface MetricDisplay {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  average?: number;
  count?: number;
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<MetricDisplay[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadMetrics = () => {
    const performanceSummary = getPerformanceSummary();
    if (performanceSummary) {
      setSummary(performanceSummary);
      
      const metricsArray: MetricDisplay[] = Object.entries(performanceSummary).map(([name, data]: any) => ({
        name,
        value: data.latest,
        rating: data.rating,
        average: data.average,
        count: data.count,
      }));
      
      setMetrics(metricsArray);
      setLastUpdated(new Date());
    }
  };

  useEffect(() => {
    // Load metrics on mount
    loadMetrics();

    // Refresh every 10 seconds
    const interval = setInterval(loadMetrics, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleClearMetrics = () => {
    clearStoredMetrics();
    setMetrics([]);
    setSummary(null);
    setLastUpdated(null);
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'needs-improvement':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRatingEmoji = (rating: string) => {
    switch (rating) {
      case 'good':
        return '✅';
      case 'needs-improvement':
        return '⚠️';
      case 'poor':
        return '❌';
      default:
        return '❔';
    }
  };

  const getMetricDescription = (name: string) => {
    const descriptions: Record<string, string> = {
      LCP: 'Largest Contentful Paint - Time for main content to load',
      FID: 'First Input Delay - Time from first interaction to response',
      CLS: 'Cumulative Layout Shift - Visual stability during load',
      FCP: 'First Contentful Paint - Time for first content to appear',
      TTFB: 'Time to First Byte - Server response time',
      INP: 'Interaction to Next Paint - Responsiveness to user input',
    };
    return descriptions[name] || name;
  };

  const formatValue = (name: string, value: number) => {
    if (name === 'CLS') {
      return value.toFixed(3);
    }
    return `${Math.round(value)}ms`;
  };

  if (metrics.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Performance Monitor</h2>
        <div className="text-center py-8 text-gray-500">
          <p className="mb-2">No performance data available yet.</p>
          <p className="text-sm">Browse the website to collect Core Web Vitals metrics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Performance Monitor</h2>
          {lastUpdated && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          onClick={handleClearMetrics}
          className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded transition"
        >
          Clear Data
        </button>
      </div>

      {/* Core Web Vitals */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Core Web Vitals</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['LCP', 'FID', 'CLS', 'INP'].map(metricName => {
            const metric = metrics.find(m => m.name === metricName);
            if (!metric) return null;

            return (
              <div
                key={metricName}
                className={`border-2 rounded-lg p-4 ${getRatingColor(metric.rating)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{metricName}</h4>
                  <span className="text-2xl">{getRatingEmoji(metric.rating)}</span>
                </div>
                <div className="text-3xl font-bold mb-1">
                  {formatValue(metricName, metric.value)}
                </div>
                <div className="text-xs opacity-75 mb-2">
                  {getMetricDescription(metricName)}
                </div>
                {metric.average && metric.count && metric.count > 1 && (
                  <div className="text-sm mt-2 pt-2 border-t border-current opacity-50">
                    Avg: {formatValue(metricName, metric.average)} ({metric.count} samples)
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Other Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Other Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['FCP', 'TTFB'].map(metricName => {
            const metric = metrics.find(m => m.name === metricName);
            if (!metric) return null;

            return (
              <div
                key={metricName}
                className={`border rounded-lg p-4 ${getRatingColor(metric.rating)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{metricName}</h4>
                  <span className="text-xl">{getRatingEmoji(metric.rating)}</span>
                </div>
                <div className="text-2xl font-bold mb-1">
                  {formatValue(metricName, metric.value)}
                </div>
                <div className="text-xs opacity-75">
                  {getMetricDescription(metricName)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance Budget Info */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">📊 Performance Budget Targets</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• LCP: &lt; 2.5 seconds (Good)</li>
          <li>• FID: &lt; 100ms (Good)</li>
          <li>• CLS: &lt; 0.1 (Good)</li>
          <li>• INP: &lt; 200ms (Good)</li>
          <li>• FCP: &lt; 1.8 seconds (Good)</li>
          <li>• TTFB: &lt; 800ms (Good)</li>
        </ul>
      </div>

      {/* Search Console Link */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">📈 Additional Monitoring</h4>
        <p className="text-sm text-gray-600 mb-3">
          For field data and real-user metrics, check Google Search Console:
        </p>
        <a
          href="https://search.google.com/search-console"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
        >
          Open Search Console →
        </a>
      </div>
    </div>
  );
}
