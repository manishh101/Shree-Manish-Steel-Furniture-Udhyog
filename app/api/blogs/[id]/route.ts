import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/db';
import Blog from '@/models/Blog';
import { getUserFromRequest } from '@/lib/auth';
import mongoose from 'mongoose';

// Helper to generate a slug from a title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/-+/g, '-')      // Replace multiple - with single -
    .trim();
}

// GET /api/blogs/[idOrSlug] - Get a single blog by ID or Slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id: idOrSlug } = await params;
    
    let blog;
    // Check if valid ObjectId, if so search by ID first
    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      blog = await Blog.findById(idOrSlug).lean();
    }
    
    // If not found by ID or not a valid ID, search by slug
    if (!blog) {
      blog = await Blog.findOne({ slug: idOrSlug.toLowerCase() }).lean();
    }
    
    if (!blog) {
      return NextResponse.json(
        { success: false, message: 'Blog post not found' },
        { status: 404 }
      );
    }
    
    // Non-admins cannot view drafts
    if (blog.status === 'draft') {
      const user = getUserFromRequest(request);
      if (!user || user.role !== 'admin') {
        return NextResponse.json(
          { success: false, message: 'Unauthorized' },
          { status: 401 }
        );
      }
    }
    
    return NextResponse.json({
      success: true,
      blog
    });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}

// PUT /api/blogs/[id] - Update a blog post (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    await connectDB();
    const body = await request.json();
    
    const blog = await Blog.findById(id);
    if (!blog) {
      return NextResponse.json(
        { success: false, message: 'Blog post not found' },
        { status: 404 }
      );
    }
    
    // Update fields
    const fieldsToUpdate = [
      'title', 'content', 'excerpt', 'image', 'status', 'tags', 'readTime', 'metaTitle', 'metaDescription'
    ];
    
    fieldsToUpdate.forEach(field => {
      if (body[field] !== undefined) {
        if (field === 'tags' && Array.isArray(body[field])) {
          blog.tags = body[field];
        } else {
          (blog as any)[field] = body[field];
        }
      }
    });
    
    // If slug is provided and is different, validate it
    if (body.slug && body.slug !== blog.slug) {
      let requestedSlug = generateSlug(body.slug);
      let uniqueSlug = requestedSlug;
      let counter = 1;
      while (await Blog.findOne({ slug: uniqueSlug, _id: { $ne: blog._id } })) {
        uniqueSlug = `${requestedSlug}-${counter}`;
        counter++;
      }
      blog.slug = uniqueSlug;
    }
    
    await blog.save();
    
    // Revalidate public cache
    revalidatePath('/blogs');
    revalidatePath(`/blogs/${blog.slug}`);
    revalidatePath('/');
    
    return NextResponse.json({
      success: true,
      message: 'Blog post updated successfully',
      blog
    });
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

// DELETE /api/blogs/[id] - Delete a blog post (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    await connectDB();
    
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) {
      return NextResponse.json(
        { success: false, message: 'Blog post not found' },
        { status: 404 }
      );
    }
    
    // Revalidate paths
    revalidatePath('/blogs');
    revalidatePath(`/blogs/${blog.slug}`);
    revalidatePath('/');
    
    return NextResponse.json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}
