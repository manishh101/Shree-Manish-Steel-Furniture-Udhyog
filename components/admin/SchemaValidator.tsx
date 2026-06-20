/**
 * Schema Validator Component
 * Admin tool for validating schema.org markup across the site
 */
'use client';

import React, { useState } from 'react';

interface ValidationResult {
  url: string;
  schemaType: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
}

interface ValidationReport {
  totalSchemas: number;
  validSchemas: number;
  invalidSchemas: number;
  results: ValidationResult[];
}

const SchemaValidator: React.FC = () => {
  const [validating, setValidating] = useState(false);
  const [reports, setReports] = useState<Record<string, ValidationReport>>({});
  const [selectedPages, setSelectedPages] = useState<string[]>([
    'https://manishsteel.com.np',
    'https://manishsteel.com.np/about',
    'https://manishsteel.com.np/products',
    'https://manishsteel.com.np/contact',
  ]);

  const predefinedPages = [
    { label: 'Homepage', url: 'https://manishsteel.com.np' },
    { label: 'About Page', url: 'https://manishsteel.com.np/about' },
    { label: 'Products Page', url: 'https://manishsteel.com.np/products' },
    { label: 'Contact Page', url: 'https://manishsteel.com.np/contact' },
    { label: 'Blog Page', url: 'https://manishsteel.com.np/blog' },
    { label: 'Gallery Page', url: 'https://manishsteel.com.np/gallery' },
  ];

  const validateSchemas = async () => {
    if (selectedPages.length === 0) {
      alert('Please select at least one page to validate');
      return;
    }

    setValidating(true);
    setReports({});

    try {
      const response = await fetch(
        `/api/admin/validate-schemas?action=validate&urls=${selectedPages.join(',')}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const data = await response.json();
      
      if (data.success) {
        const newReports: Record<string, ValidationReport> = {};
        data.validationResults.forEach((report: ValidationReport, index: number) => {
          newReports[selectedPages[index]] = report;
        });
        setReports(newReports);
      } else {
        alert('Failed to validate schemas: ' + data.message);
      }
    } catch (error) {
      console.error('Error validating schemas:', error);
      alert('Error validating schemas');
    } finally {
      setValidating(false);
    }
  };

  const togglePage = (url: string) => {
    setSelectedPages(prev =>
      prev.includes(url)
        ? prev.filter(p => p !== url)
        : [...prev, url]
    );
  };

  const totalSchemas = Object.values(reports).reduce((sum, r) => sum + r.totalSchemas, 0);
  const validSchemas = Object.values(reports).reduce((sum, r) => sum + r.validSchemas, 0);
  const invalidSchemas = Object.values(reports).reduce((sum, r) => sum + r.invalidSchemas, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Schema.org Validator</h2>
        <button
          onClick={validateSchemas}
          disabled={validating || selectedPages.length === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {validating ? 'Validating...' : 'Validate Schemas'}
        </button>
      </div>

      {/* Page Selection */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Pages to Validate</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {predefinedPages.map((page) => (
            <label
              key={page.url}
              className="flex items-center space-x-3 p-3 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedPages.includes(page.url)}
                onChange={() => togglePage(page.url)}
                className="w-4 h-4 text-blue-600"
              />
              <div>
                <div className="font-medium text-gray-900">{page.label}</div>
                <div className="text-xs text-gray-500 truncate">{page.url}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Summary Statistics */}
      {Object.keys(reports).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Total Schemas</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{totalSchemas}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Valid</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{validSchemas}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Invalid</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">{invalidSchemas}</p>
          </div>
        </div>
      )}

      {/* Validation Results */}
      {Object.entries(reports).map(([url, report]) => (
        <div key={url} className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">{url}</h3>
            <div className="flex gap-4 mt-2 text-sm">
              <span className="text-gray-600">
                Total: <span className="font-medium">{report.totalSchemas}</span>
              </span>
              <span className="text-green-600">
                Valid: <span className="font-medium">{report.validSchemas}</span>
              </span>
              {report.invalidSchemas > 0 && (
                <span className="text-red-600">
                  Invalid: <span className="font-medium">{report.invalidSchemas}</span>
                </span>
              )}
            </div>
          </div>

          <div className="p-6">
            {report.results.length === 0 ? (
              <p className="text-gray-500">No schemas found on this page</p>
            ) : (
              <div className="space-y-4">
                {report.results.map((result, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${
                      result.valid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="font-semibold text-gray-900">{result.schemaType}</span>
                        {result.valid ? (
                          <span className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                            Valid
                          </span>
                        ) : (
                          <span className="ml-3 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                            Invalid
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Errors */}
                    {result.errors.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-red-900 mb-2">
                          Errors ({result.errors.length})
                        </h4>
                        <ul className="list-disc list-inside space-y-1">
                          {result.errors.map((error, i) => (
                            <li key={i} className="text-sm text-red-700">
                              {error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Warnings */}
                    {result.warnings.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-yellow-900 mb-2">
                          Warnings ({result.warnings.length})
                        </h4>
                        <ul className="list-disc list-inside space-y-1">
                          {result.warnings.map((warning, i) => (
                            <li key={i} className="text-sm text-yellow-700">
                              {warning}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Testing Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          Testing with Google Rich Results Test
        </h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>
            For official Google validation, test each page manually using the{' '}
            <a
              href="https://search.google.com/test/rich-results"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline hover:text-blue-900"
            >
              Google Rich Results Test
            </a>
          </p>
          <div className="mt-3">
            <strong>Schema Types to Test:</strong>
            <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
              <li>LocalBusiness schema on Homepage</li>
              <li>Product schema on Product pages</li>
              <li>Article schema on Blog posts</li>
              <li>BreadcrumbList on all pages</li>
              <li>FAQPage schema on Category pages</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchemaValidator;
