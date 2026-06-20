'use client';

import { useState } from 'react';
import { FiCheckCircle, FiAlertTriangle, FiXCircle, FiRefreshCw, FiDownload } from 'react-icons/fi';

interface AuditResult {
  category: string;
  severity: 'critical' | 'warning' | 'info';
  count: number;
  message: string;
  items?: any[];
}

export default function SEOAuditDashboard() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<AuditResult[]>([]);
  const [lastRun, setLastRun] = useState<Date | null>(null);
  const [healthScore, setHealthScore] = useState<number | null>(null);

  const runAudit = async () => {
    setIsRunning(true);
    try {
      const response = await fetch('/api/admin/seo-audit', {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
        setHealthScore(data.healthScore || 0);
        setLastRun(new Date());
      }
    } catch (error) {
      console.error('Audit failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const downloadReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      healthScore,
      results,
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-audit-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <FiXCircle className="text-red-500 text-xl" />;
      case 'warning':
        return <FiAlertTriangle className="text-yellow-500 text-xl" />;
      default:
        return <FiCheckCircle className="text-green-500 text-xl" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-green-50 border-green-200';
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">SEO Audit Dashboard</h1>
        <p className="text-gray-600">
          Comprehensive SEO health check for metadata, content, URLs, and technical SEO
        </p>
      </div>

      {/* Health Score Card */}
      {healthScore !== null && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">SEO Health Score</h2>
              <div className={`text-5xl font-bold ${getHealthScoreColor(healthScore)}`}>
                {healthScore}/100
              </div>
              <div className="text-gray-600 mt-2">
                Status: {getHealthScoreLabel(healthScore)}
              </div>
            </div>
            <div className="text-right">
              {lastRun && (
                <div className="text-sm text-gray-500">
                  Last audit: {lastRun.toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={runAudit}
          disabled={isRunning}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <FiRefreshCw className={isRunning ? 'animate-spin' : ''} />
          {isRunning ? 'Running Audit...' : 'Run SEO Audit'}
        </button>

        {results.length > 0 && (
          <button
            onClick={downloadReport}
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <FiDownload />
            Download Report
          </button>
        )}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Audit Results</h2>

          {results.map((result, idx) => (
            <div
              key={idx}
              className={`border rounded-lg p-4 ${getSeverityColor(result.severity)}`}
            >
              <div className="flex items-start gap-3">
                {getSeverityIcon(result.severity)}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {result.category}
                    </h3>
                    {result.count > 0 && (
                      <span className="px-3 py-1 bg-white rounded-full text-sm font-medium">
                        {result.count} {result.count === 1 ? 'issue' : 'issues'}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700">{result.message}</p>

                  {result.items && result.items.length > 0 && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-900">
                        View details ({result.items.length} items)
                      </summary>
                      <div className="mt-2 space-y-2">
                        {result.items.slice(0, 10).map((item, itemIdx) => (
                          <div key={itemIdx} className="text-sm bg-white p-2 rounded">
                            <div className="font-medium">{item.name || item.title || 'Item'}</div>
                            {item.issue && (
                              <div className="text-gray-600">Issue: {item.issue}</div>
                            )}
                            {item.current && (
                              <div className="text-gray-600 truncate">
                                Current: {item.current}
                              </div>
                            )}
                          </div>
                        ))}
                        {result.items.length > 10 && (
                          <div className="text-sm text-gray-600">
                            ... and {result.items.length - 10} more
                          </div>
                        )}
                      </div>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isRunning && results.length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-gray-400 mb-4">
            <FiCheckCircle className="text-6xl mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Audit Data
          </h3>
          <p className="text-gray-600 mb-6">
            Run an SEO audit to check your website's health
          </p>
          <button
            onClick={runAudit}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Run First Audit
          </button>
        </div>
      )}

      {/* Quick Tips */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-3">SEO Best Practices</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Meta titles should be 50-60 characters</li>
          <li>• Meta descriptions should be 140-160 characters</li>
          <li>• All products should have unique, SEO-friendly slugs</li>
          <li>• Product descriptions should be at least 150 words</li>
          <li>• All images should have descriptive alt text</li>
          <li>• Avoid duplicate content across pages</li>
        </ul>
      </div>
    </div>
  );
}
