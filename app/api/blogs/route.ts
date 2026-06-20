import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/db';
import Blog from '@/models/Blog';
import { getUserFromRequest } from '@/lib/auth';
import { createCachedResponse } from '@/lib/cache';

// Helper to generate a slug from a title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/-+/g, '-')      // Replace multiple - with single -
    .trim();
}

// GET /api/blogs - List blogs (public listings show published only; admin can see all)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const tag = searchParams.get('tag') || '';
    
    const user = getUserFromRequest(request);
    const isAdmin = user && user.role === 'admin';
    
    // Build query
    const query: any = {};
    
    // Status handling: non-admins only see published posts
    if (isAdmin) {
      const statusParam = searchParams.get('status');
      if (statusParam && ['draft', 'published'].includes(statusParam)) {
        query.status = statusParam;
      }
    } else {
      query.status = 'published';
    }
    
    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Tag filter
    if (tag) {
      query.tags = tag;
    }
    
    const skip = (page - 1) * limit;
    
    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Blog.countDocuments(query)
    ]);
    
    return NextResponse.json(
      {
        success: true,
        blogs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      },
      {
        headers: createCachedResponse('BLOGS'),
      }
    );
  } catch (error) {
    logger.error('Error listing blogs:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}

// POST /api/blogs - Create a new blog post (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    const body = await request.json();
    const { title, content, excerpt, image, status, tags, readTime, metaTitle, metaDescription } = body;
    
    if (!title || !content || !excerpt) {
      return NextResponse.json(
        { success: false, message: 'Title, content, and excerpt are required' },
        { status: 400 }
      );
    }
    
    // Generate base slug
    let baseSlug = body.slug ? generateSlug(body.slug) : generateSlug(title);
    if (!baseSlug) {
      baseSlug = 'blog-post';
    }
    
    // Check for unique slug and append suffix if needed
    let slug = baseSlug;
    let counter = 1;
    while (await Blog.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    const blog = await Blog.create({
      title,
      slug,
      content,
      excerpt,
      image: image || '',
      status: status || 'draft',
      tags: Array.isArray(tags) ? tags : [],
      readTime: readTime || 5,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt,
      author: 'Shree Manish Steel Furniture'
    });
    
    // Revalidate public path cache
    revalidatePath('/blogs');
    revalidatePath(`/blogs/${slug}`);
    revalidatePath('/');
    
    return NextResponse.json({
      success: true,
      message: 'Blog post created successfully',
      blog
    }, { status: 201 });
  } catch (error) {
    logger.error('Error creating blog post:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create blog post' },
      { status: 500 }
    );
  }
}
