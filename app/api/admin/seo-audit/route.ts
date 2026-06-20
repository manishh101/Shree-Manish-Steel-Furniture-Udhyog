import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import Blog from '@/models/Blog';
import Category from '@/models/Category';
import { authenticateAdmin } from '@/lib/auth';

interface AuditResult {
  category: string;
  severity: 'critical' | 'warning' | 'info';
  count: number;
  message: string;
  items?: any[];
}

function validateTitleLength(title: string) {
  if (!title) return { valid: false, issue: 'missing' };
  const length = title.length;
  if (length < 30) return { valid: false, issue: 'too_short', length };
  if (length > 70) return { valid: false, issue: 'too_long', length };
  return { valid: true, length };
}

function validateDescriptionLength(description: string) {
  if (!description) return { valid: false, issue: 'missing' };
  const length = description.length;
  if (length < 100) return { valid: false, issue: 'too_short', length };
  if (length > 170) return { valid: false, issue: 'too_long', length };
  return { valid: true, length };
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate admin
    const authResult = await authenticateAdmin(request);
    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const results: AuditResult[] = [];
    let criticalCount = 0;
    let warningCount = 0;

    // Audit Products
    const products = await Product.find({})
      .populate('categoryId', 'name')
      .populate('subcategoryId', 'name')
      .lean();

    const titleIssues: any[] = [];
    const descIssues: any[] = [];
    const slugIssues: any[] = [];
    const thinContent: any[] = [];
    const missingAlt: any[] = [];
    const slugMap = new Map<string, any[]>();

    for (const product of products) {
      const productId = product._id.toString();
      const productName = product.name || 'Unnamed Product';

      // Check title
      const titleCheck = validateTitleLength(product.metaTitle || product.name);
      if (!titleCheck.valid) {
        titleIssues.push({
          id: productId,
          name: productName,
          issue: titleCheck.issue,
          length: titleCheck.length,
          current: (product.metaTitle || product.name || '').substring(0, 100),
        });
      }

      // Check description
      const descCheck = validateDescriptionLength(
        product.metaDescription || product.description
      );
      if (!descCheck.valid) {
        descIssues.push({
          id: productId,
          name: productName,
          issue: descCheck.issue,
          length: descCheck.length,
          current: (product.metaDescription || product.description || '').substring(0, 100),
        });
      }

      // Check slug
      if (!product.slug) {
        slugIssues.push({
          id: productId,
          name: productName,
          issue: 'missing',
        });
      } else {
        // Track duplicates
        const existing = slugMap.get(product.slug) || [];
        existing.push({ id: productId, name: productName });
        slugMap.set(product.slug, existing);
      }

      // Check content length
      const contentLength = (product.description || '').length;
      if (contentLength < 150) {
        thinContent.push({
          id: productId,
          name: productName,
          length: contentLength,
        });
      }

      // Check image alt text
      if (product.image && !(product as any).imageAlt) {
        missingAlt.push({
          id: productId,
          name: productName,
        });
      }
    }

    // Check for duplicate slugs
    const duplicateSlugs: any[] = [];
    slugMap.forEach((items, slug) => {
      if (items.length > 1) {
        duplicateSlugs.push({
          slug,
          count: items.length,
          products: items,
        });
      }
    });

    // Add results for products
    if (duplicateSlugs.length > 0) {
      results.push({
        category: 'Duplicate Product Slugs',
        severity: 'critical',
        count: duplicateSlugs.length,
        message: 'Multiple products share the same slug, causing routing conflicts',
        items: duplicateSlugs,
      });
      criticalCount += duplicateSlugs.length;
    }

    if (slugIssues.length > 0) {
      results.push({
        category: 'Missing Product Slugs',
        severity: 'warning',
        count: slugIssues.length,
        message: 'Products without SEO-friendly slugs will use ObjectId in URLs',
        items: slugIssues,
      });
      warningCount += slugIssues.length;
    }

    if (titleIssues.length > 0) {
      results.push({
        category: 'Product Title Issues',
        severity: 'warning',
        count: titleIssues.length,
        message: 'Product titles are too short, too long, or missing',
        items: titleIssues.slice(0, 20),
      });
      warningCount += titleIssues.length;
    }

    if (descIssues.length > 0) {
      results.push({
        category: 'Product Description Issues',
        severity: 'warning',
        count: descIssues.length,
        message: 'Product descriptions are too short, too long, or missing',
        items: descIssues.slice(0, 20),
      });
      warningCount += descIssues.length;
    }

    if (thinContent.length > 0) {
      results.push({
        category: 'Thin Product Content',
        severity: 'warning',
        count: thinContent.length,
        message: 'Products with less than 150 words may not rank well',
        items: thinContent.slice(0, 20),
      });
      warningCount += thinContent.length;
    }

    if (missingAlt.length > 0) {
      results.push({
        category: 'Missing Image Alt Text',
        severity: 'info',
        count: missingAlt.length,
        message: 'Product images without alt text are not optimized for search',
        items: missingAlt.slice(0, 20),
      });
    }

    // Audit Blogs
    const blogs = await Blog.find({}).lean();
    const blogThinContent: any[] = [];

    for (const blog of blogs) {
      const contentLength = (blog.content || '').length;
      if (contentLength < 500) {
        blogThinContent.push({
          id: blog._id.toString(),
          title: blog.title,
          length: contentLength,
        });
      }
    }

    if (blogThinContent.length > 0) {
      results.push({
        category: 'Thin Blog Content',
        severity: 'info',
        count: blogThinContent.length,
        message: 'Blog posts with less than 500 words may not provide enough value',
        items: blogThinContent,
      });
    }

    // Audit Categories
    const categories = await Category.find({}).lean();
    const categoryIssues: any[] = [];

    for (const category of categories) {
      const descLength = (category.description || '').length;
      if (descLength < 200) {
        categoryIssues.push({
          id: category._id.toString(),
          name: category.name,
          length: descLength,
        });
      }
    }

    if (categoryIssues.length > 0) {
      results.push({
        category: 'Thin Category Descriptions',
        severity: 'info',
        count: categoryIssues.length,
        message: 'Category pages should have at least 200 words of content',
        items: categoryIssues,
      });
    }

    // Calculate health score
    const totalIssues = criticalCount * 10 + warningCount * 3;
    const healthScore = Math.max(0, Math.min(100, 100 - totalIssues));

    // Add summary if no issues
    if (results.length === 0) {
      results.push({
        category: 'SEO Health',
        severity: 'info',
        count: 0,
        message: 'No major SEO issues detected! Your site is well-optimized.',
      });
    }

    return NextResponse.json({
      success: true,
      healthScore,
      results,
      summary: {
        totalProducts: products.length,
        totalBlogs: blogs.length,
        totalCategories: categories.length,
        criticalIssues: criticalCount,
        warnings: warningCount,
      },
    });
  } catch (error: any) {
    logger.error('SEO audit error:', error);
    return NextResponse.json(
      { error: 'Failed to run SEO audit', details: error.message },
      { status: 500 }
    );
  }
}
