'use client';

/**
 * SEO Monitoring Dashboard Component
 * Displays comprehensive SEO metrics including Search Console data,
 * Core Web Vitals, and keyword rankings
 * Requirements: 14.1, 14.2, 14.4
 */

import React, { useState, useEffect } from 'react';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  DocumentCheckIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';

interface SEOMetrics {
  summary: {
    totalClicks: number;
    totalImpressions: number;
    averageCTR: string;
    averagePosition: string;
    trends: {
      clicks: number;
      impressions: number;
      position: number;
    };
  };
  dailyData: Array<{
    date: string;
    clicks: number;
    impressions: number;
    ctr: string;
    position: string;
  }>;
  topKeywords: Array<{
    keyword: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  topPages: Array<{
    url: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  indexCoverage: {
    valid: number;
    validWithWarnings: number;
    error: number;
    excluded: number;
    total: number;
  };
  coreWebVitals: {
    mobile: {
      good: number;
      needsImprovement: number;
      poor: number;
      lcp: number;
      fid: number;
      cls: number;
    };
    desktop: {
      good: number;
      needsImprovement: number;
      poor: number;
      lcp: number;
      fid: number;
      cls: number;
    };
  };
  lastUpdated: string;
}

export default function SEOMonitoringDashboard() {
  const [metrics, setMetrics] = useState<SEOMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30'); // days

  useEffect(() => {
    fetchMetrics();
  }, [dateRange]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/seo-metrics?days=${dateRange}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch SEO metrics');
      }
      
      const data = await response.json();
      setMetrics(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching SEO metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  const renderTrend = (value: number, inverse: boolean = false) => {
    const isPositive = inverse ? value < 0 : value > 0;
    const Icon = isPositive ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
    
    return (
      <div className={`flex items-center gap-1 text-sm ${colorClass}`}>
        <Icon className="h-4 w-4" />
        <span>{Math.abs(value).toFixed(1)}%</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading SEO metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">Error Loading Metrics</h3>
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchMetrics}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">SEO Monitoring Dashboard</h2>
          <p className="text-sm text-gray-600 mt-1">
            Last updated: {new Date(metrics.lastUpdated).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <button
            onClick={fetchMetrics}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Clicks</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics.summary.totalClicks)}</p>
            </div>
            <MagnifyingGlassIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div className="mt-2">{renderTrend(metrics.summary.trends.clicks)}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Impressions</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(metrics.summary.totalImpressions)}</p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-purple-600" />
          </div>
          <div className="mt-2">{renderTrend(metrics.summary.trends.impressions)}</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600 mb-1">Average CTR</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.summary.averageCTR}%</p>
            </div>
            <BoltIcon className="h-8 w-8 text-yellow-600" />
          </div>
          <p className="text-sm text-gray-500 mt-2">Click-through rate</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-600 mb-1">Average Position</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.summary.averagePosition}</p>
            </div>
            <DocumentCheckIcon className="h-8 w-8 text-green-600" />
          </div>
          <div className="mt-2">{renderTrend(metrics.summary.trends.position, true)}</div>
        </div>
      </div>

      {/* Top Keywords */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Top Performing Keywords</h3>
          <p className="text-sm text-gray-600 mt-1">Keywords driving the most traffic</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keyword</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Clicks</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Impressions</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">CTR</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Position</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {metrics.topKeywords.map((keyword, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{keyword.keyword}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">{formatNumber(keyword.clicks)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-right">{formatNumber(keyword.impressions)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-right">{keyword.ctr.toFixed(1)}%</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-right">{keyword.position.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Pages */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Top Landing Pages</h3>
          <p className="text-sm text-gray-600 mt-1">Pages receiving the most organic traffic</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Page</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Clicks</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Impressions</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">CTR</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Position</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {metrics.topPages.map((page, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900 font-mono">{page.url}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">{formatNumber(page.clicks)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-right">{formatNumber(page.impressions)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-right">{page.ctr.toFixed(1)}%</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-right">{page.position.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Index Coverage & Core Web Vitals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Index Coverage */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Index Coverage</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Valid</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${(metrics.indexCoverage.valid / metrics.indexCoverage.total) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                  {metrics.indexCoverage.valid}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Valid with Warnings</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-600 h-2 rounded-full"
                    style={{ width: `${(metrics.indexCoverage.validWithWarnings / metrics.indexCoverage.total) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                  {metrics.indexCoverage.validWithWarnings}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Error</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full"
                    style={{ width: `${(metrics.indexCoverage.error / metrics.indexCoverage.total) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                  {metrics.indexCoverage.error}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Excluded</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gray-400 h-2 rounded-full"
                    style={{ width: `${(metrics.indexCoverage.excluded / metrics.indexCoverage.total) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-gray-900 w-12 text-right">
                  {metrics.indexCoverage.excluded}
                </span>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-900">Total Pages</span>
                <span className="text-lg font-bold text-gray-900">{metrics.indexCoverage.total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Core Web Vitals */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Core Web Vitals</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Mobile</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{metrics.coreWebVitals.mobile.good}%</div>
                  <div className="text-xs text-gray-600">Good</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{metrics.coreWebVitals.mobile.needsImprovement}%</div>
                  <div className="text-xs text-gray-600">Needs Work</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{metrics.coreWebVitals.mobile.poor}%</div>
                  <div className="text-xs text-gray-600">Poor</div>
                </div>
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">LCP:</span>
                  <span className={`font-semibold ${metrics.coreWebVitals.mobile.lcp <= 2.5 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {metrics.coreWebVitals.mobile.lcp}s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">FID:</span>
                  <span className={`font-semibold ${metrics.coreWebVitals.mobile.fid <= 100 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {metrics.coreWebVitals.mobile.fid}ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">CLS:</span>
                  <span className={`font-semibold ${metrics.coreWebVitals.mobile.cls <= 0.1 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {metrics.coreWebVitals.mobile.cls}
                  </span>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Desktop</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{metrics.coreWebVitals.desktop.good}%</div>
                  <div className="text-xs text-gray-600">Good</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{metrics.coreWebVitals.desktop.needsImprovement}%</div>
                  <div className="text-xs text-gray-600">Needs Work</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{metrics.coreWebVitals.desktop.poor}%</div>
                  <div className="text-xs text-gray-600">Poor</div>
                </div>
              </div>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">LCP:</span>
                  <span className={`font-semibold ${metrics.coreWebVitals.desktop.lcp <= 2.5 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {metrics.coreWebVitals.desktop.lcp}s
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">FID:</span>
                  <span className={`font-semibold ${metrics.coreWebVitals.desktop.fid <= 100 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {metrics.coreWebVitals.desktop.fid}ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">CLS:</span>
                  <span className={`font-semibold ${metrics.coreWebVitals.desktop.cls <= 0.1 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {metrics.coreWebVitals.desktop.cls}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Note about data source */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> This dashboard currently displays simulated data for demonstration. 
          To see real Search Console data, configure Google Search Console API credentials in your environment settings.
          See <code className="bg-blue-100 px-1 rounded">docs/GOOGLE_SEARCH_CONSOLE_SETUP.md</code> for setup instructions.
        </p>
      </div>
    </div>
  );
}
