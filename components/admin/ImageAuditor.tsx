/**
 * Image Auditor Component
 * Admin tool for auditing image SEO implementation
 */
'use client';

import React, { useState } from 'react';

interface ImageResult {
  src: string;
  alt: string | null;
  hasAlt: boolean;
  altQuality: 'good' | 'poor' | 'missing';
  altIssues: string[];
  hasDimensions: boolean;
  width: string | null;
  height: string | null;
  isLazyLoaded: boolean;
  format?: string;
}

interface ImageReport {
  url: string;
  totalImages: number;
  imagesWithAlt: number;
  imagesWithoutAlt: number;
  imagesWithDimensions: number;
  imagesWithLazyLoading: number;
  images: ImageResult[];
  score: number;
}

const ImageAuditor: React.FC = () => {
  const [auditing, setAuditing] = useState(false);
  const [reports, setReports] = useState<ImageReport[]>([]);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [useSitemap, setUseSitemap] = useState(false);

  const predefinedPages = [
    'https://manishsteel.com.np',
    'https://manishsteel.com.np/about',
    'https://manishsteel.com.np/products',
    'https://manishsteel.com.np/gallery',
  ];

  const runAudit = async () => {
    setAuditing(true);
    setReports([]);
    setSelectedUrl(null);

    try {
      const params = new URLSearchParams();
      
      if (useSitemap) {
        params.set('useSitemap', 'true');
      } else {
        params.set('urls', predefinedPages.join(','));
      }

      const response = await fetch(`/api/admin/audit-images?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setReports(data.reports);
        if (data.reports.length > 0) {
          setSelectedUrl(data.reports[0].url);
        }
      } else {
        alert('Failed to audit images: ' + data.message);
      }
    } catch (error) {
      console.error('Error auditing images:', error);
      alert('Error auditing images');
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
        params.set('urls', predefinedPages.join(','));
      }

      const response = await fetch(`/api/admin/audit-images?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'image-audit.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading CSV:', error);
    }
  };

  const downloadImageSitemap = async () => {
    try {
      const params = new URLSearchParams();
      params.set('format', 'sitemap');
      
      if (useSitemap) {
        params.set('useSitemap', 'true');
      } else {
        params.set('urls', predefinedPages.join(','));
      }

      const response = await fetch(`/api/admin/audit-images?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'image-sitemap.xml';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading sitemap:', error);
    }
  };

  const selectedReport = reports.find(r => r.url === selectedUrl);
  
  const totalImages = reports.reduce((sum, r) => sum + r.totalImages, 0);
  const totalWithAlt = reports.reduce((sum, r) => sum + r.imagesWithAlt, 0);
  const totalWithDimensions = reports.reduce((sum, r) => sum + r.imagesWithDimensions, 0);
  const totalWithLazyLoading = reports.reduce((sum, r) => sum + r.imagesWithLazyLoading, 0);
  const averageScore = reports.length > 0
    ? Math.round(reports.reduce((sum, r) => sum + r.score, 0) / reports.length)
    : 0;

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'good':
        return 'text-green-600';
      case 'poor':
        return 'text-yellow-600';
      case 'missing':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getQualityBadge = (quality: string) => {
    switch (quality) {
      case 'good':
        return 'bg-green-100 text-green-800';
      case 'poor':
        return 'bg-yellow-100 text-yellow-800';
      case 'missing':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Image SEO Auditor</h2>
        <div className="flex gap-2">
          <button
            onClick={runAudit}
            disabled={auditing}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {auditing ? 'Auditing...' : 'Run Audit'}
          </button>
          {reports.length > 0 && (
            <>
              <button
                onClick={downloadCSV}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Export CSV
              </button>
              <button
                onClick={downloadImageSitemap}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Download Image Sitemap
              </button>
            </>
          )}
        </div>
      </div>

      {/* Audit Options */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Audit Options</h3>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={useSitemap}
            onChange={(e) => setUseSitemap(e.target.checked)}
            className="w-4 h-4 text-blue-600"
          />
          <span className="text-gray-700">
            Use sitemap (audit all pages)
          </span>
        </label>
      </div>

      {/* Summary Statistics */}
      {reports.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Total Images</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{totalImages}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">With Alt Text</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{totalWithAlt}</p>
            <p className="text-xs text-gray-500 mt-1">
              {totalImages > 0 ? Math.round((totalWithAlt / totalImages) * 100) : 0}%
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">With Dimensions</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{totalWithDimensions}</p>
            <p className="text-xs text-gray-500 mt-1">
              {totalImages > 0 ? Math.round((totalWithDimensions / totalImages) * 100) : 0}%
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Lazy Loaded</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">{totalWithLazyLoading}</p>
            <p className="text-xs text-gray-500 mt-1">
              {totalImages > 0 ? Math.round((totalWithLazyLoading / totalImages) * 100) : 0}%
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Avg Score</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{averageScore}</p>
          </div>
        </div>
      )}

      {/* Page Selector and Results */}
      {reports.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Page List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Pages</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {reports.map((report) => (
                  <button
                    key={report.url}
                    onClick={() => setSelectedUrl(report.url)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                      selectedUrl === report.url ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {report.url.replace('https://manishsteel.com.np', '') || '/'}
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500">{report.totalImages} images</span>
                      <span className={`text-xs font-medium ${
                        report.score >= 80 ? 'text-green-600' :
                        report.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        Score: {report.score}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Image Details */}
          <div className="lg:col-span-3">
            {selectedReport && (
              <div className="bg-white rounded-lg shadow">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">{selectedReport.url}</h3>
                  <div className="flex gap-4 mt-2 text-sm text-gray-600">
                    <span>Total: {selectedReport.totalImages}</span>
                    <span className="text-green-600">With Alt: {selectedReport.imagesWithAlt}</span>
                    <span className="text-red-600">Without Alt: {selectedReport.imagesWithoutAlt}</span>
                  </div>
                </div>

                <div className="p-6">
                  {selectedReport.images.length === 0 ? (
                    <p className="text-gray-500">No images found on this page</p>
                  ) : (
                    <div className="space-y-4">
                      {selectedReport.images.map((image, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                        >
                          <div className="flex gap-4">
                            {/* Image Preview */}
                            <div className="flex-shrink-0">
                              <img
                                src={image.src}
                                alt={image.alt || 'No alt text'}
                                className="w-24 h-24 object-cover rounded border border-gray-200"
                                loading="lazy"
                              />
                            </div>

                            {/* Image Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-mono text-gray-600 truncate">
                                    {image.src}
                                  </p>
                                  {image.format && (
                                    <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                      {image.format.toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <span className={`ml-2 px-2 py-1 text-xs font-medium rounded ${getQualityBadge(image.altQuality)}`}>
                                  {image.altQuality}
                                </span>
                              </div>

                              {/* Alt Text */}
                              <div className="mb-2">
                                <span className="text-xs font-medium text-gray-500">Alt Text:</span>
                                <p className="text-sm text-gray-900 mt-1">
                                  {image.alt || <span className="text-red-600 italic">Missing</span>}
                                </p>
                              </div>

                              {/* Issues */}
                              {image.altIssues.length > 0 && (
                                <div className="mb-2">
                                  <span className="text-xs font-medium text-red-600">Issues:</span>
                                  <ul className="mt-1 space-y-1">
                                    {image.altIssues.map((issue, i) => (
                                      <li key={i} className="text-xs text-red-600">• {issue}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Attributes */}
                              <div className="flex gap-4 text-xs text-gray-600">
                                <span className={image.hasDimensions ? 'text-green-600' : 'text-red-600'}>
                                  {image.hasDimensions ? '✓' : '✗'} Dimensions
                                  {image.hasDimensions && ` (${image.width}×${image.height})`}
                                </span>
                                <span className={image.isLazyLoaded ? 'text-green-600' : 'text-gray-600'}>
                                  {image.isLazyLoaded ? '✓' : '○'} Lazy Loading
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageAuditor;
