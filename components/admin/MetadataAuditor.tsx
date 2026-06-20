/**
 * Metadata Auditor Component
 * Admin tool for auditing SEO metadata across all pages
 */
'use client';

import React, { useState } from 'react';

interface MetadataResult {
  url: string;
  title: string | null;
  titleLength: number;
  titleIssues: string[];
  description: string | null;
  descriptionLength: number;
  descriptionIssues: string[];
  canonical: string | null;
  hasH1: boolean;
  h1Text: string | null;
  score: number;
}

interface MetadataReport {
  totalPages: number;
  pagesWithIssues: number;
  duplicateTitles: Array<{ title: string; urls: string[] }>;
  duplicateDescriptions: Array<{ description: string; urls: string[] }>;
  results: MetadataResult[];
}

const MetadataAuditor: React.FC = () => {
  const [auditing, setAuditing] = useState(false);
  const [report, setReport] = useState<MetadataReport | null>(null);
  const [useSitemap, setUseSitemap] = useState(true);
  const [selectedPages, setSelectedPages] = useState<string[]>([]);

  const predefinedPages = [
    'https://manishsteel.com.np',
    'https://manishsteel.com.np/about',
    'https://manishsteel.com.np/products',
    'https://manishsteel.com.np/contact',
    'https://manishsteel.com.np/blog',
    'https://manishsteel.com.np/gallery',
  ];

  const runAudit = async () => {
    setAuditing(true);
    setReport(null);

    try {
      const params = new URLSearchParams();
      
      if (useSitemap) {
        params.set('useSitemap', 'true');
        params.set('sitemapUrl', 'https://manishsteel.com.np/sitemap.xml');
      } else {
        if (selectedPages.length === 0) {
          alert('Please select at least one page to audit');
          setAuditing(false);
          return;
        }
        params.set('urls', selectedPages.join(','));
      }

      const response = await fetch(`/api/admin/audit-metadata?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setReport(data.report);
      } else {
        alert('Failed to audit metadata: ' + data.message);
      }
    } catch (error) {
      console.error('Error auditing metadata:', error);
      alert('Error auditing metadata');
    } finally {
      setAuditing(false);
    }
  };

  const downloadCSV = async () => {
    try {
      const params = new URLSearchParams();
      params.set('format', 'csv');
      
      if (useSitemap) {
        params.set('useSitemap', 'true');
      } else {
        params.set('urls', selectedPages.join(','));
      }

      const response = await fetch(`/api/admin/audit-metadata?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'metadata-audit.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading CSV:', error);
      alert('Error downloading CSV');
    }
  };

  const togglePage = (url: string) => {
    setSelectedPages(prev =>
      prev.includes(url)
        ? prev.filter(p => p !== url)
        : [...prev, url]
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Metadata Auditor</h2>
        <div className="flex gap-2">
          <button
            onClick={runAudit}
            disabled={auditing}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {auditing ? 'Auditing...' : 'Run Audit'}
          </button>
          {report && (
            <button
              onClick={downloadCSV}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Audit Options */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Audit Options</h3>
        
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={useSitemap}
              onChange={(e) => setUseSitemap(e.target.checked)}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-gray-700">
              Use sitemap (audit all pages from sitemap.xml)
            </span>
          </label>

          {!useSitemap && (
            <div>
              <p className="text-sm text-gray-600 mb-3">Select pages to audit:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {predefinedPages.map((url) => (
                  <label
                    key={url}
                    className="flex items-center space-x-2 p-2 border border-gray-200 rounded hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPages.includes(url)}
                      onChange={() => togglePage(url)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700 truncate">{url}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Statistics */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Total Pages</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{report.totalPages}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Pages with Issues</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">{report.pagesWithIssues}</p>
          </div>
        </div>
      )}

      {/* Duplicate Issues */}
      {report && (report.duplicateTitles.length > 0 || report.duplicateDescriptions.length > 0) && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-yellow-50 px-6 py-4 border-b border-yellow-200">
            <h3 className="text-lg font-semibold text-yellow-900">Duplicate Metadata Found</h3>
          </div>
          <div className="p-6 space-y-6">
            {report.duplicateTitles.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Duplicate Titles ({report.duplicateTitles.length})
                </h4>
                {report.duplicateTitles.map((dup, index) => (
                  <div key={index} className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="font-medium text-gray-900 mb-2">&quot;{dup.title}&quot;</p>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {dup.urls.map((url, i) => (
                        <li key={i}>{url}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {report.duplicateDescriptions.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">
                  Duplicate Descriptions ({report.duplicateDescriptions.length})
                </h4>
                {report.duplicateDescriptions.map((dup, index) => (
                  <div key={index} className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="font-medium text-gray-900 mb-2">&quot;{dup.description}&quot;</p>
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                      {dup.urls.map((url, i) => (
                        <li key={i}>{url}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detailed Results */}
      {report && report.results.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Page-by-Page Analysis</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Issues
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Score
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {report.results.map((result, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {result.url}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{result.title || '-'}</div>
                      <div className={`text-xs ${
                        result.titleLength >= 50 && result.titleLength <= 60
                          ? 'text-green-600'
                          : 'text-gray-500'
                      }`}>
                        {result.titleLength} chars
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-md truncate">
                        {result.description || '-'}
                      </div>
                      <div className={`text-xs ${
                        result.descriptionLength >= 140 && result.descriptionLength <= 160
                          ? 'text-green-600'
                          : 'text-gray-500'
                      }`}>
                        {result.descriptionLength} chars
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm space-y-1">
                        {result.titleIssues.map((issue, i) => (
                          <div key={i} className="text-red-600">{issue}</div>
                        ))}
                        {result.descriptionIssues.map((issue, i) => (
                          <div key={i} className="text-orange-600">{issue}</div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(result.score)} ${getScoreColor(result.score)}`}>
                        {result.score}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetadataAuditor;
