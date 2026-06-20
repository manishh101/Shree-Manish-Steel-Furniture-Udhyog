'use client';

import React, { useState } from 'react';
import { productAPI, uploadAPI } from '@/services/api';
import { urlManager } from '@/lib/seo/urlManager';
import { imageService } from '@/services/imageService';
import {
  FaMagic,
  FaSync,
  FaImage,
  FaFileExport,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner
} from 'react-icons/fa';

interface BulkOperationResult {
  success: boolean;
  processed: number;
  skipped: number;
  errors: string[];
  details?: string[];
}

const SEOBulkToolsPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [operationResult, setOperationResult] = useState<BulkOperationResult | null>(null);

  // Bulk generate/update product slugs
  const handleBulkGenerateSlugs = async () => {
    if (!confirm('This will regenerate slugs for all products. Continue?')) return;

    setLoading(true);
    setError('');
    setSuccess('');
    setOperationResult(null);

    try {
      const response = await productAPI.getAll(1, 1000);
      const products = response.products || [];

      const result: BulkOperationResult = {
        success: true,
        processed: 0,
        skipped: 0,
        errors: [],
        details: []
      };

      for (const product of products) {
        try {
          // Skip if product already has a good slug with location
          if (product.slug && product.slug.includes('biratnagar')) {
            result.skipped++;
            continue;
          }

          const categoryName = (product.categoryId as any)?.name || product.category;
          const subcategoryName = (product.subcategoryId as any)?.name || product.subcategory;
          const contextCategory = subcategoryName || categoryName;

          const newSlug = urlManager.generateSlug(product.name, {
            includeCategory: false,
            includeLocation: true,
            includeDualKeyword: true,
            categoryName: contextCategory
          });

          await productAPI.update(product._id, { slug: newSlug });
          result.processed++;
          result.details?.push(`Updated: ${product.name} → ${newSlug}`);
        } catch (err) {
          result.errors.push(`Failed to update ${product.name}: ${err}`);
          result.success = false;
        }
      }

      setOperationResult(result);
      setSuccess(`Bulk slug generation complete. Processed: ${result.processed}, Skipped: ${result.skipped}`);
    } catch (err) {
      console.error('Bulk slug generation error:', err);
      setError(`Failed to generate slugs: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Bulk regenerate alt text for images
  const handleBulkRegenerateAltText = async () => {
    if (!confirm('This will regenerate alt text for all product images. Continue?')) return;

    setLoading(true);
    setError('');
    setSuccess('');
    setOperationResult(null);

    try {
      const response = await productAPI.getAll(1, 1000);
      const products = response.products || [];

      const result: BulkOperationResult = {
        success: true,
        processed: 0,
        skipped: 0,
        errors: [],
        details: []
      };

      for (const product of products) {
        try {
          const categoryName = (product.categoryId as any)?.name || product.category;
          const colorName = product.colorName;

          const altText = imageService.generateAltText(product.name, {
            category: categoryName,
            color: colorName,
            location: 'Biratnagar'
          });

          // Note: Alt text is typically stored with the image URL or as metadata
          // This is a placeholder - actual implementation depends on image storage structure
          result.processed++;
          result.details?.push(`Generated alt text for: ${product.name} → "${altText}"`);
        } catch (err) {
          result.errors.push(`Failed to generate alt text for ${product.name}: ${err}`);
          result.success = false;
        }
      }

      setOperationResult(result);
      setSuccess(`Alt text generation complete. Processed: ${result.processed}`);
    } catch (err) {
      console.error('Alt text generation error:', err);
      setError(`Failed to generate alt text: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Bulk update meta descriptions using templates
  const handleBulkUpdateMetaDescriptions = async () => {
    if (!confirm('This will update meta descriptions for products missing them. Continue?')) return;

    setLoading(true);
    setError('');
    setSuccess('');
    setOperationResult(null);

    try {
      const response = await productAPI.getAll(1, 1000);
      const products = response.products || [];

      const result: BulkOperationResult = {
        success: true,
        processed: 0,
        skipped: 0,
        errors: [],
        details: []
      };

      for (const product of products) {
        try {
          // Skip if already has meta description
          if (product.metaDescription && product.metaDescription.trim()) {
            result.skipped++;
            continue;
          }

          const categoryName = (product.categoryId as any)?.name || product.category || '';
          const colorName = product.colorName || '';
          const features = Array.isArray(product.features) ? product.features.slice(0, 2).join(', ') : '';

          // Template-based meta description
          let metaDescription = `${product.name}`;
          if (categoryName) metaDescription += ` - ${categoryName}`;
          if (colorName) metaDescription += ` in ${colorName}`;
          metaDescription += `. Premium quality steel furniture in Biratnagar.`;
          if (features) metaDescription += ` Features: ${features}.`;
          metaDescription += ' Free delivery. 10-year warranty.';

          // Trim to 160 characters
          if (metaDescription.length > 160) {
            metaDescription = metaDescription.substring(0, 157) + '...';
          }

          await productAPI.update(product._id, { metaDescription });
          result.processed++;
          result.details?.push(`Updated: ${product.name}`);
        } catch (err) {
          result.errors.push(`Failed to update ${product.name}: ${err}`);
          result.success = false;
        }
      }

      setOperationResult(result);
      setSuccess(`Meta description update complete. Processed: ${result.processed}, Skipped: ${result.skipped}`);
    } catch (err) {
      console.error('Meta description update error:', err);
      setError(`Failed to update meta descriptions: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Export SEO audit report
  const handleExportSEOAudit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await productAPI.getAll(1, 1000);
      const products = response.products || [];

      const auditData = products.map(product => ({
        name: product.name,
        slug: product.slug || 'MISSING',
        metaTitle: product.metaTitle || 'MISSING',
        metaDescription: product.metaDescription || 'MISSING',
        metaTitleLength: (product.metaTitle || '').length,
        metaDescriptionLength: (product.metaDescription || '').length,
        focusKeywords: Array.isArray(product.focusKeywords) ? product.focusKeywords.join(', ') : 'NONE',
        dualKeywords: Array.isArray(product.dualKeywords) ? product.dualKeywords.length : 0,
        hasImage: product.image ? 'YES' : 'NO',
        imageCount: Array.isArray(product.images) ? product.images.length : 0,
        descriptionLength: (product.description || '').length,
        descriptionWords: (product.description || '').split(/\s+/).filter(Boolean).length,
        issues: [] as string[]
      }));

      // Identify issues
      auditData.forEach(item => {
        if (item.slug === 'MISSING') item.issues.push('Missing slug');
        if (!item.slug.includes('biratnagar')) item.issues.push('Slug missing location');
        if (item.metaTitle === 'MISSING') item.issues.push('Missing meta title');
        if (item.metaTitleLength < 50 || item.metaTitleLength > 60) item.issues.push('Meta title length not optimal');
        if (item.metaDescription === 'MISSING') item.issues.push('Missing meta description');
        if (item.metaDescriptionLength < 140 || item.metaDescriptionLength > 160) item.issues.push('Meta description length not optimal');
        if (item.focusKeywords === 'NONE') item.issues.push('No focus keywords');
        if (item.dualKeywords === 0) item.issues.push('No dual keywords');
        if (item.hasImage === 'NO') item.issues.push('Missing main image');
        if (item.imageCount < 3) item.issues.push('Less than 3 images');
        if (item.descriptionWords < 50) item.issues.push('Thin content (< 50 words)');
      });

      // Convert to CSV
      const headers = ['Name', 'Slug', 'Meta Title', 'Meta Description', 'Title Length', 'Desc Length', 'Focus Keywords', 'Dual Keywords', 'Has Image', 'Image Count', 'Description Words', 'Issues'];
      const csvRows = [
        headers.join(','),
        ...auditData.map(item => [
          `"${item.name}"`,
          `"${item.slug}"`,
          `"${item.metaTitle}"`,
          `"${item.metaDescription}"`,
          item.metaTitleLength,
          item.metaDescriptionLength,
          `"${item.focusKeywords}"`,
          item.dualKeywords,
          item.hasImage,
          item.imageCount,
          item.descriptionWords,
          `"${item.issues.join('; ')}"`
        ].join(','))
      ];

      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `seo-audit-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccess('SEO audit report exported successfully');
    } catch (err) {
      console.error('Export error:', err);
      setError(`Failed to export audit report: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2">SEO Bulk Operations</h1>
        <p className="text-gray-600">Perform batch operations to improve SEO across all products</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-start">
          <FaExclamationTriangle className="mt-0.5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-start">
          <FaCheckCircle className="mt-0.5 mr-2 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bulk Generate Slugs */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="bg-blue-100 p-3 rounded-lg mr-4">
              <FaMagic className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Bulk Generate Slugs</h3>
              <p className="text-sm text-gray-600">Regenerate URL slugs for all products</p>
            </div>
          </div>
          <button
            onClick={handleBulkGenerateSlugs}
            disabled={loading}
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center justify-center"
          >
            {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaSync className="mr-2" />}
            Generate Slugs
          </button>
        </div>

        {/* Bulk Regenerate Alt Text */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="bg-purple-100 p-3 rounded-lg mr-4">
              <FaImage className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Regenerate Alt Text</h3>
              <p className="text-sm text-gray-600">Generate SEO-friendly alt text for images</p>
            </div>
          </div>
          <button
            onClick={handleBulkRegenerateAltText}
            disabled={loading}
            className="w-full bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 flex items-center justify-center"
          >
            {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaImage className="mr-2" />}
            Generate Alt Text
          </button>
        </div>

        {/* Bulk Update Meta Descriptions */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 p-3 rounded-lg mr-4">
              <FaMagic className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Update Meta Descriptions</h3>
              <p className="text-sm text-gray-600">Generate meta descriptions using templates</p>
            </div>
          </div>
          <button
            onClick={handleBulkUpdateMetaDescriptions}
            disabled={loading}
            className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 flex items-center justify-center"
          >
            {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaMagic className="mr-2" />}
            Update Descriptions
          </button>
        </div>

        {/* Export SEO Audit */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="bg-orange-100 p-3 rounded-lg mr-4">
              <FaFileExport className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Export SEO Audit</h3>
              <p className="text-sm text-gray-600">Download report of missing metadata and issues</p>
            </div>
          </div>
          <button
            onClick={handleExportSEOAudit}
            disabled={loading}
            className="w-full bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-400 flex items-center justify-center"
          >
            {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaFileExport className="mr-2" />}
            Export Report
          </button>
        </div>
      </div>

      {/* Operation Results */}
      {operationResult && (
        <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Operation Results</h3>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{operationResult.processed}</div>
              <div className="text-sm text-gray-600">Processed</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{operationResult.skipped}</div>
              <div className="text-sm text-gray-600">Skipped</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{operationResult.errors.length}</div>
              <div className="text-sm text-gray-600">Errors</div>
            </div>
          </div>

          {operationResult.errors.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-red-600 mb-2">Errors:</h4>
              <div className="bg-red-50 p-3 rounded max-h-40 overflow-y-auto">
                {operationResult.errors.map((err, index) => (
                  <div key={index} className="text-sm text-red-700 mb-1">{err}</div>
                ))}
              </div>
            </div>
          )}

          {operationResult.details && operationResult.details.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Details (showing first 20):</h4>
              <div className="bg-gray-50 p-3 rounded max-h-60 overflow-y-auto">
                {operationResult.details.slice(0, 20).map((detail, index) => (
                  <div key={index} className="text-sm text-gray-600 mb-1">{detail}</div>
                ))}
                {operationResult.details.length > 20 && (
                  <div className="text-sm text-gray-500 italic mt-2">
                    ... and {operationResult.details.length - 20} more
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SEOBulkToolsPage;
