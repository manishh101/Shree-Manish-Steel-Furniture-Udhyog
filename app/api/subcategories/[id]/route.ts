import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { connectDB } from '@/lib/db';
import Subcategory from '@/models/Subcategory';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/subcategories/[id] - Get single subcategory
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const subcategory = await Subcategory.findById(id).lean();

    if (!subcategory) {
      return NextResponse.json(
        { msg: 'Subcategory not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(subcategory);
  } catch (error: any) {
    logger.error('Error fetching subcategory:', error);
    if (error.kind === 'ObjectId') {
      return NextResponse.json(
        { msg: 'Subcategory not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Server Error' },
      { status: 500 }
    );
  }
}

// PUT /api/subcategories/[id] - Update subcategory
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    await connectDB();
    const data = await request.json();

    // Validate required fields
    if (!data.name || data.name.trim() === '') {
      return NextResponse.json(
        { errors: [{ msg: 'Name is required' }] },
        { status: 400 }
      );
    }

    const subcategory = await Subcategory.findById(id);

    if (!subcategory) {
      return NextResponse.json(
        { msg: 'Subcategory not found' },
        { status: 404 }
      );
    }

    const oldName = subcategory.name;

    // Update fields
    subcategory.name = data.name;
    subcategory.description = data.description || '';

    // Only update categoryId if provided
    if (data.categoryId) {
      // Verify the new parent category exists
      const category = await Category.findById(data.categoryId);
      if (!category) {
        return NextResponse.json(
          { msg: 'Parent category not found' },
          { status: 404 }
        );
      }
      subcategory.categoryId = data.categoryId;
      
      // Update the category field in products when category changes
      await Product.updateMany(
        { subcategoryId: id },
        { $set: { category: category.name } }
      );
    }

    if (data.displayOrder !== undefined) {
      subcategory.displayOrder = data.displayOrder;
    }

    await subcategory.save();

    // If the subcategory name changed, update all products with this subcategory
    if (data.name && data.name !== oldName) {
      await Product.updateMany(
        { subcategoryId: id },
        { $set: { subcategory: data.name } }
      );
      logger.info(`Updated subcategory name from "${oldName}" to "${data.name}" in all related products`);
    }

    // Revalidate cache for all subcategory-related pages
    revalidatePath('/products');
    revalidatePath('/');
    revalidatePath('/admin/categories');
    revalidateTag('subcategories', {});
    revalidateTag('products', {});

    return NextResponse.json(subcategory);
  } catch (error: any) {
    logger.error('Error updating subcategory:', error);
    if (error.kind === 'ObjectId') {
      return NextResponse.json(
        { msg: 'Subcategory not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Server Error' },
      { status: 500 }
    );
  }
}

// DELETE /api/subcategories/[id] - Delete subcategory
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    await connectDB();

    const subcategory = await Subcategory.findById(id);

    if (!subcategory) {
      return NextResponse.json(
        { msg: 'Subcategory not found' },
        { status: 404 }
      );
    }

    await Subcategory.findByIdAndDelete(id);

    return NextResponse.json({ msg: 'Subcategory removed' });
  } catch (error: any) {
    logger.error('Error deleting subcategory:', error);
    if (error.kind === 'ObjectId') {
      return NextResponse.json(
        { msg: 'Subcategory not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Server Error' },
      { status: 500 }
    );
  }
}
